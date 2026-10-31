'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  chooseBigInt,unseenTrainerHypergeometric,nominalPrintedDamageAtLeast
}=require('../simulation/evaluation/agent23-unseen-trainer-hypergeometric.cjs');
const {run,profilePaperField}=
  require('../simulation/evaluation/agent23-paper-field-unseen-trainer-profile.cjs');

const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-10,
  'Expected '+expected+', got '+actual);

test('binomial coefficients are exact for the full physical 60-card deck',()=>{
  assert.equal(chooseBigInt(60,30),118264581564861424n);
  assert.equal(chooseBigInt(60,0),1n);
  assert.equal(chooseBigInt(5,6),0n);
  assert.equal(chooseBigInt(5,-1),0n);
});

test('rank 11 publicly conditioned abstract hand PMF exactly normalizes',()=>{
  const m=unseenTrainerHypergeometric({
    unknownCards:58,unknownTrainers:39,unknownHand:4
  });
  assert.equal(m.outcomes.length,5);
  close(m.outcomes.reduce((s,x)=>s+x.probability,0),1);
  close(m.expectedTrainers,4*39/58);
  close(m.expectedPrintedDamage,50*4*39/58);
  close(nominalPrintedDamageAtLeast(m,150),0.6031347962382445);
  close(nominalPrintedDamageAtLeast(m,200),0.19386475593372146);
  assert.equal(m.posteriorFromRecordedPlay,false);
  assert.equal(m.competitiveGameQualified,false);
});

test('certain no-Trainer, all-Trainer, and empty-deck cases remain exact',()=>{
  const zero=unseenTrainerHypergeometric({
    unknownCards:10,unknownTrainers:0,unknownHand:4
  });
  assert.deepEqual(zero.outcomes.map(x=>x.trainers),[0]);
  assert.equal(zero.expectedPrintedDamage,0);
  assert.equal(nominalPrintedDamageAtLeast(zero,50),0);
  const all=unseenTrainerHypergeometric({
    unknownCards:10,unknownTrainers:10,unknownHand:4
  });
  assert.deepEqual(all.outcomes.map(x=>x.trainers),[4]);
  assert.equal(all.expectedPrintedDamage,200);
  assert.equal(nominalPrintedDamageAtLeast(all,200),1);
  const empty=unseenTrainerHypergeometric({
    unknownCards:0,unknownTrainers:0,unknownHand:0
  });
  assert.deepEqual(empty.outcomes.map(x=>x.trainers),[0]);
  assert.equal(empty.expectedPrintedDamage,0);
});

test('bad deck counts and impossible hand counts are rejected',()=>{
  assert.throws(()=>unseenTrainerHypergeometric({
    unknownCards:59,unknownTrainers:61,unknownHand:4
  }));
  assert.throws(()=>unseenTrainerHypergeometric({
    unknownCards:59,unknownTrainers:40,unknownHand:60
  }));
  assert.throws(()=>unseenTrainerHypergeometric({
    unknownCards:-1,unknownTrainers:0,unknownHand:0
  }));
  assert.throws(()=>nominalPrintedDamageAtLeast(
    unseenTrainerHypergeometric({
      unknownCards:10,unknownTrainers:5,unknownHand:4
    }),-10));
});

test('all exact 29 source-count profiles remain conditional and reproducible',()=>{
  const census=run();
  assert.equal(census.verifiedOpposingSixties,29);
  assert.deepEqual(census.missingSourceRanks,[23,25,28]);
  assert.equal(census.minTrainers,28);
  assert.equal(census.maxTrainers,48);
  close(census.minNominalExpectedPrintedDamage,50*4*28/59);
  close(census.maxNominalExpectedPrintedDamage,50*4*48/59);
  assert.equal(census.actualUnseenHandPosteriorModeled,false);
  assert.equal(census.actualAttackAvailabilityEvaluated,false);
  assert.equal(census.competitiveGameQualified,false);
  const r11=census.rows.find(x=>x.rank===11);
  assert.equal(r11.originalTrainers,39);
  assert.equal(new Set(census.rows.map(x=>x.rank)).size,29);
});

test('field profile rejects a roster whose physical category counts are not 60',()=>{
  assert.throws(()=>profilePaperField({decks:[{
    rank:1,archetype:'invalid',category_counts:{
      Pokémon:1,Trainer:2,Energy:3
    }
  }]}));
});
