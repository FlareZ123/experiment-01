'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnerTreasurePrompt,withOwnerTreasurePrompts}=
  require('../../simulation/twinleaf/agent2/treasure-owner-prompt-native.cjs');

class ChooseCardsPrompt{
  constructor({cards,sourceCard,playerId=101,id=35,min=1,max=1}){
    this.cards=cards;
    this.sourceCard=sourceCard;
    this.playerId=playerId;
    this.id=id;
    this.options={min,max};
    this.result=undefined;
  }
  validate(choice){
    return Array.isArray(choice)&&choice.length>=this.options.min&&
      choice.length<=this.options.max&&
      choice.every(card=>this.cards.cards.includes(card));
  }
}
class ResolvePromptAction{
  constructor(id,answer){this.id=id;this.answer=answer;}
}
class SimpleTacticsAi{
  constructor(id){this.client={id};}
  decodeNextAction(){return 'QUARANTINED_UNRELATED_PROMPT';}
}
const mockEngine=name=>{
  if(name==='simple-bot/simple-tactics-ai')return {SimpleTacticsAi};
  if(name==='game/store/actions/resolve-prompt-action')
    return {ResolvePromptAction};
  throw Error('Unexpected engine import: '+name);
};
const card=(fullName,id)=>({fullName,id});
const source=card('Mysterious Treasure FLI',990);
const crispin=card('Crispin SCR',1);
const band=card('Muscle Band XY',2);
const seeker=card('VS Seeker PHF',3);
const vstar=card('Regidrago VSTAR SIT',4);
const noivern=card('Noivern ex PAL',5);

/** @param {object} prompt Native-like owner card prompt. */
function stateFor(prompt){
  const owner={id:101,hand:{cards:[crispin,band,seeker]},
    deck:{cards:[noivern,vstar]}};
  return {players:[owner,{id:202,hand:{cards:[card('Secret',600)]}}],
    prompts:[prompt],turn:1,phase:2};
}
test('native printed Treasure one-card payment chooses Crispin from actual owner hand',()=>{
  const state=stateFor(null);
  const p=new ChooseCardsPrompt({cards:state.players[0].hand,
    sourceCard:source});
  const x=chooseOwnerTreasurePrompt(state,p,state.players[0],'crispin');
  assert.equal(x.kind,'printed-one-card-payment');
  assert.strictEqual(x.selected[0],crispin);
  assert.equal(p.validate(x.selected),true);
});
test('alternate owner payment selects physical Muscle Band and protects VS Seeker',()=>{
  const state=stateFor(null);
  const p=new ChooseCardsPrompt({cards:state.players[0].hand,
    sourceCard:source});
  const x=chooseOwnerTreasurePrompt(state,p,state.players[0],'muscle-band');
  assert.deepEqual(x.selected,[band]);
});
test('deck search requires an actual owner-deck prompt and prioritizes VSTAR',()=>{
  const state=stateFor(null);
  const p=new ChooseCardsPrompt({cards:state.players[0].deck,
    sourceCard:source,min:0,max:1});
  const x=chooseOwnerTreasurePrompt(state,p,state.players[0],'crispin');
  assert.equal(x.kind,'owner-deck-search');
  assert.strictEqual(x.selected[0],vstar);
});
test('source stamp, actor owner and physical zone all fail closed',()=>{
  const state=stateFor(null);
  const hand=state.players[0].hand;
  assert.equal(chooseOwnerTreasurePrompt(state,
    new ChooseCardsPrompt({cards:hand,sourceCard:card('Other Item',999)}),
    state.players[0],'crispin'),null);
  assert.equal(chooseOwnerTreasurePrompt(state,
    new ChooseCardsPrompt({cards:state.players[1].hand,
      sourceCard:source,playerId:101}),state.players[0],'crispin'),null);
  assert.equal(chooseOwnerTreasurePrompt(state,
    new ChooseCardsPrompt({cards:hand,sourceCard:source,playerId:202}),
    state.players[0],'crispin'),null);
  assert.equal(chooseOwnerTreasurePrompt(state,
    new ChooseCardsPrompt({cards:hand,sourceCard:source,min:2,max:2}),
    state.players[0],'crispin'),null);
});
test('missing proposed card delegates without replacing required payment',()=>{
  const state=stateFor(null);
  state.players[0].hand.cards=[seeker];
  const p=new ChooseCardsPrompt({cards:state.players[0].hand,
    sourceCard:source});
  assert.equal(chooseOwnerTreasurePrompt(state,p,state.players[0],'crispin'),
    null);
});
test('native wrapper returns physical objects, leaves unrelated roots alone, and restores prototype',()=>{
  const state=stateFor(null);
  state.prompts=[new ChooseCardsPrompt({cards:state.players[0].hand,
    sourceCard:source})];
  const previous=SimpleTacticsAi.prototype.decodeNextAction;
  const result=withOwnerTreasurePrompts(()=>{
    const owner=new SimpleTacticsAi(101);
    const other=new SimpleTacticsAi(202);
    const payment=owner.decodeNextAction(state);
    assert.ok(payment instanceof ResolvePromptAction);
    assert.strictEqual(payment.answer[0],crispin);
    const ignored=other.decodeNextAction(state);
    assert.equal(ignored,'QUARANTINED_UNRELATED_PROMPT');
    state.prompts[0].sourceCard=card('Other Item',999);
    assert.equal(owner.decodeNextAction(state),'QUARANTINED_UNRELATED_PROMPT');
    return payment.id;
  },{engine:mockEngine});
  assert.equal(result.result,35);
  assert.equal(result.audit.proposals,1);
  assert.equal(result.audit.events[0].sourcePrinting,
    'Mysterious Treasure FLI');
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,previous);
});
