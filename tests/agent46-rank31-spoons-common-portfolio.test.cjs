'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,independentPainfulSpoonsNegative,
  withPaperPromptContractPortfolio}=
  require('../simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs');

const a={player:1,slot:1,index:0};
const b={player:1,slot:2,index:0};
const c={player:1,slot:2,index:1};
const split=[
  {from:a,to:c},{from:b,to:c}
];
const unified=[
  {from:a,to:c},{from:a,to:c}
];
class ResolvePromptAction{
  /** @param {number} id @param {unknown} result */
  constructor(id,result){this.id=id;this.result=result;}
}
class MoveDamagePrompt{
  /** @param {number} playerId */
  constructor(playerId){
    this.id=46;this.playerId=playerId;this.result=undefined;
    this.options={min:1,max:2,singleDestinationTarget:true,
      singleSourceTarget:false,allowCancel:false};
  }
  /** Pinned native MoveDamagePrompt permits separate sources. */
  validate(answer){return Array.isArray(answer) &&
    answer.length>=1&&answer.length<=2;}
}
class FakeStore{
  /** @param {object} state */
  constructor(state){this.state=state;this.mutations=0;}
  /** @param {object} action */
  dispatch(action){
    this.mutations++;
    const p=this.state.prompts.find(p=>p.id===action.id);
    if(p)p.result=action.result;
    return {accepted:true};
  }
}
class IronThornsex{
  constructor(){this.attacks=[{name:'Volt Cyclone'}];}
  reduceEffect(){return null;}
}
class RadiantAlakazam{
  constructor(){this.powers=[{name:'Painful Spoons'}];}
  /** @param {object} store @param {object} state @param {object} effect */
  reduceEffect(store,state,effect){
    state.prompts.push(new MoveDamagePrompt(effect.player.id));
    return state;
  }
}
const types={
  PlayerType:{TOP_PLAYER:1,BOTTOM_PLAYER:2},
  SlotType:{ACTIVE:1,BENCH:2}
};
const deps={Store:FakeStore,IronThornsex,RadiantAlakazam,types,
  wasPowerUsed:(effect,index,card)=>effect.kind==='spoony'&&
    index===0&&effect.ownerCard===card,
  currentTrialId:()=> '31:source:both-seats'
};
/** @returns {object} */
function fixture(){
  const state={turn:4,players:[{id:31},{id:32}],prompts:[]};
  return {state,store:new FakeStore(state),owner:state.players[0],
    pokemon:new RadiantAlakazam()};
}

test('SIT Painful Spoons independent negative rejects exactly two different sources',()=>{
  assert.equal(independentPainfulSpoonsNegative(split),
    'PAINFUL_SPOONS_MULTIPLE_SOURCE_POKEMON');
  assert.equal(independentPainfulSpoonsNegative(unified),null);
  assert.equal(independentPainfulSpoonsNegative([unified[0]]),null);
  assert.equal(independentPainfulSpoonsNegative(null),null);
  assert.match(VERSION,/^agent41-unified-paper-prompt-contract-portfolio-v\\d+/);
});

test('actual source-created ability prompt receives a source-identity negative audit',()=>{
  const f=fixture();
  const prior=Object.getOwnPropertyDescriptor(
    RadiantAlakazam.prototype,'reduceEffect');
  const audit=withPaperPromptContractPortfolio(()=>{
    f.pokemon.reduceEffect(f.store,f.state,
      {kind:'spoony',ownerCard:f.pokemon,player:f.owner});
    assert.equal(f.state.prompts.length,1);
    assert.equal(f.state.prompts[0].options.singleSourceTarget,false,
      'Audit must preserve native prompt options until reply');
    assert.equal(f.state.prompts[0].validate(split),true);
    assert.throws(()=>f.store.dispatch(new ResolvePromptAction(46,split)),
      /PAPER_PROMPT_INVALID:.*PAINFUL_SPOONS_MULTIPLE_SOURCE_POKEMON/);
    assert.equal(f.store.mutations,0);
    assert.equal(f.state.prompts[0].result,undefined);
    return f.store.dispatch(new ResolvePromptAction(46,unified));
  },deps);
  assert.deepEqual(audit.result,{accepted:true});
  assert.equal(audit.audit.markedPainfulSpoonsPrompts,1);
  assert.equal(audit.audit.statusCounts.PAPER_PROMPT_INVALID,1);
  assert.equal(audit.audit.statusCounts.PAPER_PROMPT_UNVERIFIED,1);
  assert.equal(audit.audit.statusCounts.PAPER_PROMPT_VERIFIED,0);
  assert.equal(audit.audit.vetoedBeforeDispatch,1);
  assert.equal(audit.audit.nativeAccepted,1);
  assert.equal(audit.audit.byTrial['31:source:both-seats'].attempted,2);
  assert.equal(audit.audit.examples[0].sourcePrinting,'Radiant Alakazam SIT');
  assert.equal(audit.audit.examples[0].reason,
    'PAINFUL_SPOONS_MULTIPLE_SOURCE_POKEMON');
  assert.equal(f.state.prompts[0].options.singleSourceTarget,false);
  assert.strictEqual(RadiantAlakazam.prototype.reduceEffect,prior.value);
});

test('generic unmarked MoveDamage cannot borrow source-specific paper veto',()=>{
  const f=fixture();
  f.state.prompts=[new MoveDamagePrompt(f.owner.id)];
  const audit=withPaperPromptContractPortfolio(()=>
    f.store.dispatch(new ResolvePromptAction(46,split)),deps).audit;
  assert.equal(f.store.mutations,1);
  assert.equal(audit.markedPainfulSpoonsPrompts,0);
  assert.equal(audit.statusCounts.PAPER_PROMPT_UNVERIFIED,1);
  assert.equal(audit.statusCounts.PAPER_PROMPT_INVALID,0);
});

test('non-Painful-Spoons reducer effect does not mark its MoveDamage prompt',()=>{
  const f=fixture();
  const audit=withPaperPromptContractPortfolio(()=>{
    f.pokemon.reduceEffect(f.store,f.state,
      {kind:'other',ownerCard:f.pokemon,player:f.owner});
    return f.store.dispatch(new ResolvePromptAction(46,split));
  },deps).audit;
  assert.equal(audit.markedPainfulSpoonsPrompts,0);
  assert.equal(audit.statusCounts.PAPER_PROMPT_UNVERIFIED,1);
});

test('source-marking descriptors restore on callback exception',()=>{
  const prior=Object.getOwnPropertyDescriptor(
    RadiantAlakazam.prototype,'reduceEffect');
  const source=Object.getOwnPropertyDescriptor(
    FakeStore.prototype,'dispatch');
  assert.throws(()=>withPaperPromptContractPortfolio(()=>{
    throw new Error('stop native session');
  },deps),/stop native session/);
  assert.strictEqual(RadiantAlakazam.prototype.reduceEffect,prior.value);
  assert.strictEqual(FakeStore.prototype.dispatch,source.value);
});
