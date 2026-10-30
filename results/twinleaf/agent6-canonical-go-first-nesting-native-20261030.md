# Agent 6: original-Store first-player preference composes with canonical bilateral actor policy

**30 October 2026 | Native setup-only integration positive control, 0 competitively qualified games.** This follows the [symmetric](agent6-native-go-first-choice-4pair-20261030.md) and [asymmetric](agent6-native-go-first-asymmetric-four-pair-20261030.md) primitive-adapter controls.

## Exact compilation and provenance

- **[Manually dispatched GitHub Actions run 40985214583](https://github.com/FlareZ123/experiment-01/actions/runs/40985214583) completed SUCCESS**, research head `f9201b54edf0e3c31dd047b9d7be166fcfb8197d`. The existing `.github/workflows/twinleaf-setup-audit.yml` was extended with an **opt-in** canonical nesting step triggered only by `agent6_go_first=true`. The workflow remains manual-only; default-off execution is unchanged.
- Exact submodule `vendor/twinleaf` still pins upstream commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- [Native artifact 12946577069](https://github.com/FlareZ123/experiment-01/actions/runs/40985214583/artifacts/12946577069), 583-byte ZIP with published SHA-256 `60a6099db43b71f4626307c82b5b7d3d16b115641405a18cd832151ed3894c8a`. Downloaded artifact SHA independently matches; contained original `agent6-go-first-canonical-native.json` (5220 bytes), schema `agent6-canonical-go-first-nesting-v1`.
- New research-side [native composition fixture](../../simulation/evaluation/agent6-go-first-canonical-native.cjs) uses original registered source rank-6 Iron Thorns and rank-11 Absol/Garbodor, fixed rank-1 Shadow Rider reference, both source physical seats, authentic original Store, and `captureSetupOnly` stopping before first actor turn actions. It composes the unmodified [canonical actor policy](../../simulation/evaluation/agent7-canonical-actor-composition.cjs) with [`withGoFirstChoice`](../../simulation/twinleaf/agent6-go-first-choice.cjs). Canonical audit version reported `agent7-canonical-actor-five-component-v2`.

## Certified narrow control

For each of the four rank/physical-source-seat combinations (rank 6 seat 0, rank 6 seat 1, rank 11 seat 0, rank 11 seat 1), four genuinely executed native setups cover:

1. `GO_FIRST` adapter outside canonical policy; preferences `[true,false]`.
2. Canonical policy outside `GO_FIRST` adapter; preferences `[true,false]`.
3. Adapter outside canonical; preferences `[false,true]`.
4. Canonical outside adapter; preferences `[false,true]`.

The seeded coin winner stayed identical across all four arms within each rank-seat group; both nesting orders yielded the same actual first player for the same preference array, and opposite preferences reversed it. Every **16/16** arm recorded the original Store's `GO_FIRST` prompt and `verifiedByDrawLog=true` on the first settled player turn, with `firstTurnSlot === (preferences[winner] ? winner : 1-winner)`. The fixture also compared and confirmed the original `SimpleTacticsAi.prototype.decodeNextAction` descriptor after every nested run, proving both reversible monkeypatch layers restored cleanly on these normal cases.

An independent offline read of the archived JSON confirmed exactly 4 rank-seat groups, 16 native setup arms, the original coin-winner/first-turn invariants, consistent canonical audit version, and the ZIP digest. The **two numerical seeds** `24941728` and `1460221882` are repeated between ranks. They are deterministic test fixtures, not representative competitive random trials.

## What remains unqualified

The test stops before substantive gameplay. It verifies that the preference adapter can be nested with the **current** canonical actor chain and still handle a real setup prompt, independent of nesting order. It says nothing about whether the integrated chooser uses owner-only information in future tactical decisions, optimizes rival legal action priorities, actually plays rank6 control cards or rank11 Garbotoxin lines, handles fresh hidden hands, gives an effective source reply, models tournament time, or produces competitive wins. It also does not certify the fixture against later policy versions if the composition changes.

The next trustworthy experiment must introduce a **frozen owner-legitimate pre-game choice preference** into Agent41's single canonical release, then measure naturally dealt first-turn actions and actual opponent continuations with prospective coin-winner intake, all failed/censored arms and explicit clock/paper-rules vetoes. Avoid retroactively changing the 29 Oct 32-arm frozen scout. The [coin-winner-stratified intake](../statistics/agent6-prospective-actual-start-stratification-20261029.md) already defines the distinction between exogenous coin-winner identity and endogenous actual first player.

**Benchmark unchanged:** only 29/32 original 60s authenticated; ranks 23/25/28 missing. **0 qualified competitive games, no demonstrated best fixed 60 and no 99.5% evidence.**
