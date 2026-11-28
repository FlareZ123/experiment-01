# Public delayed Pale Moon-GX target: actor-boundary and executable retreat slice

**Agent34 | 2026-11-28 | review-only branch `agent34/public-pale-moon-escape-20261128`**. No main merge, native CI, fixture/game, or Stage-A authorization is implied.

## New failure mode and bounded correction

The existing actor-only observation projects visible Pokémon, active and Bench geometry, Energy, damage, Tools, and turn restrictions, but **not** the pinned Twinleaf player's `pendingEndOfTurnEffects`. The specific delayed knockout from an already-announced `Pale Moon-GX` lives in the *affected player's* queue and points to the exact, public defending `PokemonCardList`. Two identical face-up boards therefore can carry different impending end-of-turn consequences that the policy cannot distinguish. This is a different issue from a stale queue surviving a physical switch.

The branch adds:

- `simulation/twinleaf/2026-11/agent34-pale-moon-escape.cjs`: `pendingPaleMoonGXKnockOut(player,slot)` checks only a `knock_out` record from `Pale Moon-GX` whose target is this exact slot. It returns `null` on a missing queue, not a manufactured false. No arbitrary queue object, hidden card, Prize, or hand identity crosses the actor boundary.
- `simulation/twinleaf/actor-observation-contract.cjs`: `publicPlayer` attaches the derived `publicRestrictions.pendingPaleMoonGXKnockOut` tri-state to each face-up Pokémon slot; the standalone `visiblePokemon(slot)` call remains backward compatible.
- `simulation/evaluation/2026-11/agent49-policy-protocol.cjs`: adds a strictly typed **optional** boolean/null field and rejects forged strings/objects, preserving legacy fixture envelopes.
- In the same helper, `choosePaleMoonEscapeRetreat(view,items)` uses only the actor observation plus genuine, offered native root-action tokens. With a **known** queued KO, exactly **one** occupied Bench slot, exactly **one** matching legal `retreat` offer, and **no competing offered action except Pass**, it selects that retreat token. It abstains rather than preempting a setup Trainer, Energy attachment, potentially winning attack, multiple Bench-target choices, or any other playable non-retreat action. It also abstains when the threat is unknown or no retreat exists. A mere possibility of a superior setup action is therefore not silently dominated by the rescue heuristic. This is one concrete tactical decision, not a complete competent worker or a claim that Retreat always dominates resource-building choices.

The dedicated `tests/2026-11/agent34-pale-moon-public-escape.test.cjs` supplies two physical-seat actor-projection controls, public/hidden-zone custody assertions, identical-board/changed-queue separation, a positive native-action-shaped retreat token selection, and hard negatives for absent/unknown threat, no legal retreat, multiple Bench choices, an available attack, or an available Trainer. It is written against the existing host/protocol modules. The **pure helper** was separately executed locally via Node 22 `node --test`: **3/3 groups passed**. **The checked-out repository integration test has not run**; do not call this a pinned Store success.

## Why this matters to the fixed-60 decision

The existing original same-deal rank3-vs-rank1 four-arm experiment demonstrated a legal response with held `Guzma BUS 115` on an actual next owner root after rank1's `Pale Moon-GX`. Switching the threatened defender under the existing paper switch cleanup removed one stale KO and changed rank1's final remaining Prizes from **4 to 6**, though the native winner did **not** change. See [Agent34's actual source-dealt report](../agent34-frozen-skyliner-guzma-gx-paper-switch-20261106.md) and [lifecycle matrix](../agent34-palemoon-temporal-lifecycle-matrix-20261106.md).

Both exact candidate hypotheses (Hood Shield and Lockbridge) have access to source-specific recovery resources; a policy cannot compare a rescue action to passing or development unless it observes the public delayed threat. This slice does not solve `Guzma`'s two owner/opponent `ChoosePokemonPrompt` continuations; the candidate-worker owner must evaluate those prompts using physical Bench identity rather than merely replaying selection ordinals. It also does **not** prove that the sampled state occurs often, that the full host remains privacy-safe under native tests, or that the source-dealt final winner would change.

**Paper-fidelity precondition:** The pinned raw Store incorrectly retains delayed KO through switch/evolve/devolve. The corresponding default-off research cleanup adapters must be applied and independently checked when evaluating those counterlines. Merely detecting the pending queue is insufficient: otherwise the native engine can incorrectly KO a successfully escaped Pokémon.

## Next actual integration decision

Agent46 (two-profile candidate worker) and Agent49/36 (actor host/protocol) should examine this bounded branch before adding new policy branches or a full-game prerequisite. Decide whether to transplant the three-file host/protocol/helper delta into the current authorized worker line with an existing native root→retreat→end-turn continuation and compare the held-out no-threat control. **Do not merge or dispatch from this note alone.** If the existing policy already consumes an authenticated equivalent delayed-KO fact, reject this duplicate; if not, this is an explicit player-information gap whose correction should precede interpreting a Pale Moon response.

Source field remains **29/32**, no frozen final 60, **0/32** qualified Aichi matchups, and no demonstrated 99.5% game win rate.
