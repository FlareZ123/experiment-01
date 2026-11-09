'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {stage}=require('../../../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../../../simulation/twinleaf/headless.cjs');
const {actorHandDiscardInput,resolvePhysicalHandCards,chooseActorHandDiscard}=
  require('../../../simulation/twinleaf/agent47-actor-hand-discard.cjs');
const {proposeAttackFuelDiscard}=
  require('../../../simulation/twinleaf/2026-11/agent47-attack-fuel-discard-frontier.cjs');
const path=require('node:path');
const base=path.resolve(__dirname,'../../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(base,name));
const {PlayCardAction,PlayerType,SlotType}=
  native('game/store/actions/play-card-action');
const {ResolvePromptAction}=
  native('game/store/actions/resolve-prompt-action');

const BALL='Ultra Ball MEG';
const DCE='Double Colorless Energy SUM';
const B='Battle VIP Pass FST';
const H='Hisuian Heavy Ball ASR';

function prepare(seat) {
  const x=stage(seat),manager=initializeCards();
  let id=470900+seat*1000;
  const card=printing=>{
    const c=manager.getCardByName(printing);
    assert.ok(c,'Missing pinned printed card '+printing);
    c.id=id++;
    return c;
  };
  // Staged, finite real physical card objects; never a natural shuffled 60.
  x.owner.discard.cards.push(...x.owner.active.cards,...x.owner.hand.cards);
  x.owner.active.cards.length=0;
  x.owner.active.energies.cards.length=0;
  x.owner.hand.cards.length=0;
  x.owner.active.cards.push(card('Mew V FST'),card('Mew VMAX FST'));
  const vip=card(B),fuel=card(DCE),heavy=card(H),ball=card(BALL);
  x.owner.hand.cards.push(vip,fuel,heavy,ball);
  const searchTarget=card('Genesect V FST');
  x.owner.deck.cards.push(searchTarget);
  return {...x,card,vip,fuel,heavy,ball,searchTarget};
}

function nativeHandPayment(seat) {
  const x=prepare(seat);
  const before={
    hand:x.owner.hand.cards.map(c=>c.fullName),
    active:x.owner.active.getPokemonCard().fullName,
    activeEnergy:x.owner.active.energies.cards.map(c=>c.fullName)
  };
  x.store.dispatch(new PlayCardAction(x.owner.id,3,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  const prompt=x.state.prompts.find(p=>p.result===undefined);
  assert.equal(prompt?.constructor.name,'ChooseCardsPrompt');
  assert.equal(prompt.playerId,x.owner.id);
  assert.equal(prompt.message,'CHOOSE_CARD_TO_DISCARD');
  const input=actorHandDiscardInput(x.state,seat);
  assert.ok(input,'Owned real Store Ultra Ball must offer validated mandatory menu');
  const baseline=chooseActorHandDiscard(input).printings;
  assert.deepEqual(baseline,[B,DCE]);
  const proposal=proposeAttackFuelDiscard(input,x.catalog);
  assert.equal(proposal.changed,true);
  assert.deepEqual(proposal.proposal,[B,H]);
  assert.ok(input.prompt.menu.some(m=>
    JSON.stringify(m)===JSON.stringify(proposal.proposal)));
  const physical=resolvePhysicalHandCards(prompt,proposal.proposal);
  assert.equal(physical.length,2);
  assert.ok(prompt.validate(physical,x.state));
  assert.ok(physical.includes(x.vip));
  assert.ok(physical.includes(x.heavy));
  assert.equal(physical.includes(x.fuel),false);
  x.store.dispatch(new ResolvePromptAction(prompt.id,physical));
  assert.ok(x.owner.hand.cards.includes(x.fuel));
  assert.ok(x.owner.discard.cards.includes(x.vip));
  assert.ok(x.owner.discard.cards.includes(x.heavy));
  const followups=[];
  for(let i=0;i<12;i++) {
    const next=x.state.prompts.find(p=>p.result===undefined);
    if(!next)break;
    const kind=next.constructor.name;
    let choice=null;
    if(kind==='ChooseCardsPrompt'){
      assert.equal(next.playerId,x.owner.id);
      assert.equal(next.message,'CHOOSE_CARD_TO_HAND');
      choice=[x.searchTarget];
    }else if(kind==='ShuffleDeckPrompt'){
      choice=Array.from({length:x.owner.deck.cards.length},(_,j)=>j);
    }else{
      assert.equal(kind,'WaitPrompt');
    }
    assert.equal(next.validate(choice,x.state),true);
    x.store.dispatch(new ResolvePromptAction(next.id,choice));
    followups.push(kind);
  }
  assert.equal(x.state.prompts.some(p=>p.result===undefined),false);
  const energyIndex=x.owner.hand.cards.indexOf(x.fuel);
  assert.ok(energyIndex>=0);
  x.store.dispatch(new PlayCardAction(x.owner.id,energyIndex,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  assert.ok(x.owner.active.energies.cards.includes(x.fuel));
  assert.equal(x.owner.active.getPokemonCard().fullName,'Mew VMAX FST');
  assert.ok(x.owner.discard.cards.includes(x.vip));
  assert.ok(x.owner.discard.cards.includes(x.heavy));
  return {seat,before,baseline,proposal:proposal.proposal,
    physicalPaid:true,fuelRetained:true,fuelAttachedToActive:true,
    printedAttack:'Cross Fusion Strike',nativeFollowups:followups,
    stagedBoard:true,competitiveQualifiedGames:0};
}

for(const seat of [0,1]) {
  test('native Mew VMAX paid Ultra Ball retains attack DCE on seat '+seat,()=>{
    const result=nativeHandPayment(seat);
    console.log('AGENT47_NATIVE_ATTACK_FUEL',JSON.stringify(result));
  });
}
