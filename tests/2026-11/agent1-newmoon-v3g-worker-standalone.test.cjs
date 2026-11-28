'use strict';
/* Bundle parity + restricted VM integration; never launches native games. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict');
const dir=path.resolve(__dirname,'../../simulation/evaluation/2026-11');
const names=['agent1-newmoon-v2-jammer-decision.cjs',
 'agent1-newmoon-v3-finisher-slice.cjs','agent1-newmoon-v3g-gladion-policy.cjs',
 'agent1-newmoon-v3g-worker-standalone.cjs'];
const [v2,v3,g,standalone]=names.map(x=>fs.readFileSync(path.join(dir,x),'utf8'));
const i2="const oldSetup=require('./agent1-newmoon-v2-jammer-decision.cjs');";
const i3="const parent=require('./agent1-newmoon-v3-finisher-slice.cjs');";
assert.equal(v3.split(i2).length,2);
assert.equal(g.split(i3).length,2);
const inner=v3.replace(i2,[
 '/* Embedded v2 scope: no runtime require */',
 'const oldSetup=(()=>{','const module={exports:{}};',v2,
 'return module.exports;','})();'].join('\n'));
const expected=g.replace(i3,[
 '/* Embedded v3 scope: no runtime require */',
 'const parent=(()=>{','const module={exports:{}};',inner,
 'return module.exports;','})();'].join('\n'));
assert.equal(standalone,expected,'stale standalone after research source edit');
const context=vm.createContext({module:{exports:{}},exports:{}},
 {codeGeneration:{strings:false,wasm:false}});
for(const key of ['require','process','crypto','Function','eval','fetch','Buffer',
 'WebAssembly','Date','console','setTimeout'])
 vm.runInContext('globalThis['+JSON.stringify(key)+']=undefined',context);
vm.runInContext(standalone,context,{timeout:5000,filename:'agent1-v3g-standalone.cjs'});
const candidate=context.module.exports;
assert.equal(candidate.DECK_SHA,'1a5f094b06f79ff9168ca68c71fbb5f57db5352ecfe4877db48d6b93e51fcfc0');
assert.equal(candidate.POLICY_VERSION,'agent1-newmoon-v3g-gladion-rescue-research-v1');
const p=candidate.createPolicy({role:'candidate',seat:0,
 policyVersion:candidate.POLICY_VERSION,config:{}});
assert.equal(typeof p.decideWithAudit,'function');
assert.equal(typeof p.decide,'function');
console.log('v3g standalone deterministic parity, VM bootstrap and worker interface passed');
