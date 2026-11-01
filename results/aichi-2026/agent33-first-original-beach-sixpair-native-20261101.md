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

## Full after-repair native original-source result, 1 November

The second diagnostic [run 41273271820](https://github.com/FlareZ123/experiment-01/actions/runs/41273271820), head 79f72b633aad548f28fc7ac502b52454ce613ece, kept all 12 attempts and reproduced the two rank29 native exceptions **one action later**. The physical Tropical Beach placement succeeded; subsequent use-tropical-beach reached the shared research-owned receipt and triggered the same unknown-intent assertion. Its artifact ZIP SHA256: aa6ad38ce34b330916d14cc33d9b72add0ea9bf217d6cbd90e514794f0b0e0b4. These remain unqualified error arms, not negative play evidence.

Commit a6057d30 adds actual native-use receipts for Tropical Beach and Player's Ceremony: matching Stadium in play, exact owner deck-to-hand transfer, public used-turn quota and owner turn-end transition. Commit a205a0de adds positive and failed-draw/absent-Stadium/non-ending-turn pure tests. Neither treatment policy nor preregistered opponent original printed 60s, seeds, seats or 260-action horizon was changed.

**Repaired native packet:** [run 41273431460](https://github.com/FlareZ123/experiment-01/actions/runs/41273431460), artifact agent33-original-beach-paired-20261030 id 13069299745, ZIP SHA256 09064fed6c08a1691e50b2196d36e3e29ff4133acf709133909a6d2dc1a02e7a. All **12/12** control/treatment attempts preserved, **6/6 identical original physical deal/source 60 starts confirmed**, **0 native errors**, **0 physical zone invalids**, **2 native Beach placements**, **2 accepted native Stadium uses**, **2 settled draw-to-seven/end-turn witnesses**. These are two rank29 physical-seat/seed strata and represent one opponent archetype, not independent archetypes.

| Original source / candidate seat | Control | Treatment | Beach draw settled? | Engine winner |
| --- | --- | --- | --- | --- |
| 3 / A | capped | capped | no Beach selected | none |
| 3 / B | terminal | terminal | no Beach selected | candidate seat1 |
| 6 / A | capped | capped | no Beach selected | none |
| 6 / B | terminal | terminal | no Beach selected | original source seat0 |
| 29 / A | terminal | terminal | **yes, source seat1, turn2** | candidate seat0, both |
| 29 / B | capped | capped | **yes, source seat0, turn2** | none |

Both exact original rank29 source-owner cases executed genuine Tropical Beach PlayCardAction then UseStadiumAction, with **hand 5→7, deck 46→44, Stadium-used turn2, native end-turn transition**. Rank29 candidate-seat A, seed 844567280, acted on native roots **12/13**; the opponent candidate seat0 followed on turn3 with a PassTurnAction after the mandatory wait prompts. Rank29 candidate-seat B, seed 2748052802, acted on roots **31/32**; opposing candidate seat1 followed on turn3 with a Fog Crystal PlayCardAction. Both showed SETTLED_PHYSICAL_60_VERIFIED with multiple checked native settled roots and zero physical anomalies.

The rank29 A control finished in 174 actions/39 turns versus Beach treatment 168 actions/37 turns, with the **same engine winner**. Rank29 B remained **capped at 260 roots and 58 turns** under both variants; its terminal winner is unknown. There was no engine-winner reversal among completed pairs. Every attempt retains actorQualification.fullyActorOnly=false, paperClockQualified=false and competitiveGames=0. A real settled Stadium effect and subsequent opponent reply do not demonstrate a skilled policy, an actual timed-game win, or any benchmark win-rate change.

The first failed 12-attempt packet and intermediate failure remain separately archived above: this repair does not delete or retroactively reclassify their observations. The user-facing fixed-deck benchmark remains 29 authenticated original sixties, zero competitively qualified games and no 99.5% evidence.
