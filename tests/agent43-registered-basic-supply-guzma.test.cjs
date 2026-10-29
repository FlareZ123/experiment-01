'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {
  registeredBasicEnergySupply,
  basicSupplyAwareGuzmaComparison
}=require('../simulation/twinleaf/agent43-registered-basic-supply-guzma.cjs');
const {chooseHeldGuzmaMobility}=
  require('../simulation/twinleaf/agent2-held-guzma-mobility-frontier.cjs');

const P=5,D=6,C=9;
const catalog={
  colorlessEnergyType:C,
  basicEnergyTypes:{Psychic:P,Darkness:D},
  basicEnergies:new Set(['Psychic Energy MEE','Darkness Energy MEE']),
  specialConditions:{ASLEEP:2,PARALYZED:3}
};
const originalField=JSON.parse(fs.readFileSync(path.resolve(__dirname,
  '../results/aichi-2026/full-decklists.json'),'utf8'));
const source=originalField.decks.find(x=>x.rank===11);
assert.ok(source,'Require original complete Aichi rank11 source');
const source60=source.cards.flatMap(c=>Array.from({length:c.count},
  ()=>c.name+' '+c.printing.set+
    (/^Basic Energy$/.test(c.name)?' '+c.printing.number:'')));
assert.equal(source60.length,60);
const sourceEnergy=source.cards.filter(x=>/ Energy$/.test(x.name));
const summary=sourceEnergy.map(c=>({name:c.name,count:c.count}));

/** Native-pinned source card attack costs from XY9-57 and ASR-133. */
const attack=(name,cost,damage)=>({
  name,cost,damage,gxAttack:false
});
const slot=(name,attacks,energies)=>({
  name,attacks,energies,publicRestrictions:{},specialConditions:[]
});
function view(){
  return {
    decisionKind:'owner-root',globalTurn:13,
    ownHand:['Guzma BUS','Marnie SSH'],
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false},
    ownPublic:{
      active:slot('Garbodor BKP',[
        attack('Offensive Bomb',[P,C,C,C],60)
      ],['Darkness Energy MEE','Darkness Energy MEE','Darkness Energy MEE']),
      bench:[
        slot('Oranguru V ASR',[attack('Psychic',[C,C,C],30)],
          ['Darkness Energy MEE']),
        slot('Crobat V DAA',[attack('Venomous Fang',[D,C],70)],[]),
        null,null,null
      ],
      publicTurnRestrictions:{supporterPlayLocked:false,
        attackLockTurnsRemaining:0}
    },
    opponentPublic:{
      bench:[{name:'Public Lunatone OBF'}]
    },
    opponentHidden:{hand:['concealed']}
  };
}

test('registered source is exactly 60 with eight Darkness, zero Psychic or Special Energy',()=>{
  assert.deepEqual(summary,[{name:'Darkness Energy',count:8}]);
  assert.equal(sourceEnergy.some(c=>/Psychic|Special|Dragon/.test(c.name)),false);
  assert.equal(source60.filter(x=>x==='Darkness Energy MEE').length,8);
  const supply=registeredBasicEnergySupply(source60,catalog);
  assert.deepEqual([...supply.entries()],[[D,8]]);
  assert.equal(supply.has(P),false);
});

test('numerical attack gap hides a physically missing Basic Energy type at three Darkness',()=>{
  const v=view();
  assert.equal(chooseHeldGuzmaMobility(v,catalog),null,
    'Three Darkness makes numerical Garbodor gap one vs two on Oranguru');
  const assessed=basicSupplyAwareGuzmaComparison(v,catalog,source60);
  assert.equal(assessed.status,'basic-only-printed-energy-model');
  assert.equal(assessed.original,null);
  assert.equal(assessed.adjusted?.kind,'play-held-guzma-mobility');
  assert.equal(assessed.adjusted?.benchIndex,0);
  assert.equal(assessed.adjusted?.anticipatedMissing,2);
  assert.deepEqual(assessed.excludedActive,[{
    name:'Offensive Bomb',missing:[{
      type:P,required:1,registeredBasicEnergyCount:0
    }]
  }]);
});

test('an owner source with a Psychic source keeps the printed attack in the frontier',()=>{
  const v=view();
  const revised=source60.slice();
  revised[revised.indexOf('Darkness Energy MEE')]='Psychic Energy MEE';
  assert.equal(registeredBasicEnergySupply(revised,catalog).get(P),1);
  const r=basicSupplyAwareGuzmaComparison(v,catalog,revised);
  assert.equal(r.status,'basic-only-printed-energy-model');
  assert.deepEqual(r.excludedActive,[]);
  assert.equal(r.adjusted,null);
});

test('other physical prerequisites still veto supply-aware mobility',()=>{
  const v=view();
  v.ownTurnResources.supporterPlayedTurn=1;
  assert.equal(basicSupplyAwareGuzmaComparison(v,catalog,source60)
    .adjusted,null);
  const locked=view();
  locked.opponentPublic.bench=[];
  assert.equal(basicSupplyAwareGuzmaComparison(locked,catalog,source60)
    .adjusted,null);
  const unattached=view();
  unattached.ownPublic.bench[0].energies=[];
  assert.equal(basicSupplyAwareGuzmaComparison(unattached,catalog,source60)
    .adjusted,null);
});

test('unknown Special Energy or attached Energy conservatively disables model',()=>{
  const specialSource=source60.slice();
  specialSource[0]='Double Dragon Energy ROS';
  const unknown=basicSupplyAwareGuzmaComparison(view(),catalog,
    specialSource);
  assert.equal(unknown.status,'unknown-energy-supply');
  assert.equal(unknown.adjusted,null);
  const attached=view();
  attached.ownPublic.active.energies=['Unknown Rainbow Energy X'];
  const result=basicSupplyAwareGuzmaComparison(attached,catalog,source60);
  assert.equal(result.status,'unknown-attached-energy');
  assert.equal(result.adjusted,null);
});

test('opponent concealed cards never affect registered owner source feasibility',()=>{
  const a=view(),b=view();
  Object.defineProperty(b.opponentHidden,'hand',{
    get(){throw Error('Forbidden opponent concealed-hand access');}
  });
  assert.deepEqual(
    basicSupplyAwareGuzmaComparison(a,catalog,source60),
    basicSupplyAwareGuzmaComparison(b,catalog,source60)
  );
});
