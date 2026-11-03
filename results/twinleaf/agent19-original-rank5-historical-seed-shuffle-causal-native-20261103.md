# First positive original-Aichi-rank-5 source-dealt printed Energy Mix shuffle correction: 15 raw omissions vs 21 settled true shuffle prompts

**Agent 19 | 3 November 2026 | explicit retrospective developmental pressure | real pinned Store | original source 60, two fixed candidate 60s.**

## Claim boundary

This result establishes a **paper-rule implementation difference** in actual Mew/Genesect original-source-dealt two-seat engine games, and shows that applying the printed Mew V FST Energy Mix shuffle can change later native game action histories. It does **not** measure competitive paper match strength, demonstrate a candidate advantage, or qualify a single game toward 99.5%.

The source-mandated attack text searches for an Energy card, attaches it to a Fusion Strike Pokémon, **then shuffles the deck**. Twinleaf's pinned Mew V reducer omitted that final action. The [reversible default-off hook](../../simulation/twinleaf/agent19-energy-mix-shuffle-hook.cjs) schedules a genuine native `ShuffleDeckPrompt` immediately after the original attach callback. The existing independent paper target guard is enabled equally in both A/B arms.

## Historical-selection provenance

An earlier unaltered Agent22 archive [41577868458](https://github.com/FlareZ123/experiment-01/actions/runs/41577868458) showed **20 actual original-source-selected Energy Mix copies per native policy mode**, all without shuffle. It supplied four physical seed groups. These seeds are **historically selected, known-positive pressure cases**, and so the new panel is deliberately **retrospective**.

The [v4 registration](../aichi-2026/registrations/agent19-rank5-energy-mix-shuffle-historical-seed-replay-20261103.json) committed *before* this new execution preserves four historically observed seeds, each for both frozen candidate 60s: `1671807160`, `1606870827`, `3850175175`, `36879703`. It predeclares the original rank-5 Mew/Genesect printed 60, two physical seat placements, two A/B modes and every native action limit. A/B difference is exactly the printed shuffle hook. Both arms share the same `blockedTo` guard and fixed common native owner policy. All expected original source printed cards were loaded with **zero source substitutions**.

**Reproducibility:** [run 41661433176](https://github.com/FlareZ123/experiment-01/actions/runs/41661433176), head SHA `d773efd8ed4829b598f9cde4cb3794279f875e8f`, pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Compiled genuine Twinleaf and passed targeted **22 regression cases** and 16-attempt source-dealt native step. The shared workflow overall is **red**, solely at a subsequent already-failing unrelated Snorlax-Arceus `INVALID_TARGET` test. **Artifact [13241374417](https://github.com/FlareZ123/experiment-01/actions/runs/41661433176/artifacts/13241374417)**, ZIP SHA-256 `281e8bbf93c7af9fb5e07f42f0c85572ac976e05dd83f0ccf25d6abf14f92359`, contains raw, unfiltered `agent19-rank5-energy-mix-shuffle-source-paired-native.json` and short summary.

## Measured native outcomes

| Quantity | Guard-only raw pinned engine | Guard + printed Energy Mix shuffle |
| --- | ---: | ---: |
| Registered source/candidate/seat native attempts executed | **8/8** | **8/8** |
| Engine-terminal dispositions | 8 | 8 |
| Source-owned `Cross Fusion Strike` copies with settled prompt chains | 37 | 47 |
| Source-owned Mew V `Energy Mix` selections | **15** | **21** |
| Those copies resolving native `AttachEnergyPrompt` | **15** | **21** |
| Those copies then resolving same-root `ShuffleDeckPrompt` | **0** | **21** |
| Explicit source-owned same-root missing printed shuffle | **15** | **0** |
| Independent target guard inspected actual attachment prompts | 17 | 23 |
| Independent target guard rejected invalid target | 0 | 0 |
| Opt-in hook Energy Mix effects / created / settled shuffles | 0 / 0 / 0 | **21 / 21 / 21** |

Every count above is from native actual-source physical seat evidence, not merely printed attack accessibility. The read-only [source root lineage auditor](../../simulation/evaluation/agent19-original-energy-mix-shuffle-lineage-audit.cjs) proves each chosen `Energy Mix` came from that original source's `Cross Fusion Strike` `AttackAction`, then observes real `AttachEnergyPrompt` and, for the corrected arm, a same-initiating-root `ShuffleDeckPrompt` **after** the attach. All 16 native rows, including zero-opportunity rows, are preserved.

## Exact eight-pair ledger

| Original rank5 source trial ID | Raw Energy Mix / shuffle | Corrected Energy Mix / shuffle | Matched initial physical source deal | Complete native root ledger equal |
| --- | --- | --- | --- | --- |
| `5:0:A:champion-reference` | 3 / 0 | 2 / 2 | Yes | **No** |
| `5:0:A:new-moon-lockbreaker-v1` | 0 / 0 | 0 / 0 | Yes | Yes |
| `5:0:B:champion-reference` | 0 / 0 | 0 / 0 | Yes | Yes |
| `5:0:B:new-moon-lockbreaker-v1` | 0 / 0 | 0 / 0 | Yes | Yes |
| `5:1:A:champion-reference` | 0 / 0 | 0 / 0 | Yes | Yes |
| `5:1:A:new-moon-lockbreaker-v1` | 0 / 0 | 0 / 0 | Yes | Yes |
| `5:1:B:champion-reference` | 6 / 0 | 16 / 16 | Yes | **No** |
| `5:1:B:new-moon-lockbreaker-v1` | 6 / 0 | 3 / 3 | Yes | **No** |

All **8/8 initial source-deal fingerprints**, **8/8 full deal fingerprints**, and **8/8 actual starting player seats** match within A/B comparisons. The five pairs with no Energy Mix choices stayed exactly identical. The three pairs with original-source Energy Mix show their *first native action-ordinal difference* **at the printed shuffle prompt**:

- `5:0:A:champion-reference`: ordinal **74**, source physical seat **1**, global turn **18**, initiating root **71**; original action `WaitPrompt` vs corrected `ShuffleDeckPrompt`.
- `5:1:B:champion-reference`: ordinal **42**, source physical seat **0**, global turn **7**, initiating root **39**; original `WaitPrompt` vs corrected `ShuffleDeckPrompt`.
- `5:1:B:new-moon-lockbreaker-v1`: ordinal **44**, source physical seat **0**, global turn **7**, initiating root **41**; original `WaitPrompt` vs corrected `ShuffleDeckPrompt`.

The same-root causal insertion is especially informative: the first action-history divergence was **the missing paper-required shuffle itself**, after otherwise matching physical roots. Subsequent Mew copied attack counts change because the corrected shuffle changes downstream draws and decisions. Therefore comparing the original and treatment *attack totals* as if they were paired independent repetitions would be invalid. This result does not isolate a per-attack win-rate effect.

The raw game engine reports terminal dispositions across both arms, with the same nominal native winners in matched pairs, but those are **unqualified native outcomes**. A global outcome conclusion would require realistic competitive owner policies, an independent paper-rule card-interaction audit, original all-32 source coverage, correct initial Prize/hidden state and game clock adjudication. No seed-matched native result automatically meets those gates.

## Research implications

1. The **source-dealt omitted printed shuffle is established** by historical original-source archive plus new paired actual Store replay. The reversible hook repairs the missing prompt in the tested original-source encounters and preserves legal target guard handling.
2. The first [fresh four-seed independent panel](agent19-rank5-original-60-shuffle-paired-native-20261103.md) and [post-observation preference ablation](agent19-rank5-retrospective-preference-ablation-null-opportunity-20261103.md) each had 15 source-owned copied attacks, **zero Energy Mix choices**, so no treatment opportunity. This confirms that the common policy frequently favors a different copied attack and that correction effect occurrence is policy- and draw-dependent.
3. Historical positive seeds **intentionally selected after outcomes** are ideal for mechanical falsification and debug; they must be excluded from any prospective statistical evidence of a 99.5% Aichi Top32 win rate.
4. A meaningful future comparison would prespecify independent natural original 60 source-dealt draws and an explicitly defined policy rationale for when Energy Mix accelerates a subsequent attacker, without selecting favorable seeds post hoc. It should log every completed shuffle, printed target eligibility, physical source Energy transfer, subsequent public reply, native errors and timed paper-game resolution. The fixed 60 must remain identical against all 32 opponents.

**Competitive-qualified games: 0. Demonstrated Top32 win rate: none.**
