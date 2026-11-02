'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const EXPECTED_V11_SHA = 'c5caba34c758bdad80a6dbcdaf6c02c7bc2cebe69c90f31edb5f6f64070e9cbf';

/**
 * A source-only, passive snapshot of the first owner turn.
 * No other player's hidden information is read.
 * @param {object} state Native game state
 * @param {0|1} seat Source physical seat
 * @returns {object|null} Finite, owner-visible prerequisite status
 */
function sourcePrerequisites(state, seat) {
  const owner = state.players?.[seat];
  const opponent = state.players?.[1-seat];
  if (!owner?.active || !opponent?.active) return null;
  const defender = opponent.active.getPokemonCard()?.name;
  const ownActive = owner.active.getPokemonCard()?.name;
  const hasBench = name => owner.bench.some(p => p.getPokemonCard()?.name === name);
  const snapshot = {
    heldCologne: owner.hand.cards.some(c => c.name === 'Canceling Cologne'),
    opponentLocked: defender === 'Iron Thorns ex' || defender === 'Klefki',
    activeMelo: ownActive === 'Meloetta ex',
    benchMelo: hasBench('Meloetta ex'),
    benchKoko: hasBench('Tapu Koko Prism Star'),
    discardLightning2: owner.discard.cards.filter(c => c.name === 'Lightning Energy').length >= 2,
    sourcePhysicalSeat: seat,
    globalTurn: state.turn
  };
  snapshot.benchReady = snapshot.benchMelo && snapshot.benchKoko;
  snapshot.preKokoReady = snapshot.benchReady && snapshot.discardLightning2;
  snapshot.fullV2 = snapshot.heldCologne && snapshot.opponentLocked &&
    (snapshot.activeMelo || snapshot.preKokoReady);
  return snapshot;
}

/** @param {object[]} states @returns {object} */
function summarize(states) {
  const keys = ['heldCologne','opponentLocked','activeMelo','benchMelo',
    'benchKoko','discardLightning2','benchReady','preKokoReady','fullV2'];
  return {nativeSourceRoots:states.length,
    any:Object.fromEntries(keys.map(k=>[k,states.some(s=>s[k])])),
    first:states[0]??null,
    last:states.at(-1)??null};
}

/**
 * Replay the archived v1.1 48-arm cohort, adding owner-only state snapshots.
 * Hooks are restored synchronously even on native exceptions.
 * @returns {object}
 */
function diagnostic() {
  initializeCards();
  const { run } = require('./rank26-natural-pre-koko-cologne-cohort.cjs');
  const { Store } = require(path.join(output,'game/store/store'));
  const { GamePhase } = require(path.join(output,'game/store/state/state'));
  const previous=Store.prototype.dispatch;
  let current=-1;
  const captures=[];
  const observer=function(action,...args) {
    if (action?.constructor?.name==='AddPlayerAction' && action.clientId===101) {
      current++;
      captures.push([]);
    }
    const state=this.state;
    if (current>=0 && state?.phase===GamePhase.PLAYER_TURN &&
        state.turn>=1 && state.turn<=2) {
      const caseIndex=Math.floor(current/2);
      const seat=caseIndex%2===0?0:1;
      const client=seat===0?101:202;
      if (action?.clientId===client && state.activePlayer===seat &&
          !state.prompts?.some(p=>p.result===undefined)) {
        const snapshot=sourcePrerequisites(state,seat);
        if(snapshot)captures[current].push(snapshot);
      }
    }
    return previous.call(this,action,...args);
  };
  Store.prototype.dispatch=observer;
  let cohort;
  try { cohort=run(); }
  finally {
    const installed=Store.prototype.dispatch;
    Store.prototype.dispatch=previous;
    assert.equal(installed,observer,
      'Native Store observer was replaced unexpectedly');
  }
  assert.equal(current,47,'Expected exactly 48 native Store games');
  assert.equal(captures.length,48);
  assert.equal(cohort.cases.length,24);
  const cohortText=JSON.stringify(cohort,null,2)+'\n';
  const cohortSha=crypto.createHash('sha256').update(cohortText).digest('hex');
  const cases=cohort.cases.map((c,i)=>{
    const left=summarize(captures[2*i]);
    const right=summarize(captures[2*i+1]);
    return {repeat:c.repeat,slot:c.slot,sourceSeat:c.sourceSeat,
      sourceFirst:c.control.sourceActuallyFirst,
      physicalPair:c.dealDisposition,
      firstTurnControl:left,firstTurnVariant:right,
      sourceActionTraceEqual:JSON.stringify(c.control.sourceActions)===
        JSON.stringify(c.variant.sourceActions),
      terminalClassificationEqual:c.control.engineTerminal===c.variant.engineTerminal &&
        c.control.engineWinner===c.variant.engineWinner &&
        c.control.actionCapped===c.variant.actionCapped};
  });
  const eligible=cases.filter(c=>c.sourceFirst);
  const keys=['heldCologne','opponentLocked','activeMelo','benchMelo',
    'benchKoko','discardLightning2','benchReady','preKokoReady','fullV2'];
  const tallies=Object.fromEntries(keys.map(k=>[k,
    eligible.filter(c=>c.firstTurnVariant.any[k]).length]));
  return {
    schema:'agent3-rank26-owner-visible-root-prerequisites-v1.2',
    diagnosticClassification:'retrospective same-physical-seed replay',
    expectedBaselineJsonSha256:EXPECTED_V11_SHA,
    replayBaselineJsonSha256:cohortSha,
    exactV11JsonReplay:cohortSha===EXPECTED_V11_SHA,
    sourceDeckDigest:cohort.sourceDeckDigest,
    opponentDeckDigest:cohort.opponentDeckDigest,
    engineRevision:cohort.engineRevision,
    repeatRange:cohort.repeatRange,
    summary:{sourceDeals:24,developmentArms:48,
      physicalMatches:cases.filter(c=>c.physicalPair==='EXACT_SOURCE_DEAL_MATCH').length,
      actualSourceFirst:eligible.length,
      sourceFirstVariantRootCounts:eligible.map(c=>c.firstTurnVariant.nativeSourceRoots),
      sourceFirstGateHitCounts:tallies,
      controlVariantActionParity:cases.filter(c=>c.sourceActionTraceEqual).length,
      controlVariantTerminalParity:cases.filter(c=>c.terminalClassificationEqual).length,
      competitiveQualifiedGames:0},
    cases
  };
}

module.exports={sourcePrerequisites,summarize,diagnostic};
if(require.main===module)
  process.stdout.write(JSON.stringify(diagnostic(),null,2)+'\n');
