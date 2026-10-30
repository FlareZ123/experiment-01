'use strict';

const assert=require('node:assert/strict');
const {run:runSource,verifyFrame}=require('../twinleaf/agent32-rank11-six-star-vip-k1-native.cjs');
const {withNewMoonBlowerAutonomy}=
  require('../twinleaf/newmoon-garbotoxin-blower-autonomy.cjs');
const VERSION='agent1-original-six-scripted-source-opponent-owner-blower-counterplay-v1';

/**
 * A narrow, fair same-physical-seed opponent decision intervention on the
 * original eleven-action *source* policy, leaving all source printed 60s and
 * source scripted actions fixed. Opposing rank1 Shadow Rider uses original
 * native bot in one arm; in other it autonomously plays actually held
 * Field Blower GRI when it legally can remove public Garbotoxin's Tool.
 * Both arms stop on source's next owner root. No general source policy or
 * qualified game result is claimed.
 */
function run(){
  verifyFrame();
  const untreated=runSource({observeOpponentReturn:true});
  const enhanced=withNewMoonBlowerAutonomy(1,
    ()=>runSource({observeOpponentReturn:true}),{
      automaticFieldBlower:true,allowAnyActiveBlower:true});
  const treated=enhanced.result;
  const responseAudit=enhanced.policyAudit;
  assert.equal(untreated.schema,'agent1-rank11-six-native-opponent-return-v1');
  assert.equal(treated.schema,untreated.schema);
  assert.equal(untreated.registrationSha256,treated.registrationSha256);
  assert.equal(untreated.engineRevision,treated.engineRevision);
  assert.equal(untreated.attempted,6);
  assert.equal(treated.attempted,6);
  const reference=new Map(untreated.rows.map(row=>[row.index,row]));
  const rows=treated.rows.map(row=>{
    const base=reference.get(row.index);
    assert.ok(base,'Original source physical index absent in baseline');
    assert.equal(row.seed,base.seed,'Different original source K0 physical seed');
    assert.equal(row.originalK0Replayed,true);
    assert.equal(base.originalK0Replayed,true);
    assert.equal(row.witness?.atOpponentOriginalRoot,true);
    assert.equal(base.witness?.atOpponentOriginalRoot,true);
    assert.equal(row.witness.sourceEquippedGarbodor,true);
    assert.equal(base.witness.sourceEquippedGarbodor,true);
    const sourceReturnT=row.afterOpponentPublic?.sourceEquippedGarbodorCount??null;
    const sourceReturnB=base.afterOpponentPublic?.sourceEquippedGarbodorCount??null;
    return {index:row.index,seed:row.seed,
      sourceOriginalK0Verified:true,
      firstOpponentSourceGarbotoxinEquippedBothArms:true,
      untreatedStatus:base.status,
      treatedStatus:row.status,
      untouchedOpponentSourceGarbodorAtReturn:sourceReturnB,
      empoweredOpponentSourceGarbodorAtReturn:sourceReturnT,
      baselineSourcePrizesAtReturn:base.afterOpponentPublic?.sourceRemainingPrizes??null,
      treatedSourcePrizesAtReturn:row.afterOpponentPublic?.sourceRemainingPrizes??null,
      sourceReturnBoth:row.sourceReturnObserved===true&&
        base.sourceReturnObserved===true,
      nativeCounterplayNeedsExactStoreLedger:true,
      competitiveQualifiedGame:false};
  });
  const selected=responseAudit.events.filter(e=>e.kind==='autonomous-legal-Item');
  const successes=responseAudit.events.filter(e=>e.kind==='public-Tool-check'&&
    e.garbodorToolRemoved===true);
  return {version:VERSION,samePhysicalPairs:rows.length,
    sourceReturnPairs:rows.filter(row=>row.sourceReturnBoth).length,
    nativeBlowerProposals:selected.length,
    nativeBlowerPublicToolRemovalChecks:successes.length,
    blowerSelectionEvents:selected,
    blowerRemovalEvents:successes,
    rows,untreated,treated,responseAudit,
    competitiveQualifiedGames:0,
    limitation:'Six preselected source-positive original K0 physical deals. Source first-turn sequence is forced in both arms; rank1 owner Field Blower is actor-visible native option in treated only. Does not prove fully accepted prompt chain without independent Store/after-state evidence, nor opponent strength or match wins.'};
}
if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(result.samePhysicalPairs!==6||result.sourceReturnPairs!==6||
    result.treated.blocked>0||result.untreated.blocked>0){
    process.stderr.write('AGENT1_ORIGINAL_BLOWER_PAIR_FAILURE '+JSON.stringify({
      samePhysicalPairs:result.samePhysicalPairs,
      sourceReturnPairs:result.sourceReturnPairs,
      treated:result.treated.rows.map(x=>({i:x.index,status:x.status,reason:x.stopReason})),
      untreated:result.untreated.rows.map(x=>({i:x.index,status:x.status,reason:x.stopReason}))
    })+'\n');
    process.exitCode=1;
  }
}
module.exports={VERSION,run};
