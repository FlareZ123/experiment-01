'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const registration=require('../results/aichi-2026/registrations/agent22-rank7-stateful-steven-20261102.json');
const {VERSION,MODEL,source7PrintingWeight,statefulStevenBundleScore}=
  require('../simulation/twinleaf/agent22-stateful-steven-score.cjs');

/** Detached actor-only observation, with neither opponent hidden hand nor deck. */
function ownerView({
  ownHand=[],ownDiscard=[],ownPrize=6,opponentPrize=6,
  ownBench=2,opponentBench=0,ownStadium=[],opponentStadium=[],
  itemLocked=false,stadiumLocked=false,energyLocked=false
}={}){
  return {
    ownHand,
    ownPublic:{
      bench:[...Array(ownBench).fill({printing:'Wobbuffet PHF'}),
        ...Array(5-ownBench).fill(null)],
      discard:ownDiscard,stadium:ownStadium,prizeCount:ownPrize,
      publicTurnRestrictions:{
        itemPlayLocked:itemLocked,stadiumPlayLocked:stadiumLocked,
        energyPlayLocked:energyLocked,specialEnergyPlayLocked:energyLocked
      }
    },
    opponentPublic:{
      bench:[...Array(opponentBench).fill({printing:'Shadow Rider Calyrex V'}),
        ...Array(5-opponentBench).fill(null)],
      stadium:opponentStadium,prizeCount:opponentPrize
    }
  };
}

test('registered source identity, fresh seeds and value model are unaltered',()=>{
  assert.equal(registration.sourceRank,7);
  assert.equal(registration.opponentRank,1);
  assert.equal(registration.totalNativeAttempts,18);
  assert.deepEqual(registration.registeredSeeds,
    [690788095,3370031093,63650769]);
  assert.equal(VERSION,MODEL.id);
  assert.equal(MODEL.perCardCost,0.15);
});

test('source public turn zero keeps unavailable counter and retrieval low',()=>{
  const actor=ownerView();
  assert.equal(source7PrintingWeight('Capture Energy RCL',actor),9);
  assert.equal(source7PrintingWeight('Artazon PAL',actor),10);
  assert.equal(source7PrintingWeight('Counter Catcher PAR',actor),0.6);
  assert.equal(source7PrintingWeight('VS Seeker PHF',actor),0.6);
  assert.equal(source7PrintingWeight('Chaotic Swell CEC',actor),4);
  assert.ok(statefulStevenBundleScore([
    'Artazon PAL','Capture Energy RCL','Nest Ball SVI'],actor)>
    statefulStevenBundleScore([
      'VS Seeker PHF','Counter Catcher PAR','Palace Book SMP'],actor));
});

test('only visible owner Supporter discard and Prize deficit activate conditional arms',()=>{
  const actor=ownerView({ownDiscard:['N FCO'],opponentPrize:4,
    opponentBench:2,opponentStadium:['Thunder Mountain Prism Star LOT']});
  assert.equal(source7PrintingWeight('VS Seeker PHF',actor),11);
  assert.equal(source7PrintingWeight('Counter Catcher PAR',actor),11);
  assert.equal(source7PrintingWeight('Chaotic Swell CEC',actor),8);
  const withoutOwnerSupporter=ownerView({ownDiscard:['Float Stone BKT'],
    opponentPrize:4,opponentBench:2});
  assert.equal(source7PrintingWeight('VS Seeker PHF',
    withoutOwnerSupporter),0.6);
  const noOpponentBench=ownerView({opponentPrize:4});
  assert.equal(source7PrintingWeight('Counter Catcher PAR',
    noOpponentBench),0.6);
});

test('bench, Stadium, Item and Special Energy constraints reduce immediate priority',()=>{
  const actor=ownerView({ownBench:5,itemLocked:true,
    stadiumLocked:true,energyLocked:true,opponentPrize:3,opponentBench:2,
    ownStadium:['Artazon PAL'],ownDiscard:['N FCO']});
  for(const [name,value] of [
    ['Artazon PAL',1],['Capture Energy RCL',1],
    ['Counter Catcher PAR',0.6],['VS Seeker PHF',0.6],
    ['Chaotic Swell CEC',0.6],['Nest Ball SVI',0.6]
  ])assert.equal(source7PrintingWeight(name,actor),value);
});

test('same printed copies in owner hand and selected bundle diminish marginal value',()=>{
  const actor=ownerView({ownHand:['Capture Energy RCL']});
  const once=statefulStevenBundleScore(['Capture Energy RCL'],actor);
  const twice=statefulStevenBundleScore([
    'Capture Energy RCL','Capture Energy RCL'],actor);
  assert.equal(once,9/2-0.15);
  assert.equal(twice-once,9/3-0.15);
  assert.ok(twice>once);
});

test('the scorer never reads opponent hidden hand, deck or prizes identities',()=>{
  const owner=ownerView({ownHand:['Counter Catcher PAR'],opponentPrize:5,
    opponentBench:2,ownDiscard:['N FCO']});
  const score=statefulStevenBundleScore([
    'Counter Catcher PAR','VS Seeker PHF'],owner);
  Object.freeze(owner);
  assert.equal(score,statefulStevenBundleScore([
    'Counter Catcher PAR','VS Seeker PHF'],owner));
  assert.ok(Number.isFinite(score));
});
