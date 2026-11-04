'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withOwnerPrizeAndPromotion,VERSION}=
  require('../simulation/evaluation/agent20-issue25-inner-prize-promotion-v13.cjs');

test('inner owner Prize and Pokémon choice invoke one ordered native closure',()=>{
  const calls=[];
  const run=()=>{calls.push('native');return 123};
  const out=withOwnerPrizeAndPromotion(run,{
    prize:next=>{
      calls.push('prize-enter');
      const result=next();
      calls.push('prize-exit');
      return {result,audit:{submitted:1}};
    },
    pokemon:(next,opts)=>{
      calls.push('pokemon-enter');
      assert.equal(typeof opts.choose,'function');
      const result=next();
      calls.push('pokemon-exit');
      return {result,audit:{selected:1,accepted:1}};
    }
  });
  assert.deepEqual(calls,['pokemon-enter','prize-enter','native','prize-exit','pokemon-exit']);
  assert.equal(out.result,123);
  assert.equal(out.audit.version,VERSION);
  assert.deepEqual(out.audit.ownerPrize,{submitted:1});
  assert.deepEqual(out.audit.ownerPromotion,{selected:1,accepted:1});
  assert.equal(out.audit.competitiveGamesQualified,0);
});

test('native exception retains the already validated Prize boundary for postmortem',()=>{
  const error=new Error('native unsupported promotion');
  error.agent21OwnerPrizeAudit={ownerPrizeChoiceSubmitted:1};
  const out=()=>withOwnerPrizeAndPromotion(()=>{throw error},{
    prize:run=>run(),
    pokemon:next=>next()
  });
  assert.throws(out,/native unsupported promotion/);
  assert.equal(error.agent21OwnerPrizeAudit.version,VERSION);
  assert.equal(error.agent21OwnerPrizeAudit.ownerPrize.ownerPrizeChoiceSubmitted,1);
  assert.equal(error.agent21OwnerPrizeAudit.ownerPromotion,
    'UNRESOLVED_NO_COMPLETED_AUDIT');
});
