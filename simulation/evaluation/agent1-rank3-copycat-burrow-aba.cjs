'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {initializeCards,runMatch} = require('../twinleaf/headless.cjs');
const {originals} = require('./agent41-rank3-arbitration-original-store.cjs');
const {withCanonicalActorOnlyPolicy} =
  require('./agent7-canonical-actor-composition.cjs');
const {withActorOnlyRootPolicy} =
  require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {withNativePaperSupporterDiscipline} =
  require('../twinleaf/agent41-paper-supporter-discipline.cjs');
const {withSameTargetAttachEnergySelection} =
  require('../twinleaf/same-target-attach-energy-hook.cjs');

const VERSION = 'agent1-rank3-rank1-mimikyu-copycat-burrow-aba-v1';
const SOURCE_SEAT = 0;
const OWNER_SEAT = 1;
const SEED = 290134;
const ACTION_LIMIT = 520;
const EXPECTED_FULL_DEAL =
  'e7304d2a152496945cb9513e50a5e5680a6405ada4cc8ceb1e447f6ade7dddeb';
const EXPECTED_SOURCE_DEAL =
  'ed055a7d1db05b794eea2c63661593e21961dac77e850674ef2dbab57bfa787a';
const sha = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const native = name => require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',name));

/**
 * Read-only public deck-count/action observer. It records no card identities.
 * @template T
 * @param {()=>T} execute
 * @returns {{result:T,audit:object}}
 */
function withDeckDispatchAudit(execute) {
  const {Store} = native('game/store/store');
  const original = Store.prototype.dispatch;
  const audit = {dispatchCount:0,deckChanges:[],attackActions:[]};
  const observed = function observedDispatch(action,...args) {
    const state = this.state;
    const before = state.players.map(player=>player.deck.cards.length);
    const turnBefore = state.turn;
    const activeSeat = state.activePlayer;
    const actionClass = action?.constructor?.name ?? '';
    const actionName = action?.name ?? null;
    const result = original.call(this,action,...args);
    const after = state.players.map(player=>player.deck.cards.length);
    const deckDelta = after.map((count,seat)=>count-before[seat]);
    const row = {
      ordinal:audit.dispatchCount,turnBefore,activeSeat,
      actionClass,actionName,deckBefore:before,deckAfter:after,deckDelta
    };
    if(actionClass==='AttackAction') audit.attackActions.push(row);
    if(deckDelta.some(Boolean)) audit.deckChanges.push(row);
    audit.dispatchCount++;
    return result;
  };
  Store.prototype.dispatch = observed;
  try {
    return {result:execute(),audit};
  } finally {
    assert.equal(Store.prototype.dispatch,observed,
      'Nested native hooks must restore to the deck observer');
    Store.prototype.dispatch = original;
  }
}

/**
 * @param {'control'|'copycat'|'control-repeat'} variant
 * @param {{source:string[],candidate:string[]}} cards
 * @returns {object}
 */
function runArm(variant,cards) {
  const request = {
    deckA:cards.source,deckB:cards.candidate,
    seed:SEED,maxActions:ACTION_LIMIT,
    label:'agent1-rank3-copycat-burrow-'+variant,
    strictPromptValidation:true,mandatoryOptionFallback:true,
    enforceSelectOptionLegality:true,
    enforceVisiblePlayLockBothSeats:true,
    captureInitialFullPhysicalDeal:true,
    captureInitialSourceDealFingerprintSeat:SOURCE_SEAT,
    captureDecisionTrace:true,
    captureNativeAbortEvidence:true,
    capturePublicAttackTransitions:true,
    captureFinalPublicBoard:true,
    captureCopycatTurnStartSeat:OWNER_SEAT,
    passClearsLastAttackCorrection:true,
    ...(variant==='copycat' ? {
      mimikyuBurrowCopycatPolicy:true,
      mimikyuBurrowCopycatPolicySeat:OWNER_SEAT
    } : {})
  };
  try {
    const observed = withDeckDispatchAudit(()=>{
      const simulate = () => withSameTargetAttachEnergySelection(
        ()=>runMatch(request)).result;
      const guarded = withNativePaperSupporterDiscipline(()=>
        withCanonicalActorOnlyPolicy(simulate,{
          root:work=>withActorOnlyRootPolicy(work,{
            publicContextSpecialEnergy:true,specialEnergyRoot:true
          })
        },{ownerSingleSearch:true,genericFallbackAttribution:true}));
      return guarded.result.result;
    });
    const game = observed.result;
    const attackDeclarations = game.attackDeclarationTrace ?? [];
    const copycatDeclarations = attackDeclarations.filter(action=>
      action.playerSlot===OWNER_SEAT && action.attackName==='Copycat');
    const filchDeclarations = attackDeclarations.filter(action=>
      action.playerSlot===OWNER_SEAT && action.attackName==='Filch');
    const burrowDeclarations = attackDeclarations.filter(action=>
      action.playerSlot===SOURCE_SEAT && action.attackName==='Burrow');
    const copycatEffects = copycatDeclarations.map(attack=>{
      const effect = observed.audit.deckChanges.find(event=>
        event.activeSeat===OWNER_SEAT &&
        event.turnBefore===attack.turnBefore &&
        event.deckDelta[SOURCE_SEAT]===-1 &&
        event.deckDelta[OWNER_SEAT]===0);
      return {
        turn:attack.turnBefore,
        declarationOrdinal:attack.actionOrdinal??null,
        effectObserved:!!effect,
        effectOrdinal:effect?.ordinal??null,
        deckBefore:effect?.deckBefore??null,
        deckAfter:effect?.deckAfter??null
      };
    });
    const turnEvidence = game.copycatTurnStartEvidence ?? [];
    const copycatTurnEvidence = copycatDeclarations.map(attack=>{
      const snapshot = turnEvidence.find(item=>item.turn===attack.turnBefore);
      return {
        turn:attack.turnBefore,
        previousOpponentAttack:snapshot?.previousOpponentAttack?.name??null,
        activeMimikyu:snapshot?.mimikyu?.some(item=>item.location==='active')??false,
        activeMimikyuEnergy:snapshot?.mimikyu?.find(item=>item.location==='active')?.energyPrintings??[]
      };
    });
    return {
      variant,status:game.finished?'native-terminal':'native-cap',
      fullDeal:game.initialFullPhysicalDealFingerprint?.digestSha256??null,
      sourceDeal:game.initialSourceDealFingerprint?.digestSha256??null,
      winner:game.winner,actions:game.actions,turns:game.turns,
      rootLedgerSha256:sha(game.rootActionLedger),
      burrowDeclarations:burrowDeclarations.length,
      burrowTurns:burrowDeclarations.map(action=>action.turnBefore),
      filchDeclarations:filchDeclarations.length,
      filchTurns:filchDeclarations.map(action=>action.turnBefore),
      copycatDeclarations:copycatDeclarations.length,
      copycatTurns:copycatDeclarations.map(action=>action.turnBefore),
      copycatEffects,copycatTurnEvidence,
      copycatTurnStartEvidence:turnEvidence,
      deckAudit:observed.audit,
      terminalTransition:game.terminalTransition??null,
      finalState:game.finalState,
      finalPublicBoard:game.finalPublicBoard??null,
      prizesRemaining:game.prizesRemaining,
      policy:game.policy,
      competitivelyQualified:false
    };
  } catch(error) {
    return {variant,status:'native-error',
      error:String(error?.stack??error).slice(0,4000),
      competitivelyQualified:false};
  }
}

