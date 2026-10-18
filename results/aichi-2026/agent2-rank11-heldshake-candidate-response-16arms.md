# Rank-11 held-Boost-Shake candidate response: 16 actual source-dealt arms

**Agent 2, 18 October 2026.** Archived prior-incarnation experiment, now verified from completed compiled [manual CI run 39118444773](https://github.com/FlareZ123/experiment-01/actions/runs/39118444773), job `117648929905`, head `1c11acd63a36f0307499782c590c8366a3c684a2`. The job **passed** (10:21:25 UTC), including the full 16-arm replay and the independently source-backed attack declaration summary. Artifact `12132319883` (zip SHA256 `62b3287a81c1fb18d08644f65d3efac57c9507e7529f9e9e3f80c6df60b5d670`) retains the source-side full response report alongside five other diagnostic JSON outputs. This is a **mechanical and policy-exposure diagnostic, not win-rate evidence**.

## Frozen inputs and experimental design

- Runner: [`rank11-direct-candidate-attack-window.cjs`](../../simulation/twinleaf/rank11-direct-candidate-attack-window.cjs); compact, fail-closed [summary parser](../../scripts/rank11-direct-attack-window-summary.cjs); [pure observer regressions](../../tests/rank11-direct-candidate-attack-window.test.cjs).
- Source opponent: rank 11 Wataru Yano Absol Garbodor, unchanged resolved source 60 in **physical seat 0**. Candidate always in **physical seat 1**; candidates are the unchanged rank-1 Shadow Rider reference or the **provisional English-print New Moon Lockbreaker proxy**. Engine pinned to `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; 220 root actions maximum per arm.
- Four **retrospectively selected** seed IDs from an earlier 128-deal held-Boost-Shake screen: `first-a=1325646358`, `second-a=1769876458`, `first-b=3316498962`, `second-b=2809154458`. Prefix describes **rank11's actual start**, verified anew against the source-deal draw log for every arm.
- Four arms per seed: `champion-reference` (generic), `new-moon-generic`, `new-moon-horror-compressor` (native opening pivot + attack-payload compressor + Horror House policy), `new-moon-blower-horror-compressor` (preceding plus autonomous Field Blower policy).
- Each arm uses the actual Store/deck-source inventory and original `withRank11DirectBoostShake` policy, strict prompt checking and forest-seal/compressor corrections. Frozen resolved rank11 60, candidate engine-card digests, revision and true first-turn evidence are checked. Source lock witness and candidate attacks are audited independently of `attackTrace` using `real-store-attack-log-declarations-v1`.

## Observations from the compiled job

**16/16** attempted arms were engine-observed without exceptions and showed `sourcePolicyCompleted=true`: the rank11 policy finished its route and the next-turn observer saw Tool-equipped Garbodor. This is a board-state witness for the intended lock, not a separate proof that Garbotoxin remained operational against every possible disabling effect. **10/16** arms had at least one candidate Store attack declaration after the witness. The individual seed/arm declarations below are **declarations only**; complete copied-attack resolution, meaningful damage and paper legality are not established.

| Actual first player | Seed | Champion generic attack declarations | New Moon generic | New Moon Horror+Compressor | New Moon + Field Blower policy |
| --- | --- | --- | --- | --- | --- |
| Rank11 | first-a | 5 × Full Moon Rondo | 17 × Scorching Light | 17 × Scorching Light | 17 × Scorching Light |
| Candidate | second-a | 1 × Energy Drive | 0 | 0 | 0 |
| Rank11 | first-b | 1 × Shadow Mist | Horror House-GX, 2 × Poltergeist | Horror House-GX, 2 × Poltergeist | Horror House-GX, 2 × Poltergeist |
| Candidate | second-b | Tapu Cure-GX, 3 × Night Watch | 0 | 0 | 0 |

The actual rank11-first seeds produced candidate declarations in **all 6/6** New Moon arms; both candidate-first seeds produced **0/6** New Moon attack-declaring arms. Champion reference declared at least one attack in **4/4** arms. These are within the selected seeds only, not a population rate or a performance comparison.

The three New Moon policy variants were **identical on the observed declared attack names and counts within each seed**. In particular the autonomous Field Blower arm recorded `confirmedToolRemovals=0` in all **4/4** seeds. This neither disproves the previously verified **different** held-Field-Blower source seed `1244180408` nor proves that Field Blower was physically available or optimally used in these four hands. It shows that this added policy did not change the relevant recorded outcome in this retrospective frame.

### Interpretation and next discriminating test

The strongest new constraint is the **candidate-first failure to reach any recorded attack declaration under this source-opponent policy** in both selected candidate-first seeds, despite next-turn Tool-equipped Garbodor in each policy arm. Any assertion that New Moon has an effective universal rank11 anti-lock line must first explain these exact accessible-state trajectories and establish a competent reply in fresh source-dealt seeds.

To make the next study discriminating: (1) inspect the candidate-first `decisionTrace`, own visible hand, Bench and Energy for the first two candidate turns; (2) distinguish unavailable attacks from choosing Pass while an attack was possible; (3) identify whether Field Blower was held, searched, blocked, or consumed; (4) instrument native and delegated attack **selection, effect resolution and turn end**, not only the declaration log; (5) choose fresh prospective actual-start-stratified seeds with all misses retained, and audit opponent response and official paper clock. Only after those gates should opponent-strength or deck improvement be inferred.

**Qualification ceiling:** the four seed IDs were outcome-conditioned, the models rely on corrected/partial Twinleaf card and decision machinery, the provisional New Moon Japanese-to-English printing mapping is not paper certified, and declaration traces do not prove full game semantics. Observed competitive-qualified games: **0**. Aichi exact source lists: **29/32**, missing ranks 23/25/28. Demonstrated 99.5% fixed-list win rate: **none**.
