'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withTurn28CopycatShredFork}=
  require('../simulation/twinleaf/mimikyu-turn28-shred-fork.cjs');
class AddPlayerAction {}
class RetreatAction {constructor(clientId) {this.clientId=clientId;}}
class AttackAction {constructor(clientId,name) {this.clientId=clientId;this.name=name;}}
class ResolvePromptAction {
  constructor(id,result) {this.id=id;this.result=result;}
}
class Store {
  constructor(state) {this.state=state;}
  dispatch(action) {return action.constructor.name;}
}
class Bot {
  constructor() {this.client={id:202};}
  decodeNextAction() {return new RetreatAction(202);}
}
function fixture() {
  const shred={name:'Shred',damage:'80'};
  const dialga={fullName:'Dialga-GX UPR',attacks:[shred]};
  const actor={id:202,usedGX:true,
    active:{getPokemonCard:()=>({fullName:'Mimikyu GRI'}),
      energies:{cards:[{name:'Psychic Energy'},{name:'Psychic Energy'}]}},
    discard:{cards:[dialga]}};
  const defender={fullName:'Regidrago VSTAR SIT',hp:280};
  const opponent={id:101,active:{damage:210,getPokemonCard:()=>defender}};
  const state={turn:28,activePlayer:1,players:[opponent,actor],
    prompts:[],playerLastAttack:{101:{sourceCard:defender,
      attack:{name:'Apex Dragon',gxAttack:false}}}};
  const store=new Store(state),bot=new Bot();
  const args={Store,Bot,AttackAction,ResolvePromptAction};
  const options={forceShred:true,snapshot:s=>({turn:s.turn,damage:s.players[0].active.damage})};
  return {state,store,bot,args,options,dialga,shred};
}
test('force authentic RetreatAction into Copycat and select own Dialga Shred',()=>{
  const f=fixture();
  const outcome=withTurn28CopycatShredFork(f.args,()=>{
    f.store.dispatch(new AddPlayerAction());
    const attack=f.bot.decodeNextAction(f.state);
    const prompt={id:41,playerId:202,result:undefined,
      cards:[f.dialga],validate:a=>a===f.shred};
    Object.defineProperty(prompt,'constructor',{value:{name:'ChooseAttackPrompt'}});
    f.state.prompts=[prompt];
    const choice=f.bot.decodeNextAction(f.state);
    return {attack,choice};
  },f.options);
  assert.equal(outcome.result.attack.name,'Copycat');
  assert.equal(outcome.result.choice.result,f.shred);
  assert.equal(outcome.opportunities.length,1);
  assert.equal(outcome.shredSelections.length,1);
  assert.equal(outcome.forcedAttack,true);
  assert.equal(outcome.opportunities[0].damage,210);
  assert.equal(outcome.opportunities[0].shredPrintedDamage,80);
});
test('without opt-in leaves original retreat and zero forced selections',()=>{
  const f=fixture();
  const outcome=withTurn28CopycatShredFork(f.args,()=>{
    f.store.dispatch(new AddPlayerAction());
    return f.bot.decodeNextAction(f.state);
  },{...f.options,forceShred:false});
  assert.ok(outcome.result instanceof RetreatAction);
  assert.equal(outcome.opportunities.length,1);
  assert.equal(outcome.shredSelections.length,0);
  assert.equal(outcome.forcedAttack,false);
});
test('missing GX-use signal or different opponent attack suppresses fork',()=>{
  for(const change of [
    f=>{f.state.players[1].usedGX=false;},
    f=>{f.state.playerLastAttack[101].attack.name='Kaiser Tackle';},
    f=>{f.state.players[0].active.damage=20;}
  ]) {
    const f=fixture();
    change(f);
    const run=()=>withTurn28CopycatShredFork(f.args,()=>{
      f.store.dispatch(new AddPlayerAction());
      return f.bot.decodeNextAction(f.state);
    },f.options);
    if(f.state.players[0].active.damage===20) assert.throws(run,/knockout range/);
    else {
      const out=run();
      assert.ok(out.result instanceof RetreatAction);
      assert.equal(out.opportunities.length,0);
    }
  }
});
