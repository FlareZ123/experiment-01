'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {withStoreDispatchTranscript}=
  require('./store-dispatch-transcript.cjs');
const BASE=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Stage a physically conserved synthetic source-hand/deck swap at one known
 * original rank8 turn7 state. Research instrumentation only: this is not an
 * authorized player action and the resulting deal is not source-authentic.
 * @param {object} owner Native original-source player.
 * @returns {object} Publicly declared synthetic source multiset witness.
 */
function exchangeShakeForDeckQuickBall(owner){
  const hand=owner.hand.cards,deck=owner.deck.cards;
  const shakeIndex=hand.findIndex(c=>c.name==='Boost Shake');
  const quickIndex=deck.findIndex(c=>c.name==='Quick Ball');
  assert.ok(shakeIndex>=0&&quickIndex>=0,
    'Expected original turn7 Shake in hand and Quick Ball in deck');
  const before=[...hand,...deck].map(c=>c.fullName).sort();
  const shake=hand[shakeIndex],quick=deck[quickIndex];
  hand[shakeIndex]=quick;deck[quickIndex]=shake;
  assert.deepEqual([...hand,...deck].map(c=>c.fullName).sort(),before);
  return {mode:'explicit-synthetic-hand-deck-swap',
    handOut:shake.fullName,handIn:quick.fullName,
    source60MultisetPreserved:true,unmodifiedOriginalDeal:false};
}

/**
 * Execute new Box-fetches-Shake category allocation through genuine native
 * Item, discard, card search and evolution prompts. This opt-in is a
 * *retrospectively modified physical deal*, suitable for semantics only.
 * @template T
 * @param {()=>T} execute Synchronous genuine Store run.
 */
function withSyntheticRank8BoxFetchShake(execute){
  const {SimpleTacticsAi}=require(path.join(BASE,'simple-bot/simple-tactics-ai'));
  const {PlayCardAction,PlayerType,SlotType}=
    require(path.join(BASE,'game/store/actions/play-card-action'));
  const {ResolvePromptAction}=
    require(path.join(BASE,'game/store/actions/resolve-prompt-action'));
  const {GamePhase}=require(path.join(BASE,'game/store/state/state'));
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  let stage=0,exchange=null,turn8=null;
  const steps=[];
  /** @param {object} owner @param {string} name @param {object} target */
  function play(owner,name,target=board){
    const index=owner.hand.cards.findIndex(c=>c.name===name);
    assert.ok(index>=0,'Required own-hand printed card absent: '+name);
    return new PlayCardAction(owner.id,index,target);
  }
  /** @param {object} prompt @param {string[]} names @param {object} state */
  function choose(prompt,names,state){
    const used=new Set();
    const picked=names.map(name=>{
      const card=prompt.cards.cards.find((c,i)=>
        c.name===name&&!used.has(i));
      assert.ok(card,'Owner native search omitted '+name);
      used.add(prompt.cards.cards.indexOf(card));
      return card;
    });
    assert.equal(prompt.validate(picked,state),true,
      'Genuine native prompt rejected requested physical selection');
    return new ResolvePromptAction(prompt.id,picked);
  }
  /** @param {object} state @param {string} label @param {object} action */
  function next(state,label,action){
    steps.push({stage,turn:state.turn,label,action:action.constructor.name});
    stage++;
    return action;
  }
  SimpleTacticsAi.prototype.decodeNextAction=function(state){
    const owner=state.players.find(p=>p.id===this.client?.id);
    const pending=state.prompts.find(p=>p.result===undefined);
    if(stage>=11&&!turn8&&state.turn>=8&&
       state.phase===GamePhase.PLAYER_TURN&&!pending){
      const source=state.players[0];
      turn8={turn:state.turn,
        sourceBench:source.bench.map(slot=>({
          name:slot.getPokemonCard()?.name??null,
          tools:slot.tools.map(tool=>tool.name)})),
        candidateActive:state.players[1].active.getPokemonCard()?.name??null};
    }
    if(owner?.id!==101||stage>=11)return original.call(this,state);
    if(stage===0&&state.turn===7&&state.activePlayer===0&&
       state.phase===GamePhase.PLAYER_TURN&&!pending){
      const expected=['Boost Shake','Dark Patch','VS Seeker','Iono',
        'Secret Box','Float Stone'];
      assert.deepEqual(owner.hand.cards.map(c=>c.name).sort(),expected.sort(),
        'Retrospective source-turn hand fingerprint changed');
      exchange=exchangeShakeForDeckQuickBall(owner);
      return next(state,'play Box after declared synthetic source swap',
        play(owner,'Secret Box'));
    }
    if(stage===0)return original.call(this,state);
    const names=stage===1?['Dark Patch','VS Seeker','Iono']:
      stage===2?['Boost Shake','Temple of Sinnoh']:
      stage===4?['Temple of Sinnoh']:
      stage===5?['Trubbish']:
      stage===9?['Garbodor']:null;
    if(names){
      if(pending?.constructor.name!=='ChooseCardsPrompt')
        return original.call(this,state);
      return next(state,'choose '+names.join(' + ')+' in original owner prompt',
        choose(pending,names,state));
    }
    if(stage===10&&pending?.constructor.name==='ChoosePokemonPrompt'){
      const slot=owner.bench.find(s=>
        s.getPokemonCard()?.name==='Trubbish'&&
        s.tools.some(tool=>tool.name==='Float Stone'));
      assert.ok(slot,'No tooled Trubbish for final Shake evolution');
      assert.equal(pending.validate([slot],state),true);
      return next(state,'resolve native Shake evolution target',
        new ResolvePromptAction(pending.id,[slot]));
    }
    if(pending)return original.call(this,state);
    if(stage===3)return next(state,'play swapped held Quick Ball',
      play(owner,'Quick Ball'));
    if(stage===6){
      const index=owner.bench.findIndex(s=>!s.getPokemonCard());
      assert.ok(index>=0,'No free original Bench position');
      return next(state,'bench newly searched Trubbish',
        play(owner,'Trubbish',{player:PlayerType.BOTTOM_PLAYER,
          slot:SlotType.BENCH,index}));
    }
    if(stage===7){
      const index=owner.bench.findIndex(s=>s.getPokemonCard()?.name==='Trubbish');
      assert.ok(index>=0);
      return next(state,'attach held Float Stone',
        play(owner,'Float Stone',{player:PlayerType.BOTTOM_PLAYER,
          slot:SlotType.BENCH,index}));
    }
    if(stage===8)return next(state,'play Boost Shake fetched via Secret Box',
      play(owner,'Boost Shake'));
    if(stage===10)throw Error('Boost Shake did not produce a native target prompt');
    return original.call(this,state);
  };
  try{return {result:execute(),stage,exchange,steps,turn8};}
  finally{SimpleTacticsAi.prototype.decodeNextAction=original;}
}

