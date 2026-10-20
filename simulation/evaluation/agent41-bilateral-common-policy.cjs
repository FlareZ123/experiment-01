'use strict';

const assert = require('node:assert/strict');

const POLICY_VERSION = 'agent41-bilateral-common-resource-policy-v0';

/**
 * Compose exactly the same resource-decision adapters for both frozen candidate
 * decks. A card that is absent from a player's hand naturally cannot be used.
 * This is a development policy, not an information-set-safe full-game bot:
 * unmodified Twinleaf decisions may still score concealed cards.
 *
 * No branch on candidate identity, archetype, opponent rank, seed or turn.
 *
 * @template T
 * @param {0|1} candidateSeat Real physical seat of either frozen candidate.
 * @param {()=>T} execute Synchronous pinned headless match.
 * @param {{toolRemoval?:Function,stoneRecipient?:Function,starAlchemy?:Function,
 *          actorOnlyRootTactics?:Function}} [adapters]
 *   Pure-test seam; omitted dependencies load the research-owned adapters.
 * @param {{actorOnlyRootTactics?:boolean}} [options] Development-only native execution.
 * @returns {{result:T,policyAudit:object}}
 */
function withBilateralCommonCandidatePolicy(candidateSeat, execute, adapters={}, options={}) {
  assert.ok(candidateSeat === 0 || candidateSeat === 1,
    'Candidate must occupy a real physical seat');
  assert.equal(typeof execute, 'function');
  const toolRemoval = adapters.toolRemoval ??
    require('../twinleaf/newmoon-garbotoxin-blower-autonomy.cjs')
      .withNewMoonBlowerAutonomy;
  const stoneRecipient = adapters.stoneRecipient ??
    require('../twinleaf/forest-stone-v-recipient-policy.cjs')
      .withStoneVRecipient;
  const starAlchemy = adapters.starAlchemy ??
    require('../twinleaf/candidate-stone-star-alchemy-policy.cjs')
      .withStoneStarAlchemy;
  for (const dependency of [toolRemoval,stoneRecipient,starAlchemy]) {
    assert.equal(typeof dependency, 'function');
  }

  // Each adapter installs a reversible hook, calls its child synchronously,
  // and restores the original engine methods in its finally block.
  const run=()=>toolRemoval(candidateSeat,
    () => stoneRecipient(candidateSeat,
      () => starAlchemy(candidateSeat, execute)),
    {automaticFieldBlower:true,allowAnyActiveBlower:true,
      lowHandLillieAfterBlower:false,proactiveLowHandLillie:false});
  const nativeSlice=options.actorOnlyRootTactics===true?
    (adapters.actorOnlyRootTactics??
      require('../twinleaf/actor-only-native-tactic-slice.cjs')
        .withActorOnlyNativeRootTactics)(run):null;
  const tool=nativeSlice?nativeSlice.result:run();

  return {
    result:tool.result.result.result,
    policyAudit:{
      version:POLICY_VERSION,
      candidateSeat,
      frozenCommonProfile:true,
      candidateIdentityUsedForDecisions:false,
      components:{
        actorOnlyRootTactics:nativeSlice?.audit??null,
        fieldBlower:tool.policyAudit,
        forestStoneRecipient:tool.result.audit,
        starAlchemy:tool.result.result.audit
      },
      qualification:{
        legalActionsRequireLiveStoreAudit:true,
        hiddenInformationSafe:false,
        opponentPolicyIndependentOfCandidateInventory:false,
        paperClockCertified:false,
        competitiveGameQualified:false
      },
      scope:'Owner hand and public board for added tactics; generic bot still unqualified'
    }
  };
}

module.exports={POLICY_VERSION,withBilateralCommonCandidatePolicy};
