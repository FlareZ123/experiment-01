# Agent 50: symmetric known-dead first attack choices reverse three original rank-11 developmental outcomes

**1 November 2026 | native original-Store evidence | 2 historically inspected source physical deals, 4 fixed-deck/deal comparisons, 8 game attempts | 0 competitively qualified games.**

## Research question

Earlier original rank-11 native Store archives found source Mega Absol ex `Terminal Period` into a defender with the wrong number of damage counters, source Trubbish `Call for Family` with five occupied Bench positions, and candidate Girafarig `Get Lost` against an empty opponent discard. Some were repeated despite payable printed damage attacks. Could applying one **identical exact-print, public-actor attack chooser to BOTH real players** change original Store outcomes, rather than unfairly privileging one candidate?

## Reproducible execution and identity

- [Manual compiled CI 41337846611](https://github.com/FlareZ123/experiment-01/actions/runs/41337846611), executed at source commit `947fd685abe4ad37e5c5285d90264345c2f4cf43` with pinned vendor `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The Agent50 native comparison step **passed**, and an eight-attempt JSON packet was uploaded in [artifact 13096490339](https://github.com/FlareZ123/experiment-01/actions/runs/41337846611/artifacts/13096490339). ZIP SHA-256 `7fd2101bd2950940ab6ad42fda3a1ebf3caf75c8416b6574e96199f6fc3cb676`; uncompressed JSON SHA-256 `3e14cdecd39fb138c8c116063dc8cdb8ed8b5d683a15458a9cea0c0242360ea4`.
- Actual runner `simulation/evaluation/agent50-rank11-bilateral-known-dead-native-pair.cjs`; common opt-in driver `simulation/evaluation/agent41-bilateral-v2-development.cjs`; existing exact-print chooser `simulation/twinleaf/agent1-actor-dead-first-attack-frontier.cjs` (version `agent1-actor-known-dead-leading-attack-v2-trubbish-fullbench`). No vendor submodule modification. The original frozen v2 policy option set was held constant; treatment added `bilateralKnownDeadAttackRoot:true` for both seats.
- Pre-existing balanced rank-11 repeat-2 original deals: physical candidate slot A seed **3821563342**, source physical seat 1, source first; slot B seed **1326071353**, source physical seat 0, candidate first. Each original source deal was paired with both unchanged `champion-reference` and `new-moon-lockbreaker-v1` candidate printed 60s. Thus 4 candidate/deal comparisons and 8 native attempts; two source physical deal fingerprints, **not** eight independent prospective sample draws.
- All **4/4 baseline/treatment pairs** matched `sourceDealFingerprint`, `fullPhysicalDealFingerprint`, both printed 60 fingerprints, physical seat, actual first player, and seed. All **8/8 native games** reported `SETTLED_PHYSICAL_INTEGRITY_PASSED` and `consistent-accepted-native-setup-and-first-draw`. There were no engine-aborted attempts in this eight-attempt packet. This narrow physical gate does not certify every card effect or decision.
- Eight pure paired comparison tests on latest source passed in a local V8 harness, including disallowing missing physical receipts and matching later different-trajectory actions as though they shared one same-root context. The first CI source head preceded these two later *reporting-only* refinements (`d78dc3e`, `abd0d55`); those refinements were not part of the recorded native run, and a subsequent native rerun is needed to attest their postgame digests.

## Complete native attempt table

| Original registered rank-11 arm | First actual root divergence, same initial prefix | Baseline native outcome | Both-seat correction native outcome |
| --- | --- | --- | --- |
| `11:2:A:champion-reference` | candidate seat 0, T6 ordinal 46: `Get Lost` -> `Mind Shock` | 260-root cap, Prizes `[6,6]` | 260-root cap, Prizes `[5,6]` |
| `11:2:A:new-moon-lockbreaker-v1` | source seat 1, T13 ordinal 82: `Call for Family` -> `Super Poison Breath` | candidate seat 0 engine win, `[0,6]`, 259 actions | source seat 1 engine win, `[6,0]`, 140 actions |
| `11:2:B:champion-reference` | source seat 0, T10 ordinal 49: `Terminal Period` -> `Claw of Darkness` | candidate seat 1 engine win, `[6,0]`, 179 actions | source seat 0 engine win, `[0,6]`, 91 actions |
| `11:2:B:new-moon-lockbreaker-v1` | source seat 0, T10 ordinal 54: `Terminal Period` -> `Claw of Darkness` | 260-root cap, `[6,3]` | source seat 0 engine win, `[0,6]`, 86 actions |

Prizes are **physical seats `[seat0,seat1]` remaining**, so a lower number means that seat has taken more Prizes. Every ending above is the reported **untimed native-engine** status, not a paper Aichi tournament result.

**Aggregated within these four dependent developmental comparisons:** baseline 2 candidate engine wins, 0 source wins, 2 caps; corrected 0 candidate wins, **3 source wins**, 1 cap. This is a clear **policy-sensitivity counterexample**, not a metagame win-rate estimate.

## First genuinely settled same-source root and opponent continuation

All four first changed native attack choices had accepted `AttackAction` roots, `settledPromptChain:true`, identical predecision compact root prefixes, physically recorded after-attack Prize totals, and an actual next-actor root whose transition remained within the same game epoch:

| Arm | First baseline attack and Prize change | First treatment attack and Prize change | Next opposing native root after settlement |
| --- | --- | --- | --- |
| A champion | `Get Lost`, `[6,6]` -> `[6,6]` | `Mind Shock`, `[6,6]` -> **`[5,6]`** | source T7: baseline `Call for Family`, treatment `PassTurnAction` |
| A New Moon | `Call for Family`, `[6,6]` -> `[6,6]` | `Super Poison Breath`, `[6,6]` -> `[6,6]` | candidate T14: `PassTurnAction` in both |
| B champion | `Terminal Period`, `[6,6]` -> `[6,6]` | `Claw of Darkness`, `[6,6]` -> **`[4,6]`** | candidate T11: `PassTurnAction` in both |
| B New Moon | `Terminal Period`, `[6,6]` -> `[6,6]` | `Claw of Darkness`, `[6,6]` -> **`[5,6]`** | candidate T11: `PlayCardAction / Tapu Lele-GX` in both |

These receipts show an actual same-prefix first attack choice and its subsequent native effects, rather than only theoretical affordability. Differences at later numerical root indices **after the first divergence** do not identify same-state decisions because the full game trajectories already differ; the latest analysis helper explicitly avoids making that attribution.

## Decision and release limits

- **Opposing source competency mattered.** Giving the original rank-11 opponent the same correction overturned two historical candidate-labeled engine wins and changed one capped game into a source win. A candidate-only correction in this environment would answer a different question and could reward a deficient opponent.
- The archived original 32-arm frozen v2 closure is **not inherited** by this altered research driver. The native run is versioned by its own head SHA and changed source. The two fixed candidate 60s were unchanged; this experiment does not identify a stronger new 60.
- Native `ChooseCardsPrompt` acceptance does not independently establish correct paper randomness for `Night Watch`, hidden-information-safe generic decision making, all card effects, or legal timing under the Aichi Open's **25-minute** clock. One generic engine terminal may be vulnerable to those defects even when all physical cards remain conserved.
- We retained the action caps, baseline/treatment traces, source/candidate attacks, settled Prize states, initial physical deal and printed 60 SHA identities. The contemporary improvement to the readout adds an independent physical-card prompt-choice digest to detect differing physical answers behind identical compact root labels. This digest was **not present in the archived first native packet**.
- Outcome changes are **retrospective development only** on two previously inspected original source deals. Four arms share those deals and two candidate inventories. Their within-game repeated attacks are correlated and must not be converted into independent win observations. A new prospectively frozen both-seat sample with sound paper-prompt and game-clock boundaries is necessary before ranking fixed decklists.
- The full intended field still has **29/32 authenticated exact original lists** and **0 competitively qualified games**; there is no demonstrated 99.5% win rate.

## Next experiments

Re-execute the same original paired native fixture at a new source SHA to validate the postgame physical-choice checksum without changing the treatment; archive whether the first divergence, prizes and outcomes reproduce. Then integrate this symmetric choice into a genuinely common paper-qualified decision profile and test fresh both-start rank-11 source seeds. Extend to previously uncovered source archetypes rather than inflating the rank-11 repeated-root denominator. Support the official timing gate independently.

## Reproduction after evidence hardening

An independent compiled rerun [CI 41338504163](https://github.com/FlareZ123/experiment-01/actions/runs/41338504163), source head `cadb1cf11afa014c9f51872463246d710bf6f9d5`, completed SUCCESS. [Artifact 13096910095](https://github.com/FlareZ123/experiment-01/actions/runs/41338504163/artifacts/13096910095) has ZIP SHA-256 `36868f79526e7c9297a4fcc31634137bcdd79d064084d03e24839ea8be72ba1f` and raw JSON SHA-256 `aef92810de2bb9f616177d8d80a36ad5581ceddf3b367718d9aead73b3a54c33`.

All four same physical-deal comparisons, first accepted native attack divergences, eight action counts, eight terminal/cap outcomes and engine winner identities reproduced exactly. Each pair now shows precisely one first shared-prefix changed attack. All eight arms also have an independent postgame hash of physically named prompt selections. Baseline/treatment hashes differ in every pair, because the intervening attack effects change later decisions. This is stronger postgame observability and remains unqualified as paper play.

Original A champion prompt choice sidecars included 24 selections whose physical card names were unknown in each policy arm. The other three cases have named choices for all recorded prompts. Missing named selection receipts remain a certification limitation. The repeated native results reuse two historical original source deals and create no new statistical sample.

Freshly randomized, uninspected rank11 source deal seeds were separately preregistered before their own native execution in `results/aichi-2026/registrations/agent50-prospective-rank11-bilateral-known-dead-20261101.json`.
