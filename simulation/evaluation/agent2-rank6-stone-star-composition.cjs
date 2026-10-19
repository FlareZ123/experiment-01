'use strict';

const assert=require('node:assert/strict');
const {scheduledArms,assertManifest,executeArm}=
  require('./agent41-crossrank-actual-decisions.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {withStoneVRecipient}=
  require('../twinleaf/forest-stone-v-recipient-policy.cjs');
const {withStoneStarAlchemy}=
  require('../twinleaf/candidate-stone-star-alchemy-policy.cjs');

const SOURCE_HAND_SHA='0323878f6018bb7645fbda83d6753d83198ddc01a571b517d44f5678addf731b';

/**
 * Reuse one authentic source deal, adding one information-set-safe, candidate-
 * only Tool-granted VSTAR proposal. No winning-rate outcome is qualified.
 * @returns {object}
 */
function run(){
  assertManifest();
  const trial=scheduledArms().find(x=>
    x.id==='6:0:A:new-moon-lockbreaker-v1');
  assert.ok(trial);
  assert.equal(trial.seed,407516727);
  const {loadNewMoonCandidate}=
    require('../../scripts/aichi-new-moon-candidate.cjs');
  const raw=loadNewMoonCandidate();
  const plan=planAichi({label:raw.id,cards:raw.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  assert.equal(plan.engineRevision,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  const prepared=new Map([['new-moon-lockbreaker-v1',{plan}]]);
  const headless=require('../twinleaf/headless.cjs');
  const original=headless.runMatch;
  let rawGame;
  headless.runMatch=request=>{
    rawGame=original(request);
    return rawGame;
  };
  let pair;
  try {
    pair=withStoneVRecipient(0,()=>withStoneStarAlchemy(0,()=>
      executeArm(trial,prepared)));
  } finally {
    headless.runMatch=original;
  }
  const record=pair.result.result;
  assert.ok(rawGame);
  assert.equal(record.engineFirstTurnSlot,0);
  assert.equal(record.verifiedFirstTurn,true);
  assert.equal(record.sourceFirstRecordedOwnHandSha256,SOURCE_HAND_SHA);
  const own=rawGame.decisionTrace.filter(x=>x.playerSlot===0);
  const actions=own.filter(x=>x.turnBefore<=9).slice(0,80).map(x=>({
    turn:x.turnBefore,ordinal:x.actionOrdinal,action:x.action,
    card:x.card??null,ability:x.ability??null,attack:x.attack??null,
    promptSelection:x.cardSelection?.selectedCards??null
  }));
  const passes=own.filter(x=>x.action==='PassTurnAction')
    .slice(0,5).map(x=>({turn:x.turnBefore,
      ownerHand:x.decisionHandBefore?.ownHandPrintings??null,
      publicBoard:x.publicBoardBeforePass??null}));
  return {
    schema:'agent2-rank6-stone-star-composition-retrospective-v1',
    registration:'results/aichi-2026/registrations/agent2-rank6-stone-star-v1-20261019.md',
    trialId:trial.id,seed:trial.seed,sourceFirstHandSha256:SOURCE_HAND_SHA,
    trueCandidateFirst:true,engineRevision:plan.engineRevision,
    sourceTurn2Complete:record.sourcePolicyAudit.turn2.completed,
    stoneAllocationEvents:pair.audit.events,
    starAlchemyProposalEvents:pair.result.audit.events,
    acceptedStarAlchemy:rawGame.abilityTrace.filter(x=>
      x.name==='Star Alchemy'),
    candidateActionsToTurn9:actions,earlyCandidatePasses:passes,
    sourceAttackDeclarations:record.sourceAttackDeclarations,
    candidateAttackDeclarations:record.candidateAttackDeclarations,
    actions:record.actions,turns:record.turns,prizesRemaining:record.prizesRemaining,
    status:record.status,rootLedgerSha256:record.rootActionLedgerSha256,
    competitiveQualifiedGames:0
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
