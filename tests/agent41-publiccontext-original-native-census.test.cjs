'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {test}=require('node:test');
const {scheduledPublicEnergyTrials,REGISTRATION}=
  require('../simulation/evaluation/agent41-publiccontext-original-4pair.cjs');
const {comparePublicEnergyFourPairs}=
  require('../scripts/agent41-publiccontext-original-native-census.cjs');

const plan=JSON.parse(fs.readFileSync(REGISTRATION,'utf8'));

function syntheticPair(){
  const original=scheduledPublicEnergyTrials(plan);
  const a=[],b=[];
  for(const trial of original){
    const seat=trial.candidateSlot==='A'?1:0;
    const row={trial,qualifiesForCompetitiveInference:false,
      fullPhysicalDealFingerprint:String(trial.seed).padStart(64,'0'),
      verifiedFirstTurn:true,actualStarterSeat:seat,
      finished:true,winner:seat,actionCount:35,
      attackDeclarations:{source:0,candidate:1}};
    a.push(row);
    b.push({...row,attackDeclarations:{source:2,candidate:1},
      bilateralPublicContextSpecialProfile:{
        mode:'both',ownerSeat:null,sharedPolicy:true},
      actorOnlyDecisionCoverage:{detailedComponentAudits:{root:{
        acceptedActorRoots:2,typedIntentCounts:{'attach-special-energy':1},
        nativeRootAcceptances:[{seat,kind:'attach-special-energy',
          printing:'Double Dragon Energy ROS',accepted:true,
          nativePhysicalEffect:'confirmed-public-effect'}]
      }}}
    });
  }
  const pack=(mode,rows)=>({mode,attempts:8,registrationBlob:'frozen',
    enginePin:plan.pinnedTwinleaf,competitiveQualifiedGames:0,
    result:{attempted:8,rows}});
  return [pack('control',a),pack('public-context',b)];
}

test('registered Rank4/10 source cases preserve all four independent pair seeds',()=>{
  const trials=scheduledPublicEnergyTrials(plan);
  assert.equal(trials.length,8);
  assert.deepEqual([...new Set(trials.map(t=>t.rank))],[4,10]);
  assert.deepEqual([...new Set(trials.map(t=>t.seed))].length,4);
  assert.ok(trials.every(t=>t.id===
    [t.rank,t.repeat,t.candidateSlot,t.candidateId].join(':')));
});

test('eight full physical source pairs and true native accepted Special samples',()=>{
  const r=comparePublicEnergyFourPairs(...syntheticPair());
  assert.equal(r.nativeArms,16);
  assert.equal(r.matchedInitialPhysicalDeals,8);
  assert.equal(r.matchedActualFirstPlayers,8);
  assert.equal(r.sourceAttackChanges,8);
  assert.equal(r.sampledSourceConfirmedSpecial,8);
  assert.equal(r.sampledCandidateAcceptedSpecial,0);
  assert.equal(r.competitiveQualifiedGames,0);
});

test('retains failed or censored original arms and missing physical proofs',()=>{
  const [a,b]=syntheticPair();
  b.result.rows[0].status='engine-error';
  b.result.rows[0].fullPhysicalDealFingerprint=null;
  b.result.rows[0].actorOnlyDecisionCoverage=null;
  a.result.rows[1].finished=false;
  const r=comparePublicEnergyFourPairs(a,b);
  assert.equal(r.nativeArms,16);
  assert.equal(r.engineErrorsAfter,1);
  assert.equal(r.missingInitialPhysicalEvidence,1);
  assert.equal(r.actionCappedBefore,1);
});

test('refuses substituted original trial seeds or false both-seat provenance',()=>{
  const [a,b]=syntheticPair();
  b.result.rows[0].trial={...b.result.rows[0].trial,seed:8};
  assert.throws(()=>comparePublicEnergyFourPairs(a,b));
  const [c,d]=syntheticPair();
  d.result.rows[0].bilateralPublicContextSpecialProfile.ownerSeat=0;
  assert.throws(()=>comparePublicEnergyFourPairs(c,d));
});
