# New Moon Secret Box: three-card discardability sensitivity

**Agent 1, 18 October 2026. Evidence tier: exact finite-population mathematics, independently enumerated from two different sampling representations, source-locked 60, and passing manual regression CI.** This is an optimistic, deliberately state-conditioned access analysis. It does not estimate legal automatic play, matchup strength, or a win rate.

## Why the previously reported 34.39285% route needs a cost filter

The frozen [New Moon Lockbreaker v1](new-moon-lockbreak-60-candidate.md) (English-equivalent 60 SHA-256 `a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4`) carries **two Field Blower** and **one Secret Box**. The [earlier exact resource analysis](new-moon-secret-box-garbotoxin-access.md) found 24.3764594% direct first-eight Field Blower visibility and an exclusive 10.0163951-percentage-point contribution when Secret Box was visible but Blower was not, while an unprized Blower remained searchable. The sum, 34.3928545%, implicitly treats three-card Secret Box discarding as frictionless.

Secret Box requires **three other hand cards to be discarded before its search effect**. A candidate facing an early Tool-equipped rank-11 Garbodor might have critical Basics, its sole Gengar & Mimikyu-GX attack payload, Energy, its Powerglass attack bridge, and singleton Stage-specific resources. Physical card quantity alone does not establish strategically acceptable discard targets. The *Discard Capable Index* and *Active Move Realism* concepts in [the human strategic research](../../resources/human_concepts.md) suggest modeling this state dependence.

## Explicit counterfactual definition

The 60 contains **17 starting-eligible Basic Pokémon, two Field Blower, one Secret Box, and 40 other non-Basic cards**. Deal seven cards conditioned on at least one Basic, set six uniform unknown Prizes, then take the first ordinary draw. Ignore opponent mulligan bonus cards.

For a hypothetical designated discard pool of `D` **specific physical card copies among those 40 non-Basics**, count the joint event:

1. No Blower among the first eight observed cards.
2. Secret Box among those eight.
3. At least **three designated copies** among those eight, available as hypothetical discards.
4. At least one Blower remains outside the six Prize cards.

A starting Basic is reserved for the Active Spot, and **all other Basic Pokémon are protected from discarding** in this model. Designated non-Basics are counted as still held, even if realistic play would already have spent them. A designated card is *hypothetically acceptable* for cost payment by assumption; its strategic cost, whether three cards remain in hand after sequencing, and their real DCI are unproven.

The event is an **optimistic necessary-access screen for its specified set of sacrificial cards**. The original no-cost Secret Box resource result is retained as a looser upper bound. Neither is a whole-deck search-access or win probability.

## Exact results

| Hypothetical designated discard pool | Eligible copies `D` | Exclusive Secret Box→Blower access | Total direct Blower or cost-screened Box |
| --- | ---: | ---: | ---: |
| None protected as acceptable | 0 | **0.00000%** | **24.37646%** |
| Battle VIP Pass and Canceling Cologne | 6 | **0.16968%** | **24.54614%** |
| Plus Rescue Carrier and Ace Trainer | 10 | **0.82582%** | **25.20228%** |
| Plus Sky Field and Path to the Peak | 14 | **2.00757%** | **26.38403%** |
| Plus Lillie's Determination | 16 | **2.75192%** | **27.12838%** |
| Every other non-Basic card, including indispensable resources | 40 | **9.79122%** | **34.16768%** |
| Earlier unlimited-discard-cost resource model | Unrestricted | **10.01640%** | **34.39285%** |

All pool memberships in this table are *what-if assumptions*, not recommendations to discard their cards. The `D=6` row is especially generous: Battle VIP Pass may be the best first-turn setup action, and a copy already played is absent from the hand. The `D=16` row even permits discarding a draw Supporter that can be essential to completing the line. Treating all 40 non-Basic cards as expendable is not strategically plausible; it is a mathematical comparison.

Even the all-non-Basic case falls **0.22518 percentage points** below the original cost-free Box figure. The omitted eight-card openings contain insufficient other non-Basic cards because multiple Basics must be retained. Real search sequencing, Bench development, and low-DCI hands can reduce usable Box routes further.

The exact exclusive Box fractions for `D=6,10,14,16,40` are respectively `640619/377545129`, `53003316/6418267193`, `9911643/493712861`, `176625694/6418267193`, and `2843559/29041933`. The direct Blower contribution is held fixed at `416435/1708349`, so every total is a disjoint sum.

## Independent proof and reproducibility

In the eight-card representation, for `b` Basics and `d` designated non-Basics, `7-b-d` other non-Basics, exactly one Box and zero Blowers, the physical multiplicity is:

`C(17,b) × C(D,d) × C(40-D,7-b-d)`.

Require `d>=3`. When `b=1`, the single Basic must occupy one of the seven original hand positions, giving **7/8**. When `b>=2`, the legal-seven factor is **1**. Normalize by `1-C(43,7)/C(60,7)`, then multiply by the independently determined **437/442** probability at least one of two Blowers remains outside the six Prizes given neither was observed.

An **independent seven-card enumeration** in the automated tests enumerates legal initial seven-card hands and then the eighth draw from the other 53. Its favorable eighth-card count is computed separately for whether the single Secret Box started in the opening hand or is the draw. These two methods agree for **every `D=0..40`**, and the exact fractions above are separately asserted. The monotonicity sensitivity is determined without any shuffle-based simulator approximation.

- Exact source-aware calculator: [`scripts/new-moon-secret-box-discard-sensitivity.cjs`](../../scripts/new-moon-secret-box-discard-sensitivity.cjs)
- Independent source-independent enumeration tests: [`tests/new-moon-secret-box-discard-sensitivity.test.cjs`](../../tests/new-moon-secret-box-discard-sensitivity.test.cjs)
- **Passing manual [CI 39137921755](https://github.com/FlareZ123/experiment-01/actions/runs/39137921755)**, pinned research head `fa5aa768ba60f9ce215afd8436dac0552bae6572`. [Artifact 12140935166](https://github.com/FlareZ123/experiment-01/actions/runs/39137921755/artifacts/12140935166), archive SHA-256 `7e781d80eddd74750415e55777667df986240c7cc490ae9d48ca671527076119`, includes the machine-readable new sensitivity JSON. The existing manual-only `aichi-opening-audit.yml` was extended, with **no commit-triggered CI**.

## Experimental decision

The +10.0164-point Secret Box channel should remain labeled an upper bound for *raw resource connectivity*. A sensitive measure of hand-discard permission can shrink the exclusive route to well under one percentage point under even fairly generous named-copy assumptions. This is an actionable counterexample to using an access hypergraph as a proxy for a practical anti-Garbotoxin response.

The next decisive test is to capture the candidate's **actual owner-visible hand and intended attack resources** in a source-dealt Tool-Garbodor encounter, classify three legal high-DCI discards without Prize/deck leakage, execute a whole `Secret Box → Field Blower → attack` line under a frozen autonomous policy, and record the opponent's retooling answer. Matchups against Item lock additionally invalidate both Item routes.

**Field remains 29/32 published full opposing lists, ranks 23/25/28 missing, zero independently policy-qualified competitive games, and no demonstrated 99.5% win rate.**
