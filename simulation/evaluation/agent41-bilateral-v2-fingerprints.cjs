'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const ROOT=path.resolve(__dirname,'../..');
const CANDIDATE_FILES=Object.freeze([
  'simulation/evaluation/agent41-bilateral-common-policy.cjs',
  'simulation/twinleaf/newmoon-garbotoxin-blower-autonomy.cjs',
  'simulation/twinleaf/forest-stone-v-recipient-policy.cjs',
  'simulation/twinleaf/candidate-stone-star-alchemy-policy.cjs'
]);
const SOURCE_FILES=Object.freeze([
  'simulation/twinleaf/rank6-broad-thorns-policy.cjs',
  'simulation/twinleaf/rank11-direct-boostshake.cjs'
]);
const RUNNER_FILES=Object.freeze([
  'simulation/evaluation/agent41-bilateral-v2-development.cjs',
  'simulation/twinleaf/headless.cjs',
  'simulation/evaluation/agent41-crossrank-actual-decisions.cjs'
]);

/** @param {Buffer|string} data @returns {string} */
const sha256=data=>createHash('sha256').update(data).digest('hex');

/** @param {string} name @returns {string} */
function readSource(name){
  assert.ok(!path.isAbsolute(name)&&
    !name.split('/').includes('..'),'Repository-relative input required');
  return fs.readFileSync(path.join(ROOT,name),'utf8');
}

/**
 * Preserve printed card identities, not only card names. The original
 * Limitless field input gives English display printings, not authenticated
 * original Japanese physical collector IDs.
 *
 * @param {{count:number}[]} entries
 * @param {(entry:object)=>readonly (string|number)[]} identity
 * @returns {{total:number,uniqueRows:number,sha256:string}}
 */
function canonicalPrinted60(entries,identity){
  assert.ok(Array.isArray(entries));
  const grouped=new Map();
  let total=0;
  for(const row of entries){
    assert.ok(Number.isSafeInteger(row.count)&&row.count>=1&&row.count<=60);
    const tokens=identity(row);
    assert.ok(Array.isArray(tokens)&&tokens.length>=2);
    assert.ok(tokens.every(s=>(typeof s==='string'&&s.length>0)||
      (typeof s==='number'&&Number.isSafeInteger(s)&&s>=0)));
    total+=row.count;
    const key=JSON.stringify(tokens);
    grouped.set(key,(grouped.get(key)??0)+row.count);
  }
  assert.equal(total,60,'Candidate or source must be exactly 60 physical copies');
  assert.ok(entries.length<=60&&entries.length>0);
  // Preserve the physical multiset even when the source splits one exact
  // printing into repeated rows; row partition cannot change a deck digest.
  const lines=[...grouped].map(([identity,count])=>
    JSON.stringify([...JSON.parse(identity),count]));
  return {total,uniqueRows:grouped.size,
    sha256:sha256(lines.sort().join('\n')+'\n')};
}

/**
 * Source-file and frozen options fingerprint, for registration and
 * per-arm provenance. All code dependencies still require full Git revision
 * pinning as the complete transitive boundary.
 *
 * @param {readonly string[]} names
 * @param {unknown} [options]
 * @returns {{sha256:string,files:{path:string,sha256:string}[]}}
 */
function policyCommitment(names,options=null){
  const sorted=[...names].sort();
  assert.equal(new Set(sorted).size,sorted.length,'Duplicate source pathname');
  const files=sorted.map(name=>({
    path:name,sha256:sha256(readSource(name))
  }));
  return {sha256:sha256(JSON.stringify({files,options})),files};
}

/**
 * A DRAFT evidence manifest only. It contains no future seed, arm, winning
 * outcome or registration ID. The v2 plan must be committed separately
 * *after* legal-action and hidden-information policy fixes are proven.
 * @returns {object}
 */
function buildDraftFingerprints(){
  const field=JSON.parse(readSource('results/aichi-2026/full-decklists.json'));
  const registration=JSON.parse(readSource(
    'results/aichi-2026/registrations/agent41-crossrank-r6-r11-v1-20261019.json'));
  const english=JSON.parse(readSource(
    'results/als/new-moon-lockbreak-english-proxy-60.json'));
  const japanese=JSON.parse(readSource(
    'results/als/new-moon-lockbreak-japanese-print-60.json'));
  assert.equal(field.published_deck_count,29);
  const byRank=new Map(field.decks.map(deck=>[deck.rank,deck]));
  const printedSource=rank=>{
    const deck=byRank.get(rank);
    assert.ok(deck,'Missing actual Aichi source rank '+rank);
    return canonicalPrinted60(deck.cards,row=>[
      row.category,row.name,row.printing?.set,
      String(row.printing?.number??''),row.printing?.language
    ]);
  };
  const englishNewMoon=canonicalPrinted60(english.entries,row=>[
    row.type,row.name_en,row.english_proxy_card_id
  ]);
  const japaneseNewMoon=canonicalPrinted60(japanese.entries,row=>[
    row.name_en,row.japanese_set,row.japanese_card_id
  ]);
  const champion=printedSource(1);
  const frozenFlags=registration.frozenFlags;
  assert.equal(registration.enginePin,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  const policies={
    sharedCandidate:policyCommitment(CANDIDATE_FILES,{
      version:'agent41-bilateral-common-resource-policy-v0',
      flags:frozenFlags,
      identicalCodeForBothCandidates:true
    }),
    sourceOpponent:policyCommitment(SOURCE_FILES,{
      rank6:'withBroadThornsSourceAttack:first-eligible-turn-2-or-3',
      rank11:'withRank11DirectBoostShake:k0AvoidAllGarbodorHeld',
      flags:frozenFlags
    }),
    runnerAndEngineGlue:policyCommitment(RUNNER_FILES,{
      enginePin:registration.enginePin,flags:frozenFlags
    })
  };
  return {
    schema:'agent41-bilateral-v2-unregistered-fingerprint-draft-v0',
    status:'draft-only-not-precommitted',
    sourceField:{
      publishedCount:field.published_deck_count,
      absentOriginalRanks:field.missing_full_lists.map(x=>x.rank),
      manuscriptSha256:sha256(readSource('results/aichi-2026/full-decklists.json')),
      sourcePrintStatus:'Limitless English display equivalent; exact original Japanese printing unverified'
    },
    fixedCandidates:{
      'champion-reference':{
        englishDisplayPrinting:champion,
        paperPrintStatus:'Original Japanese physical collector IDs not independently verified'
      },
      'new-moon-lockbreaker-v1':{
        englishSimulationProxy:englishNewMoon,
        proposedJapanesePhysicalPrinting:japaneseNewMoon,
        paperPrintStatus:'Japanese physical candidate proposed, not original 52nd-place registration'
      }
    },
    fixedSourceOpponents:{
      6:{englishDisplayPrinting:printedSource(6)},
      11:{englishDisplayPrinting:printedSource(11)}
    },
    policies,
    enginePin:registration.enginePin,
    competitiveQualifiedGames:0,
    hiddenInformationPolicyQualified:false,
    tournamentClockQualified:false,
    caveat:'This is a reproducible draft input fingerprint, not a preregistered trial or a complete proof of paper legality'
  };
}

if(require.main===module)process.stdout.write(
  JSON.stringify(buildDraftFingerprints(),null,2)+'\n');
module.exports={CANDIDATE_FILES,SOURCE_FILES,RUNNER_FILES,
  canonicalPrinted60,policyCommitment,buildDraftFingerprints};
