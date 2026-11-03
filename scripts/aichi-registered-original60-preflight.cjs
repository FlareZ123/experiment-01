'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const {execFileSync} = require('node:child_process');
const {readFileSync} = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname,'..');
const SCHEMA = 'aichi-registered-original60-pin-v1';

/**
 * Canonical name, count and printed identity of an authenticated original.
 * This is separate from native card IDs and actual dealt physical fingerprints.
 * @param {object} deck One exact source deck manifest entry.
 * @returns {string}
 */
function printed60Sha256(deck) {
  assert.ok(deck && Array.isArray(deck.cards));
  const records=deck.cards.map(card=>{
    assert.ok(typeof card.category==='string' &&
      typeof card.name==='string' &&
      Number.isSafeInteger(card.count) && card.count>0);
    const p=card.printing;
    assert.ok(p && typeof p.set==='string' &&
      typeof p.number==='string' &&
      typeof p.language==='string');
    return [card.category,card.name,card.count,p.set,p.number,p.language];
  });
  assert.equal(records.reduce((sum,row)=>sum+row[2],0),60,
    'source must contain exactly 60 printed cards');
  records.sort((a,b)=>{
    const x=JSON.stringify(a),y=JSON.stringify(b);
    return x<y?-1:x>y?1:0;
  });
  return createHash('sha256').update(JSON.stringify(records)).digest('hex');
}

/**
 * Obtain the committed gitlink without initializing or compiling Twinleaf.
 * @returns {string}
 */
function pinnedGitlinkSha() {
  const row=execFileSync('git',['ls-tree','HEAD','vendor/twinleaf'],
    {cwd:ROOT,encoding:'utf8'}).trim();
  const match=/^160000 commit ([0-9a-f]{40})\tvendor\/twinleaf$/.exec(row);
  assert.ok(match,'pinned Twinleaf gitlink missing or moved');
  return match[1];
}

/**
 * Fail closed before vendor checkout on a pinned real source print or gitlink
 * mismatch. The enrolled source manifest and admission ledger must agree.
 *
 * @param {object} pins Versioned campaign identity pin manifest.
 * @param {{roster?:object,admission?:object,gitlinkSha?:string}} [inputs]
 * @returns {object} Source-authenticity receipt, not competitive certification.
 */
function preflightOriginalSourcePins(pins,inputs={}) {
  assert.ok(pins && typeof pins==='object' && !Array.isArray(pins));
  assert.equal(pins.schema,SCHEMA);
  assert.ok(typeof pins.campaignId==='string' && pins.campaignId.length>0);
  assert.equal(pins.engine,'twinleafgg');
  assert.match(pins.engineGitlinkSha,/^[0-9a-f]{40}$/);
  assert.match(pins.seedPlanSha256,/^[0-9a-f]{64}$/,
    'frozen seed plan must have reviewed independent SHA256');
  assert.ok(Number.isInteger(pins.maxActions) && pins.maxActions>0);
  assert.match(pins.outputFilename,/^[a-z0-9][a-z0-9-]*\.json$/);
  assert.ok(typeof pins.policyProfile==='string' && pins.policyProfile.length>0);
  assert.ok(Array.isArray(pins.originalPrints) && pins.originalPrints.length===2);
  const expectedRanks=new Set();
  for(const row of pins.originalPrints){
    assert.ok(Number.isInteger(row.rank) && row.rank>=1 && row.rank<=32);
    assert.match(row.printed60Sha256,/^[a-f0-9]{64}$/);
    assert.ok(!expectedRanks.has(row.rank),'repeated original source rank');
    expectedRanks.add(row.rank);
    assert.ok(row.role==='source'||row.role==='opponent');
  }
  assert.equal(pins.originalPrints.filter(x=>x.role==='source').length,1);
  assert.equal(pins.originalPrints.filter(x=>x.role==='opponent').length,1);

  const roster=inputs.roster??JSON.parse(readFileSync(
    path.join(ROOT,'results/aichi-2026/full-decklists.json'),'utf8'));
  const admission=inputs.admission??JSON.parse(readFileSync(
    path.join(ROOT,'results/aichi-2026/original-printed60-admission-v1.json'),'utf8'));
  const gitlink=inputs.gitlinkSha??pinnedGitlinkSha();
  assert.equal(gitlink,pins.engineGitlinkSha,'native gitlink drifted from registered pin');
  const results=[];
  for(const expected of pins.originalPrints){
    const matches=roster.decks.filter(x=>x.rank===expected.rank);
    assert.equal(matches.length,1,`original roster rank ${expected.rank} absent or duplicated`);
    const manifestSha=printed60Sha256(matches[0]);
    const admitted=admission.rows.filter(x=>x.rank===expected.rank);
    assert.equal(admitted.length,1,'source admission row missing or duplicated');
    assert.equal(manifestSha,expected.printed60Sha256,
      `original rank ${expected.rank} printed source drifted`);
    assert.equal(admitted[0].printed60Sha256,manifestSha,
      `original rank ${expected.rank} admission digest disagrees`);
    results.push({rank:expected.rank,role:expected.role,
      printed60Sha256:manifestSha,physicalCards:60});
  }
  return Object.freeze({
    schema:SCHEMA,campaignId:pins.campaignId,
    engineGitlinkSha:gitlink,sourcePrints:results,
    maxActions:pins.maxActions,outputFilename:pins.outputFilename,
    policyProfile:pins.policyProfile,
    nativeGamesExecuted:0,competitiveGamesQualified:0
  });
}

/** @param {string} filename */
function preflightOriginalSourcePinFile(filename){
  const pins=JSON.parse(readFileSync(path.resolve(filename),'utf8'));
  return preflightOriginalSourcePins(pins);
}

if(require.main===module){
  assert.equal(process.argv.length,3);
  const result=preflightOriginalSourcePinFile(process.argv[2]);
  process.stdout.write('ORIGINAL_SOURCE_PIN_PREFLIGHT_OK '+JSON.stringify(result)+'\n');
}

module.exports={SCHEMA,printed60Sha256,pinnedGitlinkSha,
  preflightOriginalSourcePins,preflightOriginalSourcePinFile};
