'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {sourceCounts,COUNTS}=require('../simulation/evaluation/agent2-rank26-cologne-counter-frontier.cjs');
const {fixed,withBonus,originalRank26}=
  require('../simulation/evaluation/agent2-rank26-mail-pad-joint.cjs');
const {fixedWindow,orderPadOpening}=
  require('../scripts/aichi-meloetta-order-pad-bridge.cjs');

const ROOT=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(
  path.join(ROOT,'results/aichi-2026/full-decklists.json'),'utf8'));
const EPS=1e-9;
/** @param {number} a @param {number} b */
function near(a,b){assert.ok(Math.abs(a-b)<EPS,a+' != '+b);}

test('authenticated rank26 source has 12 Basics, 4 Mail, 3 Pad, singleton Cologne',()=>{
 const rank26=manifest.decks.find(d=>Number(d.rank)===26);
 assert.deepEqual(sourceCounts(rank26),COUNTS);
 assert.equal(rank26.archetype,'Meloetta Donk');
});

test('exact no-bonus joint Mail-plus-Pad is proper three-channel partition',()=>{
 const q=fixed(0);
 near(q.direct,0.12659262707380411);
 near(q.padIncrement,0.14106839659931958);
 near(q.mailIncrement,0.02432419274848125);
 near(q.total,0.29198521642160485);
 near(q.direct+q.padIncrement+q.mailIncrement,q.total);
 const old=fixedWindow(12,0);
 near(q.direct,old.direct);
 near(q.direct+q.padIncrement,old.combined);
 assert.ok(q.mailIncrement>0 && q.mailIncrement<0.03);
});

test('exact simultaneous 12/12 mulligan mixture conserves Pad-only prior',()=>{
 const q=originalRank26(manifest,12);
 near(q.noBonus.total,0.29198521642160485);
 near(q.withAllOfferedBonuses.direct,0.12991556118575734);
 near(q.withAllOfferedBonuses.padIncrement,0.14375546568644576);
 near(q.withAllOfferedBonuses.mailIncrement,0.024654155869976914);
 near(q.withAllOfferedBonuses.total,0.29832518274218);
 const prior=orderPadOpening(12,12);
 near(q.withAllOfferedBonuses.direct,prior.directCologne);
 near(q.withAllOfferedBonuses.direct+q.withAllOfferedBonuses.padIncrement,
   prior.directOrPadHeads);
 assert.equal(q.qualifiedGames,0);
});

test('mulligan distribution sensitivity and optional bonus boundary',()=>{
 const q=withBonus(4);
 assert.ok(q.withAllOfferedBonuses.total>withBonus(12).withAllOfferedBonuses.total);
 const max=fixed(46);
 assert.ok(max.direct>=0 && max.total<=1);
 assert.ok(Math.abs(max.total-max.direct)<EPS);
 assert.throws(()=>fixed(-1));
 assert.throws(()=>fixed(47));
 assert.throws(()=>withBonus(0));
});
