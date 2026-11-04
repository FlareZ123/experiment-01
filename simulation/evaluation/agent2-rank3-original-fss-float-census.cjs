'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=
  require('../twinleaf/headless.cjs');
const {originals}=
  require('./agent41-rank3-arbitration-original-store.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withActorOnlyRootPolicy}=
  require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {withNativePaperSupporterDiscipline}=
  require('../twinleaf/agent41-paper-supporter-discipline.cjs');
const {withSameTargetAttachEnergySelection}=
  require('../twinleaf/same-target-attach-energy-hook.cjs');
const {selectStoneRecipient,FSS}=
  require('../twinleaf/forest-stone-v-recipient-policy.cjs');

const VERSION='agent2-original-rank3-natural-fss-first-float-visibility-v1';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const SEEDS=Object.freeze([290126,290127,290128,290129]);
const ROOT_LIMIT=260;
const FLOAT='Float Stone BKT';
const dir=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(dir,name));
const sha=o=>createHash('sha256').update(JSON.stringify(o)).digest('hex');

/**
 * Observe read-only owned hand and public board at every genuine actor root.
 * This intentionally never adjusts any action, prompt choice, shuffle,
 * tactic score, deck composition, or opponent response.
 *
 * @template T
 * @param {0|1} sourceSeat Registered rank3 physical seat.
 * @param {()=>T} execute Unmodified original-sixty engine match.
 * @returns {{result:T,audit:object}} Exact native root observation.
 */
function withReadOnlyFssFloatRootCensus(sourceSeat,execute){
  assert.ok(sourceSeat===0||sourceSeat===1);
  const {Store}=native('game/store/store');
  const {GamePhase}=native('game/store/state/state');
  const {TrainerType,CardTag}=native('game/store/card/card-types');
  const {PlayerType}=native('game/store/actions/play-card-action');
  const original=Store.prototype.dispatch;
  const vTags=[CardTag.POKEMON_V,CardTag.POKEMON_VMAX,
    CardTag.POKEMON_VSTAR,CardTag.POKEMON_VUNION];
  let ownerRootActions=0,orderedPairRootActions=0;
  let toolHoldRootActions=0,floatCandidateRootActions=0;
  let possibleDoubleBurrowRootActions=0,imminentDeckoutRootActions=0;
  const signatures=new Set(),examples=[];
  const patched=function passivePhysicalRank3RootAudit(action,...args){
    const s=this.state;
    if(s?.players?.length===2&&
        s.activePlayer===sourceSeat&&
        s.phase===GamePhase.PLAYER_TURN&&
        !s.prompts.some(p=>p.result===undefined)){
      const owner=s.players[sourceSeat],opponent=s.players[1-sourceSeat];
      const tools=owner.hand.cards.filter(c=>c.trainerType===TrainerType.TOOL);
      ownerRootActions++;
      if(tools[0]?.fullName===FSS&&
          tools.some(c=>c.fullName===FLOAT)){
        orderedPairRootActions++;
        const stone=selectStoneRecipient(owner,{
          toolType:TrainerType.TOOL,vTags,
          ownerPlayerType:PlayerType.BOTTOM_PLAYER});
        const snorlax=owner.active.getPokemonCard();
        const benched=owner.bench.find(p=>
          p.getPokemonCard()?.fullName==='Bunnelby PRC');
        const fundedBurrow=Boolean(benched?.energies.cards.some(c=>
          c.fullName==='Capture Energy RCL'));
        if(stone.kind==='hold')toolHoldRootActions++;
        const printedPossible=stone.kind==='hold'&&
          snorlax?.retreat?.length>0&&owner.active.tools.length===0&&
          owner.bench.some(slot=>slot.getPokemonCard());
        if(printedPossible)floatCandidateRootActions++;
        if(printedPossible&&fundedBurrow)
          possibleDoubleBurrowRootActions++;
        if(printedPossible&&fundedBurrow&&opponent.deck.cards.length<=2)
          imminentDeckoutRootActions++;
        const snapshot={
          turn:s.turn,sourceSeat,hand:owner.hand.cards.map(c=>c.fullName),
          sourceActive:snorlax?.fullName??null,
          sourceActiveTools:owner.active.tools.map(c=>c.fullName),
          sourceActiveEnergies:owner.active.energies.cards.map(c=>c.fullName),
          sourceBench:owner.bench.map(slot=>slot.getPokemonCard()?.fullName??null),
          bunnelbyEnergy:benched?.energies.cards.map(c=>c.fullName)??null,
          sourceVstarUsed:owner.usedVSTAR,
          opponentPublicDeckCount:opponent.deck.cards.length
        };
        const fingerprint=sha(snapshot);
        if(!signatures.has(fingerprint)){
          signatures.add(fingerprint);
          if(examples.length<24)examples.push({
            stateFingerprint:fingerprint,
            ...snapshot,
            fssHold:stone.kind==='hold',
            fssReason:stone.reason??null,
            printedFloatCandidate:printedPossible,
            fundedBurrow,
            intendedNextActionType:action?.type??null,
            intendedNextActionName:action?.name??null
          });
        }
      }
    }
    return original.call(this,action,...args);
  };
  Store.prototype.dispatch=patched;
  try{
    return {result:execute(),audit:{
      version:VERSION,sourceSeat,ownerRootActions,
      orderedPairRootActions,toolHoldRootActions,
      floatCandidateRootActions,possibleDoubleBurrowRootActions,
      imminentDeckoutRootActions,
      distinctOrderedPairPhysicalStates:signatures.size,
      examples,
      readOnly:true,competitiveQualifiedGames:0
    }};
  }finally{
    assert.equal(Store.prototype.dispatch,patched);
    Store.prototype.dispatch=original;
  }
}

