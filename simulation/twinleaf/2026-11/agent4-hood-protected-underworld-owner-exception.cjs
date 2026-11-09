'use strict';
const assert = require('node:assert/strict');
const {
  NEUTRAL_STADIUM_PRINTINGS
} = require('./agent4-thorns-lock-field-neutral-v3.cjs');

const VERSION = 'agent4-hood-protected-underworld-thorns-owner-v1';
const SOURCE = 'Shadow Rider Calyrex VMAX CRE';
const LOCK = 'Iron Thorns ex TWM';
const HOOD = 'Stealthy Hood UNB';
const neutralStadiums = new Set(NEUTRAL_STADIUM_PRINTINGS);

/**
 * The baseline owner's conservative Iron Thorns guard correctly declines
 * unprotected Underworld Door. A Stealthy Hood on the specific source may
 * restore its Ability. Apply this exception only to already face-up, owner-
 * visible and source-verified conditions. Any other lock remains the native
 * Store's responsibility.
 *
 * @param {object} view Detached current actor observation.
 * @param {{benchUnspent?:boolean[]}} receipt Genuine owner used-marker receipt.
 * @returns {number[]} Eligible Bench indices, empty if outside proof scope.
 */
function protectedBenchIndices(view, receipt) {
  if (view?.decisionKind !== 'owner-root') return [];
  const opponent = view.opponentPublic;
  const active = opponent?.active;
  if (active?.printing !== LOCK ||
      !active.abilities?.includes('Initialization')) return [];

  // Avoid treating Tool Jammer or another opponent Tool as inert.
  if (!Array.isArray(active.tools) || active.tools.length !== 0) return [];
  // Original rank-6 Thorns is a pure-Thorns Pokémon inventory. Abstain when
  // any different Bench Pokémon could contribute an additional lock.
  if (!Array.isArray(opponent.bench) || !opponent.bench.every(
    slot => slot === null || slot.printing === LOCK)) return [];

  const own = view.ownPublic;
  const stadiums = [...(own?.stadium ?? []), ...(opponent.stadium ?? [])];
  if (!stadiums.every(name =>
    typeof name === 'string' && neutralStadiums.has(name))) return [];

  const result = [];
  for (let i = 0; i < (own?.bench?.length ?? 0); i++) {
    const slot = own.bench[i];
    if (slot?.printing === SOURCE &&
        slot.abilities?.includes('Underworld Door') &&
        Array.isArray(slot.tools) &&
        slot.tools.length === 1 &&
        slot.tools[0] === HOOD &&
        receipt?.benchUnspent?.[i] === true) result.push(i);
  }
  return result;
}

/**
 * Offer a genuine physically held Hood for a free Tool slot on a Benched
 * source VMAX, under the same deliberately narrow public Thorns matchup.
 * This pays with the original card from the acting owner's hand and leaves
 * native Store attach validity and Tool consumption authoritative.
 *
 * @param {object} view Detached owner-root observation.
 * @param {{toolPrintings:Set<string>}} catalog Exact printed Tool catalog.
 * @returns {object|null} An existing attach-tool-candidate intent.
 */
function chooseHoodToolPreparation(view,catalog) {
  if (view?.decisionKind !== 'owner-root') return null;
  const own=view.ownPublic, opponent=view.opponentPublic;
  const active=opponent?.active;
  if (active?.printing !== LOCK ||
      !active.abilities?.includes('Initialization') ||
      !Array.isArray(active.tools) || active.tools.length !== 0 ||
      !Array.isArray(opponent.bench) ||
      !opponent.bench.every(slot =>
        slot === null || slot.printing === LOCK)) return null;
  const stadiums=[...(own?.stadium??[]),...(opponent.stadium??[])];
  if (!stadiums.every(stadium =>
    typeof stadium === 'string' && neutralStadiums.has(stadium))) return null;
  if (!(catalog?.toolPrintings instanceof Set) ||
      !catalog.toolPrintings.has(HOOD)) return null;
  const candidates=require('../agent18-actor-tool-candidate-frontier.cjs')
    .enumerateActorToolCandidates(view,catalog.toolPrintings);
  return candidates.find(candidate =>
    candidate.printing === HOOD &&
    candidate.slot === 'bench' &&
    own.bench[candidate.index]?.printing === SOURCE &&
    own.bench[candidate.index]?.abilities?.includes('Underworld Door')
  ) ?? null;
}

