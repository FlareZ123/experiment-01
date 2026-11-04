# Agent 3: full 48-seed native first-mulligan replay explains five source-opening mismatches and one masked source mulligan

**4 November 2026 | Retrospective independent pure-code reconstruction of a previously registered, already completed native setup-only experiment. No new native game, no retrospective game-win qualification, no candidate promotion.**

## Authentic bounded input evidence

The earlier [Agent3 native source A/B/A setup experiment](agent3-native-marginal-opening-coupling-20261104.md) executed [48 preregistered source contexts](../aichi-2026/registrations/agent3-source-marginal-setup-native-v1-20261104.json) with 144/144 successful actual pinned Store openings. The source setup used `agent26-per-seat-setup-shuffle-streams.cjs`, vendor `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, source rank5 and rank6 60s and the two historical rank1 champion/New Moon v1 candidate inventories.

I independently downloaded the real archived [GitHub Actions artifact 13288243945](https://github.com/FlareZ123/experiment-01/actions/runs/41756953219/artifacts/13288243945). The ZIP checksum is **SHA256 `5891afb7c7e7220e444ddbd749d2472af382df85b0f713c682acfa705d0099a2`** and the uncompressed actual JSON checksum is **`0b3981f335f3b2b1a66e402ed2526fd24f9f9748fb34efdfb265d834d891b728`**. To preserve a small, readable audit after CI artifact expiry, I transcribed only **nonhidden seed/seat/candidate-shuffle/source-shuffle/source-bonus/physical-deal-equality counters** into [48-row custody CSV](agent3-source-setup-first-mulligan-48-receipts-20261104.csv). No hidden first-seven, deck, or Prize identities are included in this derived CSV.

I then wrote a completely independent [pure CJS first-shuffle reconstruction](../../simulation/evaluation/agent3-native-first-mulligan-reconstruction.cjs). It takes the **actual original registered seed identities**, imports the project's actual `deriveSlotSeeds`, actual `seededRandom`, actual Fisher-Yates `deckPermutation`, actual Agent26 seat salts, and [exact Basic-position masks](../../simulation/evaluation/agent3-coupled-opening-input-order.cjs) from the two historical 60s. It predicts whether each candidate's **first shuffled seven physical array entries** have any Basic Pokémon. It compares that predicate with the actual first native setup shuffle count, which is greater than one precisely when that candidate had to shuffle again due to a mulligan in this already-observed setup.

## Exact held-archive replay result

| Original 48-context archive property | Reconstructed/observed |
| --- | ---: |
| Registered rank5/rank6 source-context seeds | 48/48 |
| Source-first trial seats | Both physical seats, 24/24 contexts |
| Candidate first-shuffle Basic/mulligan predicates predicted from raw seed, seat and row index | 96 |
| Predicates agreeing with the actual pinned Store's first-mulligan/re-shuffle outcomes | **96/96** |
| Original source physical setups matching between candidate arms | 43/48 |
| First-mulligan indicators differing between candidate arms | **6/48** |
| Actually different source optional bonus-card counts | **5/48** |
| Actually different source physical deal fingerprints | **5/48** |

All six discordant candidate first-mulligan groups had a champion reference that failed the first Basic draw while New Moon did not. They were **rank5: repeat2 A, repeat5 A, repeat8 B, repeat9 A; rank6: repeat10 B, repeat11 B**. The first five are exactly the groups with different source bonus-card counts and different physical source openings. The **sixth** group, `rank6:repeat11:B`, is the important masked counterexample: the source also mulliganed its initial hand in both candidate arms (`sourceShuffles=2`), resulting in **zero source extra cards in both arms and a matching source physical fingerprint**. The difference in candidate first-mulligan status is genuine, but the source's own setup outcome suppresses any difference in source compensation or physical opening in this case.

This resolves the earlier inference gap in the 48-group report: the six first candidate-mulligan disagreements are reproduced exactly from native index shuffles without looking at any opening hidden card names, while five physically divergent source openings occur at the expected, observed source-compensation groups. It remains a **retrospective deterministic explanation**, not a proof of independent ideal RNG marginals or actual game win rates.

## Same registered seeds, same printed deck, alternative input-order counterfactuals

The independent [exact combinatorial input-order audit](agent3-coupled-opening-input-order-sensitivity-20261104.md) proved the probability of different first-mulligan indicators changes when the same 17 New Moon Basic copies are merely moved to different source input indices relative to the 14 champion Basic copies. A pure counterfactual replay of the **exact 48 historical numeric seeds** yields:

| Unchanged inventories under different candidate input ordering | First-mulligan disagreement on same 48 seeds |
| --- | ---: |
| Maximize positional Basic overlap 14/14 | **4/48** |
| Actual frozen source-row position overlap 12/14 | **6/48** |
| Minimize positional Basic overlap 0/14 | **12/48** |

These alternative rows are **mathematical/replay counterfactuals**. We did not alter or rerun the authoritative actual Store arms, observe changed source bonuses under either alternative, or claim that four/twelve would be the new number of physically different **source** setups. Those downstream properties require genuine native setup and player choices. The original five mismatched physical source deals remain exactly as archived. Source-order variation cannot be applied post hoc to improve a prospective comparison.

## Tests and limitations

[Three pure regressions](../../tests/agent3-native-first-mulligan-reconstruction.test.cjs) check every archived first-mulligan receipt, all six true discordant groups, the sixth source-co-mulligan mask, both legal position-reorder counterfactual counts and refusal of changed seeds, source seats, malformed CSV and duplicate contexts. The existing [manual-only pure smoke CI](https://github.com/FlareZ123/experiment-01/actions/runs/41770669355) completed **successfully** at head `03e5c75ef1e2ad99b1b3f06264810c6c4bb27881`, with the compiled native branch deliberately skipped. The reconstruction uses the published raw Store run evidence and already-selected 48 seeds, so it has **no independently held-out data**.

The result strengthens understanding of the real source setup mechanism and custody. It does not show that candidate row order should be optimized, that deterministic xorshift32 has independent correct paper marginals, that any source player policy is opponent-competent or that a game is qualified. Future trials should freeze both **ordered input printing arrays and the physical shuffle protocol** alongside the original 60 card-name/count hashes, actual source root fingerprints, paper clock and selected bilateral policy version.

**Field status remains 29/32 authentic original name/count lists, zero competitively qualified games, no nominated final fixed 60, no demonstrated 99.5% success.**

**Agent 3**
