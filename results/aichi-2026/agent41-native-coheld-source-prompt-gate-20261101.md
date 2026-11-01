# Agent 41: native canPlay for a genuine original rank-6 coheld Supporter contest

**1 November 2026 | Native two-seat paper-Expanded development evidence | No competitive games certified.**

## Question and falsifiable test

A preregistered original rank-6 source-dealt field census previously discovered an early physical owner root holding both `Plumeria BUS` and `Team Flare Grunt XY`. Does the **pinned original Twinleaf Store** independently accept both printed Supporters as `card.canPlay` for the same owner and public opposing Active Energy state, without changing any gameplay?

The test reads exact physical cards from the acting owner's hand, asserts their printings match a separately detached actor observation, checks source-owned Supporter quota and public opposing Active Energy, and calls the real Store's `canPlay` once per physical held copy. It checks unchanged detached actor observation and quota after each native legality probe. **It dispatches neither Supporter, makes no prompt choices and cannot certify card-effect settlement.**

## Reproduction and native witness

- Original source: Aichi Open League 2026 final rank **6** authenticated original 60.
- Two unchanged fixed candidate comparators: `champion-reference`, `new-moon-lockbreaker-v1`.
- Original frozen registered physical source seed: **296638747** (repeat 10, candidate physical slot A, source seat B/1).
- Authenticated original source-deal SHA256: `29db5b5feaf15b2eec86b19e7d1bbe46738f63ef8e479da9a22ecb46970a1dab`.
- Frozen schedule: `results/aichi-2026/registrations/agent41-rank6-grouped-denial-original-source-20261031.json`, Git blob `6f4a694403069674f33daf81eff18971e214b758`.
- Original engine pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Native entrypoint: `simulation/evaluation/agent41-native-source-rank6-coheld-canplay.cjs`; owner-only native inspector: `simulation/twinleaf/agent41-native-coheld-denial-canplay.cjs`.
- **Successful manual CI**: [run 41271465642](https://github.com/FlareZ123/experiment-01/actions/runs/41271465642), original Store compiled, 73 source-panel pure tests passed, zero failures. Original raw artifact ID **13069084071**, ZIP SHA256 `bd6462b4e40b8636475bfd2011a45b22f16d12b6d08349f347dadefe44bfb66c`. Bounded native outcomes also appear in the successful job's `FOCUSED_NATIVE_COHELD` log line.

| Fixed comparator | First authentic source coheld root | Original physical Supporters at that root | Both native playable | Coheld root observations | Native status |
| --- | --- | --- | --- | ---: | --- |
| Champion reference | Global turn **2**, root **4**, source seat **1** | Plumeria BUS hand[1], Team Flare Grunt XY hand[0] | **Yes**, both `canPlay===true` | **31/31** | Censored/action cap |
| New Moon Lockbreaker | Global turn **28**, root **33**, source seat **1** | Plumeria BUS hand[1], Team Flare Grunt XY hand[0] and hand[18] | **Yes**, all held copies `canPlay===true` | **25/25** | Censored/action cap |

All 56 observations are repeated owner decisions **inside two game trajectories**, not independent matches or a 56-game win-rate denominator. The first champion-facing source root is especially useful because it proves a genuine turn-2 alternative to the ordinary baseline Pass before a late long-hand state.

## Repairs and evidence quality

- Agent 41 corrected an actual JavaScript shadowing/duplicate-binding defect in the opt-in native inspector (`8d18ff4c`): the owner observation callback and local printing-inspection function had shared the name `observe`.
- Added both-seat isolated regression coverage for native physical-copy enumeration, true/false `canPlay`, a throwing card callback, no-cohold exclusion and nonmutation failure (`56695d14`).
- Fixed the focused report's physical source-seat derivation from its frozen candidate-slot geometry (`0423fa96`) after a previous [failed manual run 41163796571](https://github.com/FlareZ123/experiment-01/actions/runs/41163796571).
- The focused report now preserves every attempted arm, its status and a named fail-closed validation diagnostic **before** exiting nonzero for an unmet witness (`c560025f`). This avoids losing the negative native output solely because the report's postcondition fails.
- The existing manual workflow was reused; no push-triggered CI or vendor change was added.

## Qualification boundary and next acceptance gate

**Native playable is not native played.** The model has not selected either Supporter at this contested root, settled Plumeria's two-card owner payment and opposing Energy target, or compared the later source/candidate response with that of Team Flare Grunt. The original baseline decision policy and both candidate 60s remain unchanged. Paper Supporter timing, actual full-game decision competence, clock fidelity and eventual competitive winner cannot be inferred from the `canPlay` result.

The next useful **single shared chooser** experiment is a same-physical-deal, same-root owner-choice fork inside the canonical bilateral runner, with both card choices and a hold alternative, genuine accepted root, mandatory prompt chain, later owner continuation, opponent reply, and no-opportunity/error/action-cap retention. Agent 4 already has broader source-owned Flare/Plumeria causal pilots, so integration should reuse their native prompt handler and receipts rather than replaying this observer as another matchup-win trial.

**Field-level status remains 29/32 exact original opposing lists (ranks 23,25,28 unresolved), 0 competitively qualified games, no established fixed 60, no demonstrated 99.5% field win rate.**
