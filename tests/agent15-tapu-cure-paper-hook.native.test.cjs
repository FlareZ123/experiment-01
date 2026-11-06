'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {withPaperTapuCure}=require('../simulation/twinleaf/agent15-tapu-cure-paper-hook.cjs');
const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const mod=x=>require(path.join(output,x));
const {TapuLeleGX}=mod('sets/08-sun-and-moon/set-guardians-rising/tapu-lele-gx');
const {AttackEffect,HealEffect}=mod('game/store/effects/game-effects');
const {ChoosePokemonPrompt}=mod('game/store/prompts/choose-pokemon-prompt');
const {PlayerType,SlotType}=mod('game/store/actions/play-card-action');
const {GameMessage}=mod('game/game-message');

class AddPlayerAction {}
class ResolvePromptAction {constructor(id,result){this.id=id;this.result=result;}}
class ProbeStore {
  constructor(){this.state={prompts:[],effects:[]};this.onReply=new Map();}
  dispatch(action){
    if(action instanceof ResolvePromptAction){
      const p=this.state.prompts.find(x=>x.id===action.id);
      p.result=action.result;
      this.onReply.get(action.id)(action.result);
    }
    return this.state;
  }
  prompt(state,prompt,callback){
    prompt.id=state.prompts.length+1;state.prompts.push(prompt);
    this.onReply.set(prompt.id,callback);return state;
  }
  reduceEffect(state,effect){state.effects.push(effect);return state;}
}
function fixture(){
  const card=new TapuLeleGX();
  const bench=Array.from({length:4},(_,i)=>({damage:0,cards:[{name:'P'+i}],
    getPokemonCard(){return this.cards[0];}}));
  const active={damage:0,cards:[card],getPokemonCard:()=>card};
  const owner={id:100,usedGX:false,bench,active,
    forEachPokemon:(type,cb)=>{
      cb(active,card,{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0});
      bench.forEach((b,i)=>cb(b,b.getPokemonCard(),{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:i}));
    }};
  const opponent={id:101};
  const attack=new AttackEffect(owner,opponent,card.attacks[1]);
  const store=new ProbeStore();
  return {card,bench,active,owner,opponent,attack,store};
}

test('pinned vendor Tapu Cure unconditionally rejects the four undamaged own Bench targets',()=>{
  const f=fixture();
  assert.equal(f.card.attacks[1].name,'Tapu Cure-GX');
  assert.equal(f.card.attacks[1].cost.length,1);
  assert.equal(f.card.attacks[1].gxAttack,true);
  assert.throws(()=>f.card.reduceEffect(f.store,f.store.state,f.attack),
    error=>error?.message!==undefined);
  assert.equal(f.store.state.prompts.length,0);
  assert.equal(f.owner.usedGX,false);
});

test('opt-in hook on actual native attack effect selects exactly two Bench despite zero damage',()=>{
  const f=fixture();
  const receipt=withPaperTapuCure(()=>{
    f.store.dispatch(new AddPlayerAction());
    f.card.reduceEffect(f.store,f.store.state,f.attack);
    const p=f.store.state.prompts[0];
    assert.ok(p instanceof ChoosePokemonPrompt);
    assert.deepEqual(p.slots,[SlotType.BENCH]);
    assert.equal(p.options.min,2);assert.equal(p.options.max,2);
    assert.deepEqual(p.options.blocked,[]);
    assert.equal(p.message,GameMessage.CHOOSE_POKEMON_TO_HEAL);
    assert.throws(()=>f.store.dispatch(new ResolvePromptAction(p.id,[f.active,f.bench[0]])),
      /PAPER_TAPU_CURE_INVALID_BENCH_TARGETS/);
    f.store.dispatch(new ResolvePromptAction(p.id,[f.bench[0],f.bench[2]]));
    assert.equal(f.owner.usedGX,true);
    assert.equal(f.store.state.effects.length,2);
    assert.ok(f.store.state.effects.every(e=>e instanceof HealEffect));
    assert.deepEqual(f.store.state.effects.map(e=>e.target),[f.bench[0],f.bench[2]]);
    return 'reconciled';
  },{Store:ProbeStore});
  assert.equal(receipt.result,'reconciled');
  assert.equal(receipt.audit.firstActualStoreCaptured,true);
  assert.equal(receipt.audit.correctedAttackDeclarations,1);
  assert.equal(receipt.audit.validatedTargetReplies,1);
  assert.equal(receipt.audit.rejectedTargetReplies,1);
  assert.equal(receipt.audit.paperGameQualified,false);
});

test('previously spent GX on genuine native card effect remains prohibited',()=>{
  const f=fixture();f.owner.usedGX=true;
  assert.throws(()=>withPaperTapuCure(()=>{
    f.store.dispatch(new AddPlayerAction());
    return f.card.reduceEffect(f.store,f.store.state,f.attack);
  },{Store:ProbeStore}));
  assert.equal(f.store.state.prompts.length,0);
});
