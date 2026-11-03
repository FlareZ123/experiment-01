'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {choose}=require('../simulation/evaluation/agent5-adp-thorton-prize-availability.cjs');
const {
  VERSION,combinationProbability,solo,noDirectBasicTutor,main
}=require('../simulation/evaluation/agent32-adp-forced-solo-opening-originals.cjs');

/** @param {number} a @param {number} b */
function close(a,b){assert.ok(Math.abs(a-b)<1e-12,a+' != '+b);}

test('exact first-seven single-Basic event uses correct conditional opener',()=>{
  const x=solo(7,12,0);
  close(x.noBonusForcedSolo,
    Number(7n*choose(53,6))/
    Number(choose(60,7)-choose(53,7)));
  close(x.noBonusForcedSolo,0.6924920315030554);
  close(solo(14,12,0).noBonusForcedSolo,0.3941763347511427);
  assert.equal(combinationProbability(47,0),1);
  close(combinationProbability(47,1),47/53);
});

test('extra-card no-Basic probability decreases monotonically',()=>{
  for(const A of [7,14]){
    let prev=1;
    for(let m=0;m<=24;m++){
      const p=combinationProbability(54-A,m);
      assert.ok(p<=prev);
      prev=p;
    }
  }
});

test('rank26 Meloetta original printed Basic count and forced Solo contrast',()=>{
  const x=main(32),r=x.rows.find(v=>v.rank===26);
  assert.equal(x.version,VERSION);
  assert.equal(r.originalBasicCopies,12);
  close(r.adp.forcedSoloAfterAllOptionalBonusLower,0.6807491907649439);
  close(r.champion.forcedSoloAfterAllOptionalBonusLower,0.3750679602308215);
  close(x.highExposureADPLeleOrCrobatRank26Lower,0.19449976878998396);
  assert.ok(r.adp.forcedSoloAfterAllOptionalBonusUpper-
    r.adp.forcedSoloAfterAllOptionalBonusLower<1e-8);
});

test('all opponents with equal Basic count have identical solo setup probability',()=>{
  const x=main(16);
  assert.equal(x.authenticOriginalCount,29);
  assert.deepEqual(x.originalMissing,[23,25,28]);
  assert.equal(x.championBasicCount,14);
  assert.equal(x.qualifiedWins,0);
  for(const a of x.rows)for(const b of x.rows){
    if(a.originalBasicCopies===b.originalBasicCopies){
      close(a.adp.forcedSoloAfterAllOptionalBonusLower,
        b.adp.forcedSoloAfterAllOptionalBonusLower);
      close(a.champion.forcedSoloAfterAllOptionalBonusLower,
        b.champion.forcedSoloAfterAllOptionalBonusLower);
    }
  }
});

test('original 4-Basic opponent gives the seven-Basic candidate more Bench rescue',()=>{
  const x=main(32);
  const rank6=x.rows.find(v=>v.rank===6);
  const rank1=x.rows.find(v=>v.rank===1);
  assert.ok(rank6.adp.forcedSoloAfterAllOptionalBonusLower<0.6113730374765046);
  assert.ok(rank6.adp.forcedSoloAfterAllOptionalBonusUpper>0.6113730374765046);
  close(rank1.adp.forcedSoloAfterAllOptionalBonusLower,0.684591997533834);
  assert.ok(rank6.adp.forcedSoloAfterAllOptionalBonusLower<
    rank1.adp.forcedSoloAfterAllOptionalBonusLower);
  assert.ok(rank6.adp.opponentMulliganBonusMass>
    rank1.adp.opponentMulliganBonusMass);
});

test('equal-rank original field remains far more often forced solo under seven Basics',()=>{
  const x=main(32);
  assert.ok(Math.abs(x.equalOriginalMeanLower.adp-
    0.6752184477625598)<1e-10);
  close(x.equalOriginalMeanLower.champion,0.369213776259816);
  assert.ok(x.equalOriginalMeanLower.gap>0.30);
  for(const r of x.rows){
    assert.ok(r.adp.forcedSoloAfterAllOptionalBonusLower>
      r.champion.forcedSoloAfterAllOptionalBonusUpper);
  }
});

test('rank26 no extra Basic or one of eleven Basic-search Items by first draw',()=>{
  const v=noDirectBasicTutor(12,32);
  assert.equal(v.sourceFixedPrintedTutorCount,11);
  assert.ok(v.lower<=0.10246851384076638);
  assert.ok(v.upper>=0.10246851384076638);
  assert.ok(v.upper-v.lower<1e-12);
  assert.ok(v.upper<solo(7,12,32).forcedSoloAfterAllOptionalBonusLower);
});

test('original four-Basic mulligans give more rescue opportunities on Item screen',()=>{
  const rank6=noDirectBasicTutor(4,32);
  const rank26=noDirectBasicTutor(12,32);
  assert.ok(rank6.lower<rank26.lower);
  assert.ok(rank6.lower<=0.07924311681257783);
  assert.ok(rank6.upper>=0.07924311681257783);
  assert.ok(rank6.upper-rank6.lower<2e-8);
  const x=main(32);
  assert.ok(Math.abs(x.meanADPNoDirectBasicOrTutorLower-
    0.10075844144925436)<1e-10);
});
