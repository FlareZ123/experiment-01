'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {VERSION,withOriginal29PrintedFidelity}=
  require('../simulation/twinleaf/agent50-original29-printed-fidelity-hook.cjs');

const types={FIGHTING:6,GRASS:1};
class FakeManager{
  getCardByName(name){
    const common={fullName:name,resistance:[],attacks:[
      {name:'Scratch',damage:80},{name:'Other',damage:30}]};
    if(name==='Electrode-GX CES')
      return {...common,setNumber:'48',
        attacks:[{name:'Electro Ball',damage:50},
          {name:'Crash and Burn-GX',damage:30}]};
    if(name==='Pidgeotto TEU')
      return {...common,setNumber:'123',
        resistance:[{type:types.FIGHTING,value:-30}]};
    if(name==='Shadow Rider Calyrex VMAX CRE')
      return {...common,
        attacks:[{name:'Max Geist',damage:10}]};
    if(name==='Koraidon ex TEF')
      return {...common,
        attacks:[{name:'Retribution Strike',damage:20}]};
    return common;
  }
}

test('scope corrects real source printing while restoring manager on normal return',()=>{
  const base=FakeManager.prototype.getCardByName;
  const adapter=withOriginal29PrintedFidelity(()=>{
    const m=new FakeManager();
    assert.equal(m.getCardByName('Electrode-GX CES').attacks[1].name,
      'Crush and Burn-GX');
    assert.deepEqual(m.getCardByName('Pidgeotto TEU').resistance,
      [{type:types.FIGHTING,value:-20}]);
    assert.deepEqual(m.getCardByName('Mew V FST').resistance,
      [{type:types.FIGHTING,value:-30}]);
    assert.deepEqual(m.getCardByName('Mew VMAX FST').resistance,
      [{type:types.FIGHTING,value:-30}]);
    assert.deepEqual(m.getCardByName('Genesect V FST').resistance,
      [{type:types.GRASS,value:-30}]);
    assert.equal(m.getCardByName('Koraidon ex TEF').attacks[0].damageCalculation,
      '+');
    assert.equal(m.getCardByName('Shadow Rider Calyrex VMAX CRE')
      .attacks[0].damageCalculation,'+');
    assert.equal(m.getCardByName('Trubbish FST').attacks[0].name,'Scratch');
    return 'protected-printed-metadata';
  },{CardManager:FakeManager,CardType:types});
  assert.equal(adapter.result,'protected-printed-metadata');
  assert.equal(adapter.audit.version,VERSION);
  assert.equal(adapter.audit.corrections.length,7);
  assert.strictEqual(FakeManager.prototype.getCardByName,base);
  assert.equal(new FakeManager().getCardByName('Electrode-GX CES')
    .attacks[1].name,'Crash and Burn-GX');
});

test('exception restores exact pinned manager descriptor',()=>{
  const before=Object.getOwnPropertyDescriptor(
    FakeManager.prototype,'getCardByName');
  assert.throws(()=>withOriginal29PrintedFidelity(()=>{
    const m=new FakeManager();
    assert.equal(m.getCardByName('Mew V FST').resistance[0].value,-30);
    throw Error('deliberate-experiment-exit');
  },{CardManager:FakeManager,CardType:types}),
  /deliberate-experiment-exit/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    FakeManager.prototype,'getCardByName'),before);
});
