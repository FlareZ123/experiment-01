'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {
  VERSION,independentPainfulSpoonsNegative,
  withPaperPromptContractPortfolio
}=require('../simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs');
const {probePainfulSpoonsCounterBudget}=
  require('../simulation/twinleaf/agent4-rank31-spoons-overbudget-native.cjs');
const {probeRoxieNoEligibleRoot,runRank31RoxieSpoons}=
  require('../simulation/twinleaf/agent4-rank31-roxie-koffing-spoons-native.cjs');

test('source-marked independent SIT59 check bounds total count and source identity',()=>{
  assert.match(VERSION,/v(?:10-ultra-ball-mandatory-cost|11-secret-box-physical-payment)$/);
  const a={player:'top',slot:'active',index:0};
  const b={player:'top',slot:'bench',index:0};
  const dest={player:'top',slot:'bench',index:1};
  const row=(from)=>({from,to:dest});
  for(const bad of [null,[],[row(a),row(a),row(a)]])
    assert.equal(independentPainfulSpoonsNegative(bad),
      'PAINFUL_SPOONS_PRINTED_COUNTER_COUNT_ONE_OR_TWO');
  assert.equal(independentPainfulSpoonsNegative([row(a)]),null);
  assert.equal(independentPainfulSpoonsNegative([row(a),row(a)]),null);
  assert.equal(independentPainfulSpoonsNegative([row(a),row(b)]),
    'PAINFUL_SPOONS_MULTIPLE_SOURCE_POKEMON');
});

test('v9 shared native portfolio vetoes zero and three same-source counters on both physical seats',()=>{
  for(const seat of [0,1]){
    for(const count of [0,1,2,3]){
      const observed=withPaperPromptContractPortfolio(()=>
        probePainfulSpoonsCounterBudget({seat,count,guarded:false}));
      const receipt=observed.result,audit=observed.audit;
      assert.equal(audit.markedPainfulSpoonsPrompts,1);
      assert.equal(receipt.seat,seat);
      assert.equal(receipt.count,count);
      if(count===0||count===3){
        assert.match(receipt.storeError,
          /PAPER_PROMPT_INVALID:.*PAINFUL_SPOONS_PRINTED_COUNTER_COUNT_ONE_OR_TWO/);
        assert.equal(receipt.promptPending,true);
        assert.equal(receipt.sourceDamage,30);
        assert.equal(receipt.targetDamage,180);
        assert.equal(receipt.victimInDiscard,false);
        assert.equal(receipt.prizesTaken,0);
        assert.equal(audit.statusCounts.PAPER_PROMPT_INVALID,1);
        assert.equal(audit.vetoedBeforeDispatch,1);
      }else{
        assert.equal(receipt.storeError,null);
        assert.equal(receipt.promptPending,false);
        assert.equal(receipt.sourceDamage,30-10*count);
        assert.equal(receipt.targetDamage,180+10*count);
        assert.equal(audit.statusCounts.PAPER_PROMPT_INVALID,0);
      }
      console.log('AGENT4_UNIFIED_SPOONS_V9 '+JSON.stringify({
        seat,count,storeError:receipt.storeError,
        sourceDamage:receipt.sourceDamage,targetDamage:receipt.targetDamage,
        prizesTaken:receipt.prizesTaken,marked:audit.markedPainfulSpoonsPrompts,
        invalid:audit.statusCounts.PAPER_PROMPT_INVALID
      }));
    }
  }
});

test('v9 shared native root guard forbids original Roxie with only GX payment on both physical seats',()=>{
  for(const seat of [0,1]){
    const observed=withPaperPromptContractPortfolio(()=>
      probeRoxieNoEligibleRoot(seat,false));
    const r=observed.result,a=observed.audit;
    assert.match(r.rootError,/PAPER_ROOT_INVALID:ROXIE_CEC_NO_ELIGIBLE_POKEMON/);
    assert.equal(r.after.gxInHand,true);
    assert.equal(r.after.roxieInHand,true);
    assert.equal(r.after.roxieInDiscard,false);
    assert.deepEqual(r.after.pendingPrompts,[]);
    assert.equal(a.inspectedRoxiePlayCardRoots,1);
    assert.equal(a.vetoedRoxieNoEligibleRoots,1);
    assert.equal(a.resolvedNativeReplies,0);
    console.log('AGENT4_UNIFIED_ROXIE_ROOT_V9 '+JSON.stringify({
      seat,rootError:r.rootError,rootCount:a.inspectedRoxiePlayCardRoots,
      vetoed:a.vetoedRoxieNoEligibleRoots
    }));
  }
});

test('v9 common root preflight preserves printed legal Roxie Koffing three-card draw in both seats',()=>{
  for(const seat of [0,1]){
    const observed=withPaperPromptContractPortfolio(()=>
      runRank31RoxieSpoons(false,seat,false));
    const r=observed.result,a=observed.audit;
    assert.equal(r.roxieDrawnThree,true);
    assert.equal(r.physicalKoffingDiscarded,true);
    assert.deepEqual(r.afterBomb,[10,10,190]);
    assert.match(r.rejected,/PAPER_PROMPT_INVALID:.*PAINFUL_SPOONS_MULTIPLE_SOURCE_POKEMON/);
    assert.equal(r.prizesTaken,0);
    assert.equal(a.inspectedRoxiePlayCardRoots,1);
    assert.equal(a.vetoedRoxieNoEligibleRoots,0);
    assert.equal(a.markedPainfulSpoonsPrompts,1);
    assert.equal(a.inspectedRoxiePaymentPrompts,1);
    console.log('AGENT4_UNIFIED_ROXIE_LEGAL_ROOT_V9 '+JSON.stringify({
      seat,drawnThree:r.roxieDrawnThree,
      rootCount:a.inspectedRoxiePlayCardRoots,
      vetoedRoots:a.vetoedRoxieNoEligibleRoots,
      rejectedSpooning:r.rejected
    }));
  }
});
