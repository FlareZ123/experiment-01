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

test('one exact registered Mega Absol printing resolves its pinned M1L native fullName alias',()=>{
  class AliasManager{
    getAllCards(){
      return [{superType:1,name:'Mega Absol ex',set:'MEG',setNumber:'86',
        fullName:'Mega Absol ex M1L',attacks:[],resistance:[]}];
    }
    getCardByName(name){
      return name==='Mega Absol ex M1L'?
        {...this.getAllCards()[0]}:undefined;
    }
  }
  const base=AliasManager.prototype.getCardByName;
  const output=withOriginal29PrintedFidelity(()=>{
    const instance=new AliasManager();
    assert.equal(instance.getCardByName('Never Registered CARD'),undefined);
    return instance.getCardByName('Mega Absol ex MEG');
  },{CardManager:AliasManager,CardType:types});
  assert.equal(output.result?.fullName,'Mega Absol ex M1L');
  assert.deepEqual(output.audit.aliases,[{
    originalRequest:'Mega Absol ex MEG',
    nativeFullName:'Mega Absol ex M1L'
  }]);
  assert.strictEqual(AliasManager.prototype.getCardByName,base);
  assert.equal(new AliasManager().getCardByName('Mega Absol ex MEG'),undefined);
});

test('registered non-Pokémon identity is resolved only through a unique exact native printing',()=>{
  class MixedManager{
    getAllCards(){
      return [
        {superType:2,name:"Lillie's Determination",set:'MEG',
          setNumber:'119',fullName:"Lillie's Determination M1L"},
        {superType:3,name:'Telepathic Psychic Energy',set:'POR',
          setNumber:'88',fullName:'Telepath [P] Energy M3'},
        {superType:2,name:'Counterfeit Substitute',set:'MEG',
          setNumber:'119',fullName:'Counterfeit Substitute M1L'}
      ];
    }
    getCardByName(name){
      const card=this.getAllCards().find(row=>row.fullName===name);
      return card?{...card}:undefined;
    }
  }
  const before=Object.getOwnPropertyDescriptor(
    MixedManager.prototype,'getCardByName');
  const wrapped=withOriginal29PrintedFidelity(()=>{
    const instance=new MixedManager();
    assert.equal(instance.getCardByName("Lillie's Determination MEG")
      .fullName,"Lillie's Determination M1L");
    assert.equal(instance.getCardByName('Telepathic Psychic Energy POR')
      .fullName,'Telepath [P] Energy M3');
    assert.equal(instance.getCardByName('Never Registered MEG'),undefined);
    assert.equal(instance.getCardByName('Counterfeit Substitute MEG'),undefined);
    assert.equal(instance.getCardByName('Thunder Mountain ♢ LOT'),undefined);
    return 'both-real-source-categories';
  },{CardManager:MixedManager,CardType:types});
  assert.equal(wrapped.result,'both-real-source-categories');
  assert.deepEqual(wrapped.audit.aliases,[
    {originalRequest:"Lillie's Determination MEG",
      nativeFullName:"Lillie's Determination M1L"},
    {originalRequest:'Telepathic Psychic Energy POR',
      nativeFullName:'Telepath [P] Energy M3'}
  ]);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    MixedManager.prototype,'getCardByName'),before);
  assert.equal(new MixedManager()
    .getCardByName("Lillie's Determination MEG"),undefined);
});

test('ambiguous native exact printing must never resolve an alias',()=>{
  class DuplicateManager{
    getAllCards(){
      return ['Lillies A','Lillies B'].map(fullName=>({
        name:"Lillie's Determination",set:'MEG',setNumber:'119',fullName
      }));
    }
    getCardByName(name){
      return this.getAllCards().find(c=>c.fullName===name);
    }
  }
  const result=withOriginal29PrintedFidelity(()=>
    new DuplicateManager().getCardByName("Lillie's Determination MEG"),
    {CardManager:DuplicateManager,CardType:types});
  assert.equal(result.result,undefined);
  assert.equal(result.audit.aliases.length,0);
});