/** @returns {object} Frozen original-deal A/B/A Copycat response experiment. */
function run() {
  initializeCards();
  const cards = originals();
  const old = new Map([
    ['AGENT8_ACTOR_QUICK_BALL_DEV',process.env.AGENT8_ACTOR_QUICK_BALL_DEV],
    ['AGENT41_OWNER_TERMINAL_ARBITRATION_DEV',
      process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV]
  ]);
  try {
    process.env.AGENT8_ACTOR_QUICK_BALL_DEV='false';
    process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV='false';
    const registeredArms = ['control','copycat','control-repeat'];
    const arms = registeredArms.map(variant=>runArm(variant,cards));
    const [a,b,again] = arms;
    const sameDeal = arms.every(arm=>arm.status!=='native-error' &&
      arm.fullDeal===EXPECTED_FULL_DEAL &&
      arm.sourceDeal===EXPECTED_SOURCE_DEAL);
    const exactRepeat = sameDeal && a.status===again.status &&
      a.winner===again.winner && a.actions===again.actions &&
      a.rootLedgerSha256===again.rootLedgerSha256;
    return {
      schema:VERSION,sourceRank:3,referenceRank:1,
      seed:SEED,sourceSeat:SOURCE_SEAT,ownerSeat:OWNER_SEAT,
      actionLimit:ACTION_LIMIT,
      originalSourceSha256:sha(cards.source),
      originalReferenceSha256:sha(cards.candidate),
      nativePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      registeredArms,arms,
      controls:{
        sameOriginalPhysicalDealAllArms:sameDeal,
        exactControlRepeat:exactRepeat,
        copycatPolicyEnabledOnlyInTreatment:b.policy?.includes('MimikyuBurrowCopycatPolicy-v1')??false,
        treatmentUsesCopycat:b.copycatDeclarations>0,
        everyCopycatHasBurrowDeckEffect:b.copycatDeclarations>0 &&
          b.copycatEffects.every(effect=>effect.effectObserved),
        everyCopycatHadBurrowTurnEvidence:b.copycatDeclarations>0 &&
          b.copycatTurnEvidence.every(item=>item.previousOpponentAttack==='Burrow' &&
            item.activeMimikyu),
        controlARepeatMatches:exactRepeat,
        competitiveQualifiedGames:0
      },
      interpretationLimits:'One exact historical native-bot matchup and one opt-in Copycat tactic. The tactic is only a policy counterfactual. No paper-qualified game, field win-rate estimate or 99.5% claim.'
    };
  } finally {
    for(const [key,value] of old) {
      if(value===undefined) delete process.env[key];
      else process.env[key]=value;
    }
  }
}

if(require.main===module) {
  const data=run();
  process.stdout.write(JSON.stringify(data,null,2)+'\n');
  if(data.arms.some(arm=>arm.status==='native-error') ||
    !data.controls.sameOriginalPhysicalDealAllArms ||
    !data.controls.exactControlRepeat ||
    !data.controls.everyCopycatHasBurrowDeckEffect ||
    !data.controls.everyCopycatHadBurrowTurnEvidence) process.exitCode=1;
}
module.exports={VERSION,run,withDeckDispatchAudit};