/** @returns {object[]} Fixed, disclosed before executing this census. */
function schedule(){
  return [0,1].flatMap(candidateSeat=>SEEDS.map(seed=>({
    candidateSeat,sourceSeat:1-candidateSeat,seed,
    id:'rank3-'+candidateSeat+'-'+seed
  })));
}

/** @param {object} c Fixed full-physical-deal slot.
 *  @param {object} cards Original full converted 60s.
 */
function runOne(c,cards){
  const request={
    deckA:c.candidateSeat===0?cards.candidate:cards.source,
    deckB:c.candidateSeat===1?cards.candidate:cards.source,
    seed:c.seed,maxActions:ROOT_LIMIT,
    label:'agent2-original-rank3-passive-fss-float-'+c.id,
    strictPromptValidation:true,
    mandatoryOptionFallback:true,
    enforceSelectOptionLegality:true,
    enforceVisiblePlayLockBothSeats:true,
    captureInitialFullPhysicalDeal:true,
    captureDecisionTrace:true,
    captureInitialSourceDealFingerprintSeat:c.sourceSeat
  };
  try{
    const guarded=withNativePaperSupporterDiscipline(()=>
      withCanonicalActorOnlyPolicy(()=>
        withReadOnlyFssFloatRootCensus(c.sourceSeat,()=>
          withSameTargetAttachEnergySelection(()=>runMatch(request)).result
        ),{
          root:work=>withActorOnlyRootPolicy(work,{
            publicContextSpecialEnergy:true,specialEnergyRoot:true
          })
        },{ownerSingleSearch:true,genericFallbackAttribution:true})
    );
    const observation=guarded.result.result;
    const game=observation.result;
    return {
      case:c,status:game.finished?'native-terminal':'action-cap',
      sourceDeckSha256:sha(cards.source),
      candidateDeckSha256:sha(cards.candidate),
      fullInitialDealSha256:game.initialFullPhysicalDealFingerprint?.digestSha256??null,
      sourceInitialDealSha256:game.initialSourceDealFingerprint?.digestSha256??null,
      nativeWinner:game.winner??null,
      nativeActions:game.actions??null,
      audit:observation.audit,
      competitivelyQualified:false
    };
  }catch(error){
    return {case:c,status:'native-error',
      error:String(error?.stack??error).slice(0,2000),
      competitivelyQualified:false};
  }
}

function run(){
  initializeCards();
  const cards=originals(),attempts=schedule();
  const old=new Map([
    ['AGENT8_ACTOR_QUICK_BALL_DEV',process.env.AGENT8_ACTOR_QUICK_BALL_DEV],
    ['AGENT41_OWNER_TERMINAL_ARBITRATION_DEV',
      process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV]
  ]);
  try{
    process.env.AGENT8_ACTOR_QUICK_BALL_DEV='false';
    process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV='false';
    const rows=attempts.map(c=>runOne(c,cards));
    return {
      version:VERSION,
      opponentRank:3,candidateReferenceRank:1,
      sourceOriginalCardHash:sha(cards.source),
      candidateOriginalCardHash:sha(cards.candidate),
      nativePin:PIN,maxRootActionsPerMatch:ROOT_LIMIT,
      seeds:[...SEEDS],candidateSeats:[0,1],
      rows,
      summary:{
        attempted:rows.length,errors:rows.filter(r=>r.status==='native-error').length,
        engineTerminals:rows.filter(r=>r.status==='native-terminal').length,
        capped:rows.filter(r=>r.status==='action-cap').length,
        totalOwnerRoots:rows.reduce((n,r)=>n+(r.audit?.ownerRootActions??0),0),
        orderedFssFirstFloatRoots:rows.reduce(
          (n,r)=>n+(r.audit?.orderedPairRootActions??0),0),
        distinctOrderedPairStates:rows.reduce(
          (n,r)=>n+(r.audit?.distinctOrderedPairPhysicalStates??0),0),
        printedFloatCandidateRoots:rows.reduce(
          (n,r)=>n+(r.audit?.floatCandidateRootActions??0),0),
        fundedDoubleBurrowCandidateRoots:rows.reduce(
          (n,r)=>n+(r.audit?.possibleDoubleBurrowRootActions??0),0),
        imminentDeckoutRoots:rows.reduce(
          (n,r)=>n+(r.audit?.imminentDeckoutRootActions??0),0),
        competitiveQualifiedGames:0
      },
      limitation:'Read-only original-deck root audit under unqualified common bilateral policy. No changes to policy or cards; absence of opportunity in an eight-deal panel does not establish rarity or superiority.'
    };
  }finally{
    for(const [name,value] of old){
      if(value===undefined)delete process.env[name];
      else process.env[name]=value;
    }
  }
}
if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(result.summary.errors>0)process.exitCode=1;
}
module.exports={VERSION,SEEDS,ROOT_LIMIT,schedule,run,runOne,
  withReadOnlyFssFloatRootCensus};
