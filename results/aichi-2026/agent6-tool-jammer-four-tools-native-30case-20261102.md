# Agent 6: Tool Jammer shared ToolEffect repair, four Tool classes and Active-vs-Bench geometry

**2 November 2026, 16:12 UTC | opt-in staged native mechanics | no natural competitive games**

## Why this corrects a real original-field risk

The immutable authenticated [Aichi original printed-60 field](full-decklists.json), blob `ae773f6201d7aa69d31914dbfee66f3fba692200`, has **29 complete original lists** and three missing ranks (23,25,28). In the 29 verifiable lists:

- **Tool Jammer** is present in ranks **3, 6, 7, 24, 29** (one copy per list); ranks **6/24/29** are Iron Thorns.
- **Float Stone** is present in ranks **1, 3, 5, 8, 9, 11, 15, 16, 19, 22, 26, 30** (12 distinct source lists).
- **Stealthy Hood** is present in ranks **2, 3, 15, 32** (four source lists).
- Air Balloon and Fighting Fury Belt are **absent from the 29 original lists**; their native tests here establish an independent effect-family boundary rather than a measured field incidence.
- Rank30 original Lillie's Clefairy runs one Latias ex and one Float Stone; original Iron Thorns ranks 6,24,29 each run Tool Jammer. This defines possible full-field matchup interactions, **not** an observed shuffled/dealt collision or a win probability.

A demonstrated native bug in that interaction could misstate any future outcome on an encounter. Excluding it until fixed makes the current zero-qualification boundary especially important.

## Pinned source cause and reversible repair

