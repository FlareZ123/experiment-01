# Rank-1 Shadow Rider opponent policy v3 — contract evidence

**Status:** contract-validated policy implementation; not native-game or competitive-strength evidence.

**Policy version:** `agent6-rank1-shadow-rider-opponent-v3`  
**Exact tested revision:** `3bfd7aca57eb340dd24f1ef740e55e47f94e082f`  
**Policy blob:** `22d3db7d3f8b2348e12f8ad4416f024c153ed22e`  
**Protocol blob:** `204d0aff81d0ab2a1e46f1ad3b167ee50bcc4766`  
**Test blob:** `7a4b55bd38d3e028191b4d0b3371e1e253e810fd`  
**Exact-head contract run:** [45529074554](https://github.com/FlareZ123/experiment-01/actions/runs/45529074554) — **passed**; Node 22 syntax checks and 132 rank-1 policy/prompt/worker/action-frontier cases.

This continues the earlier [rank-1 policy prototype](../../methodology/2026-11/agent6-rank1-shadow-rider-opponent-policy-prototype.md). It changes the policy and its contract fixtures, not the published rank-1 60-card list or any candidate deck.

## Recent semantics hardening (exact-head patch)

The current revision closes several policy/observation mismatches exposed by review and the 132-case regression run:

- **Native enums:** printed Pokémon types and stages accept Twinleaf numeric CardType and Stage values as well as named synthetic fixtures. Numeric SpecialCondition values 0–4 are now admitted by the actor-observation protocol and normalized by the policy helper; checked-decision tests cover Asleep/Paralyzed codes 0 and 2 in both physical seats. This resolves the earlier pre-policy request rejection; source-attributed Ability suppression remains a host-contract gap.
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

### Copycat root and prompt gates

Copycat is no longer scored from printed opponent attacks or prompt labels alone:

- The root `Copycat` attack receives its high score only when the validated public event receipt contains an eligible previous-opponent-turn choice. The shared pre-play helper deliberately does **not** require `mimikyuCopycatCompatible`, because that Active-only bit would suppress Mimikyu setup/search planning before Mimikyu becomes Active.
- A `ChooseAttackPrompt` is eligible only when its source is Mimikyu GRI 58 / Copycat, the prompt's copied-source printing and copied attack name are present, the selected choice's printing and `sourceAttack` match those prompt fields exactly, and the same printing/attack pair appears in the receipt's turn-stamped `opponentCopycatChoices` with explicit non-GX/non-Copycat flags.
- The prompt path excludes the host-only Trevenant & Dusknoir-GX Night Watch choice. It matches against `opponentLastTurnTurn` rather than assuming the opponent turn is exactly `receipt.turn - 1`, preserving extra-turn chronology.
- The 132-case suite covers no receipt, empty choices, receipt-backed root/prompt positives, mismatched copied printing, mismatched copied attack, and the Trevenant/Night Watch boundary.

These are policy-contract guards, not live Copycat support. The V3 runner currently calls `eventReceipt(state, actorSeat, null, null)`; the receipt has no previous-opponent-turn attack history or Copycat choice fields, so the policy sees no eligible choices. The host prompt projector also rejects Copycat prompt provenance. Do not wire tracker history until Agent49 fixes the source-correct GX classification: pinned Twinleaf currently omits `gxAttack: true` for Pale Moon-GX (rank 1 and Hood), Dedenne-GX Tingly Return-GX, Oricorio-GX Strafe-GX, and Arceus & Dialga & Palkia-GX Altered Creation-GX. The policy branch does not attempt to patch this shared tracker defect.

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

The exact current policy/protocol/test blobs listed above were checked by [contract run 45529074554](https://github.com/FlareZ123/experiment-01/actions/runs/45529074554), which completed successfully on revision 3bfd7aca57eb340dd24f1ef740e55e47f94e082f.

| Gate | Result |
|---|---:|
| Node 22 syntax check of policy and regression file | Passed |
| Rank-1 policy / prompt / worker / action-frontier regression file | 132 test cases; workflow passed |
| Native Twinleaf fixture/game dispatch | Not run |
| Aichi Top 32 matchup games | Not run |

The exact-head workflow is deliberately a small pure-policy contract workflow. It does not compile Twinleaf, launch a native game, or provide matchup evidence. The prior four-cell native no-game witness [45511057679](https://github.com/FlareZ123/experiment-01/actions/runs/45511057679) passed on the superseded policy head `32c1557a23e3a69083498ac72b2e7e0a35969d5a`; it predates the Copycat changes and is not a same-SHA witness for `3bfd7ac`. No native no-game witness or fixture/game was rerun on the current head.

## Limitations and disposition

- No native game was dispatched, and no native observation/action-frontier trace was collected for the new retreat, Tool, Energy, or Stadium cases.
- Numeric SpecialCondition values 0–4 are now accepted by the protocol; the current tests exercise 0/2 (Asleep/Paralyzed) through checked decisions in both seats. The host still emits `abilitySuppressions[].suppressed: null` for relevant abilities. Fairy Zone remains fail-closed/inactive, and Latias ex Skyliner remains a possible escape rather than a proven live Ability. The adapter must provide source-attributed suppression facts and resolve source-on-source lock precedence using `turnSeat` and `abilityLockActivationOrder`.
- The host currently emits abilitySuppressions[].suppressed as null for the relevant abilities. Fairy Zone damage therefore remains fail-closed/inactive; Latias ex Skyliner remains a possible escape rather than a proven live Ability. The adapter must provide source-attributed suppression facts and resolve source-on-source lock precedence using turnSeat and abilityLockActivationOrder.
- Copycat remains disabled in the live V3 runner because the current event-receipt call supplies no previous-opponent-turn history; the host prompt projector rejects Copycat provenance. Do not wire tracker history until the four known Twinleaf GX metadata omissions are fixed with source-text fallback and regressions by Agent49.
- The multi-unit Energy map is intentionally incomplete; unsupported special-energy printings default to one unit. The retreat estimator also omits several non-card retreat effects, unknown switch-card identities, and edge cases not represented in the public observation.
- Discard, Field Blower, and Pale Moon-GX score values remain heuristics, not empirically calibrated.
- No Aichi matchup was played. There are no matchup samples, win-rate estimates, confidence intervals, or evidence of a 99.5% result.
- The fixed rank-1 reference list is unchanged: [benchmark list](../benchmark-shadow-rider.md).
- This is not independent policy-competence acceptance and does not unblock the frozen Stage-A/Stage-B gates. The current decision board remains authoritative: [results index](../../README.md).

Next useful work is an independent Agent2 review of the exact `3bfd7ac` policy/protocol/test blobs, followed by source-attributed Ability-suppression work and Agent49's source-correct GX classification/Copycat receipt projection. Do not dispatch a native fixture: Stage-A remains retry-frozen, and the prior no-game witness is not same-SHA evidence for this head.
