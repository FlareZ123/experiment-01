'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const SCHEMA='agent50-native-actor-generic-fallback-setup-excluded-census-v1';
const TYPE='ChooseCardsPrompt';

/** @returns {object} */
function emptyGroup(){
  return {arms:0,totalPromptCalls:0,setupChooseCards:0,
    gameChooseCards:0,promptTypes:{}};
}
/**
 * Distinguish opening Basic setup from remaining generic-bot card selections.
 * Full per-prompt-type counts are unbounded; the first 96 audit records
 * include the whole setup before any truncated gameplay records. Fail closed
 * if setup completeness cannot be established for an arm.
 *
 * All inputs are preserved native postgame actor-only audit outputs. This
 * reads no hidden opponent card content or full Store state.
 * @param {object[]} rows Original 32-arm development result rows.
 * @returns {object} Read-only, noncompetitive evidence census.
 */
function census(rows){
  assert.ok(Array.isArray(rows)&&rows.length>0);
  const overall={source:emptyGroup(),candidate:emptyGroup()};
  const cells={};
  let truncatedLiveDecodes=0;
  for(const row of rows){
    assert.ok(row?.trial&&[0,1].includes(row.candidateSeat));
    assert.equal(row.sourceSeat,1-row.candidateSeat);
    const raw=row.actorOnlyDecisionCoverage?.detailedComponentAudits
      ?.genericFallback;
    assert.ok(raw&&raw.readOnly===true);
    assert.ok(Array.isArray(raw.boundedRecords));
    assert.ok(Number.isSafeInteger(raw.unrecordedLiveDecodes));
    const last=raw.boundedRecords.at(-1);
    assert.ok(last,'Missing native fallback record');
    assert.ok(!(raw.unrecordedLiveDecodes>0&&last.turn===0),
      'Setup classification truncated before first game turn');
    truncatedLiveDecodes+=raw.unrecordedLiveDecodes;
    const key=row.trial.rank+':'+row.trial.candidateId;
    const cell=cells[key]??={rank:row.trial.rank,
      candidateId:row.trial.candidateId,
      source:emptyGroup(),candidate:emptyGroup()};
    for(const role of ['source','candidate']){
      const seat=role==='source'?row.sourceSeat:row.candidateSeat;
      const types=raw.byOwnerPromptType?.[String(seat)];
      assert.ok(types&&typeof types==='object');
      const group=overall[role],local=cell[role];
      group.arms++;local.arms++;
      for(const [kind,n] of Object.entries(types)){
        assert.ok(Number.isSafeInteger(n)&&n>=0);
        group.totalPromptCalls+=n;local.totalPromptCalls+=n;
        group.promptTypes[kind]=(group.promptTypes[kind]??0)+n;
        local.promptTypes[kind]=(local.promptTypes[kind]??0)+n;
      }
      const setup=raw.boundedRecords.filter(rec=>rec.seat===seat&&
        rec.promptType===TYPE&&rec.turn===0&&rec.phase===1);
      assert.ok(setup.length>=1,
        'Missing native starting Basic selection in bounded setup');
      for(const rec of setup)
        assert.equal(rec.firstDecoderCallForPrompt,true);
      group.setupChooseCards+=setup.length;
      local.setupChooseCards+=setup.length;
    }
  }
  for(const group of [...Object.values(overall),...Object.values(cells)
    .flatMap(c=>[c.source,c.candidate])]){
    const raw=group.promptTypes[TYPE]??0;
    assert.ok(raw>=group.setupChooseCards);
    group.gameChooseCards=raw-group.setupChooseCards;
  }
  return {schema:SCHEMA,arms:rows.length,overall,cells,
    totalGenericDecodes:overall.source.totalPromptCalls+
      overall.candidate.totalPromptCalls,
    truncatedLiveDecodes,
    totalSetupChooseCards:overall.source.setupChooseCards+
      overall.candidate.setupChooseCards,
    totalGameChooseCards:overall.source.gameChooseCards+
      overall.candidate.gameChooseCards,
    competitiveQualifiedGames:0,
    caveat:'Read-only native decoder accounting, after actor-only fallback; setup classified solely where untruncated early records exist. Prompt counts are not competitive policy proof.'};
}

if(require.main===module){
  const path=process.argv[2];
  assert.ok(path,'Pass the archived original native scout JSON filename');
  const body=JSON.parse(fs.readFileSync(path,'utf8'));
  assert.equal(body.schema,'agent41-preregistered-32-arm-canonical-scout-v1');
  const value=census(body.developmentResult.rows);
  process.stdout.write(JSON.stringify(value,null,2)+'\n');
}

module.exports={SCHEMA,census};
