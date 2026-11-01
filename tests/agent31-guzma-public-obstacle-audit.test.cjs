'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {classifyGuzmaRoot,withGuzmaPublicObstacleAudit}=require(
  '../simulation/twinleaf/agent31-guzma-public-obstacle-audit.cjs');

const catalog={
  basicEnergies:new Set(['Psychic Energy MEE']),
  basicEnergyTypes:{Psychic:5},
  colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:3}
};
const attacker=()=>({
  printing:'Lunatone OBF',printed:{types:[5]},
  attacks:[{name:'Moon Press',cost:[5,9,9],
    damage:100,damageCalculation:null,text:'',gxAttack:false}],
  energies:['Psychic Energy MEE','Psychic Energy MEE',
    'Psychic Energy MEE'],
  specialConditions:[],publicRestrictions:{}
});
function view(){
  return {
    decisionKind:'owner-root',actorSeat:0,globalTurn:5,
    ownHand:['Guzma BUS'],
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false},
    ownPublic:{
      active:{},bench:[attacker(),null,null,null,null],prizeCount:3,
      publicTurnRestrictions:{supporterPlayLocked:false}
    },
    opponentPublic:{
      active:{},bench:[{hp:90,damage:0,tools:[],
        printed:{resistance:[]}},null,null,null,null]
    }
  };
}

test('owner-public near-miss dimensions distinguish funded attack and target',()=>{
  const v=view();
  const observed=classifyGuzmaRoot(v,catalog);
  assert.equal(observed.heldGuzma,true);
  assert.equal(observed.fundedPlainBenchAttackCount,1);
  assert.equal(observed.nominalKoPairCount,1);
  assert.equal(observed.nonfinalPrizeOpportunity,true);
  assert.equal(observed.finalPrizeOpportunity,false);
  v.ownPublic.bench[0].energies=[];
  assert.equal(classifyGuzmaRoot(v,catalog).fundedPlainBenchAttackCount,0);
  assert.equal(classifyGuzmaRoot(v,catalog).nominalKoPairCount,0);
});

test('changing opponent hidden data cannot change public obstacle measurement',()=>{
  const v=view();
  Object.defineProperty(v,'opponentHidden',{get(){
    throw Error('Observer attempted to read hidden opponent data');
  }});
  const before=classifyGuzmaRoot(v,catalog);
  v.opponentPublic.bench[0].damage=40;
  const after=classifyGuzmaRoot(v,catalog);
  assert.equal(after.heldGuzma,before.heldGuzma);
  assert.equal(after.nominalKoPairCount,1);
});

test('live Store observer counts once per turn, restores hooks, retains actions',()=>{
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
  const original=Store.prototype.dispatch;
  const v=view();
  const x=withGuzmaPublicObstacleAudit(()=>{
    const store=new Store();
    const results=[
      store.dispatch(new AddPlayerAction()),
      store.dispatch(new AttackAction(101)),
      store.dispatch(new AttackAction(101))
    ];
    v.ownHand=[];
    results.push(store.dispatch(new AttackAction(101)));
    assert.deepEqual(store.actions,[
      'AddPlayerAction','AttackAction','AttackAction','AttackAction']);
    return results;
  },{Store,observe:()=>v,getCatalog:()=>catalog});
  assert.deepEqual(x.result,[1,2,3,4]);
  assert.equal(x.audit.gamesObserved,1);
  assert.equal(x.audit.acceptedOwnerRoots,3);
  assert.equal(x.audit.acceptedOwnerRootsHoldingGuzma,2);
  assert.equal(x.audit.uniqueOwnerTurnsWithGuzma,1);
  assert.equal(x.audit.ownerTurnsWithAnyNominalAndOpenSupporter,1);
  assert.equal(x.audit.attemptedActionChanges,0);
  assert.strictEqual(Store.prototype.dispatch,original);
});

test('already-payable direct Active KO excludes gust opportunity',()=>{
  const v=view();
  v.ownPublic.active=attacker();
  v.opponentPublic.active={hp:90,damage:0,
    tools:[],printed:{resistance:[]}};
  const o=classifyGuzmaRoot(v,catalog);
  assert.equal(o.directActiveNominalKo,true);
  assert.equal(o.nominalKoPairCount,1);
  assert.equal(o.nonfinalPrizeOpportunity,false);
});
