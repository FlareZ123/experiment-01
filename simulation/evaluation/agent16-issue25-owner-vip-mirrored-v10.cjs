'use strict';

const assert=require('node:assert/strict');
const {runMirroredIssue25V6}=
  require('./agent1-issue25-mirrored-r6-r11-v6.cjs');
const {withThreePrintedOwnerAttackFrontiers}=
  require('./agent1-issue25-joined-three-attacks-v5.cjs');
const {withActorBattleVipAfterPass}=
  require('../twinleaf/agent9-battle-vip-owner-after-pass.cjs');

const VERSION='agent16-issue25-mirrored-original-v6-plus-owner-vip-after-pass-v10';

/**
 * Add one existing printed first-owner-turn Item as a real owner-root
 * response to the otherwise selected Pass. The same handler is installed on
 * both physical seats and respects the authorized owner-only deck prompt.
 * Neither original source decks nor contender sixties change. All other v6
 * source-stamped printed attack hooks remain in the selected composition.
 *
 * @template T
 * @param {()=>T} next
 * @param {{attackLayer?:Function,vipLayer?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withVipAfterPassAndThreePrintedAttacks(next,deps={}){
  assert.equal(typeof next,'function');
  const attack=deps.attackLayer??withThreePrintedOwnerAttackFrontiers;
  const vip=deps.vipLayer??withActorBattleVipAfterPass;
  assert.equal(typeof attack,'function');
  assert.equal(typeof vip,'function');
  let vipAudit=null;
  const selected=attack(()=>{
    const used=vip(next);
    assert.ok(used&&Object.hasOwn(used,'result')&&used.audit);
    vipAudit=used.audit;
    return used.result;
  });
  assert.ok(selected&&Object.hasOwn(selected,'result')&&selected.audit);
  return {result:selected.result,audit:{
    ...selected.audit,ownerVipAfterPass:vipAudit,
    ownerVipAfterPassPreselectedBothSeats:true,
    printedFirstOwnerTurnItemOnly:true,
    paperGameQualified:false,competitivelyQualifiedGames:0
  }};
}

/**
 * Reuse the original frozen eight v6 registration, seeds and sixties.
 * This is a retrospective A/B mechanistic probe, never a new held-out
 * competitive win-rate campaign.
 * @param {{runner?:Function,layers?:object,attackLayer?:Function}} [deps]
 */
function runVipIssue25V10(deps={}){
  const selected=runMirroredIssue25V6({
    runner:deps.runner,layers:deps.layers,
    attackLayer:deps.attackLayer??withVipAfterPassAndThreePrintedAttacks
  });
  const rawAudit=selected.diagnostic.audit?.firstBlockedPromptEnvelope??null;
  const vip=rawAudit?.ownerVipAfterPass??null;
  return {
    manifest:{
      ...selected.manifest,version:VERSION,
      policyEntryPoint:'simulation/evaluation/agent16-issue25-owner-vip-mirrored-v10.cjs',
      basePolicy:'agent1-issue25-preregistered-mirrored-r6-r11-v6-development',
      onlyBehavioralIntervention:'owner-visible Battle VIP Pass FST after otherwise accepted Pass',
      sameEightOriginalV6Registrations:true,
      retrospectiveABOnly:true,
      exactOwnerPaperValidityUnproven:true,
      all32AndClockQualified:false,
      releaseQualified:false,competitiveGamesQualified:0
    },
    diagnostic:{
      ...selected.diagnostic,schema:VERSION,
      sourceIndependentOwnerVipAfterPassObserved:vip!==null,
      ownerVipAfterPassSummary:vip?{
        originalPassRoots:vip.originalPassRoots??null,
        eligiblePassRoots:vip.eligiblePassRoots??null,
        proposedItems:vip.proposedItems??null,
        acceptedItems:vip.acceptedItems??null,
        rejectedItems:vip.rejectedItems??null,
        acceptedSearches:vip.acceptedSearches??null,
        rejectedSearches:vip.rejectedSearches??null,
        nativeBenchConfirmed:vip.nativeBenchConfirmed??null,
        nativeBenchUnconfirmed:vip.nativeBenchUnconfirmed??null,
        unresolvedOwnerSearches:vip.unresolvedOwnerSearches??null,
        bySeat:vip.bySeat??null
      }:null,
      competitiveGamesQualified:0,
      verdict:'FAIL-vip-development-policy-retrospective-unqualified'
    },
    rawDevelopment:selected.rawDevelopment
  };
}

module.exports={VERSION,withVipAfterPassAndThreePrintedAttacks,
  runVipIssue25V10};
