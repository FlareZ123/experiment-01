'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {withRank8AuthenticK0Observer}=
  require('./agent44-rank8-box-k0-source-census.cjs');
const {chooseOwnedBoxFetchShake}=
  require('./agent44-secretbox-owner-prompt.cjs');

const ENGINE=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const SEED=214648959;
const ORIGINAL_OWNER_HAND=[
  'Carmine TWM','Float Stone BKT','Quick Ball FST','Dark Patch ASR',
  'Battle VIP Pass FST','Secret Box TWM','Trubbish PAR'
];

/**
 * Execute an originally dealt first-own-turn Secret Box -> Boost Shake
 * attempt on registered rank8 without ANY researcher hand/deck/Prize swap.
 * Only native Store and original player-visible legal actions change the
 * match after the intercepted source K0 decision. This is a singled-out
 * original physical seed selected after a 208-source observer cohort,
 * so it can demonstrate existence but cannot estimate success frequency.
 *
 * @template T
 * @param {()=>T} execute Native source/deck match.
 * @returns {{result:T,stage:number,steps:object[],nativeK1:object|null,sourceFirstTurn:number|null,opponentReply:object|null}}
 */
function withOriginalRank8FirstTurnBoxShake(execute){
  const {SimpleTacticsAi}=require(path.join(ENGINE,'simple-bot/simple-tactics-ai'));
  const {PlayCardAction,PlayerType,SlotType}=
    require(path.join(ENGINE,'game/store/actions/play-card-action'));
  const {ResolvePromptAction}=
    require(path.join(ENGINE,'game/store/actions/resolve-prompt-action'));
  const {GamePhase}=require(path.join(ENGINE,'game/store/state/state'));
  const previous=SimpleTacticsAi.prototype.decodeNextAction;
  const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  let stage=0,sourceFirstTurn=null,nativeK1=null,opponentReply=null;
  const steps=[];
  /** @param {object} owner @param {string} name @param {object} target */
  function play(owner,name,target=board){
    const index=owner.hand.cards.findIndex(card=>card.name===name);
    assert.ok(index>=0,'Actual original owner has no '+name);
    return new PlayCardAction(owner.id,index,target);
  }
  /** @param {object} prompt @param {string[]} names @param {object} state */
  function choose(prompt,names,state){
    const taken=new Set();
    const selected=names.map(name=>{
      const idx=prompt.cards.cards.findIndex((card,i)=>
        card.name===name&&!taken.has(i));
      assert.ok(idx>=0,'No genuine owner-prompt card '+name);
      taken.add(idx);
      return prompt.cards.cards[idx];
    });
    assert.equal(prompt.validate(selected,state),true,
      'Actual native owner prompt rejected '+names.join(' + '));
    return new ResolvePromptAction(prompt.id,selected);
  }
  /** @param {object} state @param {string} detail @param {object} action */
  function next(state,detail,action){
    steps.push({stage,turn:state.turn,detail,action:action.constructor.name});
    stage++;
    return action;
  }
  SimpleTacticsAi.prototype.decodeNextAction=function(state){
    const owner=state.players.find(player=>player.id===this.client?.id);
    const pending=state.prompts.find(prompt=>prompt.result===undefined);
    if(stage===8&&!opponentReply&&sourceFirstTurn!==null&&
       state.turn>sourceFirstTurn&&state.activePlayer===1&&
       state.phase===GamePhase.PLAYER_TURN&&!pending){
      const source=state.players[0];
      opponentReply={
        turn:state.turn,
        sourceActive:source.active.getPokemonCard()?.fullName??null,
        sourceBench:source.bench.map(slot=>({
          name:slot.getPokemonCard()?.name??null,
          tools:slot.tools.map(card=>card.name)})),
        candidateActive:state.players[1].active.getPokemonCard()?.fullName??null
      };
    }
    if(owner?.id!==101||stage>=8)return previous.call(this,state);
    if(stage===0){
      if(state.activePlayer!==0||state.phase!==GamePhase.PLAYER_TURN||
         state.turn>2||pending)return previous.call(this,state);
      assert.deepEqual(owner.hand.cards.map(card=>card.fullName),
        ORIGINAL_OWNER_HAND,'Authentic 208-deal K0 hand fingerprint drift');
      sourceFirstTurn=state.turn;
      return next(state,'original source plays held Secret Box',play(owner,'Secret Box'));
    }
    if(stage===1){
      if(pending?.constructor.name!=='ChooseCardsPrompt')
        return previous.call(this,state);
      return next(state,'native Box three printed upfront discards',
        choose(pending,['Quick Ball','Battle VIP Pass','Dark Patch'],state));
    }
    if(stage===2){
      if(pending?.constructor.name!=='ChooseCardsPrompt')
        return previous.call(this,state);
      const planned=chooseOwnedBoxFetchShake(pending,owner,state);
      const {selectedCards,...diagnostic}=planned;
      nativeK1=diagnostic;
      assert.equal(planned.eligible,true,
        'Original unprized owner deck cannot support Box Item Shake');
      assert.deepEqual(planned.selectedNames,['Boost Shake'],
        'Owned Float Stone already in hand, only fetch printed Shake');
      return next(state,'real Box owner K1 selects unprized Boost Shake',
        new ResolvePromptAction(pending.id,selectedCards));
    }
    if(pending)return previous.call(this,state);
    if(stage===3){
      const index=owner.bench.findIndex(slot=>!slot.getPokemonCard());
      assert.ok(index>=0,'Source original Bench already full');
      return next(state,'bench originally held Trubbish',
        play(owner,'Trubbish',{player:PlayerType.BOTTOM_PLAYER,
          slot:SlotType.BENCH,index}));
    }
    if(stage===4){
      const index=owner.bench.findIndex(slot=>
        slot.getPokemonCard()?.name==='Trubbish');
      assert.ok(index>=0,'Originally held Trubbish not Benched');
      return next(state,'attach originally held Float Stone',
        play(owner,'Float Stone',{player:PlayerType.BOTTOM_PLAYER,
          slot:SlotType.BENCH,index}));
    }
    if(stage===5)
      return next(state,'play original-source Box-fetched Boost Shake',
        play(owner,'Boost Shake'));
    if(stage===6)throw Error('No native owner Garbodor search after Shake');
    return previous.call(this,state);
  };
  try {
    const result=execute();
    return {result,stage,steps,sourceFirstTurn,nativeK1,opponentReply};
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction=previous;
  }
}

