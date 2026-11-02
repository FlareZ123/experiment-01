'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards,seededRandom,deckPermutation}=
  require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {chooseRegisteredTreasureEarlyIntent}=
  require('../simulation/twinleaf/agent49-registered-treasure-early-setup.cjs');
const {chooseTreasureRootIntent}=
  require('../simulation/twinleaf/agent49-mysterious-treasure-frontier.cjs');
const {chooseRegidragoDonorQuickBall}=
  require('../simulation/twinleaf/agent8-regidrago-quickball-donor-frontier.cjs');
const {decks}=require('../results/aichi-2026/full-decklists.json');
const native=p=>require(path.join(__dirname,'../vendor/twinleaf/ptcg-server/output',p));
const {PlayCardAction,PlayerType,SlotType}=
  native('game/store/actions/play-card-action');
const {ResolvePromptAction}=
  native('game/store/actions/resolve-prompt-action');
const registered=decks.find(d=>d.rank===13).cards.flatMap(c=>
  Array(c.count).fill(c.name+' '+c.printing.set));

function prepared(seat){
  const x=stage(seat),manager=initializeCards();
  let id=490000+seat*100;
  const card=n=>{const c=manager.getCardByName(n);
    assert.ok(c,'Native printing missing '+n);c.id=id++;return c;};
  x.owner.active.cards=[card('Latias ex SSP')];
  x.owner.active.energies.cards.length=0;
  x.owner.bench[1].cards.length=0;
  x.owner.hand.cards=[
    card('Quick Ball FST'),card('Mysterious Treasure FLI'),
    card('Salamence ex JTG'),card('Dragapult ex TWM')];
  const targets={
    V:card('Regidrago V SIT'),STAR:card('Regidrago VSTAR SIT'),
    BUDEW:card('Budew ASC')};
  x.owner.deck.cards.push(...Object.values(targets));
  return {x,targets};
}

