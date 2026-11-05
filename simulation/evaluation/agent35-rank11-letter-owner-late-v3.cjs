'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const baseline=require('./agent35-rank11-source-letter-pass37-fork.cjs');
const {withLateOwnedLetterPrompt,VERSION:HOOK}=
  require('../twinleaf/agent35-letter-owner-match-late-hook.cjs');
const {writeAtomicLocked}=
  require('./agent20-frozen-rank6-canary-v1.cjs');
const REG=require('../../results/aichi-2026/registrations/agent35-rank11-letter-source-pass37-fork-20261105.json');

const VERSION='agent35-rank11-original-letter-owner-search-late-v3';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Development-only, original rank11 source control. Run same eight fixed
 * physical deals with only the one registered T8 owner-held Letter root
 * replaced; late native match hook owns its genuine subsequent search.
 * @param {{registration?:object,baseRun?:Function,wrapper?:Function,
 * headless?:object,Store?:Function,SimpleTacticsAi?:Function,
 * ResolvePromptAction?:Function,types?:object}} [deps]
 * @returns {object}
 */
function run(deps={}){
  const registration=deps.registration??REG;
  const native=x=>require(path.join(OUTPUT,x));
  const headless=deps.headless??require('../twinleaf/headless.cjs');
  const Store=deps.Store??native('game/store/store').Store;
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const ResolvePromptAction=deps.ResolvePromptAction??
    native('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const types=deps.types??native('game/store/card/card-types');
  const source=deps.baseRun??baseline.run;
  const wrap=deps.wrapper??withLateOwnedLetterPrompt;
  const trial=wrap(()=>source({registration}),{
    headless,Store,SimpleTacticsAi,ResolvePromptAction,
    types,registration
  });
  const r=trial.result,a=trial.audit;
  assert.equal(r.registrationId,registration.selectedOriginalId);
  assert.equal(r.sourceDealMatched,true);
  assert.equal(r.entirePhysicalDealMatched,true);
  assert.equal(r.originalPreForkSourceRootTapeMatched,true);
  assert.equal(r.sourceOwnerCardAcceptedByNativeStore,true);
  assert.equal(r.attemptedNativeOriginalRows,8);
  return {
    ...r,
    schema:VERSION,
    originalBaselineSchema:baseline.VERSION,
    lateOwnerSearchHookSchema:HOOK,
    originalRegisteredPhysicalSourceStillMatched:true,
    ownerLetterSearchAudit:a,
    genuineOwnerDeckPrompt:(a.legitimateOwnerDeckPrompts??0)>0,
    nativeTwoBasicDarknessSearchSettled:
      a.searchPromptsSettled>0&&
      a.physicalDarknessToHand===2,
    signedCompetitiveGameWins:0,
    competitiveGamesQualified:0
  };
}

if(require.main===module){
  const file=process.env.AGENT35_LETTER_MATCH_LATE_V3_OUTPUT;
  assert.ok(file,'Set AGENT35_LETTER_MATCH_LATE_V3_OUTPUT');
  const record=run(),body=JSON.stringify(record,null,2)+'\n';
  writeAtomicLocked(file,body);
  writeAtomicLocked(file+'.sha256',
    createHash('sha256').update(body).digest('hex')+
    '  '+path.basename(file)+'\n');
  process.stdout.write('AGENT35_LETTER_MATCH_LATE_V3 '+JSON.stringify({
    originalExactSource:record.originalRegisteredPhysicalSourceStillMatched,
    nativeItem:record.sourceOwnerCardAcceptedByNativeStore,
    ownerSearchPrompt:record.ownerLetterSearchAudit.legitimateOwnerDeckPrompts,
    StoreResolved:record.ownerLetterSearchAudit.searchPromptsSettled,
    physicalDarknessToHand:record.ownerLetterSearchAudit.physicalDarknessToHand,
    anyOrdinaryDarknessAttach:
      record.sameTurnRealOwnerDarknessEnergyPlayRoots.length>0,
    originalSourceDisposition:record.originalSourceRowDisposition,
    qualifiedGames:0
  })+'\n');
}
module.exports={VERSION,run};
