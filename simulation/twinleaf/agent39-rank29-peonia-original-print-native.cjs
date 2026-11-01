'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('./agent11-native-last-bench-locked-dedenne.cjs');
const {initializeCards}=require('./headless.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const OUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(OUT,p));

/**
 * Only the original-rank29 registered printing family is used for the
 * Peonia hand/replacement cards; source hand and Prize placement are
 * staged deliberately and are NOT a naturally dealt original game.
 * @param {0|1} seat
 * @returns {object}
 */
function stageSource(seat){
  const scene=stage(seat),manager=initializeCards();
  let index=990000;
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Pinned engine missing '+name);
    c.id=++index;return c;
  };
  scene.owner.active.cards.length=0;
  scene.owner.active.cards.push(card('Iron Thorns ex TWM'));
  for(const bench of scene.owner.bench)bench.cards.length=0;
  scene.opponent.active.cards.length=0;
  scene.opponent.active.cards.push(card('Regidrago V SIT'));
  scene.owner.hand.cards.length=0;
  scene.owner.hand.cards.push(card('Peonia CRE'),
    card('Lusamine CIN'),card('Lusamine CIN'));
  for(let k=0;k<4;k++)scene.owner.hand.cards.push(
    card('Crushing Hammer POR'));
  const criticalPrized=card("Team Rocket's Handiwork FCO");
  scene.owner.prizes[0].cards[0]=criticalPrized;
  assert.equal(scene.owner.prizes.length,6);
  return {...scene,criticalPrized};
}

/**
 * Check the pinned native prompt contract against the printed "up to 3"
 * for a real original rank29 source printing. Actual Store accepts 1 even
 * though native ChoosePrizePrompt.validate rejects it; this is a
 * source-stamped, narrow negative about the checker, not a whole-game win.
 * @param {0|1} seat
 * @param {1|2|3} selectedCount
 * @returns {object}
 */
function playPeonia(seat,selectedCount){
  assert.ok(seat===0||seat===1);
  assert.ok([1,2,3].includes(selectedCount));
  const scene=stageSource(seat),{owner,state,store}=scene;
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  const targetCard=owner.hand.cards[0];
  assert.equal(targetCard.fullName,'Peonia CRE');
  store.dispatch(new PlayCardAction(owner.id,0,board));
  const pending=()=>state.prompts.find(p=>p.result===undefined);
  const prizePrompt=pending();
  assert.equal(prizePrompt?.constructor.name,'ChoosePrizePrompt');
  assert.equal(prizePrompt.playerId,owner.id);
  assert.equal(prizePrompt.options.count,3);
  const selected=owner.prizes.filter(slot=>slot.cards.length>0)
    .slice(0,selectedCount);
  assert.ok(selected.includes(owner.prizes[0]));
  const nativeValid=prizePrompt.validate(selected,state);
  assert.equal(nativeValid,selectedCount===3,
    'Native exact-three validator contradicts printed optional fewer');
  store.dispatch(new ResolvePromptAction(prizePrompt.id,selected));
  const returnPrompt=pending();
  assert.equal(returnPrompt?.constructor.name,'ChooseCardsPrompt');
  assert.strictEqual(returnPrompt.cards,owner.hand);
  assert.equal(returnPrompt.options.min,selectedCount);
  assert.equal(returnPrompt.options.max,selectedCount);
  assert.ok(owner.hand.cards.includes(scene.criticalPrized));
  const payment=owner.hand.cards.filter(c=>
    c.fullName==='Crushing Hammer POR').slice(0,selectedCount);
  assert.equal(payment.length,selectedCount);
  assert.equal(returnPrompt.validate(payment),true);
  store.dispatch(new ResolvePromptAction(returnPrompt.id,payment));
  const orderPrompt=pending();
  assert.equal(orderPrompt?.constructor.name,'OrderCardsPrompt');
  assert.equal(orderPrompt.cards.cards.length,selectedCount);
  const order=Array.from({length:selectedCount},(_,i)=>i);
  assert.equal(orderPrompt.validate(order),true);
  store.dispatch(new ResolvePromptAction(orderPrompt.id,order));
  assert.equal(store.hasPrompts(),false);
  assert.equal(owner.prizes.reduce((n,slot)=>n+slot.cards.length,0),6);
  assert.ok(owner.hand.cards.includes(scene.criticalPrized));
  assert.ok(owner.discard.cards.includes(targetCard),
    'Original Peonia Supporter physically settled in owner discard');
  for(const p of payment)assert.ok(owner.prizes.some(slot=>
    slot.cards.includes(p)),'Each selected safe replacement is Prized');
  return {seat,originalRank:29,printing:'Peonia CRE',
    originalRank29CorePrized:true,
    selectedCount,nativePrintedChoiceValid:true,
    nativePromptValidatorAccepts:nativeValid,
    physicalCoreRetrieved:true,physicalReplacements:selectedCount,
    fullPromptChainClosed:true,nativeSourcePrintedCards:true,
    completeOriginal60:false,competitiveQualifiedGames:0};
}

/** @returns {object} */
function run(){
  return {schema:'agent39-rank29-native-peonia-optional-source-v1',
    pin:PIN,records:[0,1].flatMap(seat=>
      [1,2,3].map(count=>playPeonia(seat,count))),
    status:'PREPARED_NATIVE_OWNER_PHYSICAL_PROMPT_ONLY',
    fixedDeckWinRateQualified:false};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={PIN,stageSource,playPeonia,run};
