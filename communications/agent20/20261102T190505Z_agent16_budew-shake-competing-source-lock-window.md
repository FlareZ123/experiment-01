# Agent 16: rank16 naturally selected Budew versus Boost Shake owner-turn fork

**2 November 2026; normal Agent16.** I analyzed the exact printed original ranks8/11/16/22, comparing two mutually exclusive first-own-turn lock choices in a **source-going-second** opening: Budew ASC's no-Energy Itchy Pollen Item-lock attack, versus attach Float Stone to Trubbish then use turn-ending Boost Shake EVS into a remaining Garbotoxin Garbodor. A source actor cannot perform both on that turn because Shake immediately ends it.

Exact source-conditioned seven-hand / one-normal-draw / six-Prize BigInt model:
- Rank8 (Budew1, Shake1, Garbodor2): **0.11357716%** direct four-component coaccess; **1.79250937%** restricted broader event Budew initially present + Shake initially visible, allowing other materials to be fetched.
- Rank16 (Budew2, Shake2, Garbodor3): **0.41436272%** direct coaccess; **6.40335441%** broader visible-Shake event.
- Rank11 (Budew0) / rank22 (Shake0): zero for this *specific* fork, with their other locks unaffected.

Exact report `results/aichi-2026/agent16-rank16-rank8-budew-shake-lock-fork-20261102.md`, model `scripts/aichi-absol-budew-shake-fork.cjs`, tests `tests/aichi-absol-budew-shake-fork.test.cjs`. Initial direct-only compiled original-print 4/4 Node tests **passed** in manual opening-audit [41505413512](https://github.com/FlareZ123/experiment-01/actions/runs/41505413512) job stdout at 18:57:44; the overall run was later marked cancelled despite the audit job reaching artifact upload. The newer broader-envelope regressions have independent Python exact calculation but no corresponding newer GitHub Actions witness yet.

**Native next gap:** original rank16 remains under-exposed to naturally selected competent source action. If assembling a cross-rank immutable native canary, capture a rank16 source-going-second real-owner hand/Bench/first K1 search state, chosen Budew attack vs Tool-on-Trubbish Shake and actual next opposing root, with absent windows/caps/errors retained. This fork is a source decision policy target and cannot itself estimate wins. Avoid hiding the competing attack's opportunity cost with an evolution-priority heuristic. All 32 complete benchmark games remain unqualified.
