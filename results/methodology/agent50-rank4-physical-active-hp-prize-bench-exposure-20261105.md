# Agent50: exact native initial Active HP and Prize-exposure counterweight to preserving entry Abilities

**5 November 2026 | independent read-only cross-audit of existing predeclared native setup arms.** This is a **physical starting-board comparison**, with **zero competitively qualified games**, no KO events, no actual tournament clock, and no performance estimate.

## Sources and verification

The source is [Agent50's existing genuine native 32-pair same-ordered-pre-setup-hand greedy versus single-Active A/B](../../tests/agent50-rank4-same-hand-greedy-vs-priority32.native.test.cjs), [CI #41884288485](https://github.com/FlareZ123/experiment-01/actions/runs/41884288485), archived [artifact #13349769348](https://github.com/FlareZ123/experiment-01/actions/runs/41884288485/artifacts/13349769348), Twinleaf gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The published ZIP SHA256 `1e3125d1a3908e979bddf4e20735bb7a2006700069e2956b1c0067b6f208fbbe` matches the independently downloaded bytes. All **32 original JSON receipts matched their own 32 archived SHA256 sidecars**. Every row states matched source-owner *ordered pre-setup hand*, native accepted physical Active/Bench placement in both arms, and no execution of the concealed-State fallback. Pre-setup hand parity is the relevant starting-choice control here; post-setup boards intentionally diverge.

For printed HP and Prize liability, I independently parsed the uploaded Pokémon card corpus ZIP, SHA256 `c39af257e60a79a485aad09c7d7723b6afbb42eae1ba74e280b8a3f77581350a`, using exact set code via `sets/en.json` and matching English name and subtypes in `cards/en/<setid>.json`. Native name aliases were normalized only for `Dedenne GX` → `Dedenne-GX` and `Ditto Prism Star` → `Ditto ◇`. Every relevant same-name card printing within its source set agreed on HP and subtypes. Prize liability was read from Pokémon subtype/rule: TAG TEAM Pokémon-GX = 3, ordinary GX/ex/V = 2, standard Basic or Prism Star without a different prize rule = 1. This is the **conditional number of Prizes an opponent would take if that Pokémon is Knocked Out**; a sum across multiple in-play Pokémon is not an actual Prize count or a six-Prize game payoff.

The same 32 predeclared original-rank4 hands (source physical seat 0/1 and seeds 20261120–20261135) contain **11** openings with both an ordinary eligible Basic and a qualifying printed in-turn Bench-entry Ability Basic. The actual greedy chooser consumed the Ability Basic in setup in all 11; the actual one-Active protected chooser kept it in hand in all 11. This is previously published proof of physical setup custody, not a new sample or evidence of a later Ability use.

## Eleven physically positive original rank4 source openings

| Source seat / seed | Greedy Active, HP / Prize liability | Priority Active, HP / Prize liability | Greedy Benched Basics | Priority held entry supports |
| --- | --- | --- | ---: | ---: |
| 0 / 20261122 | Tapu Lele-GX, 170 / 2 | Gengar & Mimikyu-GX, 240 / 3 | 1 | 1 |
| 0 / 20261123 | Tapu Lele-GX, 170 / 2 | Gengar & Mimikyu-GX, 240 / 3 | 2 | 2 |
| 0 / 20261124 | Crobat V, 180 / 2 | Voltorb, 60 / 1 | 1 | 1 |
| 0 / 20261127 | Pikachu, 60 / 1 | Pikachu, 60 / 1 | 1 | 1 |
| 0 / 20261131 | Crobat V, 180 / 2 | Voltorb, 60 / 1 | 1 | 1 |
| 0 / 20261134 | Voltorb, 60 / 1 | Voltorb, 60 / 1 | 1 | 1 |
| 1 / 20261125 | Squawkabilly ex, 160 / 2 | Squawkabilly ex, 160 / 2 | 3 | 2 |
| 1 / 20261128 | Ditto ◇, 40 / 1 | Ditto ◇, 40 / 1 | 1 | 1 |
| 1 / 20261129 | Crobat V, 180 / 2 | Gengar & Mimikyu-GX, 240 / 3 | 3 | 2 |
| 1 / 20261132 | Pikachu, 60 / 1 | Pikachu, 60 / 1 | 1 | 1 |
| 1 / 20261133 | Eldegoss V, 180 / 2 | Voltorb, 60 / 1 | 1 | 1 |

**Exact active-slot movement:** HP difference (priority minus greedy) = unchanged in **5/11**, **−120 HP in 3/11**, **+70 HP in 2/11**, and **+60 HP in 1/11**. The number of Prize cards from *only the Active Pokémon if knocked out* increases by one in **3/11**, decreases by one in **3/11**, and is unchanged in **5/11**. Three protected openings select a 240-HP three-Prize TAG TEAM Active, whereas three instead select 60-HP one-Prize Voltorb in place of 180-HP two-Prize support Basics. These are structural tactical tradeoffs; the stronger outcome depends on the real future attack and Prize map.

**Exact Bench tradeoff:** Within the 11 positive openings, greedy has **16** physically Benched Basics in total; the deliberately single-Active protected policy has **0**. In the complete 32 original rank4 hands, greedy has at least one starting Bench in **15/32** and **21** Benched Basics across games; the alternative has no initial Bench in **32/32** by its design. Of the 11 positive hands, **nine have exactly one ordinary Basic** and **two have at least two ordinary Basics**, as certified by the published eligible/trigger native prompts. Therefore, a separate multi-Basic protected chooser would have a *possible* second ordinary starting Pokémon in only those two positive hands, subject to actual native validation; that chooser was **not** the tested single-Active treatment. The active-prize-liability and Bench counts should be treated as components of an initial-board risk frontier, rather than added as an imagined matchup win-rate gain.

**Conditional paper consequence:** If an opponent could Knock Out the protected policy's lone Active **before it had placed another Pokémon in play**, it would lose for having no Pokémon in play. Greedy's paired board would have another Pokémon in all 11 positive openings under that isolated condition. Whether this window is reachable in actual play depends on turn order, available hand-to-Bench plays at the defending player's first turn, attack legality, and opponent line; **no actual donk or knockout was observed or simulated**. Some protected starting Active identities also have much higher HP, which could make the condition harder to reach.

The sum of all initially in-play Pokémon's theoretical Prize liabilities in these 11 different physical openings is **48 under greedy versus 18 under the single-Active chooser**. This sum is only a descriptor of *exposed board liabilities across 11 separate starts*. It is not Prize cards taken, an expected tournament loss, or comparable across game horizons.

## Research and policy implication

Keeping in-turn entry supports can increase future draw, search, recovery or setup opportunities. But **setup preservation also changes Active HP, potential Prize liability, and game-loss risk from sole-Active exposure** in real native hands. Those initial-board variables should enter an Active Move Realism/Bench availability and prize-map evaluation, not an unconditional "preserve entry support" bonus. This specific 32-hand corpus is preselected developmental research and cannot establish universal or rank-4 conditional matchup performance.

A meaningful next policy study should preregister a **third multi-Basic protected** arm as a distinct treatment (the native strict prompt settlement adapter now exists), document true pre-setup physical hand parity, and extend through genuine owner in-turn entry Ability activation, opponent opportunity to attack, and terminal outcome when feasible. Retain empty-Bench/low-HP/high-Prize vulnerability as competing endpoints. Keep the currently selected steward v4/v5 unchanged pending evidence.

**Qualification:** Aichi original exact sixties 29/32; source ranks23/25/28 missing; zero paper-qualified games; no final fixed 60; the 99.5% target is not demonstrated.
