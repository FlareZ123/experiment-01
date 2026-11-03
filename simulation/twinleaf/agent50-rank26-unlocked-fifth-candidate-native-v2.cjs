'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {initializeCards}=require('./headless.cjs');
const {RANK26_PROPAGATION_PROFILE,runWithResearchProfile}=
  require('./policy-profiles.cjs');
const {sourceRootGates}=require('./agent3-rank26-post-compressor-gate-v21.cjs');

const ENGINE='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const ROOT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const BASE=20261103;
const REPEATS=Object.freeze(Array.from({length:12},(_,i)=>100+i));
const MAX_ACTIONS=120;
const OPTIONS=Object.freeze({
  allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
});
const SOURCE_LITERAL_ALIASES=Object.freeze({
  'xy4-92':{from:'Battle Compressor Team Flare Gear',to:'Battle Compressor'},
  'sve-1':{from:'Basic Grass Energy',to:'Grass Energy'},
  'sve-2':{from:'Basic Fire Energy',to:'Fire Energy'}
});
const ENTRIES=Object.freeze([
  {id:'agent5-adp-thorton-v2',
    path:'../../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json'},
  {id:'agent43-apex-alchemy-v0',
    path:'../../results/aichi-2026/agent43-apex-alchemy-paper-expanded-v0.json'}
]);
const digest=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');

/**
 * Use the authentic requested English card ID and printed card database to
 * construct the existing full-field resolver's standard fields. Never assign
 * a different expansion, number or text when native mapping is unavailable.
 *
 * @param {object} entry
 * @returns {object}
 */
function candidateManifest(entry){
  const stored=require(path.resolve(__dirname,entry.path));
  const sets=require('../../resources/sets/en.json');
  const codeBySet=new Map(sets.map(s=>[s.id,s.ptcgoCode]));
  const cache=new Map();
  const nameAliases=[];
  const cards=stored.cards.map(row=>{
    const id=row.cardId||row.id;
    assert.ok(typeof id==='string'&&id.includes('-'));
    const prefix=id.slice(0,id.lastIndexOf('-'));
    if(!cache.has(prefix))cache.set(prefix,
      require(path.resolve(__dirname,'../../resources/cards/en',prefix+'.json')));
    const printed=cache.get(prefix).find(card=>card.id===id);
    assert.ok(printed,'Requested exact source printing absent: '+id);
    assert.equal(printed.name,row.name,'Card-ID/name disagreement: '+id);
    assert.ok(Number.isInteger(row.count)&&row.count>0&&row.count<=4);
    const code=codeBySet.get(prefix);
    assert.ok(code,'No source set identifier for '+id);
    const alias=SOURCE_LITERAL_ALIASES[id];
    if(alias){
      assert.equal(row.name,alias.from,'Unexpected supplied literal for '+id);
      nameAliases.push({id,originalName:row.name,nativeName:alias.to,
        set:code,number:String(printed.number),count:row.count});
    }
    return {name:alias?.to??row.name,count:row.count,
      category:printed.supertype,
      printing:{set:code,number:String(printed.number),language:'en'}};
  });
  assert.equal(cards.reduce((n,row)=>n+row.count,0),60);
  return {label:entry.id,player:entry.id,archetype:entry.id,cards,
    sourceNameAliases:nameAliases};
}

/**
 * Passive first-global-turn source hand/board plus public opposing board
 * observer. Hook never changes an action or its native return. The private
 * source hand is only copied to output for diagnosis, never to an opponent bot.
 *
 * @template T
 * @param {0|1} seat
 * @param {()=>T} play
 * @returns {{result:T|null,error:string|null,roots:object[]}}
 */
