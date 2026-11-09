# Aichi 2026 all-29 independent fixed-60 comparison: Shadow Rider vs New Moon

**Agent 3, 9 November 2026. Completed 116 actual native games; research conclusion: provisionally prioritize the Shadow Rider reference.**

## Decision from the complete authenticated field

On **58 new pre-registered original-source groups** (29 exact printed Aichi lists, physical seats A and B), two unchanged fixed 60s were compared with the same actual native opponent and contender policy. The champion-reference Shadow Rider was decisively better in the native development observations.

| Measure | Rank-1 Shadow Rider reference | New Moon Lockbreaker v1 |
| --- | ---: | ---: |
| Attempts | 58 | 58 |
| Real native game wins | **37** | 17 |
| Real native game losses | 9 | 13 |
| Reached native terminal state | **46** | 30 |
| Censored at root cap | 11 | 27 |
| Native engine errors | 1 | 1 |

**57/58** cross-contender groups matched the original source's genuine physical deal and actual starting seat. In **28** of those, both candidates reached terminal outcomes. Of **eight** matched, both-terminal winner reversals, **seven favored Shadow Rider** and **one favored New Moon**. Their recorded original-source physical state, source rank, root ledgers and outcomes reside in the raw archive and [posthoc directional audit](https://github.com/FlareZ123/experiment-01/actions/runs/42575795413).

The **sole New Moon-favorable matched reversal** was source rank **6 Iron Thorns ex**, group `6:20261109:B`; the seven Shadow Rider-favorable reversals were source ranks **1, 8, 11, 13, 17 (both seats), and 27**. The single source-deal mismatch was rank14 group `14:20261109:B`; it is retained in attempt totals and excluded from matched causal claims.

**Concrete selection effect:** Do not promote New Moon Lockbreaker v1 merely because Field Blower and Canceling Cologne can technically turn off some locks. That package creates useful isolated counterplay, evidenced by one genuine rank6 reversal, yet its fixed 60 has substantially worse native game completion and field outcomes against the same original opponents. A future replacement must be structurally stronger and independently tested.

## Every available Aichi original matchup

W-L-N denotes native candidate wins, losses, and nonterminal attempts (action caps or engine errors), **not a paper matchup win rate**. Each contender has two independent games per rank, one in each physical seat.

| Source rank | Original archetype | Shadow Rider W-L-N | New Moon W-L-N | Matched both-terminal groups |
| ---: | --- | ---: | ---: | ---: |
| 1 | Shadow Rider Calyrex | 1-1-0 | 0-2-0 | 2/2 |
| 2 | Vileplume Control | 0-1-1 | 0-1-1 | 1/2 |
| 3 | Snorlax Stall | 0-1-1 | 0-0-2 | 0/2 |
| 4 | Raichu Electrode Combo | 2-0-0 | 1-0-1 | 1/2 |
| 5 | Mew Genesect | 1-1-0 | 1-1-0 | 2/2 |
| 6 | Iron Thorns | 0-1-1 | 1-0-1 | 1/2 |
| 7 | Snorlax Stall | 2-0-0 | 0-0-2 | 0/2 |
| 8 | Absol Garbodor | 2-0-0 | 0-1-1 | 1/2 |
| 9 | Absol Electrode | 0-0-2 | 0-0-2 | 0/2 |
| 10 | Regidrago | 1-0-1 | 1-0-1 | 1/2 |
| 11 | Absol Garbodor | 2-0-0 | 0-1-1 | 1/2 |
| 12 | Regidrago | 2-0-0 | 2-0-0 | 2/2 |
| 13 | Regidrago | 2-0-0 | 1-1-0 | 2/2 |
| 14 | Regidrago | 1-0-1 | 1-0-1 | 0/2 |
| 15 | Lopunny Vileplume | 1-1-0 | 1-1-0 | 2/2 |
| 16 | Absol Garbodor | 1-0-1 | 0-0-2 | 0/2 |
| 17 | Raichu Electrode Combo | 2-0-0 | 0-2-0 | 2/2 |
| 18 | Regidrago | 1-1-0 | 0-0-2 | 0/2 |
| 19 | Raging Bolt | 2-0-0 | 1-0-1 | 1/2 |
| 20 | Regidrago | 2-0-0 | 1-0-1 | 1/2 |
| 21 | Regidrago | 2-0-0 | 1-0-1 | 1/2 |
| 22 | Absol Garbodor | 1-0-1 | 1-0-1 | 1/2 |
| 24 | Iron Thorns | 0-1-1 | 0-1-1 | 1/2 |
| 26 | Meloetta Donk | 2-0-0 | 1-0-1 | 1/2 |
| 27 | Regidrago | 2-0-0 | 1-1-0 | 2/2 |
| 29 | Iron Thorns | 1-1-0 | 0-1-1 | 1/2 |
| 30 | Lillie's Clefairy | 1-0-1 | 1-0-1 | 0/2 |
| 31 | Dusknoir Chimecho | 1-0-1 | 0-0-2 | 0/2 |
| 32 | Regidrago | 2-0-0 | 1-0-1 | 1/2 |

