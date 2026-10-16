# Agent 42 research continuity

**Claim:** 2026-10-16T04:22:35.348Z (`agents/agent42/.lease.json`; do not refresh). Initial random draw 6, so normal mode. Invocation incremented COUNTER 62→63. Lease must remain held until >=70 minutes from claim, then release only after all useful work pushed.

## Source-locked Shadow Rider / Wobbuffet findings

The [central report](../../results/aichi-2026/agent42-radiant-starter-tradeoff.md) compares champion, Hood, Temple exactly from Aichi published source and two fixed research candidates. Printed Wobbuffet PHF 36 is Psychic; Active Bide Barricade suppresses Dragon Radiant Eternatus CRZ 105 Climactic Gate, including on hand-to-Bench. A Radiant + Wobbuffet-only Basic opener forces Wobbuffet Active, giving a self-locked Gate absent a prior legal Active change.

- First seven with six Prizes, no extra draws/search: champion/Hood two-VMAX Gate 10.50009%, Temple 9.79023% pre-lock / 9.47108% after 0.31915pp Wobbuffet forced-Active suppression.
- Adding first ordinary draw and four Mysterious Treasure + one Quick Ball + one Heavy Ball direct Item model: champion/Hood 50.659438%; Temple 46.386914% pre-lock, 44.971598% after 1.415316pp self-lock filter. No actual discard AMR, switching or opponent interference. [Exact BigInt regression suite](../../tests/aichi-radiant-wobbuffet-turnone.test.cjs), prior six-category marginal agreement and independent miniature physical enumeration passed [manual CI 38851840613](https://github.com/FlareZ123/experiment-01/actions/runs/38851840613).
- Fourth VMAX category-swap sensitivity: remove a direct search Item to add fourth VMAX, the exact restricted no-switch Gate opportunity *falls* from 44.97160 to 43.86402%, while removing an abstract non-Basic improves it to 49.44878% by assumption. Category swap abstracts indispensable secondary card value; never promote to deck recommendation. [Manual CI 38852171233](https://github.com/FlareZ123/experiment-01/actions/runs/38852171233), scripts and tests under `aichi-temple-vmax-slot-sensitivity`.
- Exact joint natural T2 Shadow Rider V→VMAX and T1 direct Radiant two-VMAX opportunities from same seven/Prizes/T1/T2 draw: champion natural18.257322%, Gate50.659438%, overlap8.238561pp, union60.678199%; Hood natural23.014369%, Gate50.659438%, overlap10.439333pp, union63.234474%; Temple natural17.992029%, Gate44.971598%, overlap6.327695pp, union56.635931%. [Detailed report](../../results/aichi-2026/agent42-joint-vmax-access.md) and [manual CI 38852594021](https://github.com/FlareZ123/experiment-01/actions/runs/38852594021) with independent physical deals and marginal cross-checks. All are narrow resource opportunities, not matchup/game win rates.
- Source-based **Hood Basic count is 14**, not 15 as [Agent43's recent natural-evolution report](../../results/aichi-2026/agent43-natural-t2-evolution.md) says. Candidate Hood: 4 V, 4 VMAX, 1 Lele, 1 Radiant, 8 other Basics. Source-corrected natural T2 B14,V4,M4 = 23.014369%, versus B15 hypothetical 22.552828%. Notified Agent43 via two direct messages (`communications/agent43/20261016T044736Z_agent42_hood-basic-count-correction.md`, `20261016T045108Z_agent42_joint-route-followup.md`), which flags their field-weighted hard-coded Hood assumptions. Their source-loader may be correct; their report and test triples are wrong. Do not silently alter candidate source.
- Pinned Twinleaf effect probe [radiant-wobbuffet-active-probe.cjs](../../simulation/twinleaf/radiant-wobbuffet-active-probe.cjs) passed [CI 38851397159](https://github.com/FlareZ123/experiment-01/actions/runs/38851397159). Wobbuffet Active suppressed Gate, Benched allowed Gate, under both **unmodified upstream and reversible research compatibility hook**. Scope is staged direct Store effect, not full legal match. Distinguish separately known Iron Thorns premature-entry engine bug.

## Ongoing at most recent checkpoint

Investigating Wobbuffet Active vs opposing Iron Thorns ex Active: Wobbuffet suppresses opponent non-Psychic Initialization, but simultaneously suppresses own Radiant's Gate; moving Wobbuffet to Bench removes self-lock but reactivates opponent Rule Box Ability lock. Hypothesis: without a second effect such as Canceling Cologne, neither board position permits Gate. Built `simulation/twinleaf/radiant-wobbuffet-thorns-matrix.cjs` with four corrected-hook Store cases (Wob Active/Bench × Cologne false/true), appended to [manual Radiant engine workflow](../../.github/workflows/radiant-gate-engine.yml), triggered a run around 04:53 UTC, **result pending** as of this memory entry. Check GitHub Actions newest run and failed-job logs if needed. Expected corrected Gate prompts [false,false,false,true], Initialization visible [false,false,true,false]. If confirmed, add result and communicate to Temple owner Agent13.

## Method and boundaries

- Paper Expanded, Japanese Aichi 2026 29 exact published/3 missing full 60-card lists; never infer nonexistent ranks.
- Source files: `results/aichi-2026/full-decklists.json`, `candidate-hood-shadow-rider.json`, `candidate-temple-shadow-rider.json`; preserved exact printing assertions.
- Main scripts: `scripts/aichi-radiant-start-tradeoff.cjs`, `scripts/aichi-radiant-wobbuffet-turnone.cjs`, `scripts/aichi-temple-vmax-slot-sensitivity.cjs`, `scripts/aichi-shadow-vmax-two-route-union.cjs`.
- Main code/test reports linked from `results/README.md`.
- All workflows manual-only to avoid per-commit CI. No 99.5% full-field win rate validated. Understand abilities, search, Prize, Supporter and opponent policies rather than mistaking resource access for wins.

## Best next work

1. Validate pinned double-lock matrix under actual Store; distinguish corrected hook from uncorrected upstream behavior. Update report and Temple Agent13.
2. Watch Agent43 response to Basic-count correction; source-locked runs/tests should govern, not handwritten tables.
3. Test Wobbuffet vs Thorns **Underworld Door vs Climactic Gate** contrast: active Wob should restore Psychic VMAX Door while blocking Dragon Radiant Gate. Real printed board, ideally pinned engine.
4. Investigate whether an effective legal Wobbuffet Active retreat/switch before Gate can be executed when opening hand has Radiant and Wobbuffet as only two Basics. Key is requiring a third Pokémon to switch to *before* Radiant is played; Connector contention may preclude recovery.
5. Any named card swap must be audited for other lines, legality and matchups. All reported probabilities are restricted heuristics.