The actual pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` has the `ToolJammer.reduceEffect` Tool suppression commented out while the live helper `IS_TOOL_BLOCKED` reduces `ToolEffect` and catches a throw; `FloatStone`, `AirBalloon`, `FightingFuryBelt` and `StealthyHood` each use that helper. Full source audit and initial four-row receipt: [Agent6 pinned Tool Jammer root cause](agent6-pinned-tool-jammer-noop-tooleffect-repair-20261102.md).

The opt-in [ToolEffect guard](../../simulation/twinleaf/agent6-tool-jammer-tool-effect-guard.cjs) is applied only to the owner-facing Store within a synchronous `try/finally`. It blocks a ToolEffect on the player's actually attached Active Tool when the opposing **Active** carries an unblocked Tool Jammer. It exempts one's own Tool Jammer, and observes the native `IS_TOOL_BLOCKED` state of the opposing Jammer. The pinned vendor is untouched. [Six pure regression cases](../../tests/agent6-tool-jammer-tool-effect-guard.test.cjs) pass.

## Compiled cumulative native matrix

The separate opt-in `runEffectRepair()` of [genuine pinned Store stage](../../simulation/twinleaf/agent6-skyliner-public-suppression-native.cjs), wired into the pre-existing manually dispatched [rank30 staging workflow](../../.github/workflows/agent7-rank30-source-psychic-staging.yml), was expanded without changing the original uncorrected 30-case baseline. All manually pre-staged rows were run in **both physical seats**.

| Tool or protected action | Opposing card position / scenario | Native effective result | Paper interpretation |
| --- | --- | --- | --- |
| Float Stone BKT on uncharged Latias ex SSP | Active Tool Jammer, Path or Thorns | Retreat cost 2, attempted unfunded RetreatAction rejected | Correct suppression |
| Air Balloon SSH on Latias | No opposing Tool Jammer | Cost 0, native RetreatAction accepted | Correct benefit |
| Air Balloon SSH on Latias | Opposing Active Tool Jammer, Path or Thorns | Cost 2, native RetreatAction rejected | Correct suppression |
| Fighting Fury Belt BKP on Latias | No opposing Tool Jammer | HP 210→250 | Correct +40 HP |
| Fighting Fury Belt BKP on Latias | Opposing Active Tool Jammer | HP remains 210 | Correct suppression |
| Float Stone, Air Balloon, Fighting Fury Belt | Opposing Jammer attached to **Bench Pidgey**, not Active | Native effect retained; zero ToolEffect veto receipts | Correct position boundary |
| Stealthy Hood UNB on Latias vs Active Iron Thorns ex Initialization | No Active Tool Jammer | `IS_ABILITY_BLOCKED=false`; native Skyliner retreat cost 0, RetreatAction accepted | Hood protects against opponent Ability |
| Stealthy Hood UNB on Latias vs Active Iron Thorns | Same enemy Active also attaches Tool Jammer | `IS_ABILITY_BLOCKED=true`; retreat cost 2, action rejected; three actual Hood ToolEffect vetoes | Jammer disables Hood, exposing Initialization |

The 30-row combined artifact includes separate Path and Thorns source setups where applicable and both physical seats. All staged rows showed expected printed owner-visible card geometry; other original policy fixtures remain conservative. Newly added default-off [public Hood-aware proposal](../../simulation/twinleaf/agent6-skyliner-hood-vs-thorns-frontier.cjs) permits nominal funded Rondo after Hood has protected the *Active Latias* against lone opposing Thorns, and vetoes it if the opponent's Active carries Tool Jammer or stadium Jamming Tower. It also refuses unknown other opponent Bench abilities and checks other recognized face-up locks. [Seven pure tests](../../tests/agent6-skyliner-hood-vs-thorns-frontier.test.cjs) pass, including a no-hidden-data probe. The original public guard still vetoes all Thorns, deliberately unchanged.

### Exact archived receipts

- [CI 41476118861](https://github.com/FlareZ123/experiment-01/actions/runs/41476118861): **12/12** Float Stone + Air Balloon paths, artifact `13156553753`, ZIP SHA256 `bf9ab0ca4e0194e13dcaa15ccfb749766a1eae64a239d2ee9cb2341789652b9c`.
- [CI 41476663150](https://github.com/FlareZ123/experiment-01/actions/runs/41476663150): **20/20** adding Fighting Fury Belt HP, artifact `13156429341`, SHA256 `b6b4f001f213524d2f704e015c0256372cd39b2c4a6c48b589d9bc579946e1e2`.
- [CI 41477143502](https://github.com/FlareZ123/experiment-01/actions/runs/41477143502): **26/26** adding opposing **Bench** Jammer negative controls, artifact `13157493973`, SHA256 `62267baa9ca72aa9d8054e366f4ecaf9e20aae91a32ef86714908ff71effc69b`.
- [CI 41477532531](https://github.com/FlareZ123/experiment-01/actions/runs/41477532531): **30/30** adding Hood/Initialization/Jammer, artifact `13157474067`, SHA256 `dc678704808a44cff498dae9dd35c5cf26dc69aa6b1648c5475d346b500776f3`.
- [CI 41478262814](https://github.com/FlareZ123/experiment-01/actions/runs/41478262814): **30/30** combined native Store rows plus seven public Hood proposal pure cases, artifact `13158591733`, SHA256 `775915b4d9af92ea5b33203b1247fb26169817eadf06191c66b5c619db3253fe`. The native Hood-aware selector yielded an offer in both unjammed rows, no offer in both Active-Jammer rows, matching the actually computed Skyliner ability state.

Each ZIP was downloaded independently and its checksum matched the corresponding GitHub artifact digest; native JSON recorded **failedChecks=0**. The workflow's original uncorrected baseline is intentionally paper-invalid and leaves its overall job status red. The new isolated steps all passed. **No natural selected match is paper-qualified**.

## Strict stop lines and next tests

These rows use manually assembled public board, energies, Tools and source turns. The original 60-card rank30 list was not naturally shuffled into this state, the opposing Tool Jammer was installed directly rather than selected and played from a real hand, and the first 30-row stage stops at retreat. Thus the 30/30 number is a deterministic *mechanics matrix*, not game success, win rate, or release qualification.

The public Hood proposal is a bounded policy inference. It only handles opponent Active Iron Thorns Initialization, attached **Active Latias** Stealthy Hood, no opposing Active Jammer, no Jamming Tower, and no other unrecognized opposing Bench Abilities. Full gameplay may contain other blockers. An actual attack settlement and an opposing response remain essential for any paper-valid line claim. The latest separate opt-in follow-up is being tested in [CI 41478791752](https://github.com/FlareZ123/experiment-01/actions/runs/41478791752), and is pending as of this report; do not infer its outcome from retreat alone.

Do not merge the default-off guard into the selected frozen bilateral profile until an integration steward registers original source deals and verifies native actual Tool attachment, payment, action effects, and opponent response. Overall benchmark remains **29/32** original printed sixties, ranks 23/25/28 missing, **zero** competitive-qualified games, no final optimized sixty and no demonstrated 99.5% win rate.

## Post-publication additive validations, preserved independently

**Exact card text and format check:** The individual card pages [Tool Jammer BST136](https://limitlesstcg.com/cards/bst/136), [Stealthy Hood UNB186](https://limitlesstcg.com/cards/unb/186), and [Jamming Tower TWM153](https://limitlesstcg.com/cards/twm/153) all identify legal Expanded printings. Tool Jammer expressly suppresses opposing **Active** Pokémon Tools while the holder is Active, explicitly exempting Tool Jammer itself. Stealthy Hood prevents the opponent's Abilities from affecting its attached Pokémon. Jamming Tower disables attached Pokémon Tools on both sides. These independent card texts support the native staged causal claims and the need to check both the holder's position and whether the Jammer is itself suppressed.

**34/34 staged native ToolEffect check:** Additional scenarios equip a Tool Jammer to opposing Active Thorns while Jamming Tower is simultaneously in play. In four added cases (Float Stone and Stealthy Hood, both seats), native `IS_TOOL_BLOCKED` reports opposing Tool Jammer already suppressed, so the research ToolEffect interceptor issues **zero** extra Jammer blocks. Jamming Tower independently disables the owner's Tool, leaving Skyliner blocked, retreat cost 2 and actual retreat rejected. [CI41479938732](https://github.com/FlareZ123/experiment-01/actions/runs/41479938732), [artifact13160056395](https://github.com/FlareZ123/experiment-01/actions/runs/41479938732/artifacts/13160056395), ZIP SHA256 `756817336a9c289a0b31e45499de64fbcf43dc55f883890172ebe0c17765fa78`, independently inspected. Overall `stagedNativeCases=34, failedChecks=0`, unchanged baseline still red.

**Follow-up local attack and two-Prize settlement:** [Separate reproduced native result](agent6-hood-rondo-native-prize-promotion-20261102.md) moves beyond just free retreat: opposing Thorns without Tool Jammer yields an actual Clefairy Rondo Knock Out, two physically taken Prize cards and opposing Bench promotion in both seats. With Jammer, native retreat rejects and no attack occurs. This remains a *synthetic staged local line*, 0 full competitive games. Do not conflate native action acceptance with completed attack effects; the actual attack requires resolving an animation WaitPrompt, Prize prompt, and promotion prompt.
