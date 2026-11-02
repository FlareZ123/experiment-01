# Agent 5: matched-source-deal passive-turn imbalance in the frozen 32-arm development scout

**2 November 2026 | secondary, post hoc diagnostic | zero competitive-qualified games.**

This report is an independent **source-deal-matched** extension of [Agent5's strict bilateral pass-only census](agent5-frozen-32-bilateral-pass-only-census-20261102.md). The single canonical native archive is the previously preregistered [Agent41 32-arm experiment](agent41-prospective-canonical-scout-native-20261029.md), [run 40918541683](https://github.com/FlareZ123/experiment-01/actions/runs/40918541683), [artifact 12917901362](https://github.com/FlareZ123/experiment-01/actions/runs/40918541683/artifacts/12917901362). No games or seeds were rerun and no policy/deck was modified.

## Correct pairing and denominator

The original 32 arms comprise **16 nominal pairs**, each a rank/repeat/candidate physical slot group comparing the unchanged champion reference with New Moon Lockbreaker v1. A valid pair must have exactly equal recorded **original source physical setup deal fingerprints**; equal seed alone is insufficient. Exactly **15/16** satisfy this. The unmatched `6:3:B` group remains in the 32-arm archive and the earlier unconditional census but is **excluded from matched contrasts**. The two candidate inventories differ, so their full two-player physical deal fingerprints are not required to match.

All 32 action ledgers are original native Store ledgers. Every qualifying pass-only turn has precisely one accepted `PassTurnAction` and only `WaitPrompt` resolutions. Consecutive turns must be alternating physical seats. The audit does not inspect concealed hands, retune bots, or assign tactical value to passing.

## Results on 15 actual source-deal-matched pairs

| Original opposing rank | Matched physical source-deal pairs | Champion pass-only turns | New Moon pass-only turns | New Moon greater / fewer | Max bilateral pass-only episode, champion / New Moon |
| --- | ---: | ---: | ---: | ---: | --- |
| 6 Iron Thorns | 7 | **130** | **226** | 6 / 1 | 7 / 18 |
| 11 Absol/Garbodor | 8 | **87** | **130** | 6 / 2 | 10 / 7 |
| **Total** | **15** | **217** | **356** | **12 / 3** | 10 / 18 |

For each matched pair, count every strict pass-only turn in the entire recorded (terminal or censored) game. In **12 of 15** matched source setup pairs the New Moon arm recorded more such turns than champion; the remaining three show fewer. These turns are serial within games, and the opposing initial deal is shared across candidate configurations, so this is a *descriptive paired action-count signal*. It is **not** an independent Bernoulli win-rate sample or a measured cardlist-strength advantage. The 260-root experiment cap, different game lengths, different in-game draws and distinct candidate board states can change pass counts without a strategy-quality difference.

## All 15 pairs: raw turn-count contrast

| Source rank / repeat / candidate slot | Champion strict Pass turns | New Moon strict Pass turns | New Moon minus champion |
| --- | ---: | ---: | ---: |
| `6:0:A` | 4 | 5 | +1 |
| `6:0:B` | 31 | 29 | -2 |
| `6:1:A` | 13 | 29 | +16 |
| `6:1:B` | 20 | 31 | +11 |
| `6:2:A` | 5 | 37 | +32 |
| `6:2:B` | 27 | 54 | +27 |
| `6:3:A` | 30 | 41 | +11 |
| `11:0:A` | 15 | 10 | -5 |
| `11:0:B` | 9 | 10 | +1 |
| `11:1:A` | 9 | 41 | +32 |
| `11:1:B` | 10 | 21 | +11 |
| `11:2:A` | 10 | 12 | +2 |
| `11:2:B` | 10 | 2 | -8 |
| `11:3:A` | 18 | 27 | +9 |
| `11:3:B` | 6 | 7 | +1 |
| **Source-matched total** | **217** | **356** | **+139** |

The excluded `6:3:B` has champion 5 and New Moon 25 strict pass-only turns; it must remain in unconditional trial accountability while **never** being assigned paired-causal status. The original 32-arm rank6 and rank11 experiment had **20 engine terminals and 12 action caps**, no competitive-qualified results. A pass-only run can reflect paper-legal waiting or adversarial control, so the diagnostic should direct an owner-visible legal-move audit rather than decide the best fixed 60.

## Testable next step

Choose a **fresh preregistered source-deal-matched holdout**, with a truly shared owner-only two-seat policy and documented attack/payment/prompt fidelity. Track pass-only episodes *as an additional prespecified process endpoint* alongside actual source pressure, characteristic attack conversion, match errors, Prize outcomes and official 25-minute time rules. If a prospective pass-only disparity recurs, inspect each actor's own hand, public Energy, active lock status and legal alternative action at the first affected pass, then validate any correction with native Store dispatch and next-turn opponent continuation.

Until those qualifications, neither this post hoc comparison nor its raw engine terminal outcomes establish a superior fixed 60. The full Aichi target remains **29/32** authenticated original opponent lists with **zero** competitively qualified wins and no demonstrated **99.5%** win rate.
