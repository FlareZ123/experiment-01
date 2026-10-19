'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const engine=name=>require(path.join(ROOT,name));
const SEED=1111464409;

/**
 * Redirect one authentic rank11 post-Shopping-Center decision into a
 * source-owned, real-Store Crobat counterattack attempt. The scripted choices
 * use own cards, available search prompts and publicly visible Pokémon only.
 * Full own deck is examined exclusively to answer an already-issued
 * Star Alchemy search. Earlier source actions and both 60s are unchanged.
 *
 * @template T
 * @param {()=>T} work Original seeded source runner.
 * @returns {{result:T,actions:object[],stage:number,intervened:boolean}}
 */
function withCrobatCounterattack(work) {
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {GamePhase}=engine('game/store/state/state');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    engine('game/store/actions/resolve-prompt-action');
  const {UseStadiumAction,UseAbilityAction,RetreatAction,AttackAction}=
    engine('game/store/actions/game-actions');
  const proto=SimpleTacticsAi.prototype;
  const original=Object.getOwnPropertyDescriptor(proto,'decodeNextAction');
  assert.equal(typeof original?.value,'function');
  let stage=0,intervened=false;
  const actions=[];
  const pendingHistory=[];
  const sourceTarget=(index)=>({
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index
  });
  const record=(state,action,notes={})=>{
    actions.push({
      stage,turn:state.turn,rootAction:action.constructor.name,
      sourceHand:state.players[0].hand.cards.map(c=>c.fullName),
      sourceUsedVSTAR:state.players[0].usedVSTAR,
      sourceRemainingPrizes:state.players[0].prizes.filter(prize=>prize.cards.length>0).length,
      ...notes
    });
    return action;
  };
  const redirected=function(state) {
    const ordinary=original.value.call(this,state);
    if(state.turn!==23||state.activePlayer!==0||
       state.players[0].id!==this.client?.id||
       state.phase!==GamePhase.PLAYER_TURN||stage===10) return ordinary;
    const source=state.players[0];
    const pending=state.prompts.find(p=>p.result===undefined);
    if(stage>=4 && pendingHistory.length<20) {
      pendingHistory.push({stage,turn:state.turn,
        pending:pending?.constructor.name??null,
        hand:source.hand.cards.map(c=>c.fullName),
        botAction:ordinary?.constructor.name??null});
    }
    const benchIndex=()=>source.bench.findIndex(s=>
      s.getPokemonCard()?.fullName==='Crobat V DAA');
    const latias=()=>source.bench.find(s=>
      s.getPokemonCard()?.fullName==='Latias ex SSP');
    const cardIndex=(fullName)=>source.hand.cards.findIndex(c=>c.fullName===fullName);
    if(stage===0) {
      if(pending || !(ordinary instanceof PlayCardAction) ||
         source.hand.cards[ordinary.handIndex]?.fullName!=='Marnie SSH' ||
         !source.stadium.cards.some(c=>c.fullName==='Shopping Center EVS'))return ordinary;
      assert.equal(source.usedVSTAR,false);
      assert.ok(source.discard.cards.some(c=>c.name==='Darkness Energy'));
      assert.ok(latias()?.tools.some(c=>c.fullName==='Forest Seal Stone SIT'));
      assert.ok(benchIndex()>=0);
      intervened=true;
      const selected=record(state,new UseStadiumAction(source.id),
        {replacedOriginalCard:'Marnie SSH'});
      stage=1;
      return selected;
    }
    if(stage===1) {
      if(!pending)return ordinary;
      assert.equal(pending.constructor.name,'ChoosePokemonPrompt');
      const selected=latias();
      assert.ok(selected,'Latias left the authentic Bench');
      assert.equal(pending.validate([selected],state),true);
      const answer=record(state,new ResolvePromptAction(pending.id,[selected]),
        {prompt:pending.constructor.name,tool:'Forest Seal Stone SIT'});
      stage=2;
      return answer;
    }
    if(pending) {
      if(stage===4 && pending.constructor.name==='ChooseCardsPrompt') {
        const chosen=source.deck.cards.find(c=>c.fullName==='Dark Patch ASR');
        assert.ok(chosen,'No Dark Patch remained in the real own deck');
        assert.equal(pending.validate([chosen],state),true);
        const answer=record(state,new ResolvePromptAction(pending.id,[chosen]),
          {prompt:pending.constructor.name,searchedCard:chosen.fullName});
        stage=5;
        return answer;
      }
      if(stage===5 && pending.constructor.name==='ShuffleDeckPrompt') {
        const answer=ordinary;
        assert.ok(answer instanceof ResolvePromptAction);
        record(state,answer,{prompt:'ShuffleDeckPrompt',delegate:'original bot'});
        stage=6;
        return answer;
      }
      if(stage===7 && pending.constructor.name==='AttachEnergyPrompt') {
        const chosen=source.discard.cards.find(c=>c.name==='Darkness Energy');
        assert.ok(chosen,'Dark Patch lacks a basic Darkness discard target');
        const target=sourceTarget(benchIndex());
        const transfers=[{card:chosen,to:target}];
        assert.equal(pending.validate(transfers,state),true);
        const answer=record(state,new ResolvePromptAction(pending.id,transfers),
          {prompt:pending.constructor.name,attachedCard:chosen.fullName,
            targetPokemon:'Crobat V DAA'});
        stage=8;
        return answer;
      }
      return ordinary;
    }
    if(stage===2) {
      assert.equal(latias()?.tools.some(c=>c.fullName==='Forest Seal Stone SIT'),false);
      const index=cardIndex('Forest Seal Stone SIT');
      assert.ok(index>=0,'Shopping Center failed to return Forest Seal Stone');
      const action=record(state,new PlayCardAction(source.id,index,
        sourceTarget(benchIndex())),{card:'Forest Seal Stone SIT',target:'Crobat V'});
      stage=3;
      return action;
    }
    if(stage===3) {
      assert.ok(source.bench[benchIndex()].tools.some(c=>
        c.fullName==='Forest Seal Stone SIT'));
      assert.equal(source.usedVSTAR,false);
      const action=record(state,new UseAbilityAction(source.id,
        'Star Alchemy',sourceTarget(benchIndex())),{ability:'Star Alchemy'});
      stage=4;
      return action;
    }
    if(stage===5 && cardIndex('Dark Patch ASR')>=0) {
      stage=6; // Pinned resolver may settle ShuffleDeckPrompt inside the search callback.
    }
    if(stage===6) {
      assert.equal(source.usedVSTAR,true);
      const index=cardIndex('Dark Patch ASR');
      assert.ok(index>=0,'Star Alchemy failed to reach source Dark Patch');
      const action=record(state,new PlayCardAction(source.id,index,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      }),{card:'Dark Patch ASR'});
      stage=7;
      return action;
    }
    if(stage===8) {
      const energies=source.bench[benchIndex()].energies.cards;
      assert.ok(energies.length>=2,'No completed actual Dark Patch attachment');
      const action=record(state,new RetreatAction(source.id,benchIndex()),
        {retreatTo:'Crobat V DAA',crobatEnergyCards:energies.map(c=>c.fullName)});
      stage=9;
      return action;
    }
    if(stage===9) {
      assert.equal(source.active.getPokemonCard()?.fullName,'Crobat V DAA',
        'Retreat did not actually make Crobat the Active');
      const action=record(state,new AttackAction(source.id,'Venomous Fang'),
        {attack:'Venomous Fang',
        opponentActive:state.players[1].active.getPokemonCard()?.fullName??null,
        opponentDamageBefore:state.players[1].active.damage});
      stage=10;
      return action;
    }
    return ordinary;
  };
  Object.defineProperty(proto,'decodeNextAction',{...original,value:redirected});
  try {
    const result=work();
    return {result,actions,stage,intervened,pendingHistory};
  } finally {
    Object.defineProperty(proto,'decodeNextAction',original);
  }
}

