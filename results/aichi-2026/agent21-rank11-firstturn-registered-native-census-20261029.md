# Rank-11 original source first-turn native Store census from the preregistered cohort

**Agent 21 | 29 October 2026 | independently read archival evidence, not newly simulated performance.**

## Question and evidence scope

The same-day [Agent 41 preregistered scout](agent41-prospective-canonical-scout-native-20261029.md) reports only two rank-11 native source Boost Shake completions in 16 game arms, both in the same source-second paired deal. Can the *existing raw archive* describe what happened in the original source's very first normal turn in each distinct deal, without counting each fixed source deal twice?

Original [CI run 40918541683](https://github.com/FlareZ123/experiment-01/actions/runs/40918541683), artifact **12917901362**, ZIP SHA256 **`55ef8029bce341803da3f895246509cc61480e42a840d35fe34d6ab12f294ad2`**, independently verified on downloaded original ZIP. Input inside archive: `agent41-prospective-canonical-32.json`. Frozen registration Git blob `8c54d8497f9927b04d501237462f64a42173d33d`; native Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This report is a *read-only reconstruction* of the already preregistered 32-arm dataset. No seed was selected, changed, excluded, or rerun.

[CommonJS source audit](../../scripts/agent21-rank11-firstturn-native-census.cjs) asserts all 32 original arms present, 16 rank-11 original arms, eight exact rank11 pairs, each candidate arm's **original source physical-deal digest equal within its pair**, actual starter agreement, and identical first source-turn accepted *root-action labels* in both comparison arms. It intentionally does not assert whole-game or arbitrary card-target equivalence. The raw accepted action ledger and the existing owner-pass public-state witness are read without feeding hidden cards to a decision policy.

## Eight distinct original source opening deals, not sixteen independent draws

| Source 60 cell (rank 11) | Original source starts | Original source first-turn accepted root actions | First-pass Active, if observed | Completed direct Tool/Garbodor source opener |
| --- | --- | --- | --- | --- |
| repeat 0, candidate seat A, seed 3149897025 | First | Darkness Energy; Pass | Latias ex | No |
| repeat 1, candidate seat A, seed 24941728 | Second | Benched Trubbish; Float Stone; Boost Shake | No Pass | **Yes**, both arms |
| repeat 2, candidate seat A, seed 340754762 | First | Tapu Lele-GX; Darkness Energy; Pass | Oranguru V | No |
| repeat 3, candidate seat A, seed 2307728896 | Second | Pass | Oranguru V | No |
| repeat 0, candidate seat B, seed 2246176619 | First | Darkness Energy; Pass | Crobat V | No |
| repeat 1, candidate seat B, seed 3403930699 | First | Pass | Mega Absol ex | No |
| repeat 2, candidate seat B, seed 2147808079 | First | Crobat V; Darkness Energy; Pass | Mega Absol ex | No |
| repeat 3, candidate seat B, seed 1254634394 | First | Crobat V; Darkness Energy; Pass | Oranguru V | No |

The rank-11 source's initial physical deal and **root labels on its first turn** agree across both candidates in all **8/8 pairs**. The two fixed opponent-candidate 60s are different, so **their full physical deals must not be declared equal**. A matching label such as Darkness Energy also does not prove the same *recipient target*; that requires the separate native target sidecar. The Pass state observations are matched by public Active/Bench and three held-mobility counts, deliberately ignoring global action ordinal shifts from the different candidate arms.

## Failure-inclusive bounded census

| Source first-turn classification | Distinct deals |
| --- | ---: |
| Rank-11 source actually first | **6 / 8** |
| Rank-11 source actually second | **2 / 8** |
| Source-first deals ending the first source turn with Pass | **6 / 6** |
| Source-first deals with an accepted Item/Tool/Supporter/Stadium root play on first turn | **0 / 6** |
| Source-first deals with native completed direct Boost Shake Tool-Garbodor line | **0 / 6** |
| Source-second deals with completed direct Boost Shake line | **1 / 2** |
| Source-first Pass states with an Active Oranguru V | **2 / 6** |
| Source-first Pass states with Float Stone still held | **0 / 6** |

The source has 12 source-first *game arms*, but only **six independent source opening deals** because the two candidate treatments share source deals within all eight pairs. All 16 rank-11 arms are preserved and accounted for, including nonterminal games. The successful source-second line is the original report's known hand-Trubbish + Float Stone + Boost Shake setup.

The **first-turn no-Trainer result is a trace fact**, not a proof that the bot irrationally passed a legal Trainer option. The archived complete starting hands were deliberately **not persisted as readable card lists**; `sourceFirstOwnHandSha256` and `sourceDealFingerprint` are digests, while setup `ChooseCardsPrompt` only reveals chosen initial Basic Pokémon. The owner-visible post-Pass mobility audit covers Float Stone, Guzma, Escape Rope only; it cannot identify held Battle VIP Pass, Quick Ball, Boost Shake, generic Tools, discarded/Prized Garbodor, or potential owner-search resources at every decision boundary. Once the line changes hand, implicit K0/K1 constraints and evolving eligibility matter.

## Decision for the shared qualification program

The archive certifies **low observed direct-source-opener exposure, without proving a policy shortfall**: the direct source policy completed one of eight distinct natural opening deals. The non-use of Trainers on six source-first deals could reflect absent cards, policy inaction, or both. It cannot distinguish those causes post hoc. Independent [Agent8 Prize-aware exact source calculations](agent8-rank11-scout-opportunity-calibration-20261029.md) put the narrow direct held-Boost/Tool/Trubbish-VIP structural opportunity at **6.4555%** per Basic-valid opening-plus-one-draw; under an expressly idealized independent-deal model, **zero** such direct events in six deals has approximately **67.005%** probability. Thus **0/6 is unsurprising under this restricted resource model**, even when the source decision policy is competent. Separately, [Agent39's prospectively registered 256 native source attempts](agent39-rank11-active-natural256-20261029.md) observed 21 selected direct Shake opportunities and 20 equipped-Garbodor next-turn witnesses under its different source actor. This is a more informative genuine Store route-coverage denominator and neither run measures competitive wins.

Before replacing the source policy or registering a new competitive comparison, test **a source-owned first-turn K0 opportunity and decision witness** for the existing hand-Trubbish/VIP direct policy, its distinct Quick Ball-only branch from [the exact raw access study](agent21-rank11-raw-opener-gate-20261029.md), and source-first Oranguru/Back Order options. Capture owner-visible legality (hand, board, costs), the selected native action, Search-Prompt K1 only after genuine search, and one source opponent reply. Keep existing scripts and canonical runner rather than duplicating them. A new clean preregistration would be required for any policy changes or matchup comparison.

**Boundary:** no headless rerun, no paper-clock calibration, no decision-optimality or legal-opportunity counterfactual, no validated win-rate or candidate ranking. Field completeness remains **29/32** original opposing 60s; **zero competitively qualified games**, no demonstrated 99.5% fixed 60.
