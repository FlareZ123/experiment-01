'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {chooseQuickBallRootIntent}=
  require('../simulation/twinleaf/agent8-actor-quick-ball-frontier.cjs');
const {chooseRegidragoDonorQuickBall,REGIDRAGO_V,EVOLVED_DONORS}=
  require('../simulation/twinleaf/agent8-regidrago-quickball-donor-frontier.cjs');

const OUTPUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUTPUT,name));
const SEARCH_MESSAGES=new Set(['CHOOSE_CARD_TO_HAND',
  'CHOOSE_CARD_FROM_DECK','SEARCH_DECK_FOR_CARD']);

/**
 * Staged physical source-13-representable owner Quick Ball chain.
 * Both the singleton donor and the Regidrago are real native printings.
 * The exercise is conditional, with no tournament opening probability
 * or winner qualification.
 * @param {0|1} seat
 * @param {string} donor
 */
function nativeDonorLine(seat,donor){
  const x=stage(seat),manager=initializeCards();
  const printing=(name,id)=>{
    const card=manager.getCardByName(name);
    assert.ok(card,'Exact physical printing missing: '+name);
    card.id=id;return card;
  };
  x.owner.active.cards=[printing('Latias ex SSP',900001)];
  x.owner.active.energies.cards.length=0;
  x.owner.bench[1].cards.length=0;
  x.owner.hand.cards=[
    printing('Quick Ball FST',900002),
    printing(donor,900003),
    printing('Grass Energy MEE',900004)
  ];
  const found=printing(REGIDRAGO_V,900005);
  x.owner.deck.cards.push(found);
  const before=actorObservation(x.state,seat);
  assert.equal(chooseQuickBallRootIntent(before),null,
    'Original duplicate-only selector should miss source donor opportunity');
  const intent=chooseRegidragoDonorQuickBall(before);
  assert.equal(intent?.donorPrinting,donor);
  assert.equal(intent?.printing,'Quick Ball FST');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  x.store.dispatch(new PlayCardAction(x.owner.id,intent.handIndex,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  const receipts=[];
  let discarded=false,searched=false;
  for(let i=0;i<24;i++){
    const pending=x.store.state.prompts.find(p=>p.result===undefined);
    if(!pending)break;
    const kind=pending.constructor.name;
    let selection=null;
    if(kind==='ChooseCardsPrompt'&&
       pending.message==='CHOOSE_CARD_TO_DISCARD'&&
       pending.cards.cards.some(card=>card.fullName===donor)){
      assert.equal(discarded,false,'Duplicate donor payment prompt');
      selection=[pending.cards.cards.find(card=>card.fullName===donor)];
      assert.equal(pending.validate(selection),true);
      discarded=true;
    }else if(kind==='ChooseCardsPrompt'&&
             SEARCH_MESSAGES.has(pending.message)&&
             pending.cards.cards.some(card=>card===found)){
      assert.equal(searched,false,'Duplicate Regidrago owner search');
      selection=[found];
      assert.equal(pending.validate(selection),true);
      searched=true;
    }else{
      assert.ok(['WaitPrompt','ShowCardsPrompt','ShuffleDeckPrompt'].includes(kind),
        'Unexpected unqualified owner prompt '+kind+':'+pending.message);
    }
    receipts.push({kind,message:pending.message??null,
      selected:selection?.map(card=>card.fullName)??null});
    x.store.dispatch(new ResolvePromptAction(pending.id,selection));
  }
  assert.equal(x.store.hasPrompts(),false,'Quick Ball prompts did not settle');
  assert.equal(discarded,true,'Native Quick Ball omitted donor payment');
  assert.equal(searched,true,'Native Quick Ball omitted Regidrago deck search');
  assert.ok(x.owner.discard.cards.some(c=>c.fullName===donor),
    'Donor must enter native discard to enable future Apex Dragon');
  assert.ok(x.owner.hand.cards.some(c=>c===found),
    'Searched Regidrago V must enter its actual owner hand');
  const index=x.owner.hand.cards.indexOf(found);
  x.store.dispatch(new PlayCardAction(x.owner.id,index,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:1
  }));
  assert.equal(x.owner.bench[1].getPokemonCard(),found,
    'Searched Basic must be accepted on native Bench');
  assert.ok(x.owner.discard.cards.some(c=>c.fullName==='Quick Ball FST'));
  return {seat,donor,ownerBefore:before.ownHand,
    nativePrompts:receipts,donorInDiscard:true,
    regidragoOnBench:true,competitiveQualifiedGame:false};
}

for(const seat of [0,1])for(const donor of EVOLVED_DONORS){
  test('native paid Quick Ball donor->Regidrago V in seat '+seat+
    ' with '+donor,()=>{
    const outcome=nativeDonorLine(seat,donor);
    console.log('AGENT8_RANK13_QUICKBALL_DRAGON_DONOR',
      JSON.stringify(outcome));
  });
}