function withNativeRootObserver(seat,play){
  const {Store}=require(path.join(ROOT,'game/store/store'));
  const {GamePhase}=require(path.join(ROOT,'game/store/state/state'));
  const old=Store.prototype.dispatch;
  const roots=[];
  let root=null,result=null,error=null;
  const expectedId=seat===0?101:202;
  const wrapper=function observe(action,...args){
    if(!root&&action?.constructor?.name==='AddPlayerAction'&&
       action.clientId===101)root=this;
    const s=this.state;
    if(this===root&&s.players?.length===2&&
       s.turn===1&&s.activePlayer===seat&&
       s.phase===GamePhase.PLAYER_TURN&&
       !s.prompts.some(p=>p.result===undefined)&&
       action?.clientId===expectedId){
      const gates=sourceRootGates(s,seat);
      if(gates){
        const opponent=s.players[1-seat];
        roots.push({...gates,rootIndex:roots.length,
          candidateBenchCount:opponent.bench.filter(p=>p.getPokemonCard()).length,
          candidateSolo:opponent.bench.every(p=>!p.getPokemonCard()),
          action:action.constructor.name,
          proposedSourceCard:typeof action.handIndex==='number'?
            s.players[seat].hand.cards[action.handIndex]?.name??null:null});
      }
    }
    return old.call(this,action,...args);
  };
  Store.prototype.dispatch=wrapper;
  try{try{result=play();}catch(e){error=String(e?.stack??e).slice(0,2000);}}
  finally{
    assert.strictEqual(Store.prototype.dispatch,wrapper);
    Store.prototype.dispatch=old;
  }
  return {result,error,roots};
}

/** @param {object} r @param {number} sourceSeat @returns {object} */
function summarizeArm(r,sourceSeat){
  const game=r.result?.result??r.result;
  const actions=(game?.decisionTrace??[]).filter(x=>
    x.playerSlot===sourceSeat&&x.turnBefore===1);
  const first=game?.firstTurnSlot===sourceSeat;
  const sourceFirstRoots=first?r.roots:[];
  return {
    nativeError:r.error,
    verifiedFirstDraw:game?.verifiedByDrawLog===true,
    actualSourceFirst:game?.firstTurnSlot===undefined?null:first,
    candidateOpeningSoloPublic:sourceFirstRoots[0]?.candidateSolo??null,
    candidateOpeningActivePublic:sourceFirstRoots[0]?.opponentActive??null,
    sourceFirstRoots:sourceFirstRoots.length,
    sourceFirstActions:actions.map(a=>({
      action:a.action,card:a.card??null,ability:a.ability??null,
      attack:a.attack??null,ordinal:a.actionOrdinal??null,
      opponentPrizesAfter:a.prizesAfter?.[1-sourceSeat]??null
    })),
    heldCologneAtAnySourceRoot:sourceFirstRoots.some(x=>x.cologneHeld),
    discardedLightningAtAnySourceRoot:sourceFirstRoots.some(x=>x.discardLightningCount>0),
    sourceMeloettaActiveAtAnyRoot:sourceFirstRoots.some(x=>x.activeMelo),
    sourceMeloettaBenchAtAnyRoot:sourceFirstRoots.some(x=>x.benchMelo),
    sourceKokoBenchAtAnyRoot:sourceFirstRoots.some(x=>x.benchKoko),
    sourceOpponentOnePrizeAtAnyRoot:sourceFirstRoots.some(x=>x.opponentOnePrize),
    sourceFirstCrisisPunch:actions.filter(a=>a.action==='AttackAction'&&
      a.attack==='Crisis Punch').length,
    sourceFirstPumps:actions.filter(a=>a.action==='PlayCardAction'&&
      a.card==='Damage Pump').length,
    sourceFirstCompressor:actions.filter(a=>a.action==='PlayCardAction'&&
      a.card==='Battle Compressor').length,
    sourceFirstPropagation:actions.filter(a=>a.action==='UseAbilityAction'&&
      a.ability==='Propagation').length,
    nativeTerminal:game?.finished===true,
    nativeWinner:game?.finished===true?game.winner:null,
    nativeActionCapped:game?.finished===false,
    policy:game?.researchPolicyProfile??null,
    sourceRoots:sourceFirstRoots,
    competitiveQualifiedGame:false
  };
}

