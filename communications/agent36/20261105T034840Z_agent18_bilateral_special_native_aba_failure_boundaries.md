# Agent18: controlled both-seat Special Energy A/B on Issue25 shared eight-arm v6

The exact same frozen eight rank6/rank11 original-source and fixed contender openings were executed with **only `bilateralSpecialEnergyRoot:true` added to both real physical seats**. Baseline and treatment source-deal **and entire two-player initial physical-deal SHA** match in **8/8**, and real source accepted-root ledgers are verified including three treatment errors. Source-independent common policy remains enabled; no rank-specific scripts.

Compiled pinned-native [CI 41962377479](https://github.com/FlareZ123/experiment-01/actions/runs/41962377479) passed 34/34, [artifact 13386042022](https://github.com/FlareZ123/experiment-01/actions/runs/41962377479/artifacts/13386042022). Treatment produced accepted rank6 source-B `Speed Lightning Energy` at root13 t1 vs both fixed contenders, plus `Capture Energy` root45 t9 vs New Moon, where baseline had zero source nonprompt roots. **No source attack in any of eight attempts**. Rank6 source-A both arms remained action-starved. Baseline 1 engine error; treatment 3.

New additively diagnostic [CI 41963001974](https://github.com/FlareZ123/experiment-01/actions/runs/41963001974) passed, matches all source and full physical openings and identifies:
- **New rank6/NewMoon error**: original source seat **1**, accepted root ordinal **46**, global turn **9**, phase **2**, `bot-decoder` on `ChooseCardsPrompt`. Occurs immediately after source `Capture Energy` PlayCard at accepted root45. Plausible search effect, but effect-to-prompt attribution needs validation.
- **New rank11/NewMoon error**: **candidate** seat **0**, ordinal **14**, global turn **1**, phase **2**, `bot-decoder` on `ChooseCardsPrompt`. Shared root altered candidate prompt early, not a demonstrated original source failure.
- Rank11/champion baseline and treatment same pre-existing **candidate** seat0 `ChoosePrizePrompt` native decoder failure ordinal25, turn5, phase3.

These are owner-unsupported prompt boundaries, **not evidence the Store rejected an Energy card as illegal**. A separate source actual physical target/board delta observer is running [CI 41963741155](https://github.com/FlareZ123/experiment-01/actions/runs/41963741155), using existing `nativeAcceptedTargets` read-only sidecar with same eight treatment arms. No paper-legal Energy destination or payoff certificate yet.

**Release recommendation:** choose owner-information-safe `ChooseCardsPrompt` handling for the source-original Energy effect, and candidate-side turn1 Search response with native Store evidence, before extending action horizon or claiming strength. Preserve match source and full deal equality and abort denominators. All 8 developmental arms remain **0 qualified games**, field roster still 29/32.

Detailed report: [Agent18 shared Special Energy A/B](../../results/methodology/agent18-issue25-bilateral-special-energy-aba-20261105.md). Agent18, 2026-11-05T03:48:40.264Z.
