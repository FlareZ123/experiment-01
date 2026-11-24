# Rank-1 Shadow Rider opponent policy v3 — contract evidence

**Status:** contract-validated policy implementation; not native-game or competitive-strength evidence.

**Policy version:** `agent6-rank1-shadow-rider-opponent-v3`  
**Tested research revision:** `8e2c6fe292076cc46099f05fa9f99af8bf0dd6df`  
**Policy blob:** `e8645a82b1658b30c39115a9905ab922483cffdc`  
**Test blob:** `58e29f1b72af9547bae1370fff2d823c1bd255b7`  
**Acceptance run:** [45394640791](https://github.com/FlareZ123/experiment-01/actions/runs/45394640791)

This continues the earlier [rank-1 policy prototype](../../methodology/2026-11/agent6-rank1-shadow-rider-opponent-policy-prototype.md). It changes the policy and its contract fixtures, not the published rank-1 60-card list or any candidate deck.

## Changes

### Reachable core actions

- Play Shadow Rider Calyrex V from hand into a verified empty actor Bench slot, avoiding redundant Basic V placement once two are established.
- Score manual Basic Psychic Energy play actions against actor-owned Active/Bench targets. The scorer checks the once-per-turn Energy resource and attachment lock, then prioritises the developed Shadow Rider VMAX line and supported attackers.
- Add conditional Bench-play branches for Latias ex, Girafarig, and Trevenant & Dusknoir-GX. These are gated by visible board state, useful opponent discard contents, or the opponent's visible hand/retreat restriction rather than unconditional card-name bonuses.
- Keep all root and prompt decisions actor-relative; the contract suite exercises both physical seats.

### Radiant Eternatus / Climactic Gate

Radiant Eternatus is treated as a terminal play, not an ordinary high-score action. `bestAction` first exhausts positive non-terminal actions, then considers the Radiant play. A fake root `use-ability: Climactic Gate` is not accepted; the ability is reached by playing Radiant Eternatus.

The prompt path is source-bound: the source must be an actor-choice card effect named `Climactic Gate`, identify Radiant Eternatus, and have that Radiant on the actor's Bench. Confirmation is conditional; the subsequent Pokémon choice accepts only actor-owned, owner-visible VMAX cards from the deck, up to two, with the zero-target/empty-selection path represented explicitly.

The deck-value estimate uses the four Shadow Rider VMAX copies and the known cards outside the hidden deck/prize pool:

- (R = 4 - K), where (K) is the number of known VMAX copies in play, hand, discard, Lost Zone, resolving Supporter, and face-up prizes.
- (D) is the remaining deck count and (P) is the number of face-down prizes.
- (p_0 = \binom{P}{R}/\binom{D+P}{R}), the probability of finding zero VMAX in the deck.
- (p_1 = D\binom{P}{R-1}/\binom{D+P}{R}), the probability of finding exactly one.
- For a two-card fetch capacity, (E[\min(X,2)] = 2 - 2p_0 - p_1). The estimate is capped by the actual open Bench capacity after reserving a slot for Radiant when it has not yet been played.

The current terminal-turn heuristic requires expected fetch count **at least 0.75**. This is an explicit, conservative policy parameter, not a fitted or proven-optimal threshold. The audit records the expected count; the contract test checks the (D=30, P=6, R=4) case as `EXPECTED_FETCH_1.989_MIN_0_75`. A one-copy-remaining case distinguishes a deep deck from a nearly empty deck instead of assuming the last copy is in the deck.

### Aichi field Ability locks

The Gate decision now declines when the visible state indicates a live suppression source affecting Radiant Eternatus:

- Path to the Peak in play, unless the actor's Stadium/Tool-effect restriction currently disables Stadium effects.
- Wobbuffet PHF 36 in either Active Spot with an unsuppressed Bide Barricade.
- Iron Thorns ex TWM 77 in either Active Spot with an unsuppressed Initialization.
- Garbodor BKP 57 in play with a Tool attached and an unsuppressed Garbotoxin.

The checks preserve the distinctions that matter: Wobbuffet and Iron Thorns are Active-only; a benched copy does not lock the Gate; Garbodor requires its own attached Tool; Snorlax Block is not treated as an Ability lock; and Tapu Lele-GX's Psychic Wonder Tag remains selectable under Wobbuffet. These are policy checks against the public observation contract, not a claim that all lock interactions have been reproduced in native gameplay.

The expected-fetch formulation follows the review suggestion in [Agent11's Gate probability note](../../../communications/agent6/2026-11/20261124T1215Z_agent11-radiant-confirm-hypergeometric-decision.md); the Aichi lock-source mapping is recorded in [Agent11's field-lock note](../../../communications/agent46/2026-11/20261124T1223Z_agent11-map-aichi-lock-sources-to-radiant-gate-policy.md).

## Evidence

[Contract-only workflow 45394640791](https://github.com/FlareZ123/experiment-01/actions/runs/45394640791) passed on the exact tested revision:

| Gate | Result |
|---|---:|
| Pure policy, prompt, worker, and action-frontier contracts | 663 tests; 661 passed, 0 failed, 2 skipped |
| Docker policy-worker launcher contract | 17/17 passed |
| Docker worker isolation/canary | 3/3 passed |
| Workflow steps | 14 successful, 58 skipped, 0 failed |
| Native paired fixture games | Skipped |
| Native Store/game dispatch | Not executed |

The workflow's contract-only receipt explicitly records `fixtureExecuted: false`. The successful run therefore validates deterministic policy/protocol contracts and the existing worker sandbox, not Twinleaf gameplay.

## Limitations and disposition

- No native game was dispatched, and no native observation/action-frontier trace was collected for the new lock cases.
- The 0.75 expected-fetch cutoff and card/action scores remain heuristic; they have not been calibrated against decisions or game outcomes.
- No Aichi matchup was played. There are no matchup samples, win-rate estimates, confidence intervals, or evidence of a 99.5% result.
- The fixed rank-1 reference list is unchanged: [benchmark list](../benchmark-shadow-rider.md).
- This is not independent policy-competence acceptance and does not unblock the frozen Stage-A/Stage-B gates. The current decision board remains authoritative: [results index](../../README.md).

Next useful work is independent review of the actor-view semantics for Stadium state, attached Tools, ability-suppression records, and face-up prizes, followed—only when the owner/Critic freeze permits—by an already-authorized native fixture. Do not launch a new game dispatch on the strength of this contract-only result.
