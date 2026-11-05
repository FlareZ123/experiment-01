'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const baseline=require('./agent35-rank11-source-letter-pass37-fork.cjs');
const {withOwnerLetterSearch,VERSION:SEARCH_VERSION}=
  require('../twinleaf/agent35-owner-letter-search.cjs');

const VERSION='agent35-rank11-source-letter-owner-prompt-v2';
const REG=require('../../results/aichi-2026/registrations/agent35-rank11-letter-owner-prompt-v2-20261105.json');

/**
 * Retrospective, same-native-opening source-only continuation. The selected
 * Item root remains exact to v1. The new branch handles only the genuine
 * owner-locked Basic Energy search prompt after actual Store acceptance.
 * @param {{registration?:object,baseRun?:Function,searchHook?:Function}} [deps]
 * @returns {object} Complete eight-arm development diagnostic, never wins.
 */
function run(deps={}){
  const registration=deps.registration??REG;
  const runBase=deps.baseRun??baseline.run;
  const search=deps.searchHook??withOwnerLetterSearch;
  const observed=runBase({
    registration,
    withLetterFork:(next,native)=>baseline.withLetterFork(next,{
      ...native,
      withOwnerSearchHook:(nativeMatch,options)=>
        search(nativeMatch,{...options})
    })
  });
  const audit=observed.sourceOwnerSearchAudit??null;
  return {
    ...observed,
    schema:VERSION,
    baselineSchema:baseline.VERSION,
    treatmentSchema:SEARCH_VERSION,
    frozenSourceRegistration:
      'results/aichi-2026/registrations/agent35-rank11-letter-owner-prompt-v2-20261105.json',
    sourceItemRootAccepted:observed.sourceOwnerCardAcceptedByNativeStore,
    originalDealAndRootPrefixHeld:observed.sourceDealMatched===true &&
      observed.entirePhysicalDealMatched===true &&
      observed.originalPreForkSourceRootTapeMatched===true,
    ownerLetterSearchPromptObserved:
      (audit?.nativeLetterOwnerSearchPrompts??0)>0,
    nativePhysicalDeckToHandCompleted:
      (audit?.physicallySettledSearches??0)>0 &&
      observed.sourceFollowthroughPrompts.length>0,
    originalSourceRootAfterItem:
      observed.sourceFollowthroughPrompts[0]??null,
    originalSourceHasAnySameTurnEnergyAttachment:
      observed.sameTurnRealOwnerDarknessEnergyPlayRoots.length>0,
    competitiveGamesQualified:0,
    benchmarkResultAdmitted:false
  };
}

/**
 * Exclusive-lock atomic native receipt writer.
 * @param {string} filename
 * @param {object} result
 */
function write(filename,result){
  assert.equal(result?.schema,VERSION);
  fs.mkdirSync(path.dirname(filename),{recursive:true});
  const lock=filename+'.lock';
  const fd=fs.openSync(lock,'wx');
  const tmp=filename+'.'+process.pid+'.tmp';
  try{
    fs.writeFileSync(tmp,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
    fs.renameSync(tmp,filename);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}

if(require.main===module){
  const filename=process.env.AGENT35_LETTER_OWNER_PROMPT_V2_OUTPUT;
  assert.ok(filename,'Set AGENT35_LETTER_OWNER_PROMPT_V2_OUTPUT');
  const result=run();
  write(filename,result);
  process.stdout.write(JSON.stringify({
    schema:VERSION,
    itemStoreAccepted:result.sourceItemRootAccepted,
    physicalPromptSettled:result.nativePhysicalDeckToHandCompleted,
    proposedSearches:result.sourceOwnerSearchAudit?.ownerOnlySearchChoices??0,
    firstAfterItem:result.originalSourceRootAfterItem?.action??null,
    sourceDisposition:result.originalSourceRowDisposition,
    acceptedRoots:result.originalSourceAcceptedRoots,
    competitiveGamesQualified:0
  })+'\n');
}

module.exports={VERSION,run,write};
