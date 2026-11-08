'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseEarlyBeachAfterPass,VERSION}=
  require('../../simulation/twinleaf/agent7-early-beach-after-pass.cjs');

/** Original source rank-3 first owner root: seven actual known physical prints. */
function opening(){
  return {
    actorSeat:1,decisionKind:'owner-root',globalTurn:1,
    ownHand:[
      'Plumeria BUS','Team Rocket\'s Handiwork FCO','Night Stretcher ASC',
      'Enhanced Hammer TWM','Trainers\' Mail ROS','Penny SVI',
      'Tropical Beach BWP'
    ],
    ownPublic:{active:{printing:'Snorlax PGO'},stadium:[],deckCount:47},
    opponentPublic:{stadium:[]},
    ownTurnResources:{stadiumUsedTurn:0,stadiumPlayedTurn:0,
      stadiumPlayLocked:false}
  };
}

test('exact rank3 source opening offers Beach as the otherwise-Pass owner action',()=>{
  const actual=chooseEarlyBeachAfterPass(opening());
  assert.equal(VERSION,'agent7-first-cycle-otherwise-pass-tropical-beach-v1');
  assert.deepEqual(actual,{kind:'play-tropical-beach',handIndex:6,
    printing:'Tropical Beach BWP',
    reason:'first-cycle-otherwise-pass-place-for-draw'});
});
test('separate following owner root uses the actual Stadium and draws one',()=>{
  const x=opening();
  x.ownHand.pop();x.ownPublic.stadium=['Tropical Beach BWP'];
  x.ownTurnResources.stadiumPlayedTurn=1;
  assert.deepEqual(chooseEarlyBeachAfterPass(x),{
    kind:'use-tropical-beach',cardsToDraw:1,
    reason:'first-cycle-otherwise-pass-draw'});
  x.ownTurnResources.stadiumUsedTurn=1;
  assert.equal(chooseEarlyBeachAfterPass(x),null);
});
test('both physical owner seats and first two global turns have the same rule',()=>{
  const x=opening();x.actorSeat=0;x.globalTurn=2;
  assert.equal(chooseEarlyBeachAfterPass(x)?.kind,'play-tropical-beach');
  x.globalTurn=3;
  assert.equal(chooseEarlyBeachAfterPass(x),null);
});
test('never replace another Stadium or play a locked or spent Stadium',()=>{
  for(const mutate of [
    x=>x.opponentPublic.stadium.push('Chaotic Swell CEC'),
    x=>x.ownPublic.stadium.push('Sky Field ROS'),
    x=>{x.ownTurnResources.stadiumPlayLocked=true;},
    x=>{x.ownTurnResources.stadiumPlayedTurn=1;},
    x=>{delete x.ownTurnResources.stadiumPlayedTurn;},
    x=>{x.ownHand.pop();}
  ]){
    const x=opening();mutate(x);
    assert.equal(chooseEarlyBeachAfterPass(x),null);
  }
});
test('requires known Stadium use clock, Active Pokemon, and a safe deck',()=>{
  for(const mutate of [
    x=>{delete x.ownTurnResources.stadiumUsedTurn;},
    x=>{x.ownTurnResources.stadiumUsedTurn=1;},
    x=>{x.ownPublic.active=null;},
    x=>{x.ownPublic.deckCount=7;},
    x=>{x.decisionKind='owner-prompt';},
  ]){
    const x=opening();mutate(x);
    assert.equal(chooseEarlyBeachAfterPass(x),null);
  }
});
test('never read or depend on opposing hidden zones',()=>{
  const a=opening(),b=opening();
  b.opponentSecret={hand:['unknown'],deck:['another'],prizes:['secret']};
  assert.deepEqual(chooseEarlyBeachAfterPass(a),chooseEarlyBeachAfterPass(b));
});

test('canonical actor root stays Pass unless experimental first-cycle policy is enabled',()=>{
  const {chooseActorRootIntent}=
    require('../../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
  const x=opening();
  x.ownPublic.active.energies=[];
  x.ownPublic.active.attacks=[];
  x.ownPublic.bench=[null,null,null,null,null];
  x.ownPublic.discard=[];
  x.ownTurnResources.pokemonPlayLocked=true;
  x.ownTurnResources.energyPlayLocked=true;
  const catalog={basics:new Set(),abilityBasics:new Set(),
    basicEnergies:new Set(),specialEnergies:new Set(),
    basicEnergyTypes:{},colorlessEnergyType:9,
    specialConditions:{ASLEEP:0,PARALYZED:1,CONFUSED:2}};
  assert.equal(chooseActorRootIntent(x,catalog).kind,'pass');
  assert.equal(chooseActorRootIntent(x,catalog,{earlyBeachAfterPass:true}).kind,
    'play-tropical-beach');
});