/** @returns {object} */
function run() {
  const {planAichi}=require('../evaluation/aichi-pilot.cjs');
  const {pairedCandidateSlots}=
    require('./new-moon-lockbreak-source-diagnostic.cjs');
  const {runArm}=require('./new-moon-second-start-paired.cjs');
  const source=planAichi(1,{
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  }).opponents.find(row=>row.rank===11);
  assert.equal(source?.status,'ready');
  const candidate=pairedCandidateSlots().lockbreak;
  assert.equal(candidate.length,60);
  assert.equal(source.cards.length,60);
  const args=[candidate,source.cards,1,SEED,350,true,true,false,false,true];
  const baseline=runArm(...args);
  const alternative=withCrobatCounterattack(()=>runArm(...args));
  const changed=alternative.result;
  assert.equal(baseline.firstTurnSlot,0);
  assert.equal(changed.firstTurnSlot,0);
  assert.equal(changed.verifiedByDrawLog,true);
  assert.deepEqual(baseline.deckHashes,changed.deckHashes);
  assert.equal(alternative.intervened,true,'Original source decision was never reached');
  const prior=game=>game.rootActionLedger.filter(r=>r.actionOrdinal<220)
    .map(r=>({
      ordinal:r.actionOrdinal,turn:r.turnBefore,slot:r.playerSlot,
      action:r.action,card:r.card??null,attack:r.attackChoice??null,
      ability:r.ability??null
    }));
  assert.deepEqual(prior(baseline),prior(changed),
    'Source root actions changed before original Marnie choice');
  const attack=changed.attackDeclarationTrace.find(r=>
    r.turnBefore===23&&r.playerSlot===0&&r.attackName==='Venomous Fang');
  const actualAttackTransition=changed.publicAttackTransitions.find(row=>
    row.turnBefore===23 && row.triggerPlayerSlot===0 &&
    row.declarations.some(declaration=>declaration.attackName==='Venomous Fang'));
  assert.ok(actualAttackTransition,'Real source Venomous Fang public transition was not captured');
  assert.deepEqual(actualAttackTransition.beforePrizesRemaining,[2,1],
    'Two real occupied source Prizes before counterattack');
  assert.equal(actualAttackTransition.before[1].active?.name,'Mewtwo & Mew-GX');
  assert.equal(actualAttackTransition.before[1].active?.damage,200);
  assert.equal(actualAttackTransition.promptPendingAfter,true,
    'Native Crobat declaration must settle through its actual pending prompt');
  assert.equal(actualAttackTransition.settled?.completionRootActionOrdinal,231);
  assert.equal(actualAttackTransition.settled?.after[1].active,null,
    'After the prompt, defending TAG TEAM must be Knocked Out');
  assert.equal(actualAttackTransition.settled?.after[0].active?.name,'Crobat V');
  assert.deepEqual(actualAttackTransition.settled?.prizesRemaining,[0,1],
    'Actual TAG TEAM Knock Out should close two remaining source Prizes');
  const attacksBefore=baseline.attackDeclarationTrace.filter(r=>
    r.turnBefore===22&&r.playerSlot===1&&r.attackName==='Poltergeist');
  assert.equal(attacksBefore.length,1);
  return {
    schema:'rank11-authentic-crobat-stone-patch-retreat-attack-counterfactual-v1',
    seed:SEED,retrospectivePositiveControl:true,
    fixedCandidate:'New Moon Lockbreaker English mechanics proxy 60',
    publishedOpponent:'Aichi rank11 Absol/Garbodor exact 60',
    candidateSeat:1,sourceActualFirstSeat:0,
    sourceDeckHashes:changed.deckHashes,engine:changed.engine,
    originalPrefixBefore220Identical:true,
    actionSteps:alternative.actions,
    pendingHistory:alternative.pendingHistory,
    finalStage:alternative.stage,
    sequenceComplete:alternative.stage===10 && Boolean(attack),
    sourceAttackDeclaration:attack??null,
    sourceAttackPublicTransition:actualAttackTransition,
    sourceOccupiedPrizesAtAttack:alternative.actions.find(row=>
      row.attack==='Venomous Fang')?.sourceRemainingPrizes??null,
    sourceOccupiedPrizesAfterFork:changed.prizesRemaining[0],
    baseline:{
      turns:baseline.turns,actions:baseline.actions,winner:baseline.winner,
      prizes:baseline.prizesRemaining,finished:baseline.finished,
      endReason:baseline.endReason
    },
    counterfactual:{
      turns:changed.turns,actions:changed.actions,winner:changed.winner,
      prizes:changed.prizesRemaining,finished:changed.finished,
      endReason:changed.endReason
    },
    qualifiedCompetitiveGames:0,
    caveat:'Retrospective one-game forced source-owned strategy via real pinned Store. No paper damage audit, clock, other counterplay, or strong adversarial candidate policy; no win-rate inference.'
  };
}
if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!result.sequenceComplete)process.exitCode=1;
}
module.exports={withCrobatCounterattack,run};
