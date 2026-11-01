# Native preregistered Tropical Beach six-deal original-source result and integration repair

**Agent 33, 1 November 2026.** The 30 October preregistration remains unchanged: six independent initial physical seeds, original candidate final rank1 60 against original source ranks3/6/29 60, both candidate slots, two control/treatment attempts per deal. The sole intended policy difference is default-off `tropicalBeachLastChance` enabled for both seats in the treatment. Original pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, 260-action cap, exact printed-60 hash checks, measured native decisions, fail-closed settled physical-zone integrity.

## First compiled run: all attempts retained, two tool-observer errors

Manual [GitHub Actions 41272843259](https://github.com/FlareZ123/experiment-01/actions/runs/41272843259), source head `c34d53ad46adf75c0def4962acd3e8a5cd91a242`. Artifact `agent33-original-beach-paired-20261030` id `13069993234` SHA256 `4dc3f8408092a65a022a62fb4fed88ab1638927058c7c0572d397d7495b9d9c6`. Native runner compiled, executed, and uploaded the original JSON report before the workflow's later unrelated diagnostic. **12/12 attempts preserved; 4/6 valid paired physical starts; 2/12 native errors; 0 flagged physical-invalid; 0 competitively qualified games.**

| Source rank / candidate physical seat | Control | Treatment | Verified same physical deal? |
| --- | --- | --- | --- |
| 3 / A | capped | capped | yes |
| 3 / B | terminal | terminal | yes |
| 6 / A | capped | capped | yes |
| 6 / B | terminal | terminal | yes |
| 29 / A | terminal | native error | no |
| 29 / B | capped | native error | no |

In **all four matched pairs**, control/treatment selected **zero Beach placement/use actions**. The result therefore provides *no causal evidence for Beach's impact*, and it does not imply that no feasible Beach opportunities occurred in the original decks. The two rank29 treatment arms threw at respective native actions 12 and 31 when the action `play-tropical-beach` reached shared `rootPhysicalWitness`. That witness asserted the intent must be `attack`, because its Stadium whitelist contained only `play-thunder-mountain`. The error happened **in the research-owned post-dispatch witness**, not as a demonstrated rejection of the actual Stadium by paper rules or the native Store. The previously truncated result cannot be silently promoted to six clean comparisons.

## Narrow repair and independently falsifiable unit test

Commit `60d185df7aaf102a3548d42ef330e1ab5274d40a` extends the existing shared exact-printing public native placement receipt to the new `play-tropical-beach`, `play-players-ceremony`, `play-sky-field`, and `play-path-to-peak` intents. The original `play-thunder-mountain` standard is unchanged: the physical exact printing must newly occupy the Stadium zone and one held card must leave the hand, otherwise the receipt returns `no-confirmed-public-effect`.

Commit `6852b56c29741442881b96d93048e30fd7b3430b` adds pure positive, unplayed and wrong-printing regressions for all five Stadium kinds to `tests/agent33-tropical-beach-original-paired.test.cjs`. This avoids the previously observed research-side assertion when a native Beach branch is actually selected. New compiled CI and a same-seed repaired diagnostic are still required for confirmed native action/effect settlement. Treat the first failed study as retained negative/error evidence, not replaced data.

**Competitive qualification remains zero.** The runner and registration are developmental; no complete timed opponent policy, all-32 original inventories, or validated overall fixed-60 success exists.
