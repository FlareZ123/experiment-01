'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stageSource,PIN}=
  require('./agent39-rank29-peonia-original-print-native.cjs');
const {chooseOwnerPeoniaSlots,recordAcceptedPeoniaPositions}=
  require('./agent39-peonia-owner-visited-slots.cjs');

const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(root,p));
const {PlayCardAction,PlayerType,SlotType}=
  native('game/store/actions/play-card-action');
const {ResolvePromptAction}=
  native('game/store/actions/resolve-prompt-action');
const {PassTurnAction}=native('game/store/actions/game-actions');
const {GamePhase}=native('game/store/state/state');
const {ChoosePrizePromptResolver}=
  native('simple-bot/prompt-resolver/choose-prize-prompt-resolver');
const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};

/** @param {object} scene */
function pending(scene){
  return scene.state.prompts.find(p=>p.result===undefined)??null;
}

/**
 * Genuine EndTurnEffect followed by actual between-turn and next-turn
 * compulsory draw. Only the two WaitPrompt controls are automatically
 * resolved. No owner actions, Supporters or cards are fabricated.
 * @param {object} scene
 * @returns {object}
 */
function advanceOneRealTurn(scene){
  const {state,store}=scene;
  assert.equal(state.phase,GamePhase.PLAYER_TURN);
  assert.equal(pending(scene),null);
  const previousSeat=state.activePlayer;
  const before=state.turn;
  const player=state.players[previousSeat];
  store.dispatch(new PassTurnAction(player.id));
  const waits=[];
  for(let k=0;k<6;k++){
    const p=pending(scene);
    if(!p)break;
    assert.equal(p.constructor.name,'WaitPrompt');
    waits.push({id:p.id,ownerId:p.playerId});
    store.dispatch(new ResolvePromptAction(p.id,null));
  }
  assert.equal(pending(scene),null,'No unhandled between-turn prompts');
  assert.equal(state.phase,GamePhase.PLAYER_TURN);
  assert.equal(state.turn,before+1);
  assert.equal(state.activePlayer,1-previousSeat);
  assert.equal(waits.length,2);
  return {fromTurn:before,toTurn:state.turn,
    fromSeat:previousSeat,toSeat:state.activePlayer,
    waitPrompts:waits.length};
}

/**
 * Physically play the one source Peonia from owner's own hand and complete
 * its actual Prize/hand-replacement/order prompts. The Prize selection
 * either uses the pinned bot or a pure actor-owned visited-position plan.
 * @param {object} scene
 * @param {'generic'|'complement'} selector
 * @param {number[]} acceptedVisited
 */
function playActualPeonia(scene,selector,acceptedVisited){
  const {store,state,owner}=scene;
  assert.equal(state.activePlayer,scene.seat);
  assert.equal(owner.supporterTurn,0);
  const held=owner.hand.cards.findIndex(c=>c.fullName==='Peonia CRE');
  assert.ok(held>=0,'Source must physically hold recovered Peonia');
  const physical=owner.hand.cards[held];
  assert.equal(physical.canPlay(store,state,owner),true);
  store.dispatch(new PlayCardAction(owner.id,held,board));
  const choose=pending(scene);
  assert.equal(choose?.constructor.name,'ChoosePrizePrompt');
  assert.equal(choose.playerId,owner.id);
  const occupiedIndices=owner.prizes.map((slot,i)=>
    slot.cards.length>0?i:null).filter(i=>i!==null);
  let indices;
  if(selector==='generic'){
    const resolver=new ChoosePrizePromptResolver({});
    const action=resolver.resolvePrompt(state,owner,choose);
    indices=action.result.map(slot=>owner.prizes.indexOf(slot));
    assert.equal(choose.validate(action.result,state),true);
    store.dispatch(action);
  }else{
    const existing=owner.hand.cards.filter(c=>
      ['Crushing Hammer POR',"Trainers' Mail ROS",'Tag Call CEC']
        .includes(c.fullName));
    const plan=chooseOwnerPeoniaSlots({
      occupiedIndices,visitedIndices:acceptedVisited,
      safeReplacementCount:existing.length
    });
    assert.ok(plan&&plan.indices.length===3);
    indices=plan.indices;
    const selected=indices.map(i=>owner.prizes[i]);
    assert.equal(choose.validate(selected,state),true);
    store.dispatch(new ResolvePromptAction(choose.id,selected));
  }
  assert.equal(owner.supporterTurn,1);
  const pay=pending(scene);
  assert.equal(pay?.constructor.name,'ChooseCardsPrompt');
  assert.strictEqual(pay.cards,owner.hand);
  const replacements=owner.hand.cards.filter(c=>
    ['Crushing Hammer POR',"Trainers' Mail ROS",'Tag Call CEC']
      .includes(c.fullName)).slice(0,indices.length);
  assert.equal(replacements.length,indices.length);
  assert.equal(pay.validate(replacements),true);
  store.dispatch(new ResolvePromptAction(pay.id,replacements));
  const reorder=pending(scene);
  assert.equal(reorder?.constructor.name,'OrderCardsPrompt');
  assert.equal(reorder.validate(indices.map((_,i)=>i)),true);
  store.dispatch(new ResolvePromptAction(reorder.id,
    indices.map((_,i)=>i)));
  assert.equal(pending(scene),null);
  assert.ok(owner.discard.cards.includes(physical));
  assert.equal(owner.prizes.reduce((s,p)=>s+p.cards.length,0),6);
  for(const c of replacements)
    assert.ok(owner.prizes.some(slot=>slot.cards.includes(c)));
  return {turn:state.turn,seat:state.activePlayer,indices,
    sourcePrinting:physical.fullName,replacements:replacements.map(c=>c.fullName),
    visitedAfter:recordAcceptedPeoniaPositions(acceptedVisited,indices)};
}

