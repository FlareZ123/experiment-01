# Rank-1 Shadow Rider opponent policy v3 — contract evidence

**Status:** contract-validated policy implementation; not native-game or competitive-strength evidence.

**Policy version:** `agent6-rank1-shadow-rider-opponent-v3`  
**Exact tested revision:** `6c7dbde71a5a21de1f272f571d74e61f3e296150`  
**Policy blob:** `11a2b633cd3fecead2df0946264d62aced86ac39`  
**Test blob:** `42c9903b59361a8f72e457f8bbf7dd52bd0f6764`  
**Exact-head contract run:** [45496803806](https://github.com/FlareZ123/experiment-01/actions/runs/45496803806) — **passed**

This continues the earlier [rank-1 policy prototype](../../methodology/2026-11/agent6-rank1-shadow-rider-opponent-policy-prototype.md). It changes the policy and its contract fixtures, not the published rank-1 60-card list or any candidate deck.

## Recent semantics hardening (exact-head patch)

The current revision closes several policy/observation mismatches exposed by review and the 122-case regression run:

- **Native enums:** printed Pokémon types and stages now accept Twinleaf numeric CardType and Stage values as well as named synthetic fixtures. Numeric special-condition values are also understood by a policy helper, but the current policy protocol still rejects numeric specialConditions before the policy receives an observation; that remains a host-contract issue.
- **Energy units:** Energy Drive now counts Energy units on the two Active Pokémon, not attached Energy-card count, and ignores Benched Energy. The current adapter accounts for implemented multi-unit special-energy cases: Double Dragon, Double Colorless, Double Turbo, Twin, Triple Acceleration, Double Rainbow, Counter, Reversal, Scramble, Upper, Ignition, Boost, R, Aqua, Magma, Miracle, Rapid Strike, and Team Rocket's Energy. Unsupported special-energy printings still fall back to one unit; this is not a complete Expanded Energy rules engine.
- **Retreat and Pale Moon-GX:** the public retreat estimator handles Asleep/Paralyzed, Boost Energy's retreat restriction, special-Energy units, Float Stone / Air Balloon / U-Turn Board while their effects may be live, and Latias ex's Skyliner when its suppression status is explicit. Unknown Skyliner or Tool status is treated as a possible escape and reduces Pale Moon's trap score; it is not silently converted into a guaranteed retreat or guaranteed lock.
- **Tool/Stadium effects:** Field Blower does not target a Tool known to be disabled by the global epoch, Jamming Tower, or Tool Jammer on the relevant Active Pokémon. When the prompt omits the exact Tool attachment slot, a potentially effective opponent Tool remains selectable; a known-disabled Tool does not. Path to the Peak / Silent Lab are selected from explicit opponent-owned prompt choices unless the Stadium/Tool epoch is known to suppress their effects.
- **Dimension Valley:** the cost discount is applied only when the Stadium is present and its effect is known live; a suppressed or unknown Stadium epoch does not grant the discount.
- **Quick Ball / Get Lost:** malformed mandatory Quick Ball discard prompts abstain with the protocol-supported NO_SUPPORTED_CARD_SELECTION reason instead of falling through to generic deck-search scoring. Get Lost is not selected against an empty opponent discard, and Girafarig is considered a retreat-to attacker only when it has a legal attack cost and a non-empty discard target.

The changes remain policy-side estimates over the actor observation. They do not prove native Twinleaf or paper-rule correctness for untested card interactions.

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

The exact current policy/test blobs listed above were checked by [contract run 45496803806](https://github.com/FlareZ123/experiment-01/actions/runs/45496803806), which completed successfully on revision 6c7dbde71a5a21de1f272f571d74e61f3e296150.

| Gate | Result |
|---|---:|
| Node 22 syntax check of policy and regression file | Passed |
| Rank-1 policy / prompt / worker / action-frontier regression file | 122 test cases; workflow passed |
| Native Twinleaf fixture/game dispatch | Not run |
| Aichi Top 32 matchup games | Not run |

The exact-head workflow is deliberately a small pure-policy contract workflow. It does not compile Twinleaf, launch a native game, or provide matchup evidence. The earlier broader contract-only run [45394640791](https://github.com/FlareZ123/experiment-01/actions/runs/45394640791) covered the prior 110-test baseline and worker/Docker checks; it is historical baseline evidence, not validation of the current source/test blobs.

## Limitations and disposition

- No native game was dispatched, and no native observation/action-frontier trace was collected for the new retreat, Tool, Energy, or Stadium cases.
- The host actor-observation contract still exposes specialConditions as numeric Twinleaf enum values while the policy protocol validates them as strings. The policy helper handles numeric values, but the protocol must normalize or admit the enum values before those states can be exercised through a validated worker request.
- The host currently emits abilitySuppressions[].suppressed as null for the relevant abilities. Fairy Zone damage therefore remains fail-closed/inactive; Latias ex Skyliner remains a possible escape rather than a proven live Ability. The adapter must provide source-attributed suppression facts and resolve source-on-source lock precedence using turnSeat and abilityLockActivationOrder.
- The multi-unit Energy map is intentionally incomplete; unsupported special-energy printings default to one unit. The retreat estimator also omits several non-card retreat effects, unknown switch-card identities, and edge cases not represented in the public observation.
- Discard, Field Blower, and Pale Moon-GX score values remain heuristics, not empirically calibrated.
- No Aichi matchup was played. There are no matchup samples, win-rate estimates, confidence intervals, or evidence of a 99.5% result.
- The fixed rank-1 reference list is unchanged: [benchmark list](../benchmark-shadow-rider.md).
- This is not independent policy-competence acceptance and does not unblock the frozen Stage-A/Stage-B gates. The current decision board remains authoritative: [results index](../../README.md).

Next useful work is to repair the actor-observation/protocol mismatch for numeric special conditions and source-attributed Ability suppression, then independently review the exact current policy/test blobs. Only after the owner/Critic freeze permits should an already-authorized native fixture be run; do not launch new game dispatch on the strength of this contract-only result.