function playPaidItem(x,printing,donor,target,seed){
  const itemIndex=x.owner.hand.cards.findIndex(c=>c.fullName===printing);
  assert.ok(itemIndex>=0,'Item physically unavailable');
  const owner=x.owner,found=x.owner.deck.cards.find(c=>c.fullName===target);
  assert.ok(found,'Target physically unavailable before owner prompt');
  x.store.dispatch(new PlayCardAction(owner.id,itemIndex,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
  const seen=[];
  for(let i=0;i<16;i++){
    const prompt=x.state.prompts.find(p=>p.result===undefined);
    if(!prompt)break;
    let selected=null,kind=prompt.constructor.name;
    if(kind==='ChooseCardsPrompt'){
      assert.equal(prompt.playerId,owner.id,'No nonowner prompts');
      // Quick Ball exposes an owner-hand candidate list, which is not
      // necessarily identical to owner.hand. Trace physical Card identity.
      const paid=prompt.cards.cards.find(c=>
        c.fullName===donor&&owner.hand.cards.includes(c));
      const searched=prompt.cards.cards.find(c=>
        c===found&&owner.deck.cards.includes(c));
      if(paid)selected=[paid];
      else if(searched)selected=[searched];
      else throw Error('Prompt offers no owner-held payment/target: '+
        prompt.message);
      assert.equal(prompt.validate(selected,x.state),true);
    }else if(kind==='ShuffleDeckPrompt'){
      selected=deckPermutation(owner.deck.cards.length,seededRandom(seed));
    }else assert.ok(['WaitPrompt','ShowCardsPrompt'].includes(kind),kind);
    seen.push(kind);
    x.store.dispatch(new ResolvePromptAction(prompt.id,selected));
  }
  assert.equal(x.store.hasPrompts(),false);
  assert.ok(owner.discard.cards.some(c=>c.fullName===donor));
  assert.ok(owner.discard.cards.some(c=>c.fullName===printing));
  assert.ok(owner.hand.cards.includes(found));
  assert.ok(seen.filter(k=>k==='ChooseCardsPrompt').length>=1);
  return seen;
}

function compare(seat,mode){
  const quickFirst=mode==='quick-v-then-treasure-vstar';
  const treasureFirstStar=mode==='treasure-vstar-then-quick-v';
  assert.ok(quickFirst||treasureFirstStar||
    mode==='treasure-v-then-quick-budew');
  const {x,targets}=prepared(seat);
  const first=actorObservation(x.state,seat);
  const quick=chooseRegidragoDonorQuickBall(first);
  const treasure=chooseRegisteredTreasureEarlyIntent(first,x.catalog,registered);
  assert.equal(quick?.printing,'Quick Ball FST');
  assert.equal(treasure?.printing,'Mysterious Treasure FLI');
  assert.equal(treasure?.targetExactDeckMembershipKnown,false);
  const firstItem=quickFirst?'Quick Ball FST':'Mysterious Treasure FLI';
  const nextItem=quickFirst?'Mysterious Treasure FLI':'Quick Ball FST';
  const firstTarget=treasureFirstStar?'Regidrago VSTAR SIT':'Regidrago V SIT';
  const firstPrompts=playPaidItem(x,firstItem,'Salamence ex JTG',
    firstTarget,100+seat);
  if(!treasureFirstStar){
    const index=x.owner.hand.cards.indexOf(targets.V);
    x.store.dispatch(new PlayCardAction(x.owner.id,index,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:1}));
    assert.strictEqual(x.owner.bench[1].getPokemonCard(),targets.V);
  }
  const secondRoot=actorObservation(x.state,seat);
  if(quickFirst){
    const selected=chooseTreasureRootIntent(secondRoot,x.catalog);
    assert.equal(selected?.printing,'Mysterious Treasure FLI');
    assert.equal(selected?.discardPrinting,'Dragapult ex TWM');
  }else if(treasureFirstStar){
    const selected=chooseRegidragoDonorQuickBall(secondRoot);
    assert.equal(selected?.printing,'Quick Ball FST');
    assert.equal(selected?.donorPrinting,'Dragapult ex TWM');
  }else{
    assert.equal(chooseRegidragoDonorQuickBall(secondRoot),null,
      'Preboard donor-first Quick Ball proposer should now be inactive');
  }
  const secondTarget=quickFirst?'Regidrago VSTAR SIT':
    treasureFirstStar?'Regidrago V SIT':'Budew ASC';
  const secondPrompts=playPaidItem(x,nextItem,'Dragapult ex TWM',
    secondTarget,200+seat);
  if(treasureFirstStar){
    const index=x.owner.hand.cards.indexOf(targets.V);
    x.store.dispatch(new PlayCardAction(x.owner.id,index,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:1}));
    assert.strictEqual(x.owner.bench[1].getPokemonCard(),targets.V);
  }
  return {
    seat,mode,quickFirst,firstPrompts,secondPrompts,
    boardV:x.owner.bench[1].getPokemonCard()?.fullName,
    heldStar:x.owner.hand.cards.includes(targets.STAR),
    heldBudew:x.owner.hand.cards.includes(targets.BUDEW),
    donorsPaid:['Salamence ex JTG','Dragapult ex TWM'].every(n=>
      x.owner.discard.cards.some(c=>c.fullName===n)),
    itemsFinalized:['Quick Ball FST','Mysterious Treasure FLI'].every(n=>
      x.owner.discard.cards.some(c=>c.fullName===n)),
    promptsClear:!x.store.hasPrompts()
  };
}

for(const seat of [0,1])test('rank13 two paid Items three target-order branches seat '+seat,()=>{
  const quickFirst=compare(seat,'quick-v-then-treasure-vstar');
  const treasureFirstV=compare(seat,'treasure-v-then-quick-budew');
  const treasureFirstStar=compare(seat,'treasure-vstar-then-quick-v');
  for(const row of [quickFirst,treasureFirstV,treasureFirstStar]){
    assert.equal(row.boardV,'Regidrago V SIT');
    assert.equal(row.donorsPaid,true);
    assert.equal(row.itemsFinalized,true);
    assert.equal(row.promptsClear,true);
  }
  assert.equal(quickFirst.heldStar,true);
  assert.equal(quickFirst.heldBudew,false);
  assert.equal(treasureFirstV.heldStar,false);
  assert.equal(treasureFirstV.heldBudew,true);
  assert.equal(treasureFirstStar.heldStar,true);
  assert.equal(treasureFirstStar.heldBudew,false);
  console.log('AGENT49_DUAL_CONNECTOR_NATIVE',
    JSON.stringify({quickFirst,treasureFirstV,treasureFirstStar,
      competitiveQualifiedGames:0,stagedOriginalSixty:false}));
});
