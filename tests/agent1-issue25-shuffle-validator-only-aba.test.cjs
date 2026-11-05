'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  VERSION,PLANS,withShuffleOnlyOverV14
}=require('../simulation/evaluation/agent1-issue25-shuffle-validator-only-aba.cjs');

test('three registered A/B/A arms vary numeric shuffle only',()=>{
  assert.equal(PLANS.length,3);
  assert.deepEqual(PLANS.map(p=>p.correctNumericShuffle),[false,true,false]);
  assert.ok(PLANS.every(p=>p.mode==='protected'));
});

test('common owner-prompt baseline and root policy are held fixed',()=>{
  for(const useNumeric of [false,true]){
    const events=[];
    const joined=()=>null;
    const result=withShuffleOnlyOverV14(()=>{
      events.push('source');
      return 'native-original-store';
    },{
      correctNumericShuffle:useNumeric,
      joinedAttackLayer:joined,
      numericLayer:next=>{
        events.push('numeric');
        return next();
      },
      v14Layer:(next,options)=>{
        events.push('v14-baseline');
        assert.strictEqual(options.joinedAttackLayer,joined);
        return {result:next(),audit:{sample:'unchanged'}};
      }
    });
    assert.equal(result.result,'native-original-store');
    assert.deepEqual(events,useNumeric?
      ['v14-baseline','numeric','source']:
      ['v14-baseline','source']);
    assert.equal(result.audit.numericShuffleOnlyTreatmentSelected,
      useNumeric);
    assert.equal(result.audit.wonderTagYesSelected,false);
    assert.equal(result.audit.competitiveGamesQualified,0);
  }
  assert.equal(typeof VERSION,'string');
});
