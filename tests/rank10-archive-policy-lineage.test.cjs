'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');

/**
 * These retrospective programs require the explicitly pinned historical DDE
 * policy for their hard-coded source-root action numbers and turn counts.
 * This is a source-wiring guard, not a simulator, mechanics or policy test.
 */
const archived=[
  'rank10-extra-turn-shred-fork.cjs',
  'rank10-mimikyu-shred-source-fork.cjs',
  'rank10-turn28-bot-fingerprint.cjs',
  'rank10-postshred-opponent-perspective.cjs',
  'rank10-shred-turn29-response-source.cjs',
  'rank10-turn29-hidden-order-source.cjs',
  'rank10-shred-policy-rng-aligned.cjs',
  'rank10-turn29-guzma-source.cjs'
];

for(const file of archived){
  test('historical rank10 source policy is explicit in '+file,()=>{
    const source=fs.readFileSync(path.resolve(__dirname,
      '../simulation/twinleaf',file),'utf8');
    assert.match(source,/doubleDragonRecovery\s*:\s*true/,
      'Archived source uses Double Dragon recovery');
    assert.match(source,/doubleDragonArchiveV3\s*:\s*true/,
      'An implicit v4 default cannot reproduce historical turn28/29 states');
  });
}

test('live v4 rank10 audit retains its distinct current-policy scope',()=>{
  const source=fs.readFileSync(path.resolve(__dirname,
    '../simulation/twinleaf/rank10-live-decision-noninterference.cjs'),'utf8');
  assert.match(source,/doubleDragonRecovery\s*:\s*true/);
  assert.doesNotMatch(source,/doubleDragonArchiveV3\s*:\s*true/);
});
