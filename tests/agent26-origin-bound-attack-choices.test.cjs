'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withOwnerOriginBoundAttackChoices}=
  require('../simulation/twinleaf/agent26-origin-bound-attack-choices.cjs');
class AttackEffect{constructor(player,attack){this.player=player;this.attack=attack;}}
class ChooseCardsPrompt{
  constructor(actor,zone,{secret,allowCancel}){
    this.playerId=actor.id;this.cards=zone;this.id=42;
    this.message=17;this.filter={};
    this.options={min:2,max:2,isSecret:secret,allowCancel};
  }
  validate(cs){return cs.length>=this.options.min&&
    cs.length<=this.options.max&&
    cs.every(x=>this.cards.cards.includes(x))&&
    new Set(cs).size===cs.length;}
}
class ResolvePromptAction{constructor(id,result){this.id=id;this.result=result;}}
class ShowCardsPrompt{
  constructor(actorId,cards){this.playerId=actorId;this.cards=cards;
    this.id=43;this.message=18;this.options={allowCancel:false};}
}
class ShuffleDeckPrompt{
  constructor(actorId){this.playerId=actorId;this.id=44;}
  validate(order,state){
    const owner=state.players.find(p=>p.id===this.playerId);
    return Array.isArray(order)&&order.length===owner.deck.cards.length&&
      order.slice().sort((a,b)=>a-b).every((x,i)=>x===i);
  }
}
class SimpleTacticsAi{decodeNextAction(){throw Error('unsafe underlying fallback');}}
class TrevenantDusknoirGX{
  constructor(){this.fullName='Trevenant & Dusknoir-GX SMP';this.attacks=[{}];}
  reduceEffect(store,state,effect){
    const other=state.players.find(x=>x.id!==effect.player.id);
    store.prompt(state,new ChooseCardsPrompt(effect.player,other.hand,
      {secret:true,allowCancel:false}),chosen=>{
      store.prompt(state,new ShowCardsPrompt(effect.player.id,chosen),()=>{});
      store.prompt(state,new ShuffleDeckPrompt(other.id),()=>{});
    });
  }
}
class Girafarig{
  constructor(){this.fullName='Girafarig LOT';this.attacks=[{}];}
  reduceEffect(store,state,effect){
    const discard=state.players.find(x=>x.id!==effect.player.id).discard;
    const count=Math.min(2,discard.cards.length);
    const corrected=count<2;
    const prompt=new ChooseCardsPrompt(effect.player,discard,
      {secret:false,allowCancel:!corrected});
    prompt.options.min=count;
    prompt.options.max=count;
    store.prompt(state,prompt,()=>{});
  }
}
const modules={
  'simple-bot/simple-tactics-ai':{SimpleTacticsAi},
  'sets/08-sun-and-moon/set-sun-and-moon-promos/trevenant-dusknoir-gx':{
    TrevenantDusknoirGX},
  'sets/08-sun-and-moon/set-lost-thunder/girafarig':{Girafarig},
  'game/store/prompts/choose-cards-prompt':{ChooseCardsPrompt},
  'game/store/prompts/show-cards-prompt':{ShowCardsPrompt},
  'game/store/prompts/shuffle-prompt':{ShuffleDeckPrompt},
  'game/store/actions/resolve-prompt-action':{ResolvePromptAction},
  'game/game-message':{GameMessage:{CHOOSE_CARD_TO_DISCARD:17,
    CARDS_SHOWED_BY_THE_OPPONENT:18}}
};
function execute(kind,seat,hiddenReordering=false){
  const source=kind==='night-watch'?
    new TrevenantDusknoirGX():new Girafarig();
  const actor={id:seat+100};
  const other={id:(1-seat)+100,
    hand:{cards:[{n:'secretA'},{n:'secretB'},{n:'secretC'},{n:'secretD'}]},
    discard:{cards:[{n:'publicA'},{n:'publicB'},{n:'publicC'}]}};
  if(hiddenReordering)other.hand.cards.reverse();
  const state={turn:9,players:seat===0?[actor,other]:[other,actor],prompts:[]};
  const store={prompt(s,p){s.prompts.push(p);}};
  const ai=Object.create(SimpleTacticsAi.prototype);
  ai.client={id:actor.id};
  const out=withOwnerOriginBoundAttackChoices(()=>{
    source.reduceEffect(store,state,new AttackEffect(actor,source.attacks[0]));
    return ai.decodeNextAction(state);
  },{committedSeed:'precommitted-test-seed',engine:p=>modules[p]});
  assert.ok(out.result instanceof ResolvePromptAction);
  assert.equal(out.audit.markedPrompts.length,1);
  assert.equal(out.audit.selected.length,1);
  assert.ok(out.audit.selected[0].positions.every(x=>Number.isInteger(x)));
  return out;
}
test('paper-random opaque positions across both seats and hidden orders',()=>{
  for(const seat of [0,1]){
    const a=execute('night-watch',seat);
    const b=execute('night-watch',seat,true);
    assert.deepEqual(a.audit.selected[0].positions,b.audit.selected[0].positions);
    assert.equal(a.audit.selected[0].privateCardIdentitiesExposed,false);
  }
});
test('two actual public discard references are legal from both seats',()=>{
  for(const seat of [0,1]){
    const a=execute('get-lost',seat);
    assert.deepEqual(a.audit.selected[0].positions,[0,1]);
    assert.equal(a.result.result[0].n,'publicA');
    assert.equal(a.result.result[1].n,'publicB');
  }
});
test('paper-corrected Get Lost with an empty opponent discard resolves zero cards',()=>{
  const source=new Girafarig();
  const actor={id:100},other={id:101,hand:{cards:[]},discard:{cards:[]}};
  const state={turn:3,players:[actor,other],prompts:[]};
  const ai=Object.create(SimpleTacticsAi.prototype);
  ai.client={id:actor.id};
  const out=withOwnerOriginBoundAttackChoices(()=>{
    source.reduceEffect({prompt(s,p){s.prompts.push(p);}},state,
      new AttackEffect(actor,source.attacks[0]));
    return ai.decodeNextAction(state);
  },{committedSeed:'zero-card-case',engine:p=>modules[p]});
  assert.deepEqual(out.result.result,[]);
  assert.equal(out.audit.selected[0].kind,'get-lost');
  assert.equal(out.audit.selected[0].count,0);
});
test('source-created Night Watch reveal and shuffle resolve across two actor seats',()=>{
  for(const seat of [0,1]){
    const actor={id:seat+100,deck:{cards:[{},{}]}};
    const other={id:(1-seat)+100,
      hand:{cards:[{n:'hiddenA'},{n:'hiddenB'},{n:'hiddenC'}]},
      discard:{cards:[]},deck:{cards:[{n:'top1'},{n:'top2'},{}]}};
    const state={turn:5,players:seat===0?[actor,other]:[other,actor],
      prompts:[]};
    const callbacks=new WeakMap();
    const store={prompt(s,p,cb){s.prompts.push(p);callbacks.set(p,cb);}};
    const source=new TrevenantDusknoirGX();
    const ai=Object.create(SimpleTacticsAi.prototype);
    const out=withOwnerOriginBoundAttackChoices(()=>{
      source.reduceEffect(store,state,new AttackEffect(actor,source.attacks[0]));
      ai.client={id:actor.id};
      const choose=ai.decodeNextAction(state);
      state.prompts[0].result=choose.result;
      callbacks.get(state.prompts[0])(choose.result);
      const reveal=ai.decodeNextAction(state);
      assert.equal(reveal.result,true);
      state.prompts.find(p=>p instanceof ShowCardsPrompt).result=true;
      ai.client={id:other.id};
      const shuffle=ai.decodeNextAction(state);
      assert.ok(shuffle instanceof ResolvePromptAction);
      assert.equal(new Set(shuffle.result).size,other.deck.cards.length);
      return shuffle;
    },{committedSeed:'uniform-shuffle-seed',engine:p=>modules[p]});
    assert.equal(out.audit.resolvedFollowups.length,2);
    assert.deepEqual(out.audit.resolvedFollowups.map(e=>e.kind),
      ['night-watch-reveal','night-watch-shuffle']);
    assert.equal(out.audit.privateCardIdentityInspectedForPolicy,false);
  }
});
test('only exact printed attack and prompt shape bypass fail-closed decoder',()=>{
  const actor={id:100},other={
    id:101,hand:{cards:[{},{}]},discard:{cards:[{},{}]}};
  const source=new TrevenantDusknoirGX();
  source.fullName='wrong printing';
  const state={turn:2,players:[actor,other],prompts:[]};
  const ai=Object.create(SimpleTacticsAi.prototype);
  ai.client={id:actor.id};
  assert.throws(()=>withOwnerOriginBoundAttackChoices(()=>{
    source.reduceEffect({prompt(s,p){s.prompts.push(p);}},
      state,new AttackEffect(actor,source.attacks[0]));
    ai.decodeNextAction(state);
  },{committedSeed:'test',engine:p=>modules[p]}),
  /unsafe underlying fallback/);
});
