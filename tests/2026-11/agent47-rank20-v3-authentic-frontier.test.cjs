'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../../simulation/twinleaf/agent47-apex-ultraball-original-store.cjs');
const {assertSource60Conserved}=
 require('../../simulation/twinleaf/agent47-apex-ultraball-followthrough-original-store.cjs');
const {actorObservation}=
 require('../../simulation/twinleaf/actor-observation-contract.cjs');
const {createKnownCapFreeActionEnumerator,assertKnownCapFreeAdapterAdmissionClear}=
 require('../../simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs');
const {buildNativeActionFrontier,selectedNativeAction}=
 require('../../simulation/evaluation/2026-11/agent36-native-action-frontier.cjs');
const {createRank20RyunoSession}=require('../../simulation/evaluation/2026-11/agent47-rank20-ryuno-terminal-slice.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const OUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=p=>require(path.join(OUT,p));
const cardActions=load('game/store/actions/play-card-action'),
 gameActions=load('game/store/actions/game-actions'),
 cardTypes=load('game/store/card/card-types');
const native={
 ActionEnumerator:load('advanced-bot/action-enumerator').ActionEnumerator,
 Simulator:load('game/bots/simulator').Simulator,
 GameError:load('game/game-error').GameError,
 PokemonCard:load('game/store/card/pokemon-card').PokemonCard,
 TrainerCard:load('game/store/card/trainer-card').TrainerCard,
 EnergyCard:load('game/store/card/energy-card').EnergyCard,
 PlayerType:cardActions.PlayerType,SlotType:cardActions.SlotType,
 Stage:cardTypes.Stage,TrainerType:cardTypes.TrainerType,
 SpecialCondition:cardTypes.SpecialCondition,
 CardType:cardTypes.CardType,EnergyType:cardTypes.EnergyType,
 cardActions,gameActions
};
function moveDonorFromSource(x){
 const p=x.owner;
 for(const zone of [p.deck,...p.prizes,p.hand]){
  const index=zone.cards.findIndex(c=>c.fullName==='Mega Dragonite ex M2a');
  if(index>=0){p.discard.cards.push(zone.cards.splice(index,1)[0]);return;}
 }
 throw new Error('MISSING_EXACT_SOURCE20_M2A');
}
for(const seat of [0,1]){
 test('actual actor observation and cap-free native frontier exact source20 seat '+seat,()=>{
  const x=stage(seat);
  moveDonorFromSource(x);
  assertSource60Conserved(x.owner);
  const observation=actorObservation(x.state,seat);
  const enumerator=createKnownCapFreeActionEnumerator({native,enginePin:PIN});
  const frontier=buildNativeActionFrontier({state:x.state,actorSeat:seat,native,enumerator});
  const admission=assertKnownCapFreeAdapterAdmissionClear({
    enumerator,enginePin:PIN,frontierDiagnostics:frontier.diagnostics});
  assert.ok(admission);
  const offered=frontier.actionFrontier.items.filter(c=>
    c.kind==='attack'&&c.attackName==='Apex Dragon');
  assert.ok(offered.length===1,
    'source20 funded Apex must appear exactly once in the complete cap-free legal frontier: '+
      JSON.stringify(frontier.diagnostics));
  const session=createRank20RyunoSession({role:'opponent',seat});
  const decision=session.decide({role:'opponent',seat,observation,
    actionFrontier:frontier.actionFrontier,prompt:null});
  assert.ok(decision,
    'source20 policy declined authentic actor observation and enumerated Apex: '+
    JSON.stringify({
      active:observation.ownPublic.active,
      target:observation.opponentPublic.active,
      ownTurn:observation.ownPublic.publicTurnRestrictions,
      oppTurn:observation.opponentPublic.publicTurnRestrictions,
      prizes:observation.ownPublic.prizeCount,
      bench:observation.opponentPublic.bench
    }));
  assert.equal(decision.kind,'select-action');
  assert.equal(decision.token,offered[0].token);
  protocol.validateDecision(decision,null,protocol.validateFrontier(frontier.actionFrontier));
  const action=selectedNativeAction(frontier,decision.token);
  assert.equal(action.type,'ATTACK_ACTION');
  assert.equal(action.name,'Apex Dragon');
  assert.equal(action.clientId,x.owner.id);
  console.log(JSON.stringify({seat,originalSource60:true,
    offeredCount:frontier.actionFrontier.items.length,
    actionAdmission:admission.frontierDiagnostics,
    policyChoice:decision,
    nativeActionType:action.type,
    nativeActionSource:action.__agent3AttackSource??null,
    paperMatchupQualified:false}));
 });
}