/**
 * Source-own physical Lusamine to recover the actual discarded Peonia.
 * No direct card movement, and prompt selection is made from public own
 * discard rather than hidden Prize cards.
 * @param {object} scene
 */
function playActualLusamine(scene){
  const {store,state,owner}=scene;
  assert.equal(state.activePlayer,scene.seat);
  assert.equal(owner.supporterTurn,0);
  const held=owner.hand.cards.findIndex(c=>c.fullName==='Lusamine CIN');
  assert.ok(held>=0);
  const lusamine=owner.hand.cards[held];
  const peonia=owner.discard.cards.find(c=>c.fullName==='Peonia CRE');
  assert.ok(peonia,'First Peonia must be physically in public discard');
  assert.equal(lusamine.canPlay(store,state,owner),true);
  store.dispatch(new PlayCardAction(owner.id,held,board));
  const choose=pending(scene);
  assert.equal(choose?.constructor.name,'ChooseCardsPrompt');
  assert.strictEqual(choose.cards,owner.discard);
  assert.equal(choose.playerId,owner.id);
  assert.equal(choose.options.min,1);
  assert.equal(choose.validate([peonia]),true);
  store.dispatch(new ResolvePromptAction(choose.id,[peonia]));
  const reveal=pending(scene);
  assert.equal(reveal?.constructor.name,'ShowCardsPrompt');
  assert.equal(reveal.playerId,scene.opponent.id);
  assert.ok(reveal.cards.includes(peonia));
  store.dispatch(new ResolvePromptAction(reveal.id,true));
  assert.equal(pending(scene),null);
  assert.equal(owner.supporterTurn,1);
  assert.ok(owner.hand.cards.includes(peonia));
  assert.ok(owner.discard.cards.includes(lusamine));
  return {turn:state.turn,seat:scene.seat,printing:lusamine.fullName,
    recoveredPrinting:peonia.fullName};
}

/**
 * Two genuine original Store runs on identical prepared source positions
 * with either generic repeated first-three or owner-approved complement.
 * Opponent explicitly passes twice; this does not model competent play.
 * @param {0|1} seat
 * @param {'generic'|'complement'} treatment
 */
function runArm(seat,treatment){
  const scene=stageSource(seat);
  const {owner,state,criticalPrized}=scene;
  const temp=owner.prizes[4].cards[0];
  owner.prizes[0].cards[0]=temp;
  owner.prizes[4].cards[0]=criticalPrized;
  const before={turn:state.turn,ownerSeat:seat,
    ownerDeck:owner.deck.cards.length,
    opponentDeck:scene.opponent.deck.cards.length,
    criticalPrizeIndex:4};
  const first=playActualPeonia(scene,'generic',[]);
  assert.deepEqual(first.indices,[0,1,2]);
  assert.ok(owner.prizes[4].cards.includes(criticalPrized));
  const transitions=[];
  transitions.push(advanceOneRealTurn(scene));
  transitions.push(advanceOneRealTurn(scene));
  const recovered=playActualLusamine(scene);
  transitions.push(advanceOneRealTurn(scene));
  transitions.push(advanceOneRealTurn(scene));
  const second=playActualPeonia(scene,treatment,first.visitedAfter);
  assert.ok(state.turn>first.turn&&second.turn>recovered.turn);
  assert.equal(state.activePlayer,seat);
  assert.equal(owner.prizes.reduce((n,p)=>n+p.cards.length,0),6);
  const recoveredH=owner.hand.cards.includes(criticalPrized);
  assert.equal(recoveredH,treatment==='complement');
  assert.equal(owner.prizes[4].cards.includes(criticalPrized),
    treatment==='generic');
  assert.equal(pending(scene),null);
  return {seat,treatment,before,first,recovered,second,
    transitions,physicallyRecoveredCriticalHandiwork:recoveredH,
    physicallyPrizedCriticalHandiwork:!recoveredH,
    completeOriginal60:false,competitivelyQualifiedGames:0};
}

/** @returns {object} */
function run(){
  return {schema:'agent39-rank29-peonia-lusamine-real-turn-v1',
    enginePin:PIN,
    cases:[0,1].flatMap(seat=>['generic','complement'].map(t=>
      runArm(seat,t))),
    nativeTurns:true,nativeSupporterQuota:true,
    sourceCardOriginalRank29Printings:true,
    realOpponentResponse:false,sourceDealtOriginal60:false,
    qualifiedGames:0};
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');

module.exports={advanceOneRealTurn,playActualPeonia,
  playActualLusamine,runArm,run};
