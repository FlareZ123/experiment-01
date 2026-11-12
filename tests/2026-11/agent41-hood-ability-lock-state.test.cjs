'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  liveGarbotoxinSlots,hasLiveGarbotoxin,
  hasActiveIronThornsInitialization,hasLiveOpponentAbilityLock,
  hasHoodedDoorRecoveryWindow
}=require('../../simulation/twinleaf/hood-ability-lock-state.cjs');

const power=name=>({name});
const pokemon=(name,powers=[])=>({name,fullName:name+' TEST',powers});
const slot=(card,tools=[])=>({getPokemonCard:()=>card,tools});
const tool=name=>({name,fullName:name+' TEST'});
const player=({active=null,bench=[],hand=[],stadium=[]}={})=>({
  active,bench,hand:{cards:hand.map(name=>({name}))},
  stadium:{cards:stadium.map(name=>({name}))}
});
const garbodor=()=>pokemon('Garbodor',[power('Garbotoxin')]);
const otherGarbodor=()=>pokemon('Garbodor',[power('Gloomy Garbage')]);
const ironThorns=()=>pokemon('Iron Thorns ex',[power('Initialization')]);
const shadowVmax=()=>pokemon('Shadow Rider Calyrex VMAX',[power('Underworld Door')]);
const hand=['Battle Compressor','Night Stretcher','Field Blower'];
function recoveryBoard(opponentActive,opponentBench=[],opponentStadium=[],ownStadium=[]){
  const own=player({active:slot(shadowVmax(),[tool('Stealthy Hood')]),
    bench:[slot(shadowVmax())],hand,stadium:ownStadium});
  const opponent=player({active:opponentActive,bench:opponentBench,
    stadium:opponentStadium});
  return {own,opponent,state:{players:[own,opponent]}};
}

test('live Garbotoxin recognizes an Active Garbodor with any Pokémon Tool',()=>{
  const foe=player({active:slot(garbodor(),[tool('Float Stone')])});
  assert.equal(hasLiveGarbotoxin(foe),true);
  assert.deepEqual(liveGarbotoxinSlots(foe),[{
    zone:'active',index:null,printing:'Garbodor TEST',tools:['Float Stone TEST']
  }]);
});

test('live Garbotoxin recognizes a Benched Garbodor with a non-Float-Stone Tool',()=>{
  const foe=player({bench:[slot(garbodor(),[tool('Pokémon Tool')])]});
  assert.equal(hasLiveGarbotoxin(foe),true);
  assert.equal(liveGarbotoxinSlots(foe)[0].zone,'bench');
});

test('a Garbodor name or Tool alone does not prove Garbotoxin',()=>{
  assert.equal(hasLiveGarbotoxin(player({active:slot(garbodor())})),false);
  assert.equal(hasLiveGarbotoxin(player({active:slot(otherGarbodor(),
    [tool('Float Stone')])})),false);
});

test('Iron Thorns is a lock only in the Active Spot with Initialization',()=>{
  assert.equal(hasActiveIronThornsInitialization(
    player({active:slot(ironThorns())})),true);
  assert.equal(hasActiveIronThornsInitialization(
    player({bench:[slot(ironThorns())]})),false);
  assert.equal(hasLiveOpponentAbilityLock(player({
    bench:[slot(garbodor(),[tool('Float Stone')])]
  })),true);
});

test('recovery accepts Active or Benched Garbotoxin with any Tool',()=>{
  const active=recoveryBoard(slot(garbodor(),[tool('Float Stone')]));
  assert.equal(hasHoodedDoorRecoveryWindow(
    active.own,active.opponent,active.state),true);
  const benched=recoveryBoard(slot(pokemon('Other Pokémon')),
    [slot(garbodor(),[tool('Pokémon Tool')])]);
  assert.equal(hasHoodedDoorRecoveryWindow(
    benched.own,benched.opponent,benched.state),true);
});

test('a Tool Jammer on the opponent Active disables the candidate Active Hood',()=>{
  const b=recoveryBoard(slot(garbodor(),[tool('Tool Jammer')]));
  assert.equal(hasHoodedDoorRecoveryWindow(b.own,b.opponent,b.state),false);
});

test('a Tool Jammer on a Benched Pokémon does not disable the Active Hood',()=>{
  const b=recoveryBoard(slot(pokemon('Other Pokémon')),
    [slot(garbodor(),[tool('Tool Jammer')])]);
  assert.equal(hasHoodedDoorRecoveryWindow(b.own,b.opponent,b.state),true);
});

test('Jamming Tower and Path to the Peak suppress the recovery line',()=>{
  for(const stadium of ['Jamming Tower','Path to the Peak']){
    const b=recoveryBoard(slot(garbodor(),[tool('Float Stone')]),[],
      [stadium]);
    assert.equal(hasHoodedDoorRecoveryWindow(
      b.own,b.opponent,b.state),false,stadium);
  }
});

test('a same-name Garbodor without Garbotoxin cannot trigger the recovery line',()=>{
  const b=recoveryBoard(slot(otherGarbodor(),[tool('Float Stone')]));
  assert.equal(hasHoodedDoorRecoveryWindow(b.own,b.opponent,b.state),false);
});
