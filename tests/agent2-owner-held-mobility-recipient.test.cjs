'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorEnergyRecipient}=require(
  '../simulation/twinleaf/agent44-actor-energy-recipient.cjs');
const {chooseActorRootIntent}=require(
  '../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const P=5,C=9;
const catalog={
  basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set(['Psychic Energy MEE']),
  basicEnergyTypes:{Psychic:P},colorlessEnergyType:C,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};

/** @param {string} name @param {number[]} cost @returns {object} */
function pokemon(name,cost){
  return {name,energies:[],attacks:[{
    name:'Printed Attack',cost,gxAttack:false
  }],publicRestrictions:{},specialConditions:[],printed:{types:[P]}};
}

/** @param {string[]} held @returns {object} */
function view(held){
  return {decisionKind:'owner-root',globalTurn:9,
    ownHand:['Psychic Energy MEE',...held],
    ownTurnResources:{energyPlayedTurn:0,energyPlayLocked:false,
      pokemonPlayLocked:false,itemPlayLocked:false,
      supporterPlayLocked:false,supporterPlayedTurn:0},
    ownPublic:{
      active:pokemon('Stranded Active',[P,P,P]),
      bench:[pokemon('Near-term Bench',[P]),null,null,null,null],
      stadium:[],publicTurnRestrictions:{itemPlayLocked:false,
        supporterPlayLocked:false}
    },
    opponentPublic:{bench:[pokemon('Opponent Bench',[C])]},
    opponentHidden:{hand:['secret'],prizes:['secret']}
  };
}

const pick=(v,enabled=true)=>chooseActorEnergyRecipient(v,catalog,
  {mobilityAware:enabled});

test('opt-in Switch changes stranded Active funding to ready Bench',()=>{
  const v=view(['Switch SVI']);
  assert.equal(pick(v,false).slot,'active');
  assert.deepEqual({
    slot:pick(v).slot,index:pick(v).index,
    gapBefore:pick(v).gapBefore,gapAfter:pick(v).gapAfter
  },{slot:'bench',index:0,gapBefore:1,gapAfter:0});
  const chosen=chooseActorRootIntent(v,catalog,{
    energyRecipientFrontier:true,mobilityAwareRecipient:true
  });
  assert.equal(chosen.kind,'attach-basic-energy');
  assert.equal(chosen.slot,'bench');
  assert.equal(chooseActorRootIntent(v,catalog,{
    energyRecipientFrontier:true
  }).slot,'active');
});

test('held Escape Rope enables the same public Bench funding choice',()=>{
  assert.equal(pick(view(['Escape Rope BST'])).slot,'bench');
});

test('Item lock prevents counting held Switch or Escape Rope as mobility',()=>{
  for(const card of ['Switch SVI','Escape Rope BST']){
    const v=view([card]);
    v.ownTurnResources.itemPlayLocked=true;
    assert.equal(pick(v).slot,'active');
    v.ownTurnResources.itemPlayLocked=false;
    v.ownPublic.publicTurnRestrictions.itemPlayLocked=true;
    assert.equal(pick(v).slot,'active');
  }
});

test('held playable Guzma qualifies with public opposing Bench',()=>{
  assert.equal(pick(view(['Guzma BUS'])).slot,'bench');
});

test('Guzma requires unspent Supporter, no lock, opposing Bench and legal turn',()=>{
  const spent=view(['Guzma BUS']);
  spent.ownTurnResources.supporterPlayedTurn=1;
  assert.equal(pick(spent).slot,'active');
  const locked=view(['Guzma BUS']);
  locked.ownTurnResources.supporterPlayLocked=true;
  assert.equal(pick(locked).slot,'active');
  const publicLocked=view(['Guzma BUS']);
  publicLocked.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;
  assert.equal(pick(publicLocked).slot,'active');
  const noBench=view(['Guzma BUS']);
  noBench.opponentPublic.bench=[null,null,null,null,null];
  assert.equal(pick(noBench).slot,'active');
  const firstTurn=view(['Guzma BUS']);
  firstTurn.globalTurn=1;
  assert.equal(pick(firstTurn).slot,'active');
  const noQuota=view(['Guzma BUS']);
  delete noQuota.ownTurnResources.supporterPlayedTurn;
  assert.equal(pick(noQuota).slot,'active');
});

test('Guzma and Hala and Switch Cart never masquerade as generic mobility',()=>{
  assert.equal(pick(view(['Guzma & Hala CEC'])).slot,'active');
  assert.equal(pick(view(['Switch Cart ASR'])).slot,'active');
  assert.equal(pick(view(['Switch Raft DRM'])).slot,'active');
});

test('an Energy that funds Active immediately stays with Active',()=>{
  const v=view(['Guzma BUS']);
  v.ownPublic.active.attacks[0].cost=[P];
  assert.equal(pick(v).slot,'active');
  assert.equal(pick(v).gapAfter,0);
});

test('when no held mobility exists, explicit option preserves v3 order',()=>{
  const v=view(['Boss’s Orders PAL','Guzma & Hala CEC']);
  assert.deepEqual(pick(v,true),pick(v,false));
});

test('choice is independent of opponent hidden identities and own unknown deck',()=>{
  const x=view(['Guzma BUS']),y=view(['Guzma BUS']);
  y.opponentHidden={hand:['differently concealed'],prizes:['other']};
  y.ownUnknownDeck=['unknown'];
  assert.deepEqual(pick(x),pick(y));
});

test('only publicly known non-GX costs count as funding targets',()=>{
  const v=view(['Switch SVI']);
  v.ownPublic.bench[0].attacks[0].gxAttack=true;
  assert.equal(pick(v).slot,'active');
});
