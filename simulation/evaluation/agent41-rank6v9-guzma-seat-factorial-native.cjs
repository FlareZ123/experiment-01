'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {runMatch, initializeCards} = require('../twinleaf/headless.cjs');
const {planAichi} = require('./aichi-pilot.cjs');
const {withPureNativeSupporterProposal} =
  require('../twinleaf/agent20-native-supporter-proposal-purity.cjs');
const {nativeFirstDifference, digest} =
  require('./agent7-funded-stadium-symmetric-eightgroup-native.cjs');
const REG = require('../../results/aichi-2026/registrations/agent41-guzma-two-seat-native-factorial-20261103.json');

const OUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const native = name => require(path.join(OUT, name));
const sha = value => createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/**
 * Reuse the original tested native purity correction without copying it.
 * The excluded real seat executes the exact pinned original native tactic.
 * Simulator-clone eligibility remains governed by Agent20's live Store guard.
 *
 * @template T
 * @param {()=>T} play Original physical headless match.
 * @param {number[]} seats Registered real seat numbers.
 * @param {object} deps Pinned compiled native classes.
 * @returns {{result:T,audit:object|null}}
 */
function playSeatScoped(play, seats, deps) {
  assert.ok(seats.every(seat => seat === 0 || seat === 1));
  if(seats.length === 0) return {result:play(),audit:null};
  const proto = deps.PlaySupporterTactic.prototype;
  const baseline = Object.getOwnPropertyDescriptor(proto,'useTactic');
  assert.equal(typeof baseline?.value,'function');
  return withPureNativeSupporterProposal(() => {
    const pure = Object.getOwnPropertyDescriptor(proto,'useTactic');
    assert.equal(typeof pure?.value,'function');
    assert.notStrictEqual(pure.value,baseline.value);
    function scoped(state, player, ...args) {
      const target = seats.includes(state.activePlayer) ?
        pure.value : baseline.value;
      return target.call(this,state,player,...args);
    }
    Object.defineProperty(proto,'useTactic',{...pure,value:scoped});
    try {
      return play();
    } finally {
      assert.strictEqual(proto.useTactic,scoped);
      Object.defineProperty(proto,'useTactic',pure);
    }
  },deps);
}

/** @param {object} game */
function summarize(game) {
  if(!game) return null;
  return {
    finished:game.finished,winner:game.winner,actions:game.actions,
    firstTurnSlot:game.firstTurnSlot,
    fullDeal:game.initialFullPhysicalDealFingerprint,
    fullRootSha256:sha(game.rootActionLedger),
    fullDecisionSha256:sha(game.decisionTrace),
    rootActionLedger:game.rootActionLedger,
    decisionTrace:game.decisionTrace,
    attackTrace:game.attackTrace,
    originalControlDigest:digest(game)
  };
}

/**
 * Count actual attacks through turns completed in all observed arms.
 * Fail closed at an unqualified clock reset or an incomplete last turn.
 * This is a descriptive window, not a true paper time-control.
 * @param {object[]} arms Executed game arms.
 */
function commonTurnAttacks(arms) {
  assert.ok(arms.every(a => Array.isArray(a?.result?.rootActionLedger)));
  const firstEpoch = arms.map(a => {
    const ledger = a.result.rootActionLedger;
    const resetAt = ledger.findIndex(root => root.turnAfter < root.turnBefore);
    const prefix = resetAt === -1 ? ledger : ledger.slice(0,resetAt);
    assert.ok(prefix.length);
    return {prefix,resetAt,maxTurn:Math.max(...prefix.map(r => r.turnBefore))};
  });
  const cutoff = Math.min(...firstEpoch.map(e => e.maxTurn)) - 1;
  assert.ok(cutoff >= 0,'No complete common native global turn window');
  return {
    cutoff,epochs:firstEpoch.map(e => ({
      observedMaxTurn:e.maxTurn,resetAt:e.resetAt
    })),
    byArm:arms.map((arm,i) => ({
      arm:arm.id,realAttackRoots:firstEpoch[i].prefix
        .filter(r => r.action==='AttackAction'&&r.turnBefore<=cutoff)
        .map(r => ({
          ordinal:r.actionOrdinal,turn:r.turnBefore,
          seat:r.playerSlot,attack:r.attack??null
        }))
    }))
  };
}

/**
 * @param {object} source Exactly preregistered previously seen physical seed.
 * @param {string[]} rank9 Native original rank9 printed 60.
 * @param {string[]} rank6 Native original rank6 printed 60.
 * @param {object} deps Native engine classes.
 */