Aggregate physical qualification: **116 actual native Store runs**, 58 registered group openings, 57 cross-contender matched source deals, 28 fully terminal matched groups, 2 engine failures, and 38 action-cap censored outcomes. Source-rank13 Celestial Roar was physically observed in 3 native rows. The paper-correction profile reported zero natural Mew Energy Mix activations. **Zero competitively qualified paper games.**

## Two remaining error traces

- **Rank2 Vileplume Control, New Moon seat B:** native `CANNOT_PLAY_THIS_CARD` at root 166 while attempting a `PlayCardAction`.
- **Rank31 Dusknoir Chimecho, Shadow Rider seat B:** native `CANNOT_USE_POWER` at root 192 while attempting an `AttackAction`.

These are evidence of remaining decision/engine gaps, and were counted as errors. They are not attributed to game losses. The dominant source of missing comparative endings is still root-cap censoring, especially under stall/lock and incomplete agent decision policies.

## Immutable execution and evidence

- [Frozen pre-game registration with all 58 freshly drawn CSPRNG seeds](https://github.com/FlareZ123/experiment-01/blob/agent3/dual-fixed60-full29-20261109/results/aichi-2026/registrations/agent3-dual-fixed60-all29-paperprofile-prospective-20261109.json).
- [Single exact native runner](https://github.com/FlareZ123/experiment-01/blob/agent3/dual-fixed60-full29-20261109/simulation/evaluation/2026-11/agent3-dual-fixed60-all29-paperprofile-native.cjs).
- [Completed 116-game CI 42574658791, archived complete native roots and outcomes](https://github.com/FlareZ123/experiment-01/actions/runs/42574658791) (artifact `agent3-dual-fixed60-all29-paperprofile-native`, ID `13654836844`).
- [Separate no-replay matched directional audit CI 42575795413](https://github.com/FlareZ123/experiment-01/actions/runs/42575795413), including original source mismatch and both engine errors.
- Frozen branch commit for the 116-game run: `469887139b309ab886fb09645831a0c49102f496`. Twinleaf pinned submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Actor policy profile: unchanged Agent19 four-rank challenger common options plus `agent41-frozen-bilateral-development-v2.json` policy, with identically enabled Celestial Roar v2 paper custody, Mew Energy Mix shuffle, and AttachEnergy blocked-target correction for both contender 60s and both original players. Policy RNG and physical-shuffle RNG after setup were isolated per seat.

## Limits and next priority

The observed winners depend on a developmental automated policy, source-specific actor behavior, a 260-root cap and a pinned simulator with incomplete rule coverage. The study covers all **29 authenticated original print inventories**; ranks **23, 25, and 28** remain absent. It does **not** establish real game win percentages, competitive timing, or the extreme **99.5% target**. The rank1 champion reference also necessarily faces its own identical 60 within the field, making its mirror an intrinsic obstacle to an extreme equal-weight field target.

The next high-value work is to test a **substantially different whole-deck architecture** against the reference across an adequately broad original-source panel, while fixing action-cap decision failures and the two narrow native errors. Incrementally rearranging a few low-impact Trainer slots or optimizing search-access proxies does not answer the fixed-60 objective. Preserve New Moon's rank6 Iron Thorns favorable trace as evidence for future lockbreaking packages without promoting this unqualified complete list.

**Deck selection status:** Shadow Rider is the strongest observed developmental comparator of these two fixed lists. No legal, competitively qualified, 99.5%-capable final list has been demonstrated.
