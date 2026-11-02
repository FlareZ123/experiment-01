'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const {run,preflight,profile:baseline}=require('./agent18-rank5-selected-canary.cjs');
const selected=require('./agent18-rank5-natural-evolution-v2.json');

/** Verify one and only one selected option changes on the same known physical deals. */
function pairedPreflight(){
  assert.equal(gitBlobHash(fs.readFileSync(path.join(__dirname,
    'agent18-rank5-natural-evolution-v2.cjs'))),
  selected.selectedV2EntrypointGitBlobSha,
  'Retrospective treatment entrypoint changed without re-registering');
  const frozen=preflight(undefined,{},baseline);
  const experimental=preflight(undefined,{},selected);
  assert.deepEqual(experimental.trials,frozen.trials,
    'Retrospective option contrast must conserve all registered physical deals');
  const changed=Object.keys(experimental.options).filter(
    key=>experimental.options[key]!==frozen.options[key]);
  assert.deepEqual(changed,['actorNaturalEvolutionRoot'],
    'Only printed natural evolution may change between profiles');
  assert.equal(frozen.options.actorNaturalEvolutionRoot,false);
  assert.equal(experimental.options.actorNaturalEvolutionRoot,true);
  assert.equal(selected.seedsPreviouslyObserved,true,
    'Never describe seen-source treatment as independent prospective evaluation');
  return {selectedSchema:selected.schema,changed,registered:experimental.trials};
}
if(require.main===module){
  pairedPreflight();
  process.stdout.write(JSON.stringify(run(selected),null,2)+'\n');
}
module.exports={selected,pairedPreflight};