function runSeed(source,rank9,rank6,deps) {
  const request = {
    deckA:rank9,deckB:rank6,seed:source.seed,
    maxActions:REG.maxActions,
    strictPromptValidation:true,isolatePolicyRandomness:true,
    captureDecisionTrace:true,captureInitialFullPhysicalDeal:true,
    label:REG.schema+'-'+source.kind
  };
  const arms=REG.armOrder.map(spec => {
    try {
      const output=playSeatScoped(()=>runMatch(request),
        spec.allowedSeats,deps);
      return {id:spec.id,status:'executed',result:output.result,
        audit:output.audit,error:null};
    } catch(error) {
      return {id:spec.id,status:'native-error',
        result:null,error:String(error?.stack??error),
        audit:error?.agent20SupporterPurityAudit??null};
    }
  });
  const [control,rank9Only,rank6Only,both,repeat]=arms;
  const fingerprints=arms.map(arm =>
    arm.result?.initialFullPhysicalDealFingerprint?.digestSha256??null);
  const sameFullDeal=fingerprints.every(x =>
    x!==null&&x===source.originalFullDealSha256);
  const controlSha=control.result?.rootActionLedger ?
    sha(control.result.rootActionLedger):null;
  const bothSha=both.result?.rootActionLedger ?
    sha(both.result.rootActionLedger):null;
  const repeatSha=repeat.result?.rootActionLedger ?
    sha(repeat.result.rootActionLedger):null;
  const repeatDecision=control.result&&repeat.result&&
    sha(control.result.decisionTrace)===sha(repeat.result.decisionTrace);
  const archivedControlReproduced=controlSha===
    source.archivedControlFullRootSha256;
  const archivedBothReproduced=bothSha===
    source.archivedBothFullRootSha256;
  const attackWindow=arms.every(a=>a.result) ?
    commonTurnAttacks(arms):null;
  return {
    kind:source.kind,seed:source.seed,rank9Seat:0,rank6Seat:1,
    statuses:arms.map(a=>({id:a.id,status:a.status,error:a.error})),
    fingerprints,sameFullDeal,
    controlRepeated:controlSha!==null&&
      controlSha===repeatSha&&repeatDecision,
    archivedControlReproduced,archivedBothReproduced,
    rootShas:arms.map(a=>({
      id:a.id,sha:a.result?.rootActionLedger ?
        sha(a.result.rootActionLedger):null
    })),
    firstControlForks:arms.slice(1,4).map(a=>({
      id:a.id,difference:a.result ?
        nativeFirstDifference(control.result,a.result):null
    })),
    originalControlTurn4Gx:!!control.result?.rootActionLedger.some(r=>
      r.action==='AttackAction'&&r.playerSlot===0&&
      r.turnBefore===4&&r.attack==='Horror House-GX'),
    attackWindow,
    arms:arms.map(a=>({
      id:a.id,status:a.status,audit:a.audit,
      error:a.error,result:summarize(a.result)
    })),
    competitiveQualifiedGames:0
  };
}

function run() {
  initializeCards();
  const {Store}=native('game/store/store');
  const {PlaySupporterTactic}=
    native('simple-bot/simple-tactics/play-supporter-tactic');
  const {PlayCardAction}=native('game/store/actions/play-card-action');
  const {TrainerCard}=native('game/store/card/trainer-card');
  const {TrainerType}=native('game/store/card/card-types');
  const {GamePhase}=native('game/store/state/state');
  const deps={Store,PlaySupporterTactic,PlayCardAction,
    TrainerCard,TrainerType,GamePhase};
  const planned=planAichi(6,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const rank6=planned.candidate.cards;
  const rank9=planned.opponents.find(row=>row.rank===9)?.cards;
  assert.equal(rank6?.length,60);
  assert.equal(rank9?.length,60);
  const rows=REG.testData.map(seed=>runSeed(seed,rank9,rank6,deps));
  const allParities=rows.every(r=>
    r.sameFullDeal&&r.controlRepeated&&
    r.archivedControlReproduced&&r.archivedBothReproduced&&
    r.statuses.every(s=>s.status==='executed'));
  return {
    schema:REG.schema,registration:REG,
    enginePin:REG.enginePin,
    runHead:process.env.GITHUB_SHA??null,
    attemptedPhysicalSeeds:rows.length,
    attemptedNativeGames:rows.length*REG.armOrder.length,
    allParities,rows,competitiveQualifiedGames:0,
    limitation:'Retrospective original-deal causal diagnostic. Historical and previously observed fresh seed, weak native bot, unverified paper effect resolution and 90-root cap. No fixed-deck win-rate evidence.'
  };
}
if(require.main===module) {
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  process.stderr.write('AGENT41_GUZMA_SEAT_FACTORIAL '+JSON.stringify({
    seeds:result.attemptedPhysicalSeeds,
    arms:result.attemptedNativeGames,
    parity:result.allParities,
    rows:result.rows.map(r=>({
      seed:r.seed,parity:r.sameFullDeal,
      exactControl:r.archivedControlReproduced,
      exactBoth:r.archivedBothReproduced,
      cutoff:r.attackWindow?.cutoff,
      attacks:r.attackWindow?.byArm.map(a=>({
        id:a.arm,roots:a.realAttackRoots
      }))
    }))
  })+'\n');
  if(!result.allParities)process.exitCode=1;
}
module.exports={run,runSeed,playSeatScoped,commonTurnAttacks};
