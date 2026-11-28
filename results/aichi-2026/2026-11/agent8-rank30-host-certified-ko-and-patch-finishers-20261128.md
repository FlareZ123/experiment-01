# Rank-30 source policy: an executable Raihan route without weakening the shared V3 wire contract

**Agent 8 — 28 November 2026.** This is a scoped opponent-model implementation, not a candidate deck change, native match result or performance estimate.

## The missed attack that an energy-search bridge restores

The original Aichi rank-30 Clefairy source list has **2 Raihan, 4 Wondrous Patch** and secondary attackers Latias ex and Tapu Lele-GX. Prior research recognized that a single Basic Psychic could turn a powered Latias or Lele into an immediate knockout. The **actual policy roots and prompt choices**, however, still had two real disconnects:

1. Before this work, `raihanOpportunity` considered only Clefairy energy deficits. A hand with legal offered Raihan, a supported opponent-turn KO, Basic Psychic in discard and a two-Psychic Latias facing 280-HP Dragon Regidrago VSTAR had no usable Raihan **root**, even though the later AttachEnergyPrompt selector already preferred the Latias line. The worker now recognizes the exact missing third Psychic or Lele's second Energy and selects the actual offered Raihan root. Bench variants require certified free retreat, unused retreat and known active board. The subsequent V3 `AttachEnergyPrompt` selects that exact card and target. The deck-search continuation also selects **Sky Field** when a verified hand of Basic bodies allows a funded Clefairy to convert a 160-damage Full Moon Rondo to a 220-damage terminal knockout in the current turn.

2. The shared `agent49-policy-protocol.cjs` V3 event receipt explicitly permits **only** `priorOpponentTurnKO:{any,byAttack}` and rejects a turn property. However, the existing rank30 policy's freshness guard and its `previousTurnResponseOptions` required `priorOpponentTurnKO.turn===globalTurn-1`. Thus **no incoming fully V3-conformant receipt could enable a normal Raihan action**. Merely trusting the boolean would introduce a serious stale-KO bug when the opponent took an additional no-KO turn. These defects mattered more than improving a hypothetical rare utility card.

## Scope-safe resolution

`simulation/twinleaf/agent8-rank30-ko-receipt-bridge.cjs` is a **research-owned, host-only** adapter. A host must install the existing `agent8-ko-turn-tracker.cjs` turn observer from the game start, validate the **original inbound V3 request** with the real `agent49-policy-protocol.cjs` before policy dispatch, and then call `bindHostVerifiedLastOpponentKO(request,{tracker,ownerPlayerId,opponentPlayerId})`. The bridge itself repeats `validatePublicEventReceipt` on the inbound V3 receipt, takes a fail-closed `snapshotLastOpponentTurn` from the observer, and prepares a separate, private policy-only request with `hostAuthenticatedPriorOpponentTurnKO`. The original V3 receipt remains unmodified.

The worker and `previousTurnResponseOptions` can read only this exact host certificate or a separately stamped direct-test fixture. The certificate contains the turn of the **actual latest completed opponent-owned turn**, even across consecutive turns. It rejects mismatched actor/observation turns, invalid version, missing ownership, missing/interrupted history, and replay across turns. If the latest opponent turn has no KO, a prior native KO boolean that remained true cannot trigger Raihan. An opponent's **nonattack KO** still qualifies, correctly reflecting Raihan's printed wording.

The enriched private request **intentionally fails V3 validation if echoed onto the wire**. No shared protocol file has been altered. This is not installed in any owner runner, and it is not a reason to weaken V3 validation or declare an otherwise unsupported game valid. Native same-Store transition testing and owner authorization are mandatory before this opt-in host adapter can be deployed.

## Source-card attack continuation now usable in opt-in paths

The direct `raihanAttachPrompt` now ranks a real same-turn Latias Eon Blade or Lele Energy Drive KO above a normal Clefairy second attachment; it falls back when Fairy Zone is disabled, damage is insufficient, an Energy target is not actor-owned, the KO history is stale, or a free retreat has already been spent.

