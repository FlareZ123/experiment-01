'use strict';
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const TAPE_VERSION='native-policy-random-tape-v1';
const digest=tape=>{
  const hash=createHash('sha256'),b=Buffer.allocUnsafe(8);
  for(const value of tape){b.writeDoubleBE(value,0);hash.update(b);}
  return hash.digest('hex');
};
/**
 * Read the genuine active policy PRNG once per underlying Math.random call.
 * Always restore the source, including when policy throws. Capture is a
 * diagnostic; store the tape outside the live policy State.
 * @template T
 * @param {()=>T} work
 * @param {{limit?:number}} [options]
 * @returns {{result:T,tape:number[],sha256:string,version:string}}
 */
function recordPolicyRandomTape(work,{limit=100000}={}) {
  assert.equal(typeof work,'function');
  assert.ok(Number.isSafeInteger(limit)&&limit>=0);
  const prior=Math.random,tape=[];
  Math.random=function nativePolicyTapeSampler() {
    if(tape.length>=limit)throw new Error('Native policy RNG tape limit');
    const value=prior();
    assert.ok(Number.isFinite(value)&&value>=0&&value<1);
    tape.push(value);
    return value;
  };
  try{
    const result=work();
    return {result,tape,sha256:digest(tape),version:TAPE_VERSION};
  }finally{Math.random=prior;}
}
/**
 * Reuse exactly the recorded native policy draws with fail-closed exhaustion.
 * @template T
 * @param {number[]} originalTape
 * @param {()=>T} work
 * @returns {{result:T,consumed:number,sha256:string}}
 */
function replayPolicyRandomTape(originalTape,work) {
  assert.ok(Array.isArray(originalTape));
  assert.equal(typeof work,'function');
  const tape=originalTape.slice(),prior=Math.random;
  for(const value of tape)assert.ok(
    typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<1
  );
  let i=0;
  Math.random=function nativePolicyTapeReplay(){
    if(i>=tape.length)throw new Error('Native policy RNG replay exhausted');
    return tape[i++];
  };
  try {
    const result=work();
    if(i!==tape.length)throw new Error(
      'Native policy RNG replay consumption mismatch: '+i+'/'+tape.length
    );
    return {result,consumed:i,sha256:digest(tape)};
  }finally{Math.random=prior;}
}
module.exports={TAPE_VERSION,digest,recordPolicyRandomTape,
  replayPolicyRandomTape};
