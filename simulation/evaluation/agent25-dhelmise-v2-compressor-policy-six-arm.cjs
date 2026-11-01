'use strict';
const {run}=require('./agent25-dhelmise-v2-native-three-lock-smoke.cjs');
const registration=require('../../results/als/registrations/agent25-dhelmise-v2-early-discard-policy-20261101.json');
if(registration.version!=='agent25-dhelmise-v2-early-battle-compressor-owner-policy-v1-precommit')
  throw new Error('Pre-registered candidate-only intervention is missing.');
const study=()=>run({donorCompressor:true});
module.exports={study};
if(require.main===module)process.stdout.write(JSON.stringify(study(),null,2)+'\n');
