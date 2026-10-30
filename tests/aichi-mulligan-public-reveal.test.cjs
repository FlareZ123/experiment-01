'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const field=require('../results/aichi-2026/full-decklists.json');
const {revealedMulliganSignature}=
  require('../scripts/aichi-mulligan-public-reveal.cjs');
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-12,
  String(a)+' differs from '+String(b));

test('all three published Iron Thorns sources have four Basics and eight fixed signature copies',()=>{
  for(const rank of [6,24,29]){
    const deck=field.decks.find(d=>d.rank===rank);
    const count=name=>deck.cards.filter(c=>c.name===name)
      .reduce((sum,c)=>sum+c.count,0);
    assert.equal(count('Iron Thorns ex'),4);
    assert.equal(count('Plumeria'),4);
    assert.equal(count('Speed Lightning Energy'),4);
  }
});

test('rank6 Plumeria-only exposure across all failed hands',()=>{
  const x=revealedMulliganSignature({basics:4,namedNonBasics:4});
  close(x.firstAttemptInvalidProbability,0.6005003742553344);
  close(x.namedGivenInvalidHand,0.4231370306842005);
  close(x.anyNamedRevealedBeforeValid,0.3887644501857918);
  close(x.expectedFailedHands,1.503131256095683);
  close(x.expectedPublicCardAppearances,10.521918792669782);
});

test('rank6 eight and twelve control-signature source counts',()=>{
  const eight=revealedMulliganSignature({basics:4,namedNonBasics:8});
  const twelve=revealedMulliganSignature({basics:4,namedNonBasics:12});
  close(eight.anyNamedRevealedBeforeValid,0.5063964993450207);
  close(twelve.anyNamedRevealedBeforeValid,0.5564944726546789);
  close(twelve.expectedNamedCardAppearances,2.2546968841435246);
});

test('rank1 and New Moon have lower failed-seven disclosure rates',()=>{
  const r14=revealedMulliganSignature({basics:14,namedNonBasics:4});
  const r17=revealedMulliganSignature({basics:17,namedNonBasics:4});
  close(r14.anyNamedRevealedBeforeValid,0.0738982157634045);
  close(r17.anyNamedRevealedBeforeValid,0.04542070343544401);
  assert.ok(r17.expectedPublicCardAppearances<
    r14.expectedPublicCardAppearances);
});

test('independent miniature geometric toy gives seven-twelfths reveal chance',()=>{
  const x=revealedMulliganSignature({deckSize:6,openingSize:2,
    basics:1,namedNonBasics:2});
  close(x.namedGivenInvalidHand,0.7);
  close(x.firstAttemptInvalidProbability,2/3);
  close(x.anyNamedRevealedBeforeValid,7/12);
  close(x.expectedFailedHands,2);
  close(x.expectedPublicCardAppearances,4);
  close(x.expectedNamedCardAppearances,1.6);
});

test('no named targets or no possible Basic-free seven gives no named reveal',()=>{
  const zero=revealedMulliganSignature({basics:4,namedNonBasics:0});
  const allBasics=revealedMulliganSignature({basics:60,namedNonBasics:0});
  close(zero.anyNamedRevealedBeforeValid,0);
  close(allBasics.anyNamedRevealedBeforeValid,0);
  close(allBasics.expectedPublicCardAppearances,0);
});

test('one possible named target in a rank6 mulligan is never guaranteed',()=>{
  const x=revealedMulliganSignature({basics:4,namedNonBasics:1});
  close(x.namedGivenInvalidHand,7/56);
  close(x.anyNamedRevealedBeforeValid,0.15817220825309714);
});

test('invalid target counts and impossible Basic populations are rejected',()=>{
  for(const args of [
    {basics:0,namedNonBasics:1},
    {basics:4,namedNonBasics:-1},
    {basics:4,namedNonBasics:57},
    {basics:61,namedNonBasics:0},
    {basics:4,namedNonBasics:1,openingSize:61}
  ])assert.throws(()=>revealedMulliganSignature(args));
});
