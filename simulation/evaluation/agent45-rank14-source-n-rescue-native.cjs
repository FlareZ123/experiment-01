'use strict';
const assert=require('node:assert/strict');
const registration=require(
  '../../results/aichi-2026/registrations/agent32-prospective-29rank-116native-20261109.json');
const {runNativeBatch}=require('./agent32-fresh-perfection-field.cjs');
const {withSourceNInsteadOfPass}=require(
  '../twinleaf/agent45-original-source-n-after-pass.cjs');
const VERSION='agent45-rank14-original-source-n-vs-perfection-2x2-v1';
const TARGET='14:3029:B:new-moon-lockbreaker-v1';

/** Frozen four-cell native challenge: source's genuine N after Pass.
 * Registered 60s never vary. All originally reported seed failures remain
 * development-only; no correction to prospective historical claims.
 */
function run(deps={}){
  const group=registration.groups.find(g=>g.id===TARGET);
  assert.ok(group&&group.rank===14);
  const frozen=[...registration.groups.slice(0,3),group]
    .map(g=>({...g}));
  const batch=deps.batch??runNativeBatch;
  const adapt=deps.sourceN??withSourceNInsteadOfPass;
  const arms=[];
  for(const pivot of [false,true]){
    for(const sourceN of [false,true]){
      const execute=()=>batch(true,undefined,{
        registeredTrials:frozen,
        registeredFrameName:registration.schema,
        nativeRootActionLimit:registration.nativeRootLimit,
        vipAfterPass:true,vipPreferMewtwoDonor:true,
        perfectionTransition:pivot
      });
      const play=sourceN?adapt(execute):{result:execute(),audit:null};
      const selected=play.result.selected.rawDevelopment.rows;
      assert.equal(selected.length,4);
      const row=selected[3];
      assert.equal(row.trial?.id,TARGET);
      const sourceRoots=row.rootActionLedger?.filter(x=>x.playerSlot===0)??[];
      arms.push({
        pivot,sourceN,seed:group.seed,
        nativeFinished:row.finished===true,
        winnerSeat:row.winner??null,
        finalPrizes:row.finalPrizes??null,
        error:row.error?String(row.error).slice(0,1000):null,
        rootActions:row.rootActionLedger?.length??null,
        initialPhysicalDealSha:row.fullPhysicalDealFingerprint??null,
        originalSourceDealSha:row.sourceDealFingerprint??null,
        nativeTargetLinked:row.nativeAcceptedTargetSidecar?.rootOrdinalLinked===true,
        sourceNativeAttackCount:sourceRoots.filter(x=>x.action==='AttackAction').length,
        sourceNativePassCount:sourceRoots.filter(x=>x.action==='PassTurnAction').length,
        sourceNativeNRootCount:sourceRoots.filter(x=>x.action==='PlayCardAction'&&
          (x.card==='N'||x.card==='N FCO')).length,
        nativeSourceNAudit:play.audit,
        competitiveGameQualified:false
      });
    }
  }
  const samePhysicalDeal=arms.every(a=>
    typeof a.initialPhysicalDealSha==='string'&&
    typeof a.originalSourceDealSha==='string'&&
    a.initialPhysicalDealSha===arms[0].initialPhysicalDealSha&&
    a.originalSourceDealSha===arms[0].originalSourceDealSha);
  const targetIntegrity=arms.every(a=>a.nativeTargetLinked===true&&a.error===null);
  const result={version:VERSION,target:TARGET,
    registeredOriginalSeed:group.seed,unchangedOriginalSourceAndCandidateSixties:true,
    registeredFrame:registration.schema,pinnedTwinleaf:registration.enginePin,
    samePhysicalDeal,targetIntegrity,arms,
    retrospectiveOnly:true,competitiveGamesQualified:0};
  process.stdout.write('AGENT45_SOURCE_N_NATIVE '+JSON.stringify(result)+'\n');
  if(!samePhysicalDeal||!targetIntegrity)process.exitCode=1;
  return result;
}
if(require.main===module)run();
module.exports={VERSION,TARGET,run};
