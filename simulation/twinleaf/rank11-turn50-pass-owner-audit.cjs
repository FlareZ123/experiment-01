'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {loadNewMoonCandidate}=require('../../scripts/aichi-new-moon-candidate.cjs');
const {runWithResearchProfile,RANK11_AUTONOMOUS_PROFILE}=
  require('./policy-profiles.cjs');
const {withNewMoonBlowerAutonomy}=
  require('./newmoon-garbotoxin-blower-autonomy.cjs');
const {withRank11Turn49QuickBalls}=
  require('./rank11-turn49-quick-ball-counterfactual.cjs');

const SEED=1244180408;
const SOURCE_SEAT=0;
const CANDIDATE_SEAT=1;

/**
 * Detached retrospective telemetry only. Own-hand evidence is captured by
 * the common runner after each bot decision; it never enters the decision
 * policy. Public board fields are intentionally reduced to human-readable
 * face-up Pokémon, Energy, Tools and Stadium details.
 * @param {object} game
 * @returns {object}
 */
function summarize(game) {
  const own=game.decisionTrace.filter(row=>
    row.playerSlot===CANDIDATE_SEAT && row.turnBefore>=48 &&
    row.turnBefore<=54);
  const passes=own.filter(row=>row.action==='PassTurnAction').map(row=>({
    ordinal:row.actionOrdinal,turn:row.turnBefore,
    ownHand:row.decisionHandBefore?.ownHandPrintings??null,
    opponentHandSize:row.decisionHandBefore?.opponentHandSize??null,
    ownPublicBoard:row.publicBoardBeforePass?.[CANDIDATE_SEAT]??null,
    opponentPublicBoard:row.publicBoardBeforePass?.[SOURCE_SEAT]??null,
    ownBasicEnergyAudit:row.printedBasicEnergyBeforePass??null,
    prizesAfter:row.prizesAfter,
    attackPassProbe:row.attackPassProbe??null,
    warning:'AttackPassProbe enumerates printed and Tool attacks only, omitting delegated Perfection.'
  }));
  const turnActions=own.filter(row=>[
    'PlayCardAction','UseAbilityAction','AttackAction','PassTurnAction'
  ].includes(row.action)).map(row=>({
    ordinal:row.actionOrdinal,turn:row.turnBefore,action:row.action,
    card:row.card??null,ability:row.ability??null,attack:row.attack??null
  }));
  const copyChoices=own.filter(row=>row.attackChoice?.selection).map(row=>({
    ordinal:row.actionOrdinal,turn:row.turnBefore,
    selected:row.attackChoice.selection
  }));
  return {actions:game.actions,turns:game.turns,winner:game.winner,
    prizes:game.prizesRemaining,
    passes,turnActions,copyChoices};
}

/** @returns {object} */
function run() {
  const candidate=loadNewMoonCandidate();
  const plan=planAichi({label:candidate.id,cards:candidate.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const opponent=plan.opponents.find(row=>row.rank===11);
  assert.equal(opponent?.status,'ready');
  const request={
    deckA:opponent.cards,deckB:plan.candidate.cards,
    seed:SEED,maxActions:450,rank11SourceSeat:SOURCE_SEAT,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    label:'rank11-turn50-candidate-own-hand-pass-observer-only'
  };
  const play=()=>runWithResearchProfile(request,RANK11_AUTONOMOUS_PROFILE);
  const baseline=withNewMoonBlowerAutonomy(CANDIDATE_SEAT,play,
    {lowHandLillieAfterBlower:true}).result;
  const counterfactual=withNewMoonBlowerAutonomy(CANDIDATE_SEAT,
    ()=>withRank11Turn49QuickBalls(SOURCE_SEAT,play),
    {lowHandLillieAfterBlower:true});
  const modified=counterfactual.result.result;
  assert.equal(counterfactual.result.audit.successfulSearchPromptCycles,3);
  assert.deepEqual(baseline.deckHashes,modified.deckHashes);
  assert.equal(modified.firstTurnSlot,SOURCE_SEAT);
  assert.equal(modified.verifiedByDrawLog,true);
  const prefix=game=>game.rootActionLedger.filter(row=>row.turnBefore<49);
  assert.deepEqual(prefix(baseline),prefix(modified),
    'Read-only audit must preserve the source pre-turn49 action prefix');
  assert.equal(baseline.winner,1);
  assert.equal(modified.winner,0);
  const observed=summarize(modified);
  assert.equal(observed.passes.some(row=>row.turn===50),true,
    'Changed candidate t50 pass was not observed');
  return {
    schema:'rank11-turn50-newmoon-owner-pass-observation-v1',
    seed:SEED,enginePinned:plan.engineRevision,
    sourceDeckHashes:baseline.deckHashes,
    baseline:summarize(baseline),
    counterfactual:observed,
    opponentCounterfactual:counterfactual.result.audit,
    originalPrefixIdentical:true,
    perspective:'candidate own hand and publicly face-up board only',
    caveat:'Retrospectively selected source seed, unqualified engine policy, untimed and English printing proxy',
    qualifiedCompetitiveGames:0
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,summarize};