/**
 * The second half of Shake has two actual native prompts after playing it:
 * a deck Evolution selection and a target Pokémon in play. This function
 * deliberately injects only those original paper-legal selections.
 *
 * @template T
 * @param {()=>T} execute
 * @returns {object}
 */
function withOriginalRank8FirstTurnCompletion(execute){
  // Completion is implemented in the main policy hook; this wrapper is
  // retained as a named boundary for native first-turn review.
  return execute();
}

function main(){
  const candidate=require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
  const plan=planAichi(candidate,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(deck=>deck.rank===8);
  assert.equal(source?.status,'ready');
  const request={
    deckA:source.cards,deckB:plan.candidate.cards,
    seed:SEED,maxActions:120,strictPromptValidation:true,
    forestSealSearchCorrection:true,doubleDragonRecovery:true,
    supporterDecisionCorrection:true,isolatePolicyRandomness:true,
    leleEntryAbilityLockCorrection:true,radiantGateLockCorrection:true,
    entryDrawLockCorrection:true,captureDecisionTrace:true,
    label:'agent44-original-source-rank8-firstturn-box-shake-seed-214648959'
  };
  initializeCards();
  const {Store}=require(path.join(ENGINE,'game/store/store'));
  const baseline=withRank8AuthenticK0Observer(Store,0,()=>runMatch(request));
  const attempted=withRank8AuthenticK0Observer(Store,0,()=>
    withOriginalRank8FirstTurnBoxShake(()=>runMatch(request)));
  assert.deepEqual(attempted.sourceK0,baseline.sourceK0,
    'Original source first-turn K0 state was modified before owner acted');
  assert.deepEqual(attempted.result.result.deckHashes,baseline.result.deckHashes,
    'Original source deck multiset or initial physical deal diverged');
  const replay=attempted.result;
  const restored=runMatch(request);
  assert.deepEqual(restored.decisionTrace,baseline.result.decisionTrace,
    'Native firstturn owner-policy hook contaminated later original replay');
  return {
    schema:'agent44-natural-original-rank8-first-own-turn-boostshake-v1',
    seed:SEED,
    sourceRank:8,
    sourceDeckOriginal:true,
    candidateDeckOriginal:true,
    physicalDealOriginal:true,
    noPreActionZoneMutation:true,
    sourceFirstTurn:replay.sourceFirstTurn,
    sourceK0:attempted.sourceK0,
    nativeStage:replay.stage,
    steps:replay.steps,
    nativeK1:replay.nativeK1,
    opponentReply:replay.opponentReply,
    originalK0ControlParity:true,
    originalDeckHashParity:true,
    restoredControlDecisionParity:true,
    nativeAcceptedCompleteEvolution:false,
    competitiveQualifiedGames:0,
    caveat:'One retrospectively selected original-source seed from archived 208-deal K0 witnesses, with scripted original-owner action choices. A native-positive test proves this specific original deal line exists, not its natural policy trigger frequency, full matchup win strength, or 99.5% performance.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={SEED,ORIGINAL_OWNER_HAND,
  withOriginalRank8FirstTurnBoxShake,withOriginalRank8FirstTurnCompletion,main};
