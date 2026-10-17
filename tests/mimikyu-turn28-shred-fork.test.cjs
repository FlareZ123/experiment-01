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


test('source Copycat decision ignores opposing hidden zones and undealt cards',()=>{
  /** @param {unknown} secret */
  function check(secret) {
    const f=fixture();
    const opponent=f.state.players[0],actor=f.state.players[1];
    opponent.hand={cards:[secret]};
    opponent.deck={cards:[secret]};
    opponent.prizes=[{cards:[secret]}];
    actor.deck={cards:[secret]};
    actor.prizes=[{cards:[secret]}];
    const out=withTurn28CopycatShredFork(f.args,()=>{
      f.store.dispatch(new AddPlayerAction());
      const attack=f.bot.decodeNextAction(f.state);
      const prompt={id:41,playerId:202,result:undefined,
        cards:[f.dialga],validate:a=>a===f.shred};
      Object.defineProperty(prompt,'constructor',{value:{name:'ChooseAttackPrompt'}});
      f.state.prompts=[prompt];
      const choice=f.bot.decodeNextAction(f.state);
      return [attack.constructor.name,attack.name,
        choice.constructor.name,choice.result.name];
    },f.options);
    return {actions:out.result,opportunities:out.opportunities,
      selections:out.shredSelections,forcedAttack:out.forcedAttack};
  }
  assert.deepEqual(check('secret set A'),
    check({secret:'entirely distinct card and prize contents',order:[2,1,3]}));
});


test('source-ordinal fork bypasses untrusted bot selection only at matching dispatch',()=>{
  const f=fixture();
  class ForbiddenBot extends Bot {
    decodeNextAction() {
      throw Error('source-fork decision must bypass speculative bot');
    }
  }
  const run=withTurn28CopycatShredFork({...f.args,Bot:ForbiddenBot},()=>{
    f.store.dispatch(new AddPlayerAction());
    const bot=new ForbiddenBot();
    const attack=bot.decodeNextAction(f.state);
    const prompt={id:87,playerId:202,result:undefined,
      cards:[f.dialga],validate:a=>a===f.shred};
    Object.defineProperty(prompt,'constructor',
      {value:{name:'ChooseAttackPrompt'}});
    f.state.prompts=[prompt];
    const selected=bot.decodeNextAction(f.state);
    return {attack,selected};
  },{...f.options,rootActionOrdinal:1});
  assert.equal(run.result.attack.name,'Copycat');
  assert.equal(run.result.selected.result,f.shred);
  assert.equal(run.opportunities[0].rootActionOrdinal,1);
  assert.equal(run.forcedAttack,true);
  assert.equal(run.shredSelections.length,1);
});
test('source-ordinal fork does not select when ordinal mismatches',()=>{
  const f=fixture();
  const run=withTurn28CopycatShredFork(f.args,()=>{
    f.store.dispatch(new AddPlayerAction());
    return f.bot.decodeNextAction(f.state);
  },{...f.options,rootActionOrdinal:2});
  assert.ok(run.result instanceof RetreatAction);
  assert.equal(run.forcedAttack,false);
});

test('ordinal source RNG accounting measures and aligns a skipped proposal',()=>{
  const f=fixture();
  class ThreeDrawBot extends Bot {
    decodeNextAction() {
      Math.random(); Math.random(); Math.random();
      return new RetreatAction(202);
    }
  }
  const original=withTurn28CopycatShredFork({...f.args,Bot:ThreeDrawBot},()=>{
    f.store.dispatch(new AddPlayerAction());
    return new ThreeDrawBot().decodeNextAction(f.state);
  },{...f.options,forceShred:false,rootActionOrdinal:1,
    capturePolicyRngAtOrdinal:true});
  assert.match(original.policyRngLedger[0].drawDigest,/^[0-9a-f]{64}$/);
  assert.deepEqual(original.policyRngLedger.map(({drawDigest,...rest})=>rest),[{
    kind:'original-proposal',rootActionOrdinal:1,draws:3,
    action:'RetreatAction'
  }]);
  const changed=withTurn28CopycatShredFork({...f.args,Bot:ThreeDrawBot},()=>{
    f.store.dispatch(new AddPlayerAction());
    return new ThreeDrawBot().decodeNextAction(f.state);
  },{...f.options,rootActionOrdinal:1,policyRngAlignDraws:3});
  assert.equal(changed.result.name,'Copycat');
  assert.match(changed.policyRngLedger[0].drawDigest,/^[0-9a-f]{64}$/);
  assert.deepEqual(changed.policyRngLedger.map(({drawDigest,...rest})=>rest),[{
    kind:'aligned-direct-fork',rootActionOrdinal:1,draws:3,
    action:'AttackAction'
  }]);
});
