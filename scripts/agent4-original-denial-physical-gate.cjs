'use strict';
const assert=require('node:assert/strict');
const {runFixedDenialFork}=require('./agent4-original-source-denial-fork.cjs');
const VERSION='agent4-source6-plumeria-flare-failclosed-physical-custody-v1';

/**
 * Apply the *existing* fail-closed settled-physical-60 gate to both original
 * source branches. Keep all failures as diagnostic attempted experiments;
 * independently report the physical predicate, without certifying wins.
 */
function runNativePhysicalGatePair(){
  const key='AGENT4_PHYSICAL_ZONE_GATE_DEV';
  const old=process.env[key];
  process.env[key]='true';
  const modes=[];
  try{
    for(const mode of ['plumeria','flare']){
      try{
        const x=runFixedDenialFork(mode);
        modes.push({mode,attempted:x.report.attempted,
          enginePin:x.report.enginePin,
          summary:x.report.physicalZoneQualificationSummary??null,
          rows:x.report.rows.map(r=>({
            id:r.trial?.id??null,
            status:r.status??null,finished:r.finished??false,
            physicalZoneQualification:r.physicalZoneQualification??null,
            settledPhysicalAudit:
              r.physicalZoneIntegrityAudit?.summary??null,
            sourceDealFingerprint:r.sourceDealFingerprint??null,
            branchWinner:r.winner??null,competitiveQualified:false
          }))});
      }catch(error){
        modes.push({mode,attempted:2,
          status:'driver-error-before-physical-qualification',
          error:String(error?.stack??error),
          competitiveQualified:false});
      }
    }
  }finally{
    if(old===undefined)delete process.env[key];
    else process.env[key]=old;
  }
  assert.deepEqual(modes.map(x=>x.mode),['plumeria','flare']);
  return {version:VERSION,originalSourceRank6Seed:2906058002,
    nativePhysicalZoneGateRequested:true,matchedSourceSeat:1,
    initialDealAndPrefixGateSeparate:true,
    gameWinRateQualified:false,competitiveQualifiedGames:0,modes};
}
module.exports={VERSION,runNativePhysicalGatePair};
if(require.main===module)
  process.stdout.write(JSON.stringify(runNativePhysicalGatePair(),null,2)+'\n');
