'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {compare,attempt,publicBeachLedgerCounts,
  settledPhysicalFailure,settledPhysicalSummary}=
  require('../simulation/evaluation/agent33-tropical-beach-original-paired.cjs');
const X='a'.repeat(64),Y='b'.repeat(64),Z='c'.repeat(64);
const trial={id:'6:A',rank:6,candidateSlot:'A',seed:2348713281};
function row(treated=false){
 return {trial,treated,status:'native-capped-unqualified',
   engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
   fullDealSha256:X,sourceDealSha256:Y,
   candidateSixtySha256:Z,sourceSixtySha256:X,actualFirstPlayer:1,
   rootActionLedger:[{actionOrdinal:0,action:'PassTurnAction'}],
   beachProposalCounts:{use:treated?1:0},
   beachNativeConfirmed:{use:treated?1:0}};
}
test('real matching full physical starts are explicitly unqualified',()=>{
 const r=compare(row(),row(true));
 assert.equal(r.registeredPairedPhysicalStart,true);
 assert.equal(r.competitivelyQualified,false);
 assert.equal(r.treatmentBeachNativeConfirmed,1);
});
test('native errors never count as a matching physical start',()=>{
 const a=row();a.status='native-error-unqualified';
 const b=row(true);b.status='native-error-unqualified';
 const r=compare(a,b);
 assert.equal(r.firstPlayerMatch,false);
 assert.equal(r.registeredPairedPhysicalStart,false);
});
test('different original physical deal hash refuses paired comparison',()=>{
 const b=row(true);b.fullDealSha256=Y;
 assert.equal(compare(row(),b).registeredPairedPhysicalStart,false);
});
test('different source or candidate printed sixty refuses paired comparison',()=>{
 const b=row(true);b.candidateSixtySha256=Y;
 assert.equal(compare(row(),b).registeredPairedPhysicalStart,false);
});
test('missing first-player proof cannot become equality from undefined',()=>{
 const a=row(),b=row(true);
 a.actualFirstPlayer=undefined;b.actualFirstPlayer=undefined;
 assert.equal(compare(a,b).firstPlayerMatch,false);
});
test('one native exception retains an attempted error row in denominator',()=>{
 const a=attempt(trial,null,true,()=>{throw new Error('synthetic native error')});
 assert.equal(a.status,'native-error-unqualified');
 assert.equal(a.competitiveQualified,false);
 assert.ok('nativeAbortEvidence' in a);
});

test('generic PlayCardAction must never count as placing Tropical Beach',()=>{
  assert.deepEqual(publicBeachLedgerCounts([
    {action:'PlayCardAction',card:'Quick Ball'},
    {action:'PlayCardAction',card:'Temple of Sinnoh'},
    {action:'PlayCardAction',card:'Tropical Beach'},
    {action:'UseStadiumAction'}
  ]),{nativeStadiumUseActions:1,nativeBeachCardPlacements:1});
});

