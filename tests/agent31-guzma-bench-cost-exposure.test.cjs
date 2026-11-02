'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  classifyBenchCostExposure,
  withGuzmaBenchCostObserver
}=require('../simulation/twinleaf/agent31-guzma-bench-cost-exposure.cjs');

const catalog={
  basicEnergies:new Set(['Psychic Energy MEE']),
  basicEnergyTypes:{Psychic:5},
  colorlessEnergyType:9
};
const move=(name,cost,damage,text,damageCalculation=null)=>({
  name,cost,damage,text,damageCalculation,gxAttack:false
});
const pokemon=(printing,energies,attacks)=>({
  printing,energies,attacks,tools:[],damage:0
});
function owner(){
  return {
    decisionKind:'owner-root',actorSeat:0,globalTurn:5,
    ownHand:['Guzma BUS'],
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false},
    ownPublic:{
      active:{},
      bench:[
        pokemon('Shadow Rider Calyrex VMAX CRE',[
          'Psychic Energy MEE','Psychic Energy MEE',
          'Psychic Energy MEE'],[
          move('Max Geist',[9,9,9],10,
            '10 plus 30 for each Psychic Energy', {source:'field-energy'})
        ]),
        pokemon('Latias ex SSP',[
          'Psychic Energy MEE','Psychic Energy MEE',
          'Psychic Energy MEE'],[
          move('Eon Blade',[5,5,9],200,
            'During your next turn, this Pokemon cannot attack')
        ]),
        pokemon('Radiant Eternatus CRZ',[
          'Psychic Energy MEE','Psychic Energy MEE',
          'Psychic Energy MEE'],[
          move('Power Beam',[2,7,9],200,'')
        ]),
        null,null
      ],
      publicTurnRestrictions:{supporterPlayLocked:false},
      resolvingSupporter:[]
    },
    opponentPublic:{bench:[{hp:100},null,null,null,null]}
  };
}

test('printed-attack cost screen sees text and dynamic moves excluded by narrow KO selector',()=>{
  const v=owner();
  const c=classifyBenchCostExposure(v,catalog);
  assert.equal(c.heldGuzma,true);
  assert.equal(c.benchEnergyCardCount,9);
  assert.equal(c.benchPokemonWithEnergy,3);
  assert.equal(c.basicEnergyFundedBenchAttacks,2);
  assert.equal(c.basicEnergyFundedPositiveBaseAttacks,2);
  assert.equal(c.basicEnergyFundedVariableDamageAttacks,1);
  assert.equal(c.basicEnergyFundedTextBearingAttacks,2);
  assert.deepEqual(c.fundedExamples.map(x=>x.name),
    ['Max Geist','Eon Blade']);
  assert.equal(c.quotaOpen,true);
  assert.equal(c.hiddenOpponentZonesUnexamined,true);
});

test('failed cost and absent opponent Bench do not manufacture a legal gust',()=>{
  const v=owner();
  v.ownPublic.bench[0].energies=[];
  v.ownPublic.bench[1].energies=['Psychic Energy MEE'];
  v.opponentPublic.bench=[null,null,null,null,null];
  const c=classifyBenchCostExposure(v,catalog);
  assert.equal(c.basicEnergyFundedBenchAttacks,0);
  assert.equal(c.opponentBenchCount,0);
  assert.equal(c.benchEnergyCardCount,4);
});

test('opponent hidden zones are not accessed by the cost/Bench classifier',()=>{
  const v=owner();
  Object.defineProperty(v,'opponentHidden',{get(){
    throw new Error('Forbidden opponent concealed-zone read');
  }});
  assert.equal(classifyBenchCostExposure(v,catalog)
    .basicEnergyFundedBenchAttacks,2);
});

test('native Store observer preserves accepted actions and restores original method',()=>{
  class AddPlayerAction{}
  class AttackAction{constructor(id){this.id=id;}}
  class Store{
    constructor(){
      this.state={players:[{id:101},{id:202}],
        prompts:[],activePlayer:0,turn:5};
      this.actions=[];
    }
    dispatch(action){
      this.actions.push(action.constructor.name);
      return this.actions.length;
    }
  }
  const previous=Store.prototype.dispatch;
  const v=owner();
  const x=withGuzmaBenchCostObserver(()=>{
    const s=new Store();
    const out=[
      s.dispatch(new AddPlayerAction()),
      s.dispatch(new AttackAction(101)),
      s.dispatch(new AttackAction(101))
    ];
    v.ownHand=[];
    out.push(s.dispatch(new AttackAction(101)));
    return out;
  },{Store,observe:()=>v,getCatalog:()=>catalog});
  assert.deepEqual(x.result,[1,2,3,4]);
  assert.equal(x.audit.gameCount,1);
  assert.equal(x.audit.acceptedRoots,3);
  assert.equal(x.audit.heldRoots,2);
  assert.equal(x.audit.uniqueHeldOwnerTurns,1);
  assert.equal(x.audit.heldTurnsWithBenchEnergy,1);
  assert.equal(x.audit.heldTurnsWithBasicFundedBenchAttack,1);
  assert.equal(x.audit.heldTurnsWithTargetQuotaAndFundedAttack,1);
  assert.equal(x.audit.perGameSeat.length,1);
  assert.equal(x.audit.perGameSeat[0].gameId,1);
  assert.equal(x.audit.perGameSeat[0].heldTurns,1);
  assert.strictEqual(Store.prototype.dispatch,previous);
});

test('outside game data stays unchanged when no Guzma is held',()=>{
  const v=owner();
  v.ownHand=[];
  assert.equal(classifyBenchCostExposure(v,catalog).heldGuzma,false);
});
