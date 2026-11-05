'use strict';

const assert=require('node:assert/strict');
const {probe}=require('./agent6-skyliner-public-suppression-native.cjs');
const {VERSION,PIN,withBilateralActiveToolJammerPaperGuard}=
  require('./agent6-bilateral-tool-jammer-paper-guard.cjs');

const MODES=[
  {mode:'path-float-jammer',nativePlayJammer:true,
    nativeEndOpponentTurn:true,expectedCost:2,expectedBlocks:1},
  {mode:'thorns-float-jammer',nativePlayJammer:true,
    nativeEndOpponentTurn:true,expectedCost:2,expectedBlocks:1},
  {mode:'path-float',expectedCost:0,expectedBlocks:0},
  {mode:'path-float-bench-jammer',expectedCost:0,expectedBlocks:0},
  {mode:'thorns-float-jammer-jamming',expectedCost:2,expectedBlocks:0},
  {mode:'path-airballoon',expectedCost:0,expectedBlocks:0},
  {mode:'path-airballoon-jammer',expectedCost:2,expectedBlocks:1},
  {mode:'thorns-airballoon',expectedCost:0,expectedBlocks:0},
  {mode:'thorns-airballoon-jammer',expectedCost:2,expectedBlocks:1},
  {mode:'path-airballoon-bench-jammer',expectedCost:0,expectedBlocks:0},
  {mode:'path-furybelt',expectedCost:2,expectedBlocks:0},
  {mode:'path-furybelt-jammer',expectedCost:2,expectedBlocks:1},
  {mode:'thorns-furybelt',expectedCost:2,expectedBlocks:0},
  {mode:'thorns-furybelt-jammer',expectedCost:2,expectedBlocks:1},
  {mode:'path-furybelt-bench-jammer',expectedCost:2,expectedBlocks:0},
  {mode:'thorns-stealthyhood',expectedCost:0,expectedBlocks:0},
  {mode:'thorns-stealthyhood-jammer',expectedCost:2,expectedBlocks:1},
  {mode:'thorns-stealthyhood-jammer-jamming',
    expectedCost:2,expectedBlocks:0}
];

/**
 * Genuine pinned Store, actual Tool-Jammer hand play for marked scenarios.
 * Staged board state and explicit actor actions only. The symmetric ToolEffect
 * wrapper is enabled outside Store construction, without touching upstream.
 * @returns {object} Full failure-inclusive mechanically staged receipts.
 */
function run(){
  const attempts=[];
  for(const spec of MODES)for(const seat of [0,1]){
    let packet=null,error=null;
    try{
      const repaired=withBilateralActiveToolJammerPaperGuard(()=>
        probe(spec.mode,seat,{
          nativePlayJammer:Boolean(spec.nativePlayJammer),
          nativeEndOpponentTurn:Boolean(spec.nativeEndOpponentTurn)
        }));
      const native=repaired.result;
      const problems=Object.entries(native.checks).filter(([,v])=>!v)
        .map(([name])=>name);
      assert.equal(native.nativeRetreatCost,spec.expectedCost);
      assert.equal(native.nativeRetreatAccepted,spec.expectedCost===0);
      assert.deepEqual(problems,[]);
      assert.equal(repaired.audit.blockedByOwnerSeat[String(seat)]>0,
        spec.expectedBlocks>0);
      assert.equal(repaired.audit.blockedByOwnerSeat[String(1-seat)],0);
      assert.ok(repaired.audit.inspectedToolEffectQueries>0);
      packet={
        mode:spec.mode,physicalSeat:seat,
        expectedRetreatCost:spec.expectedCost,
        actualRetreatCost:native.nativeRetreatCost,
        nativeRetreatAccepted:native.nativeRetreatAccepted,
        nativeRetreatError:native.nativeRetreatError,
        nativeChecks:native.checks,
        sourceActualHandToActiveJammerPlay:spec.nativePlayJammer?
          native.nativeJammerPlayReceipt:null,
        correctionAudit:repaired.audit,
        competitivelyQualified:false
      };
    }catch(caught){
      error=String(caught?.stack??caught);
    }
    attempts.push({mode:spec.mode,seat,packet,error});
  }
  const failures=attempts.filter(row=>row.error!==null);
  const familyAudit=require('./agent6-tool-jammer-fan-muscle-native.cjs').run();
  for(const issue of familyAudit.failures)failures.push(issue);
  return {
    version:'agent6-bilateral-native-tool-jammer-20261105-v1',
    wrapperVersion:VERSION,enginePin:PIN,
    stagedNativeCases:attempts.length+familyAudit.stagedNativeCases,
    failures,failedChecks:failures.length,
    attempts,toolFamilyAudit:familyAudit,competitiveQualifiedGames:0,
    nativeDevelopmentOnly:true
  };
}

if(require.main===module){
  const output=run();
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
  if(output.failedChecks>0)process.exitCode=1;
}
module.exports={MODES,run};
