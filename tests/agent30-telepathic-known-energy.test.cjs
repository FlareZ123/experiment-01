'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {specialEnergyUnits}=
  require('../simulation/twinleaf/agent3-special-energy-frontier.cjs');
const {chooseActorEnergyRecipient}=
  require('../simulation/twinleaf/agent44-actor-energy-recipient.cjs');

const P=5,C=9;
const TELEPATHIC='Telepathic Psychic Energy MEE';
const BASIC='Psychic Energy MEE';
const catalog={
  basicEnergies:new Set([BASIC]),
  specialEnergies:new Set([TELEPATHIC,'Double Colorless Energy SUM',
    'Rainbow Energy CES']),
  basicEnergyTypes:{Psychic:P,Lightning:4},colorlessEnergyType:C
};

/** @param {string[]} energies @param {number[]} cost */
function pokemon(energies,cost){
  return {energies,attacks:[{name:'Will-O-Wisp',cost,gxAttack:false}],
    publicRestrictions:{}};
}
/** @param {string[]} activeEnergy */
function view(activeEnergy){
  return {decisionKind:'owner-root',globalTurn:3,
    ownHand:[BASIC],
    ownPublic:{active:pokemon(activeEnergy,[P,P]),
      bench:[pokemon([],[P]),null,null,null,null],stadium:[]},
    opponentPublic:{stadium:[]}};
}

test('printed me3-88 attached Telepathic provides one Psychic unit',()=>{
  assert.deepEqual(specialEnergyUnits(TELEPATHIC,catalog),[P]);
  assert.deepEqual(specialEnergyUnits(TELEPATHIC,catalog,true),[C]);
  assert.deepEqual(specialEnergyUnits('Double Colorless Energy SUM',catalog),[C,C]);
  assert.equal(specialEnergyUnits('Rainbow Energy CES',catalog),null);
  assert.equal(specialEnergyUnits('Telepathic Psychic Energy UNKNOWN',catalog),null);
});

test('Telepathic attached to a real printed two-Psychic Stage1 plan receives Basic',()=>{
  const pick=chooseActorEnergyRecipient(view([TELEPATHIC]),catalog);
  assert.deepEqual(pick,{handIndex:0,printing:BASIC,slot:'active',index:0,
    attackName:'Will-O-Wisp',gapBefore:1,gapAfter:0,
    knownBasicEnergyOnly:true});
});

test('Temple turns Telepathic into Colorless in the recipient gap calculation',()=>{
  const v=view([TELEPATHIC]);
  v.ownPublic.stadium=['Temple of Sinnoh ASR'];
  const pick=chooseActorEnergyRecipient(v,catalog);
  assert.equal(pick.slot,'active');
  assert.equal(pick.gapBefore,2);
  assert.equal(pick.gapAfter,1);
});

test('unsupported attached Rainbow cannot masquerade as payable Psychic',()=>{
  const v=view(['Rainbow Energy CES']);
  const pick=chooseActorEnergyRecipient(v,catalog);
  assert.equal(pick.slot,'bench');
  assert.equal(pick.gapBefore,1);
  assert.equal(pick.gapAfter,0);
});

test('conserves Basic hand and public information boundary',()=>{
  const a=view([TELEPATHIC]),b=view([TELEPATHIC]);
  a.opponentHidden={hand:['opponent A'],prizes:['hidden A']};
  b.opponentHidden={hand:['opponent B'],prizes:['hidden B']};
  b.ownHiddenDeck=['hidden owner'];
  assert.deepEqual(chooseActorEnergyRecipient(a,catalog),
    chooseActorEnergyRecipient(b,catalog));
});
