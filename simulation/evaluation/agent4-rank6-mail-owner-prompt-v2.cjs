'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const {withOwnedMailPrompt}=require('../twinleaf/agent4-mail-owner-prompt-native.cjs');
const {writeAtomicLocked}=require('./agent20-frozen-rank6-canary-v1.cjs');
const VERSION='agent4-original-rank6-mail-owner-top4-prompt-v2';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const REG=require('../../results/aichi-2026/registrations/agent4-rank6-trainers-mail-pass14-20261105.json');

/** Same registered original eight plus one source-owner prompt treatment. */
function run(deps={}){
  const reg=deps.reg??REG;
  const native=name=>require(path.join(OUTPUT,name));
  const headless=deps.headless??require('../twinleaf/headless.cjs');
  const Store=deps.Store??native('game/store/store').Store;
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const ResolvePromptAction=deps.ResolvePromptAction??
    native('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const types=deps.types??native('game/store/card/card-types');
  const trial=(deps.wrapper??withOwnedMailPrompt)(
    ()=>(deps.firstFork??
      require('./agent4-rank6-original-mail-pass14-fork.cjs').run)(),
    {headless,Store,SimpleTacticsAi,ResolvePromptAction,types,reg});
  const original=trial.result;
  assert.equal(original.originalSourceId,reg.selectedOriginalId);
  assert.equal(original.completePreTreatmentIdentityProven,true);
  assert.equal(original.physicallyHeldItemAcceptedByStore,true);
  assert.equal(original.originalAttemptsRetained,8);
  return {schema:VERSION,sourceOriginalId:reg.selectedOriginalId,
    originalDealAndPrefixProven:true,sourceItemStoreAccepted:true,
    nativeStatus:original.targetNativeStatus,
    nativeError:original.targetNativeError,
    nativeAbort:original.sourceNativeAbort,
    sourcePromptRoots:original.ownerPromptRootsAfterItem,
    sourceAttackRoots:original.sourceAttackRootsAfterItem,
    candidateReplyRoots:original.candidateReplyRootsAfterItem,
    allOriginalAttemptStatuses:original.originalAllEightStatuses,
    ownerMailPromptAudit:trial.audit,qualifiedGames:0,winRate:null};
}
if(require.main===module){
  const file=process.env.AGENT4_RANK6_MAIL_PROMPT_V2_OUTPUT;
  assert.ok(file,'Set AGENT4_RANK6_MAIL_PROMPT_V2_OUTPUT');
  const record=run(),bytes=JSON.stringify(record,null,2)+'\n';
  fs.mkdirSync(path.dirname(file),{recursive:true});
  writeAtomicLocked(file,bytes);
  writeAtomicLocked(file+'.sha256',
    createHash('sha256').update(bytes).digest('hex')+'  '+
    path.basename(file)+'\n');
  const audit=record.ownerMailPromptAudit;
  process.stdout.write('AGENT4_MAIL_PROMPT_V2 '+JSON.stringify({
    sameSource:record.originalDealAndPrefixProven,
    physicalItem:record.sourceItemStoreAccepted,
    exactOwnerPrompts:audit.ownerPromptsSeen,
    settled:audit.StoreResolved,selectedTrainers:audit.physicalTrainersToHand,
    otherCardsToDeck:audit.nonchosenTopCardsToDeck,
    sourceRootPrompts:record.sourcePromptRoots.length,
    sourceAttackRoots:record.sourceAttackRoots.length,
    candidateReplies:record.candidateReplyRoots.length,
    nativeStatus:record.nativeStatus,qualifiedGames:0})+'\n');
}
module.exports={VERSION,run};
