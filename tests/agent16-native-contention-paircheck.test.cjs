'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION}=require('../simulation/twinleaf/agent16-owner-priority-contention.cjs');
const {compareOwnerArbitrationPair,commonReport}=
  require('../scripts/agent16-native-contention-paircheck.cjs');

function frozenPair(){
  const rows=Array.from({length:4},(_,i)=>({
    trial:{id:'rank'+i},sourceDealFingerprint:'source'+i,
    fullPhysicalDealFingerprint:'full'+i,actualStarterSeat:i%2,
    rootActionLedgerSha256:'root'+i,
    actionCount:200,finished:i%2===0,winner:i%2,
    actorOnlyDecisionCoverage:{
      version:'actor-four-part',
      componentVersions:{root:'actor-base'},
      nativeDecisionCounts:{actorRootsAccepted:25,actorRootsRejected:0},
      detailedComponentAudits:{root:{
        version:'actor-base',selectedRootDecisions:25,acceptedActorRoots:25
      }}
    }
  }));
  const control={attempted:4,rows,competitiveQualifiedGames:0,
    actorOnlyCompositionOptIn:true,actorOnlyCellsWithAudits:4};
  const observed=structuredClone(control);
  for(const row of observed.rows){
    const a=row.actorOnlyDecisionCoverage;
    a.componentVersions.root+='+'+VERSION;
    a.detailedComponentAudits.root.version+='+'+VERSION;
    a.detailedComponentAudits.root.ownerArbitrationCensusOptIn=true;
    a.detailedComponentAudits.root.ownerArbitration={
      version:VERSION,ownerRoots:25,contentionRoots:2,
      pairs:{'attack > attach-special-energy':2},
      samples:[{seat:0,nativePlayability:'unverified'}]
    };
  }
  return {control,observed};
}

test('strip only observer metadata and preserve every original native field',()=>{
  const {control,observed}=frozenPair();
  assert.deepStrictEqual(commonReport(observed),control);
  const r=compareOwnerArbitrationPair(control,observed);
  assert.equal(r.sourcePairedArms,4);
  assert.equal(r.ownerRoots,100);
  assert.equal(r.contentionRoots,8);
  assert.equal(r.pairs['attack > attach-special-energy'],8);
  assert.equal(r.gameAndFullAuditsIdentical,true);
});

test('physical source mismatches remain hard failures',()=>{
  const {control,observed}=frozenPair();
  observed.rows[0].fullPhysicalDealFingerprint='altered';
  assert.throws(()=>compareOwnerArbitrationPair(control,observed),
    /Owner arbitration observation changed game/);
});

test('root priority or terminal outcome divergences remain hard failures',()=>{
  const {control,observed}=frozenPair();
  observed.rows[1].rootActionLedgerSha256='different';
  assert.throws(()=>compareOwnerArbitrationPair(control,observed));
  observed.rows[1].rootActionLedgerSha256='root1';
  observed.rows[1].winner=0;
  assert.throws(()=>compareOwnerArbitrationPair(control,observed));
});

test('other audit changes cannot be concealed by normalizer',()=>{
  const {control,observed}=frozenPair();
  observed.rows[0].actorOnlyDecisionCoverage.nativeDecisionCounts
    .actorRootsAccepted++;
  assert.throws(()=>compareOwnerArbitrationPair(control,observed));
});

test('invalid or native-certified alternatives are rejected',()=>{
  const {control,observed}=frozenPair();
  observed.rows[0].actorOnlyDecisionCoverage.detailedComponentAudits.root
    .ownerArbitration.samples[0].nativePlayability='certified';
  assert.throws(()=>compareOwnerArbitrationPair(control,observed),
    /unverified/);
});

test('source arms without genuine owner-root observations are rejected',()=>{
  const {control,observed}=frozenPair();
  observed.rows[2].actorOnlyDecisionCoverage.detailedComponentAudits.root
    .ownerArbitration.ownerRoots=0;
  assert.throws(()=>compareOwnerArbitrationPair(control,observed),
    /ownerRoots > 0/);
});