/** @returns {object} Bounded source-fingerprint original Store semantics proof. */
function main(){
  const candidate=require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
  const plan=planAichi(candidate,{allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true});
  const opponent=plan.opponents.find(d=>d.rank===8);
  assert.equal(opponent?.status,'ready');
  const request={deckA:opponent.cards,deckB:plan.candidate.cards,
    seed:1260748957,maxActions:200,strictPromptValidation:true,
    forestSealSearchCorrection:true,doubleDragonRecovery:true,
    supporterDecisionCorrection:true,isolatePolicyRandomness:true,
    leleEntryAbilityLockCorrection:true,radiantGateLockCorrection:true,
    entryDrawLockCorrection:true,captureDecisionTrace:true};
  initializeCards();
  const {Store}=require(path.join(BASE,'game/store/store'));
  const opts={liveStoreOnly:true,typedActionValues:true,
    promptReferenceActionValues:true,sourceZoneEveryDispatch:true};
  const baseline=withStoreDispatchTranscript(Store,()=>runMatch(request),opts);
  const modified=withStoreDispatchTranscript(Store,()=>
    withSyntheticRank8BoxFetchShake(()=>runMatch(request)),opts);
  const replay=modified.result;
  assert.ok(replay.exchange?.source60MultisetPreserved);
  assert.equal(replay.stage,11);
  assert.ok(replay.turn8,'No candidate decision after native Box-fetch Shake');
  assert.ok(replay.turn8.sourceBench.some(p=>
    p.name==='Garbodor'&&p.tools.includes('Float Stone')),
    'Genuine Store never settled equipped Garbodor after Box fetched Shake');
  assert.deepEqual(modified.actionTrace.slice(0,86),
    baseline.actionTrace.slice(0,86),
    'Original matched physical prefix changed before synthetic intervention');
  const restored=withStoreDispatchTranscript(Store,()=>runMatch(request),opts);
  assert.deepEqual(restored.actionTrace,baseline.actionTrace,
    'Synthetic hook leaked into a subsequent unmodified replay');
  return {
    schema:'agent44-retrospective-synthetic-box-fetch-shake-native-v1',
    seed:request.seed,sourcePrefixStoreActions:86,
    declaredSyntheticDeal:replay.exchange,
    scriptedNativeSteps:replay.steps,
    candidateReplyTurnObserved:replay.turn8.turn,
    equippedGarbodorAtReply:true,
    originalStorePrefixIdentical:true,
    nativePolicyRestored:true,
    modifiedNativeActions:replay.result.actions,
    originalPhysicalDealPreserved:false,
    competitiveQualifiedGames:0,
    caveat:'Researcher swapped hand/deck card outside Store; semantically testable physical card effects only, with no natural trigger or competitive inference.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={exchangeShakeForDeckQuickBall,withSyntheticRank8BoxFetchShake,main};
