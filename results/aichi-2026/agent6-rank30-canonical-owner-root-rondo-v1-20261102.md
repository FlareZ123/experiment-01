# Original rank-30: canonical owner-root policy actually chooses native retreat and Rondo

**Agent 6 | 2 November 2026 | opt-in, retrospective, eight exact original Store arms; not competitively qualified.**

## Motivation and architecture

The first real-Store fork [funded Clefairy feasibility](agent6-rank30-fund-then-retreat-rondo-native-20261102.md) demonstrated that source seat 1 turn 30 can legally retreat Active Latias ex SSP into funded Benched Lillie's Clefairy ex and then Rondo for 180. However, the headless bot's action ledger still recorded its original Pass at the intercepted root. An attempt to wrap the ordinary bot's `decodeNextAction` instead failed: **zero delegated Pass decisions** in eight matched original Store games, because the actor-only canonical root selector had already chosen the root. [Failed actor-root layer experiment 41384714089](https://github.com/FlareZ123/experiment-01/actions/runs/41384714089), artifact `13114617609` (ZIP SHA256 `cf410690a70ce096f099b59b94a42c3490ca7e8cbb760e7bef8b011640fe0290`).

The correction adds a **default-off actor-public** `skylinerRondoRetreat` option to `simulation/twinleaf/agent34-actor-only-root-policy.cjs`, backed by detached owner-only `simulation/twinleaf/agent6-owner-public-skyliner-rondo-frontier.cjs`. It independently translates the selected intent into a real `RetreatAction`, and `simulation/twinleaf/agent5-owner-root-slice.cjs` checks actual owner-public swap and unchanged retreat Energy. When disabled, existing canonical decisions retain their original behavior. One early run exposed two integration errors (false default had `undefined` owner-seat assertion; new retreat intent lacked public physical witness). Both were repaired and rerun, preserving failures rather than suppressing them.

## Verified original 8-arm result

[Native Actions run 41386142870](https://github.com/FlareZ123/experiment-01/actions/runs/41386142870), [complete JSON artifact 13115417482](https://github.com/FlareZ123/experiment-01/actions/runs/41386142870/artifacts/13115417482), ZIP SHA256 `b5e03e45bdb4aafad60370078b8330c6a5186a821fd3e1673aa6bf14c2944bdc`. Pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Workflow head `5d4c5fafde767284798113973f32ce4720fd8023`.

Both candidate 60s, original source rank-30 printed 60, original A/B source seats and seeds, and the previously established Psychic Bench staging are fixed. Each original A/B source/candidate pair had identical **full initial physical deal** across option-disabled and option-enabled arms (**4/4 matched pairs**). **Eight genuine native attempts**, **zero native row errors**, all untimed engine terminal, **zero competitively qualified games**.

| Source slot and fixed opponent | Canonical control | Canonical owner-root Skyliner option |
| --- | --- | --- |
| A, champion-reference | Source Pass at turn 30, candidate terminal winner | Source actor chooses real `RetreatAction` at turn 30, then genuine `Full Moon Rondo`; candidate still wins |
| A, New Moon | No corresponding turn-30 opportunity before terminal | No action change |
| B, champion-reference | No eligible Active Latias turn-33 window | No action change |
| B, New Moon | Active Mimikyu uses Filch instead of Rondo | No action change; printed eligibility deliberately limited to Active Latias |

**The central advance is genuine root fidelity.** In A/champion, `rootActionLedger` now records an actual source-owned **RetreatAction at global turn 30, action ordinal 117**, then an actual **AttackAction Full Moon Rondo at ordinal 118**. The native Store accepted the retreat and attack, independent physical owner-zone receipts remained valid, and Rondo settled **180 damage** on the opposing Active Latias ex. This matches the earlier Store-level feasibility witness but removes its stale original-Pass ledger problem.

The first-generation selector was intentionally conservative: Active must be an uncharged **Latias ex SSP**, Skyliner must be visible, and the Benched Clefairy must be payable with two basic Psychic Energy. The new [Bench Skyliner/Filch counterfactual](agent6-rank30-skyliner-benched-filch-to-rondo-gameflip-20261102.md) identified a stronger turn-33 situation with **Mimikyu Active and Latias ex on the Bench**, which this v1 selector deliberately misses.

## Next

Generalize the owner-public action offer to the physically proven Bench Latias case, preserving the option to use a better Active attack. Prefer immediate public Prize opportunities over unqualified attack volume: A's 180 damage did not change the winner, while B's Rondo took Duskull, Mewtwo & Mew-GX, and Squawkabilly ex in three attacks. Any new policy must be verified on a **real canonical root RetreadAction** and settled native game, with same-deal source/candidate control and full abort accounting.

This result does not establish source-matchup strength, the 99.5% single-deck objective or paper legality/clock qualification. The canonical bot still uses unqualified prompt fallbacks and policies. Only the exact owner-root action ordering is supported by the native evidence.
