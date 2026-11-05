'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  PLANS,withShuffleHeldWonderTag
}=require('../simulation/evaluation/agent1-issue25-wondertag-shuffle-held-aba.cjs');

test('v15 A/B/A registration preserved while numeric validator held in all arms',()=>{
  assert.deepEqual(PLANS.map(p=>p.wonderTagYes),[false,true,false]);
  assert.ok(PLANS.every(p=>p.mode==='protected'));
  assert.equal(PLANS.length,3);
});

test('owner baseline and numeric shim are invariant across Wonder Tag false/true',()=>{
  for(const yes of [false,true]){
    const events=[],joined=()=>null;
    const observed=withShuffleHeldWonderTag(()=>{
      events.push('native');
      return 23;
    },{
      wonderTagYes:yes,joinedAttackLayer:joined,
      ownerLayer:(next,opts)=>{
        assert.strictEqual(opts.joinedAttackLayer,joined);
        events.push('owner-v14');
        return {result:next(),audit:{owner:'same'}};
      },
      numericLayer:next=>{
        events.push('numeric');
        return next();
      },
      sourceLayer:next=>{
        events.push('wondertag');
        return {result:next(),audit:{nativeOffers:2}};
      },
      publicRevealLayer:next=>{
        events.push('public-reveal');
        return {result:next(),audit:{nativePublicSupporterReveals:0}};
      }
    });
    assert.equal(observed.result,23);
    assert.deepEqual(events,yes?
      ['owner-v14','numeric','public-reveal','wondertag','native']:
      ['owner-v14','numeric','public-reveal','native']);
    assert.equal(observed.audit.allArmsNumericShuffleValidationIdentical,true);
    assert.equal(observed.audit.wonderTagYesOnlyPolicyIntervention,yes);
    assert.deepEqual(observed.audit.sourceStampedWonderTagYes,
      yes?{nativeOffers:2}:null);
    assert.equal(observed.audit.publicRevealWitnessIdenticalInAllArms,true);
    assert.deepEqual(observed.audit.postAcceptedPublicSupporterRevealAudit,
      {nativePublicSupporterReveals:0});
    assert.equal(observed.audit.competitiveGamesQualified,0);
  }
});
