'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {chooseUnderworldActiveFundingPriority}=
  require('../simulation/twinleaf/agent34-underworld-active-funding-priority.cjs');

const VMAX='Shadow Rider Calyrex VMAX CRE';
const PSY='Psychic Energy MEE';
const C={basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set([PSY]),basicEnergyTypes:{Psychic:5},
  colorlessEnergyType:9,specialConditions:{ASLEEP:2,PARALYZED:0}};
const pokemon=(printing,energy=[],abilities=[])=>({
  printing,printed:{types:[5],retreatCost:[9]},
  abilities,energies:energy,tools:[],specialConditions:[],
  publicRestrictions:{},attacks:printing===VMAX?
    [{name:'Max Geist',cost:[9,9,9],gxAttack:false}]:[]
});
function state(){
  return {decisionKind:'owner-root',globalTurn:11,
    ownHand:[PSY],
    ownPublic:{active:pokemon(VMAX),bench:[
      pokemon(VMAX,[],['Underworld Door']),
      null,null,null,null],stadium:[],
      publicTurnRestrictions:{attackLockTurnsRemaining:0}},
    ownTurnResources:{pokemonPlayLocked:false,energyPlayLocked:false,
      energyPlayedTurn:0,retreatedTurn:0},
    opponentPublic:{stadium:[],bench:[null,null,null,null,null]}};
}
const options={underworldDoorRoot:true,
  underworldMarkerReceipt:{activeUnspent:false,
    benchUnspent:[true,false,false,false,false]}};
const choose=(v,switchOn)=>chooseActorRootIntent(v,C,{
  ...options,underworldActiveFundingPriority:switchOn});

test('default off uses the authenticated Underworld source root',()=>{
  assert.equal(choose(state(),false).kind,'use-underworld-door');
});

test('one held Psychic prioritizes manual Active funding over Benched Underworld',()=>{
  const v=state();
  const choice=choose(v,true);
  assert.equal(choice.kind,'attach-basic-energy');
  assert.equal(choice.slot,'active');
  assert.equal(choice.index,0);
  assert.equal(choice.handIndex,0);
  assert.equal(choice.gapBefore,3);
  assert.equal(choice.gapAfter,2);
  assert.equal(choice.singleHeldPsychicContestedByUnderworld,true);
  assert.equal(choice.paperPhysicalEffectUnconfirmed,true);
  assert.equal(choice.sourceAbility,'Underworld Door');
});

test('third Active Psychic is the immediate attack-enabling contested resource',()=>{
  const v=state();v.ownPublic.active.energies=[PSY,PSY];
  const first=choose(v,true);
  assert.equal(first.kind,'attach-basic-energy');
  assert.equal(first.gapBefore,1);
  assert.equal(first.gapAfter,0);
  v.ownHand=[];v.ownPublic.active.energies.push(PSY);
  v.ownTurnResources.energyPlayedTurn=v.globalTurn;
  assert.equal(choose(v,true).kind,'attack');
});

test('two held Psychic can fund Bench Ability and manual Active this turn',()=>{
  const v=state();v.ownHand=[PSY,PSY];
  assert.equal(choose(v,true).kind,'use-underworld-door');
});

test('already powered Active, consumed attachment, and missed source abstain',()=>{
  const v=state();v.ownPublic.active.energies=[PSY,PSY,PSY];
  assert.equal(choose(v,true).kind,'use-underworld-door');
  const paid=state();paid.ownTurnResources.energyPlayedTurn=11;
  assert.equal(choose(paid,true).kind,'use-underworld-door');
  const absent=state();
  assert.equal(chooseUnderworldActiveFundingPriority(absent,C).kind,
    'attach-basic-energy');
  const natural=chooseActorRootIntent(absent,C,{
    underworldDoorRoot:true,underworldActiveFundingPriority:true,
    underworldMarkerReceipt:{activeUnspent:false,
      benchUnspent:[false,false,false,false,false]}
  });
  assert.equal(natural.kind,'attach-basic-energy');
  assert.equal(natural.singleHeldPsychicContestedByUnderworld,undefined,
    'Without a verified Underworld root, only the generic Energy plan runs');
});

test('active status, non-source Active, and unknown special Energy abstain',()=>{
  const sleep=state();sleep.ownPublic.active.specialConditions=[2];
  assert.equal(choose(sleep,true).kind,'use-underworld-door');
  const off=state();off.ownPublic.active=pokemon('Tapu Lele-GX GRI');
  assert.equal(choose(off,true).kind,'use-underworld-door');
  const special=state();special.ownPublic.active.energies=['Mystery Energy PHF'];
  assert.equal(choose(special,true).kind,'use-underworld-door');
});

test('genuine energy-play lock, attack lock and off-spec attack abstain',()=>{
  const lock=state();lock.ownTurnResources.energyPlayLocked=true;
  assert.equal(choose(lock,true).kind,'use-underworld-door');
  const attackLock=state();
  attackLock.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;
  assert.equal(choose(attackLock,true).kind,'use-underworld-door');
  const nonprinted=state();nonprinted.ownPublic.active.attacks[0].name='Other';
  assert.equal(choose(nonprinted,true).kind,'use-underworld-door');
});

test('private opponent zones are never inspected',()=>{
  const v=state();
  for(const field of ['hand','deck','prizes']){
    Object.defineProperty(v.opponentPublic,field,{get(){
      throw Error('Opponent secret was read');
    }});
  }
  assert.equal(choose(v,true).kind,'attach-basic-energy');
});
