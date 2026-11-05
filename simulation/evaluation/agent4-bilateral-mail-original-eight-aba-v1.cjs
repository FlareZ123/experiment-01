'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {compare}=require('./agent4-bilateral-mail-aba-compare.cjs');
const {withBilateralOwnerMail}=
  require('../twinleaf/agent4-bilateral-mail-native.cjs');
const {writeAtomicLocked}=
  require('./agent20-frozen-rank6-canary-v1.cjs');
const REG=require('../../results/aichi-2026/registrations/agent4-bilateral-mail-original-eight-aba-v1-20261105.json');
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/** Execute selected-v5 A, both-seat owner-Mail B, and identical A again. */
function run(deps={}){
  const reg=deps.reg??REG;
  const runner=deps.runner??
    require('./agent36-issue25-steward-innermost-prize-v5.cjs')
      .runStewardInnermostPrizeV5;
  const native=x=>require(path.join(OUTPUT,x));
  const headless=deps.headless??require('../twinleaf/headless.cjs');
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??native('game/store/store').Store;
  const PlayCardAction=deps.PlayCardAction??
    native('game/store/actions/play-card-action').PlayCardAction;
  const ResolvePromptAction=deps.ResolvePromptAction??
    native('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const types=deps.types??native('game/store/card/card-types');
  const A=runner();
  const trial=(deps.wrapper??withBilateralOwnerMail)(()=>runner(),{
    headless,SimpleTacticsAi,Store,PlayCardAction,
    ResolvePromptAction,types,trialIds:reg.seededOriginalTrialIds
  });
  const A2=runner();
  return compare(A,trial.result,A2,trial.audit,reg);
}
if(require.main===module){
  const output=process.env.AGENT4_BILATERAL_MAIL_ABA_OUTPUT;
  assert.ok(output,'Set AGENT4_BILATERAL_MAIL_ABA_OUTPUT');
  const value=run(),body=JSON.stringify(value,null,2)+'\n';
  fs.mkdirSync(path.dirname(output),{recursive:true});
  writeAtomicLocked(output,body);
  writeAtomicLocked(output+'.sha256',
    createHash('sha256').update(body).digest('hex')+
    '  '+path.basename(output)+'\n');
  const audit=value.bilateralMailAudit;
  process.stdout.write('AGENT4_BILATERAL_MAIL_ABA '+JSON.stringify({
    physicalParity:value.sameAllPhysicalOpenings,
    ARepeatRootTape:value.ARepeatFullyDeterministic,
    proposedByPhysicalSeat:audit.proposalCountsBySeat,
    nativeItemRootsBySeat:audit.actualMailItemRootsBySeat,
    resolvedOwnerPrompts:audit.nativeStoreResolvedBySeat,
    trainersMovedToHand:audit.physicalTrainerToHandBySeat,
    divergence:value.panel.map(x=>[x.id,x.firstTreatedRootDivergence]),
    dispositions:value.panel.map(x=>[x.id,x.treatmentDisposition]),
    qualifiedGames:0})+'\n');
}
module.exports={run};
