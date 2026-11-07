'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const {run}=require('../simulation/twinleaf/agent3-mimikyu-copycat-eonblade-lock-native.cjs');

test('Mimikyu Copycat applies Eon Blade next-turn attack lock to the physical Mimikyu',()=>{
  const result=run();
  assert.equal(result.passed,true);
  assert.equal(result.rows.length,2);
  assert.equal(result.rows.every(row=>
    row.copiedDamage===200&&
    row.copiedRestrictionOnMimikyuAfterAttack===true&&
    row.copiedRestrictionOnMimikyuNextOwnTurn===true&&
    row.nextOwnTurnFilchRejectedAs==='BLOCKED_BY_EFFECT'&&
    row.paperGameCertified===false),true);
  assert.equal(result.paperGameCertified,false);
  assert.equal(result.qualifiedCompetitiveGames,0);

  const outputDir=process.env.AGENT3_COPYCAT_LOCK_OUT_DIR;
  if(outputDir){
    fs.mkdirSync(outputDir,{recursive:true});
    const destination=path.join(outputDir,
      'agent3-mimikyu-copycat-eonblade-lock-native.json');
    const temporary=destination+'.tmp-'+process.pid;
    fs.writeFileSync(temporary,JSON.stringify(result,null,2)+'\n','utf8');
    fs.renameSync(temporary,destination);
  }
  console.log('AGENT3_MIMIKYU_COPYCAT_EONBLADE_LOCK',JSON.stringify(result));
});