The original four Wondrous Patch copies can also accelerate **Benched Psychic Pokémon** by attaching Basic Psychic from the discard. The opt-in `patchPrompt` now tests actual actor-visible targets: a two-Psychic Latias can receive the third Psychic and use Eon Blade for 400 to an unprotected Dragon target after a legitimate free retreat, and a one-Psychic Lele can receive the second for a certified Energy Drive knockout. These future lines are valued ahead of a generic Clefairy attachment **only** if a live zero-cost retreat is publicly certified and unused. An invalid target or suppressed Skyliner falls back to the existing Clefairy priority.

**Important operational boundary:** `enablePatchProjection:true` remains a developer-only annotated config rejected by the ordinary shared V3 policy initializer. The worker continues to abstain on Patch in normal V3. The new priority is useful only after the owner explicitly admits a matching pinned research hook, with a separate native no-game proof.

## Reproducible decision evidence

All test source files and implementation reside on isolated branch `agent8/rank30-gust-psychic-weakness-20261128`, not the nominated candidate's mainline:

- **281/281 constructed rank30 worker decisions pass** across nine `simulation/evaluation/2026-11/agent8-rank30-*.test.cjs` suites, executing the real fetched JavaScript source with an isolated V8 CommonJS `node:test` shim. This includes genuine V3 `validatePrompt` and `validateDecision` for source-compatible Raihan, Cruel Arrow, Tapu Cure-GX and Wondrous Patch prompts, and synthetic follow-up state transitions for attach→retreat→attack. The newest Wondrous Patch suite contributes **10/10**, Raihan source-root and Sky Field search cases **6/6**.
- **18/18 additional host KO-bridge constructed tests pass**, including two seats, extra own/opponent turns, stale native booleans, unknown and nonattack KO causes, multiple KOs, replay, incomplete turn history and rejected private certificate spoofing. `simulation/twinleaf/agent8-rank30-ko-receipt-bridge.test.cjs`.
- **13/13 turn-owner KO Store-observer constructed tests** previously passed in `simulation/twinleaf/agent8-ko-turn-tracker.test.cjs`.
- These are **not** native Store/hook integration, actual match gameplay, Aichi Top32 results, sampled game win rates or proof of 99.5%. The original rank30 source 60 and current nominated fixed 60 remain unchanged.

## Unresolved highest-value native tests

1. Under independent owner approval, test the original V3 request → Store turn-owner observer → internal KO bridge → real Raihan root→Raihan discard attachment→Sky Field search, with opponent extra-turn no-KO negative control. Do not weaken actor visibility or public V3 validation.
2. Under separately approved native opt-in Patch hook, test the actual Wondrous Patch root→Energy attachment prompt→free retreat→Eon Blade/ Energy Drive resolve in one pinned Store, with suppressed Skyliner negative control.
3. Reuse existing `agent46-mimikyu-apex-flattened-hook.cjs` and associated pinned-native research rather than reimplementing the already-investigated Mimikyu Copycat→Apex Dragon engine gap. The rank30 worker does **not** yet claim this route; it remains subject to distinct actor receipt/copy session proof and hook admission.
4. The overarching deck target remains **one fixed legal 60 against all 32 Aichi decks**. This contribution strengthens one *opponent* policy so future candidate tests cannot inflate performance through unrealistic adversary decisions. It is not evidence of reaching any positive win-rate threshold.

**Files:** `simulation/twinleaf/agent8-rank30-ko-receipt-bridge.cjs`, `simulation/twinleaf/agent8-rank30-ko-receipt-bridge.test.cjs`, `simulation/twinleaf/agent8-ko-turn-tracker.cjs`, `simulation/twinleaf/agent8-ko-supporter-options.cjs`, `simulation/evaluation/2026-11/agent8-rank30-clefairy-opponent-policy.cjs`, `simulation/evaluation/2026-11/agent8-rank30-raihan-secondary-attach.test.cjs`, `simulation/evaluation/2026-11/agent8-rank30-wondrous-patch-finisher.test.cjs`.
