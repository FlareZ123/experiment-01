'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {preflightVisibleOwnerRemainingUpperBound}=
  require('../simulation/twinleaf/owner-original-60-plan-gate.cjs');

const FOG='Fog Crystal CRE';
const BASIC='Psychic Energy MEE 13';

/** Detached owner observation with no concealed-zone inputs whatsoever. */
function view(hand=[],discard=[],activeEnergy=[]){
  return {
    decisionKind:'owner-root',actorSeat:1,globalTurn:14,
    ownHand:[...hand],
    ownPublic:{
      stadium:[],discard:[...discard],lostZone:[],
      resolvingSupporter:[],
      prizeCount:6,
      active:{
        evolutionPrintings:['Unown AOR'],
        energies:[...activeEnergy],tools:[]
      },
      bench:[null,null,null,null,null]
    }
  };
}
/** One named 60 with counts independent of the prompt. */
function original(fog=4,basic=3){
  return [
    ...Array(fog).fill(FOG),...Array(basic).fill(BASIC),
    'Unown AOR',...Array(59-fog-basic).fill('Other Card FST')
  ];
}
const targets=[
  {role:'fog-item-target',acceptablePrintings:[FOG],copies:1},
  {role:'basic-psychic-target',acceptablePrintings:[BASIC],copies:1}
];

test('K0 public owner discard and held copies exhaust original Fog',()=>{
  const registered=original(4,3);
  const owner=view([FOG],[FOG,FOG,FOG]);
  const r=preflightVisibleOwnerRemainingUpperBound(
    registered,owner,targets);
  assert.equal(r.status,'blocked-impossible-visible-exhaustion');
  assert.deepEqual(r.blockedBy.map(x=>x.role),['fog-item-target']);
  assert.equal(r.requirements[0].original60Copies,4);
  assert.equal(r.requirements[0].visibleOutsideDeckCopies,4);
  assert.equal(r.requirements[0].maximumRemainingDeckCopies,0);
  assert.equal(r.requirements[1].maximumRemainingDeckCopies,3);
  assert.equal(r.ownerHiddenDeckInspected,false);
  assert.equal(r.ownerHiddenPrizesInspected,false);
  assert.equal(r.competitiveGamesQualified,0);
});

test('all Basic Psychic publicly spent also vetoes an active-attachment recipe',()=>{
  const r=preflightVisibleOwnerRemainingUpperBound(
    original(4,3),view([], [BASIC,BASIC], [BASIC]),targets);
  assert.equal(r.status,'blocked-impossible-visible-exhaustion');
  assert.deepEqual(r.blockedBy.map(x=>x.role),['basic-psychic-target']);
  assert.equal(r.requirements[1].maximumRemainingDeckCopies,0);
});

test('K0 still permits unresolved Prize uncertainty and enforces full printing custody',()=>{
  const registered=original(4,3);
  const owner=view([],[FOG,BASIC,BASIC]);
  Object.defineProperty(owner,'opponentHiddenCards',{get(){
    throw Error('Forbidden opponent hidden input access');
  }});
  const r=preflightVisibleOwnerRemainingUpperBound(
    registered,owner,targets);
  assert.equal(r.status,'not-disproven');
  assert.equal(r.requirements[0].maximumRemainingDeckCopies,3);
  assert.equal(r.requirements[1].maximumRemainingDeckCopies,1);
  assert.equal(r.currentDeckMembershipCertified,false);
  // A visible printing cannot exceed the player's actual registered 60.
  assert.throws(()=>preflightVisibleOwnerRemainingUpperBound(
    registered,view([],[FOG,FOG,FOG,FOG,FOG]),targets),
  /Visible own zone exceeds registered original60/);
});