/**
 * Reuse the original owner hand, target and used-marker logic unchanged.
 * A disposable view masks only the active Thorns suppression, and prevents
 * unhooded VMAX from being selected as a source. Neither the real actor
 * observation nor any Store state is modified.
 *
 * @param {object} view Detached current owner root.
 * @param {object} catalog Actor card-print catalog.
 * @param {{activeUnspent?:boolean,benchUnspent?:boolean[]}} receipt
 * @param {(view:object,catalog:object,receipt:object)=>object|null} chooser
 * @returns {object|null} Original-shaped Underworld root for protected source.
 */
function chooseProtectedHoodUnderworld(view, catalog, receipt, chooser) {
  const indices = protectedBenchIndices(view, receipt);
  if (indices.length === 0) return null;
  assert.equal(typeof chooser, 'function');
  const allowed = new Set(indices);
  const sourceBench = view.ownPublic.bench.map((slot, index) =>
    slot?.printing === SOURCE && !allowed.has(index)
      ? {...slot, abilities:slot.abilities.filter(
        name => name !== 'Underworld Door')}
      : slot
  );
  const active = view.opponentPublic.active;
  const derived = {
    ...view,
    ownPublic:{...view.ownPublic, bench:sourceBench},
    opponentPublic:{
      ...view.opponentPublic,
      active:{
        ...active,
        abilities:active.abilities.filter(name => name !== 'Initialization')
      }
    }
  };
  const root = chooser(derived, catalog, receipt);
  if (root?.kind !== 'use-underworld-door' ||
      root.position !== 'bench' ||
      !allowed.has(root.benchIndex) ||
      root.sourcePrinting !== SOURCE) return null;
  return root;
}

/**
 * Reversible opt-in compatibility wrapper. The ordinary shared owner policy
 * remains unchanged; actual native Store legal/prompt checks still apply.
 *
 * @template T
 * @param {()=>T} work Synchronous native Store experiment.
 * @returns {{result:T,audit:object}}
 */
function withProtectedHoodUnderworld(work) {
  assert.equal(typeof work,'function');
  const module = require('../agent31-underworld-door-owner-frontier.cjs');
  const original = module.chooseUnderworldDoorRoot;
  assert.equal(typeof original, 'function');
  const audit = {
    schema:VERSION, ownerProposals:0, baselineSelected:0,
    protectedSelected:0, originalSixtiesChanged:false,
    privateOpponentRead:false, nativePaperQualifiedGames:0,
    samples:[]
  };
  function guarded(view, catalog, receipt) {
    audit.ownerProposals++;
    const normal = original(view,catalog,receipt);
    if (normal) {
      audit.baselineSelected++;
      return normal;
    }
    const recovered = chooseProtectedHoodUnderworld(
      view,catalog,receipt,original);
    if (recovered) {
      audit.protectedSelected++;
      if (audit.samples.length < 24) audit.samples.push({
        actorSeat:view.actorSeat,globalTurn:view.globalTurn,
        sourcePrinting:recovered.sourcePrinting,
        benchIndex:recovered.benchIndex
      });
    }
    return recovered;
  }
  module.chooseUnderworldDoorRoot = guarded;
  try { return {result:work(),audit}; }
  finally {
    assert.strictEqual(module.chooseUnderworldDoorRoot,guarded);
    module.chooseUnderworldDoorRoot = original;
  }
}

/**
 * Scope the exact native owner-root Tool preparation opt-in to one synchronous
 * experimental branch. It is NEVER active in the shared baseline.
 *
 * @template T
 * @param {()=>T} work
 * @returns {T}
 */
function withHeldHoodToolPriority(work) {
  assert.equal(typeof work,'function');
  const before=process.env.AGENT4_HOOD_TOOL_ROOT_DEV;
  process.env.AGENT4_HOOD_TOOL_ROOT_DEV='true';
  try{return work();}
  finally{
    if(before===undefined)delete process.env.AGENT4_HOOD_TOOL_ROOT_DEV;
    else process.env.AGENT4_HOOD_TOOL_ROOT_DEV=before;
  }
}

module.exports = {
  VERSION,protectedBenchIndices,chooseHoodToolPreparation,
  chooseProtectedHoodUnderworld,withProtectedHoodUnderworld,
  withHeldHoodToolPriority
};
