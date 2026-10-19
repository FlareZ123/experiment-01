'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {publicPerfectionPrerequisites}=require(
  '../twinleaf/agent28-perfection-donor-context.cjs');

const PROBE_PATH=require.resolve('../twinleaf/perfection-post-pass-probe.cjs');
const HEADLESS_PATH=require.resolve('../twinleaf/headless.cjs');
const EXPECTED_ROOTS=new Map([
  ['6:0:A:champion-reference','df894ca4304355b937b515cc559dbacbf6c803a2c0b0fc23f47260889f900dbe'],
  ['6:0:A:new-moon-lockbreaker-v1','87ef423a77ec6aafd6063fd3ad054ce3f9d29806a52ab04f21c1c6bb0e1495e4'],
  ['11:2:B:champion-reference','dd2bfba15a260541405501c6f09b03e17d9140c908a8243132e5122e294c97b8'],
  ['11:2:B:new-moon-lockbreaker-v1','646c06f1d8a52f426689b877c1cc84f530ef22c36f0fd55ac34573ef6d8d4979']
]);

/**
 * Revisit four existing, already published historical 60-card game states.
 * Decorate a detached post-choice observer before headless imports it.
 * No live decision-policy method or chosen action is changed.
 * @returns {object} Exact unqualified diagnostic, preserving every failed arm.
 */
function runPublicDonorReplay(){
  assert.equal(require.cache[HEADLESS_PATH],undefined,
    'Headless must be loaded after observer installation');
  const probe=require(PROBE_PATH);
  const original=probe.probePostPassPerfection;
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {CardTag}=require(path.join(output,'game/store/card/card-types'));
  let observed=0;
  const decorate=(state,playerId,...args)=>{
    const finding=original(state,playerId,...args);
    if(!finding)return finding;
    const seat=state.players.findIndex(player=>player.id===playerId);
    assert.ok(seat===0||seat===1);
    observed++;
    return {...finding,publicCopyPrerequisites:publicPerfectionPrerequisites(
      state,seat,{gx:CardTag.POKEMON_GX,ex:CardTag.POKEMON_EX})};
  };
  probe.probePostPassPerfection=decorate;
  try{
    const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
    const result=runDevelopment();
    assert.equal(result.attempted,4);
    assert.equal(result.errors,0);
    const rows=result.rows.map(row=>{
      const id=row.trial.id;
      assert.equal(row.rootActionLedgerSha256,EXPECTED_ROOTS.get(id),
        'Historical real-root decisions changed for '+id);
      return {
        id,rootActionLedgerSha256:row.rootActionLedgerSha256,
        sourceLineCompleted:row.trial.rank===6?
          row.sourceAudit.turn2.completed||row.sourceAudit.turn3.completed:
          row.sourceAudit.completed,
        originalCandidateAttacks:row.attackDeclarations.candidate,
        candidatePassCount:row.candidatePostChoicePassProbe.observedCandidatePasses,
        samples:row.candidatePerfectionPassSamples.map(sample=>({
          ordinal:sample.ordinal,turn:sample.turn,
          activationAccepted:sample.activationAccepted,
          rejection:sample.rejection??null,
          attackMenu:sample.validAttackNames,
          publicCopyPrerequisites:sample.publicCopyPrerequisites
        }))
      };
    });
    assert.equal(rows.reduce((n,row)=>n+row.samples.length,0),observed);
    return {
      schema:'agent28-bilateral-historical-public-copy-source-v1',
      scope:'Four previously viewed historical 60-card trials only',
      enginePin:result.enginePin,policyVersion:result.candidatePolicy,
      observationOnly:true,rootPlaybackUnchanged:true,
      observedPerfectionPassRoots:observed,rows,
      competitiveQualifiedGames:0,winRateCertified:false
    };
  }finally{
    assert.equal(probe.probePostPassPerfection,decorate);
    probe.probePostPassPerfection=original;
    delete require.cache[HEADLESS_PATH];
  }
}

if(require.main===module)process.stdout.write(
  JSON.stringify(runPublicDonorReplay(),null,2)+'\n');
module.exports={runPublicDonorReplay};
