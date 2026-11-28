# One coherent fixed-Hood candidate policy: three independent execution repairs integrated without losing existing coverage (2026-11-28)

**Status:** owner-review branch, **not merged**, no native CI/game/Store dispatch; explicitly **not** a win-rate result. The target fixed Hood Shield source 60 is unchanged. This is a coherent implementation option for [draft candidate engine PR #95](https://github.com/FlareZ123/experiment-01/pull/95), not a competing deck recommendation.

[Integrated review branch](https://github.com/FlareZ123/experiment-01/tree/agent1/candidate-pr95-coherent-execution-20261128), rooted in PR #95 original `321302d26d417257d947fb0a942c26e647c32b67`, contains only **one modified** `simulation/evaluation/2026-11/agent46-candidate-policy.cjs` worker and **three added policy regression files**. Branch commits: [combined worker `aaf0b43`](https://github.com/FlareZ123/experiment-01/commit/aaf0b433176ef8b0c84da02c3fc7d768cd39da02), [Guzma test `d11ed95`](https://github.com/FlareZ123/experiment-01/commit/d11ed95f2fb967fe10e5c6cc9d42e8b290f46bf4), [Max Geist test `588805d`](https://github.com/FlareZ123/experiment-01/commit/588805d98f718f0f90d79027e7e45794f2c211cc). The third second-V source test arrived from the branch base.

## Integrated gameplay transitions

1. **Guzma BUS115:** Score a gusted opponent's Bench KO using the **forced incoming own Benched attacker**, not the outgoing Active. When no own Bench, the own-switch clause cannot resolve and the Active stays. Opponent-target `ChoosePokemonPrompt` also uses post-switch payable attacks, and falls closed when none is available. Details: [source-specific proof](agent1-hood-guzma-forced-self-switch-decision-20261128.md).
2. **Repeatable Shadow Rider VMAX engine:** The fixed source 60 has 4× Basic Shadow Rider V and 4× VMAX. Once one V/VMAX is established, seek another Basic V with Fog Crystal CRE140 / Mysterious Treasure FLI113 / Quick Ball FST237 and their **actual source-printed deck prompts**, Bench it within a reserved slot, then search a second VMAX with Treasure when an eligible Basic V exists and native evolution is offered. Prevent VMAX-in-hand from being falsely treated as a Basic V. Preserve Regidrago Mimikyu counter and Bench budget when these truly contend. Details: [three-channel engine chain](agent1-hood-second-v-engine-root-20261128.md).
3. **One-Energy Max Geist lethal setup:** When 3 Psychic already pay VMAX Max Geist but the **actually offered native manual Energy action** would add 30 damage and newly cross an unobstructed opponent HP threshold, take the attachment **before** the nonlethal attack. The narrow helper does not project away defender abilities/tools/stadiums. Details: [220 HP one-turn exact KO](agent1-maxgeist-one-energy-exact-ko-policy-20261128.md).

Combining these patches did not trivially commute: the root planner, prompt scorer and energy sequencing share `chooseRoot` and resource contention. I assembled the actual source function deltas from the three **already tested** isolated branches onto the latest second-engine branch; then executed the **exact final GitHub-fetched combined file** against all three suites to detect interference. No independent old-branch result is silently relabeled a combined test.

## Executed baseline and compatibility evidence

| Unit-test set | Unmodified draft PR #95 | Combined worker |
| --- | ---: | ---: |
| Our two-seat Guzma + competing Underworld Door root/prompt | 4/14 | **14/14** |
| Our two-seat second V root + Fog/Quick/Treasure/VMAX search/evolve | 12/28 | **28/28** |
| Our two-seat exact lethal Max Geist Energy sequence + uncertainty controls | 12/14 | **14/14** |
| **Total new integration cases** | **28/56** | **56/56** |
| Existing Agent32 draft colored-cost / Underworld root / typed prompt suites | not rerun baseline in this invocation | **38/38** |
| Existing original Agent46 basic worker contract/setup/search/audit suite | not rerun baseline in this invocation | **19/19** |
| **Combined evidence total** | — | **113/113** |

The three Agent32 test files were loaded from the **exact draft PR #95 branch**, the 19 original policy tests from `main`, and all were run against the **final combined branch** via synchronous V8/CommonJS, executing each test callback and assertions. The Node `node:test` / strict assert API was simulated locally, and the original suite's file read of the worker source returned the exact fetched worker text; strict `agent49-policy-protocol.cjs` validators were executed for new tests. This is **in-process JavaScript regression execution**, not a Node CLI test run, not Twinleaf Store, and not 113 actual games.

**Independent native evidence** (not an execution result of this integrated branch): earlier archived pre-PR #95 116-game action ledgers recorded **11 Hood games** with two Underworld Door source activations on the same turn, confirming the multi-engine mechanic can arise in the pinned Store. Full witness/action ordinals in [second-engine report](agent1-hood-second-v-engine-root-20261128.md).

## Owner review gate

The newer, substantially more sophisticated `agent46/two-profile-policy-successor-20261127-v2` worker may be the **preferred final policy**; it already handles second V root and active Guzma better, adds Radiant Eternatus Climactic Gate, fuller lock-state and attack opportunities. The integrated **PR #95 simple-worker branch is not recommended for blind substitution** without owner deciding which policy lineage to use. Use this branch as a runnable fallback/acceptance comparison and take only independently justified improvements into a final owned profile.

**Still missing:** a pinned Twinleaf **native** source/projector-to-owner-policy-to-actual-Store continuation for these exact code changes; full 29 authenticated opponents evaluated on unchanged 60; ranks 23/25/28 source lists; 0/32 qualified benchmark matchups. Nothing here establishes the desired 99.5%.