/** @returns {object} */
function run(){
  initializeCards();
  const source=planAichi(26,OPTIONS);
  const sourceCards=source.candidate.cards;
  assert.equal(sourceCards?.length,60);
  const originals=source.opponents.filter(x=>x.status==='ready').map(x=>x.rank);
  assert.equal(originals.length,29);
  const entryPlans=ENTRIES.map(entry=>{
    try{
      const input=candidateManifest(entry);
      const p=planAichi(input,OPTIONS);
      return {entry,originalInputHash:digest(input.cards),
        sourceNameAliases:input.sourceNameAliases,
        status:p.candidate.cards?.length===60?
          'NATIVE_EXACT_SIXTY_READY':'NATIVE_PRINTING_BLOCKED',
        cards:p.candidate.cards,
        unresolved:p.candidate.unresolved,substitutions:p.candidate.substitutions,
        nativeDigest:p.candidateNativeOrderedSha256};
    }catch(e){
      return {entry,status:'NATIVE_RESOLUTION_ERROR',error:String(e?.stack??e),
        cards:null,unresolved:[],substitutions:[]};
    }
  });
  const attempts=[],used=new Set();
  for(const row of entryPlans){
    if(row.status!=='NATIVE_EXACT_SIXTY_READY')continue;
    for(const repeat of REPEATS){
      const seeds=deriveSlotSeeds(BASE,'pilot',26,repeat);
      for(const [slot,seat,seed] of [['A',0,seeds.A],['B',1,seeds.B]]){
        const key=row.entry.id+':'+seed;
        assert.ok(Number.isSafeInteger(seed)&&seed>0&&!used.has(key));
        used.add(key);
        const a=seat===0?sourceCards:row.cards;
        const b=seat===1?sourceCards:row.cards;
        const observed=withNativeRootObserver(seat,()=>runWithResearchProfile({
          deckA:a,deckB:b,rank26SourceSeat:seat,seed,
          maxActions:MAX_ACTIONS,strictPromptValidation:true,
          captureDecisionTrace:true,isolatePolicyRandomness:true,
          forestSealSearchCorrection:true,
          leleEntryAbilityLockCorrection:true,
          entryDrawLockCorrection:true,
          label:'agent50-unlocked-alias-v2-rank26-'+row.entry.id+'-'+repeat+'-'+slot
        },RANK26_PROPAGATION_PROFILE));
        attempts.push({candidate:row.entry.id,sourceSeat:seat,seed,repeat,
          slot,sourceDeckHash:digest(sourceCards),
          candidateDeckHash:digest(row.cards),
          ...summarizeArm(observed,seat)});
      }
    }
  }
  const candidates=entryPlans.map(row=>{
    const cells=attempts.filter(x=>x.candidate===row.entry.id);
    const first=cells.filter(x=>x.actualSourceFirst);
    return {id:row.entry.id,status:row.status,
      originalInputHash:row.originalInputHash??null,
      sourceNameAliases:row.sourceNameAliases??[],
      nativeDigest:row.nativeDigest??null,
      unresolved:row.unresolved,substitutions:row.substitutions,
      resolverError:row.error??null,
      attemptedArms:cells.length,actualSourceFirst:first.length,
      sourceFirstSolo:first.filter(x=>x.candidateOpeningSoloPublic===true).length,
      sourceFirstWithRoots:first.filter(x=>x.sourceFirstRoots>0).length,
      firstTurnCrisisPunch:first.reduce((n,x)=>n+x.sourceFirstCrisisPunch,0),
      sourceFirstCompressor:first.reduce((n,x)=>n+x.sourceFirstCompressor,0),
      nativeErrors:cells.filter(x=>x.nativeError).length};
  });
  return {schema:'agent50-original-rank26-unlocked-fifth-candidate-native-v2',
    preRegistration:'results/aichi-2026/registrations/agent50-unlocked-rank26-fifth-candidate-alias-v2-20261103.md',
    originalSourceRank:26,originalSourceDeckHash:digest(sourceCards),
    authenticatedSourceDecks:29,missingSourceRanks:[23,25,28],
    engineRevision:ENGINE,seedBase:BASE,repeats:REPEATS,
    maximumActions:MAX_ACTIONS,sourcePolicy:RANK26_PROPAGATION_PROFILE,
    class:'prospective developmental original-source native pilot',
    sourcePolicyCompetitivelyQualified:false,candidatePolicyCompetitivelyQualified:false,
    paperClockVerified:false,competitiveGames:0,
    candidates,attempts};
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={candidateManifest,summarizeArm,withNativeRootObserver,run,
  BASE,REPEATS,MAX_ACTIONS,ENTRIES};
