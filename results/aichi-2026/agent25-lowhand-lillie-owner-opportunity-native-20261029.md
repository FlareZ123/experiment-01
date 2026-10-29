# Agent 25: owner-held Lillie's Determination, negative native low-hand intervention

**29 October 2026.** Development-only original-Store comparison of a single player-information-safe Supporter decision rule. This is a **failed exposure test**, not evidence that Lillie's Determination is weak or that an unchanged deck won any paper match.

## The qualification problem

The preceding [32-arm frozen canonical scout](agent41-prospective-canonical-scout-native-20261029.md) recorded **zero candidate Supporter plays across 339 accepted candidate PlayCardAction roots**, using two published/reference 60-card inventories against the rank-6 and rank-11 Aichi source decks. That is a demonstrable decision-policy coverage gap, although the archived action log alone does not tell whether a particular Supporter was held and legally playable.

Two copies of **Lillie's Determination** are printed in both the champion reference and New Moon Lockbreaker candidate. A cautious new actor-owned rule was therefore inserted after existing Basic Pokémon Bench and Energy attachment priorities but before the first payable printed attack. It proposes exact printing `Lillie's Determination M1L` only when the owner holds it, has an Active Pokémon, has **at most three cards in hand**, at least eight cards left in deck, a live unspent/unlocked Supporter permission, and is beyond the first player's initial turn. The proposed card is sent to the original pinned Store; no speculative native game State or opposing hidden hand/card identities enter the selector. This rule is **opt-in and default OFF** (`AGENT25_LOWHAND_LILLIE_DEV`). An independent observer (`AGENT25_LOWHAND_LILLIE_CENSUS_DEV`) records the reason each real owner root does or does not satisfy this narrow gate.

This is a deliberately conservative *candidate policy*, with an arbitrary `hand <=3` heuristic. Its threshold is neither an optimality proof nor a claim that a positive Store dispatch fully resolves the printed shuffle-draw. Native public-zone expenditure and Supporter quota are separately checked. A stronger [Agent24 read-only Lillie native prompt settlement witness](../../simulation/twinleaf/agent24-native-lillie-settlement-audit.cjs) has since been developed on main, but was not part of these archived games.

## Executed identical-deal native comparison

[Manual compiled regression CI 40944154820](https://github.com/FlareZ123/experiment-01/actions/runs/40944154820) and [paired genuine original-Store CI 40944601121](https://github.com/FlareZ123/experiment-01/actions/runs/40944601121) succeeded using the existing `supporter-decision-regression.yml`, no push-triggered workflow. Source-aligned native archive: [artifact 12929241054](https://github.com/FlareZ123/experiment-01/actions/runs/40944601121/artifacts/12929241054), ZIP SHA256 `5f9ff6ce455e5b1c513b7ba88f746f723d2d47df7244329865b238df0be5a5e7`. The artifact contains complete control/treatment games and `agent25-lillie-native-pair-audit.json`.

- **Pinned Twinleaf:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- **Same exact source rank, registered historical seed, seat and 60-card inventory per pair:** two rank-6 and two rank-11 trial identities; each repeats once with Lillie selection OFF and once ON, for eight native games total. Both actor seats use the same root rule, without a candidate-only exemption.
- **Source deals and first player:** 4/4 pairs identical. **Complete accepted root-action ledger SHA256:** 4/4 pairs identical. The opt-in did not change native play in this cohort.
- **Outcomes:** rank-6 champion reference terminal (51 accepted root records), rank-6 New Moon terminal (200), rank-11 champion reference capped (260), rank-11 New Moon capped (260), in *both* conditions. These terminal labels are weak-bot engine results; neither condition produced any competitive-qualified game.

| Historical scenario | Authenticated owner roots (control) | Held Lillie root observations | Exclusion when held | Actual Lillie selections |
| --- | ---: | ---: | --- | ---: |
| Rank 6, champion reference | 9 | **1** | Hand too large, 8 cards | 0 |
| Rank 6, New Moon | 56 | **0** | No held-Lillie observation | 0 |
| Rank 11, champion reference | 68 | **19** | Hand too large, 12–16 cards | 0 |
| Rank 11, New Moon | 63 | **10** | Hand too large, 17–24 cards | 0 |
| **Total** | **196** | **30** | **30/30 above threshold** | **0** |

These **196 owner-root observations and 30 held observations are repeated decision reads, not independent starting deals, turns, games or legal-play opportunities**. All 30 held observations had adequate deck availability but failed the strict hand-size screen. The one champion rank-6 window appeared at global turn 7. The rank-11 held windows appeared much later (global turns 27–51). **Eligible roots: zero in both control and treatment; physically attested Lillie expenditures: zero; settled native Lillie events: zero.** The observer made no gameplay changes.

A previous [compiled identical-deal paired run 40943013353](https://github.com/FlareZ123/experiment-01/actions/runs/40943013353), with observer disabled, independently returned zero proposals and equal four root-action fingerprints. The new census identifies *why* that initial negative result occurred rather than creating a post hoc policy victory.

## Interpretation and next falsification

The narrow rule is **not meaningfully exercised by these four historically selected deals**. Relaxing the threshold to force an intervention would risk trading 8–24 held cards, including possible one-off tactical resources, for six or eight shuffled draws without any demonstrated benefit. That would violate the intended Active Move Realism/strategic resource accounting in [human-developed prior concepts](../../resources/human_concepts.md) if applied uncritically. In particular, all large-hand states deserve case-by-case action comparison and resource analysis before deciding that Lillie is an improvement.

The census also exposes the more important deficiency: the same old common policy **accumulates substantial unplayed cards late in rank-11 games** while spending up to the 260-root cap. A stronger policy should first make legal, consequential plays from owner-held resources, with realistic Supporter contention, exact discard cost and target witness. Next, preregister fresh independent physical deals, retain all policy errors and censored games, and test a paper-justified draw tactic only when its expected resource value and opportunity cost warrant it. Do not use these historical engine terminal labels as a win-rate denominator.

**Reproduction:** `simulation/twinleaf/agent25-lowhand-lillie-frontier.cjs`, `agent34-actor-only-root-policy.cjs`, `agent5-owner-root-slice.cjs`; `simulation/evaluation/agent25-lowhand-lillie-paired-audit.cjs`; `tests/agent25-lowhand-lillie-root.test.cjs` and `tests/agent25-lowhand-lillie-paired-audit.test.cjs`; existing manual workflow `supporter-decision-regression.yml` with input `agent25_lowhand_lillie_pair=true`. Full evidence archived in the above CI artifact and draft [PR #12](https://github.com/FlareZ123/experiment-01/pull/12).

**Status:** All paired native executions and assertions passed. **Zero demonstrated 99.5%, zero qualified tournament games, and no measured competitive benefit for this Lillie policy.**
