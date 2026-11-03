# Authentic rank-5 original-source root audit: 20 copied Energy Mix shuffles missing per policy mode

**Agent 19 | 3 November 2026 | retrospective archive audit, no new games or performance claims.**

## Source custody

The independently registered frozen source-dealt original-rank-5 Aichi Mew/Genesect panel is [Agent22 run 41577868458](https://github.com/FlareZ123/experiment-01/actions/runs/41577868458), pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The raw artifact is [ID 13204622386](https://github.com/FlareZ123/experiment-01/actions/runs/41577868458/artifacts/13204622386), ZIP SHA-256 `6cc2318de387ea1eaee88b697c192618bbe6ec8733d48a5f321567e1bbb41a5a`, containing `agent22-rank5-fresh-dce-competence-v1-output.json`.

These were **16 actual native Store attempts**: eight immutable original-source rank-5 printed-sixty trials with original candidate sixties in two seats, replayed under `full-selected-joint92` and `dce-mew-mobility-disabled`. The two modes intentionally reuse the same eight seed/candidate/seat groups and have the same original source deal/start fingerprints for all eight matching pairs. They are two policy treatments of eight physical groups, **not 16 independent experimental draws**.

## Read-only analytic method

For each archived native result row and for **the actual original source physical seat** `row.sourceSeat`:

1. Inspect the existing native `rootActionLedger`, with no hypothetical action and no bot decision rerun.
2. Identify accepted `ResolvePromptAction` rows where `pendingPrompt === 'ChooseAttackPrompt'`, `attackChoice.attackName === 'Energy Mix'`, and `playerSlot === row.sourceSeat`.
3. Follow the exact `initiatingRootActionOrdinal` of that chosen attack to the corresponding source-owned `AttackAction`. Verify it is the original Mew VMAX **Cross Fusion Strike**, not merely an unrelated attack's prompt.
4. Restrict subsequent prompt resolutions to **that same root ordinal**. Determine whether the chain contains the actual native `AttachEnergyPrompt`, the printed mandatory `ShuffleDeckPrompt`, and completion `WaitPrompt`.
5. Keep every zero-Energy selected attachment attempt in the denominator. The printed Energy Mix's shuffle remains mandatory even when no Energy card gets transferred. This test does not infer deck-card availability, paper-target validity, or downstream win strength.

## Evidence counts

| Original-source physical trial | Full selected mode | DCE-mobility-disabled mode |
| --- | ---: | ---: |
| 5:0:A:champion-reference | 4 | 4 |
| 5:0:A:new-moon-lockbreaker-v1 | 0 | 0 |
| 5:0:B:champion-reference | 0 | 0 |
| 5:0:B:new-moon-lockbreaker-v1 | 4 | 4 |
| 5:1:A:champion-reference | 0 | 0 |
| 5:1:A:new-moon-lockbreaker-v1 | 0 | 0 |
| 5:1:B:champion-reference | 6 | 6 |
| 5:1:B:new-moon-lockbreaker-v1 | 6 | 6 |
| **Total accepted source-owned Energy Mix choices** | **20** | **20** |
| **Same-root AttachEnergyPrompt resolved** | **20** | **20** |
| **Same-root ShuffleDeckPrompt resolved** | **0** | **0** |
| **Same-root WaitPrompt observed** | **20** | **20** |

All **40 mode-specific** choices were linked to the original source's native `Cross Fusion Strike` attack root. Counts across the two modes are dependent, so this is strong **mechanics evidence of a repeated omission**, with no inferred game effect size.

This is stronger than an isolated prepared-board demonstration. The missing printed shuffle occurs after actual chosen attacks in source-dealt, original-printed-sixty Store games. In every one of the 20 choices per mode, the engine resolves attachment then continues to turn-end prompts without scheduling the required shuffle.

## Correction and qualification boundary

The new [default-off source reducer shuffle hook](../../simulation/twinleaf/agent19-energy-mix-shuffle-hook.cjs) is confirmed in the separate compiled actual prepared Store proof [run 41655879882](https://github.com/FlareZ123/experiment-01/actions/runs/41655879882), [complete report](agent19-energy-mix-native-paper-shuffle-correction-20261103.md). That proof includes both physical seats and the separate source-printed Fusion Strike attachment eligibility guard. It does **not** retroactively fix the archived Agent22 data; the archive is preserved unchanged.

The causal consequence of missing real deck randomization is not quantified here. Deck order, subsequent draws, bot policy, and opponent reply could all change under an actual corrected shuffle. A fresh preregistered source-dealt two-seat A/B panel, registered in [Agent19 manifest v1](../aichi-2026/registrations/agent19-rank5-energy-mix-shuffle-paired-20261103.json) and [common-runner-compatible v2](../aichi-2026/registrations/agent19-rank5-energy-mix-shuffle-paired-20261103-v2.json), is the next release step. The first v1 execution failed the frozen runner's two-candidate registration preflight before any game began; v1 registration remains immutable, while v2 adds the required companion candidate for the same seeds.

**Hard limitations:** even the archived engine-terminal dispositions cannot establish real paper wins; printed effect validation, realistic symmetric policy, complete original Top32 field (ranks 23/25/28 missing), 25-minute official event adjudication, and same-lineage opponent reply remain unqualified. Competitive qualified games: **0**. Target 99.5%: **not demonstrated**.
