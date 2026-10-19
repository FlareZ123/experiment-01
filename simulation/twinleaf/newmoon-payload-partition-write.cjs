'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {run}=require('./newmoon-rank11-payload-prospective.cjs');
const {scheduledRepeats}=require('./newmoon-payload-partition-plan.cjs');

/**
 * A fixed partition writes one indivisible JSON artifact. Exclusive lock
 * prevents concurrent writers from overwriting each other's evidence.
 * @param {number} partitionIndex Previously registered repeat subset index.
 * @param {string} destination Absolute or repository-relative JSON path.
 * @returns {object}
 */
function runAndWrite(partitionIndex,destination){
  const expected=scheduledRepeats(partitionIndex);
  const output=path.resolve(destination);
  const lockFile=output+'.lock';
  const lock=fs.openSync(lockFile,'wx');
  const temporary=output+'.'+crypto.randomUUID()+'.tmp';
  try{
    const packet=run(partitionIndex);
    assert.deepEqual(packet.scheduledRepeats,expected);
    assert.deepEqual(packet.rows.map(row=>row.repeat),expected);
    fs.writeFileSync(temporary,JSON.stringify(packet,null,2)+'\n');
    fs.renameSync(temporary,output);
    return {partitionIndex,scheduledRepeats:expected,
      rows:packet.rows.length,qualifiedCompetitiveGames:0,output};
  }finally{
    if(fs.existsSync(temporary))fs.unlinkSync(temporary);
    fs.closeSync(lock);
    fs.unlinkSync(lockFile);
  }
}

if(require.main===module){
  const index=Number(process.env.NEWMOON_PAYLOAD_PARTITION);
  scheduledRepeats(index);
  const destination=process.env.NEWMOON_PAYLOAD_OUTPUT||
    'newmoon-payload-partition-'+index+'.json';
  process.stdout.write(JSON.stringify(runAndWrite(index,destination))+'\n');
}

module.exports={runAndWrite};
