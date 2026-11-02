'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {rank9BombOwnerSnapshot,withRank9BombOwnerFrontier}=
  require('../simulation/twinleaf/agent10-rank9-extra-energy-bomb-owner-frontier.cjs');

function slot(name,energies=[]){
  return {
    getPokemonCard(){return name?{fullName:name}:null;},
    energies:{cards:energies.map(fullName=>({fullName}))}
  };
}
function state(sourceSeat=1){
  const own={
    active:slot('Electrode-GX CES',['Prism Energy ASC']),
    bench:[slot('Mega Absol ex M1L',['Telepathic Psychic Energy MEG']),slot('Unown AOR')],
    discard:{cards:[{fullName:'Darkness Energy MEE',superType:'Energy'},
      {fullName:'Battle VIP Pass FST',superType:'Trainer'}]},
    getPrizeLeft(){return 5;},
    hand:{cards:[{fullName:'Secret Box TWM'},
      {fullName:'Ultra Ball MEG'},
      {fullName:'Prism Energy ASC',superType:'Energy'}]},
    deck:{cards:[]}
  };
  const opp={
    active:slot('Klefki SVI'),bench:[],discard:{cards:[]},
    getPrizeLeft(){return 4;},hand:{cards:[{fullName:'private hidden card'}]},
    deck:{cards:[]}
  };
  const players=sourceSeat===1?[opp,own]:[own,opp];
  return {players,activePlayer:sourceSeat,turn:6,prompts:[]};
}
class AddPlayerAction{}
class PlayCardAction{}
class PassTurnAction{}
class UseAbilityAction{constructor(name){this.name=name;}}
class FakeStore{
  constructor(s){this.state=s;this.calls=[];}
  dispatch(action){this.calls.push(action.constructor.name);return true;}
}

test('owner CES Electrode discard and ex recipients are physical resource flags',()=>{
  const s=state();
  const o=rank9BombOwnerSnapshot(s,1,'Energy');
  assert.equal(o.sourceHasElectrode,true);
  assert.equal(o.discardedEnergyCount,1);
  assert.equal(o.heldDiscardConnectors.ultraBall,1);
  assert.equal(o.heldDiscardConnectors.secretBox,1);
  assert.deepEqual(o.heldEnergyPrintings,['Prism Energy ASC']);
  assert.equal(o.atLeastFiveEnergyCardsInDiscard,false);
  assert.equal(o.eligibleMegaAbsolEx,true);
  assert.ok(o.eligibleRecipientPrintings.includes('Mega Absol ex M1L'));
  assert.ok(!o.eligibleRecipientPrintings.includes('Electrode-GX CES'));
  assert.equal(o.possibleEnergyTransferGeometry,true);
  assert.ok(!JSON.stringify(o).includes('private hidden card'));
  s.players[1].discard.cards=[];
  assert.equal(rank9BombOwnerSnapshot(s,1,'Energy').possibleEnergyTransferGeometry,false);
  s.players[1].discard.cards=[{fullName:'Darkness Energy MEE',superType:'Energy'}];
  s.players[0].getPrizeLeft=()=>2;
  assert.equal(rank9BombOwnerSnapshot(s,1,'Energy').apparentTwoPrizeSelfKoRisk,true);
});

test('records first owner roots and accepted passes across both physical seats; restores dispatch',()=>{
  const original=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  const run=()=>{
    const a=new FakeStore(state(1));
    a.dispatch(new AddPlayerAction());
    a.dispatch(new AddPlayerAction());
    a.dispatch(new PlayCardAction());
    a.dispatch(new PassTurnAction());
    const b=new FakeStore(state(0));
    b.dispatch(new AddPlayerAction());
    b.dispatch(new AddPlayerAction());
    b.dispatch(new UseAbilityAction('Extra Energy Bomb'));
    b.dispatch(new PassTurnAction());
    return {complete:true};
  };
  const {result,audit}=withRank9BombOwnerFrontier(run,{
    Store:FakeStore,energySuperType:'Energy',trialSourceSeats:[1,0]});
  assert.equal(result.complete,true);
  assert.equal(audit.oneStorePerRegisteredTrial,true);
  assert.equal(audit.trials.length,2);
  assert.deepEqual(audit.trials.map(x=>x.acceptedSourcePasses.length),[1,1]);
  assert.deepEqual(audit.trials.map(x=>x.firstOwnerRoots.length),[1,1]);
  assert.equal(audit.trials[1].sourceAbilityRoots[0].abilityName,'Extra Energy Bomb');
  assert.strictEqual(Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch').value,
    original.value);
});

test('preserves error audit and restores prototype after real failure',()=>{
  const original=FakeStore.prototype.dispatch;
  assert.throws(()=>withRank9BombOwnerFrontier(()=>{
    const s=new FakeStore(state(1));s.dispatch(new AddPlayerAction());
    s.dispatch(new PassTurnAction());throw new Error('capped test abort');
  },{Store:FakeStore,energySuperType:'Energy',trialSourceSeats:[1]}),
  error=>error.message==='capped test abort'&&
    error.rank9BombOwnerEvidence.trials[0].acceptedSourcePasses.length===1);
  assert.strictEqual(FakeStore.prototype.dispatch,original);
});
