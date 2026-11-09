'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {runSeat}=
  require('../../simulation/twinleaf/agent46-mimikyu-apex-consecutive-native.cjs');
const {withMimikyuApexPaperCompatibility}=
  require('../../simulation/twinleaf/2026-11/agent6-mimikyu-apex-paper-compatibility.cjs');

const OUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const {Store}=require(path.join(OUT,'game/store/store'));
const {Mimikyu}=require(path.join(
  OUT,'sets/08-sun-and-moon/set-guardians-rising/mimikyu'));

test('scoped compatibility restores native prototype patches after a two-seat genuine Apex',()=>{
  const originalDispatch=Store.prototype.dispatch;
  const originalCopycat=Mimikyu.prototype.reduceEffect;
  const results=withMimikyuApexPaperCompatibility(()=>{
    assert.notStrictEqual(Store.prototype.dispatch,originalDispatch);
    assert.notStrictEqual(Mimikyu.prototype.reduceEffect,originalCopycat);
    return [runSeat(0,{chooseMimikyuTimeless:true}),
      runSeat(1,{chooseMimikyuTimeless:true})];
  });
  assert.strictEqual(Store.prototype.dispatch,originalDispatch);
  assert.strictEqual(Mimikyu.prototype.reduceEffect,originalCopycat);
  for(const row of results){
    assert.equal(row.error,null);
    assert.equal(row.originalSourceLastAttackAfterResolvedApex.attack,
      'Apex Dragon');
    assert.equal(row.mimikyuOwnerGXUsed,true);
    assert.equal(row.mimikyuOwnerTurnSkip,true);
    assert.ok(row.mimikyuOpponentDamage>=150);
    assert.deepEqual(row.nativePending,[]);
  }
});

test('scoped compatibility restores both hooks even if experiment throws',()=>{
  const originalDispatch=Store.prototype.dispatch;
  const originalCopycat=Mimikyu.prototype.reduceEffect;
  assert.throws(()=>
    withMimikyuApexPaperCompatibility(()=>{
      throw Error('staged immediate runner failure');
    }),/staged immediate runner failure/);
  assert.strictEqual(Store.prototype.dispatch,originalDispatch);
  assert.strictEqual(Mimikyu.prototype.reduceEffect,originalCopycat);
});
