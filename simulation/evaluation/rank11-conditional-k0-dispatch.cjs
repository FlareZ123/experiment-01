'use strict';
const {executeAll}=require('./rank11-conditional-k0-complete.cjs');
const {executePartition}=require('./rank11-conditional-k0-screen-run.cjs');

/**
 * Choose an explicitly predeclared 32-source-attempt partition, or the
 * entire 512-index frame, before reading any result.
 * @param {string} input
 * @returns {object}
 */
function run(input) {
  if(input==='all')return executeAll();
  if(!/^(?:[0-9]|1[0-5])$/.test(input))
    throw new Error('Choose a fixed partition 0..15 or all');
  return executePartition({partition:Number(input)});
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(
    process.env.RANK11_K0_PARTITION||'0'),null,2)+'\n');
module.exports={run};