test('unobserved settled physical conservation is an explicit release hold',()=>{
  assert.equal(settledPhysicalSummary(null).status,
    'PHYSICAL_INTEGRITY_UNVERIFIED');
  assert.equal(settledPhysicalSummary({
    schema:'live-headless-physical-zone-integrity-v1',
    settledRootsChecked:0,settledRootsWithAnomaly:0
  }).status,'PHYSICAL_INTEGRITY_UNVERIFIED');
});
test('completed zero-anomaly Store roots certify conservation only',()=>{
  assert.deepEqual(settledPhysicalSummary({
    schema:'live-headless-physical-zone-integrity-v1',
    settledRootsChecked:7,settledRootsWithAnomaly:0
  }),{status:'SETTLED_PHYSICAL_60_VERIFIED',
    settledRootsChecked:7,settledRootsWithAnomaly:0,
    firstViolationSha256:null});
});
test('nested settled physical 59-card engine loss is an invalid game attempt',()=>{
  const failure=new Error('Twinleaf physical invariant');
  failure.code='TWINLEAF_SETTLED_PHYSICAL_60_VIOLATION';
  failure.physicalConservationWitness={actionOrdinal:37,turn:5,
    actingSeat:1,actionType:'AttackAction',ownership:{secret:'hidden'}};
  const wrapped=new Error('Headless Store aborted',{cause:failure});
  const first=settledPhysicalFailure(wrapped);
  assert.equal(first.firstActionOrdinal,37);
  assert.equal(first.firstActingSeat,1);
  assert.equal(first.witnessSha256.length,64);
  assert.equal('ownership' in first,false);
  const row=attempt(trial,null,false,()=>{throw wrapped;});
  assert.equal(row.status,'ENGINE_PHYSICAL_INVALID');
  assert.equal(row.physicalFailure.witnessSha256,first.witnessSha256);
  assert.equal(compare(row,row).registeredPairedPhysicalStart,false);
});
test('ordinary native error cannot be fabricated into 59-card engine loss',()=>{
  assert.equal(settledPhysicalFailure(new Error('ordinary')),null);
});

test('all new Stadium owner intents require the exact native public physical placement',()=>{
  const {rootPhysicalWitness}=
    require('../simulation/twinleaf/agent5-owner-root-slice.cjs');
  const names=[
    ['play-tropical-beach','Tropical Beach BCR'],
    ['play-players-ceremony','Player Ceremony SP127'],
    ['play-sky-field','Sky Field ROS'],
    ['play-path-to-peak','Path to the Peak CRE'],
    ['play-thunder-mountain','Thunder Mountain {*} LOT']
  ];
  for(const [kind,printing] of names){
    const intent={kind,printing};
    const before={stadiumPrintings:[],handCount:6},
      accepted={stadiumPrintings:[printing],handCount:5};
    assert.equal(rootPhysicalWitness(intent,before,accepted,{}),
      'confirmed-public-effect',kind+' should be a settled native root');
    assert.equal(rootPhysicalWitness(intent,before,{
      stadiumPrintings:[],handCount:6
    },{}),'no-confirmed-public-effect',kind+' cannot credit an unplayed Stadium');
    assert.equal(rootPhysicalWitness(intent,before,{
      stadiumPrintings:['Another Stadium'],handCount:5
    },{}),'no-confirmed-public-effect',kind+' must match exact printing');
  }
});

test('Beach and Ceremony native uses require exact draw and terminated turn',()=>{
  const {rootPhysicalWitness}=
    require('../simulation/twinleaf/agent5-owner-root-slice.cjs');
  for(const [kind,printing,handStart,draw] of [
    ['use-tropical-beach','Tropical Beach BWP',3,4],
    ['use-players-ceremony',"Player's Ceremony SP127",3,2]
  ]){
    const before={inPlayStadiumPrintings:[printing],
      handCount:handStart,deckCount:12,stadiumUsedTurn:4,
      turn:5,phase:2,activePlayer:0};
    const after={...before,
      handCount:handStart+draw,deckCount:12-draw,
      stadiumUsedTurn:5,turn:6,activePlayer:1};
    assert.equal(rootPhysicalWitness({kind},before,after,{}),
      'confirmed-public-effect',kind+' should witness real public draw/end turn');
    assert.equal(rootPhysicalWitness({kind},before,
      {...after,deckCount:11-draw},{}),'no-confirmed-public-effect',
      kind+' must conserve exactly drawn cards');
    assert.equal(rootPhysicalWitness({kind},before,
      {...after,turn:5,activePlayer:0,phase:2},{}),
      'no-confirmed-public-effect',kind+' must actually end turn');
    assert.equal(rootPhysicalWitness({kind},{...before,
      inPlayStadiumPrintings:[]},after,{}),
      'no-confirmed-public-effect',kind+' must have matching Stadium');
  }
});
