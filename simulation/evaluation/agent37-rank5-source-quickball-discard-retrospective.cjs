'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {run,VERSION}=require('./agent37-rank5-fusion-mobility-prospective.cjs');

const OUTPUT=path.resolve(__dirname,
  '../../agent37-rank5-source-quickball-discard-8arm.json');

/**
 * Reuse the original two rank-5 source deals and both fixed opponents with
 * the existing source-scoped Quick Ball and native actor discard policies.
 * The option choice follows observation of the original source failures:
 * these are retrospective, development-only arms, never prospective results.
 * @returns {object} Every native attempt, including caps and errors.
 */
function runRetrospective({preservePayableAttack=false,
  preferMewGenesectSearch=false}={}){
  assert.equal(typeof preservePayableAttack,'boolean');
  assert.equal(typeof preferMewGenesectSearch,'boolean');
  const result=run({quickBallScope:'source',actorHandDiscard:true,
    sourceQuickBallPreservePayableAttack:preservePayableAttack,
    sourceMewGenesectQuickBallSearch:preferMewGenesectSearch,
    sourceMewGenesectQuickBallSearch:preferMewGenesectSearch});
  assert.equal(result.requestedNativeAttempts,8);
  assert.equal(result.comparison.length,4);
  assert.equal(result.competitiveQualifiedGames,0);
  return {
    ...result,
    experiment:preferMewGenesectSearch?
      'agent37-rank5-source-quickball-mew-genesect-search-retrospective-v3':
      preservePayableAttack?
        'agent37-rank5-source-quickball-discard-preserve-attack-retrospective-v2':
        'agent37-rank5-source-quickball-discard-retrospective-v1',
    parentVersion:VERSION,
    design:'post-observation development; same registered physical deals',
    sourceQuickBallRoot:true,
    sourceActorHandDiscard:true,
    sourceQuickBallPreservePayableAttack:preservePayableAttack,
    independentlyProspective:false,
    competitiveQualifiedGames:0,
    certifiedWinRate:null
  };
}

/** @param {string} destination @param {object} value */
function saveAtomic(destination,value){
  const lockPath=destination+'.lock';
  const fd=fs.openSync(lockPath,'wx');
  const tempPath=destination+'.tmp-'+process.pid;
  try{
    fs.writeFileSync(tempPath,JSON.stringify(value,null,2)+'\n');
    fs.renameSync(tempPath,destination);
  }finally{
    fs.rmSync(tempPath,{force:true});
    fs.closeSync(fd);
    fs.unlinkSync(lockPath);
  }
}

if(require.main===module){
  const result=runRetrospective({
    preservePayableAttack:
      process.env.AGENT37_QUICKBALL_PRESERVE_ATTACK_DEV==='true',
    preferMewGenesectSearch:
      process.env.AGENT37_QUICKBALL_MEW_SEARCH_DEV==='true'
  });
  saveAtomic(OUTPUT,result);
  process.stdout.write(JSON.stringify({
    experiment:result.experiment,
    output:path.basename(OUTPUT),
    competitiveQualifiedGames:0,
    pairs:result.comparison.map(row=>({
      trial:row.trial.id,
      sourceDealPairing:row.sourceDealPairing,
      control:row.control,
      treatment:row.treatment,
      sourceAttackDelta:row.sameDealNativeAttackDelta
    }))
  },null,2)+'\n');
}

module.exports={OUTPUT,runRetrospective,saveAtomic};
