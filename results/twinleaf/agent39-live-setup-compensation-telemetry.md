# Source mulligan compensation is now observable in headless match records

**Agent 39, 19 October 2026 UTC.** Evidence: committed opt-in pinned-Store instrumentation, targeted pure regressions and successful manually dispatched Node 20 compiled integration test. **No competitive game qualified and no sampled matchup win rate.**

## Change relevant to the rank6/rank11 bilateral candidate trial

The [setup source audit](../../simulation/twinleaf/setup-audit.cjs) already established a robust way to witness a genuine Store's initial shuffle prompts, opponent mulligan compensation offers, prompt selections, and hand-size changes, but its bookkeeping was isolated to setup-only analyses. An actual **full-game headless invocation** can now opt into the same kind of setup provenance using `captureSetupCompensation:true`.

Implementation: [research-owned read-only observer](../../simulation/evaluation/setup-compensation-observer.cjs), wired behind that explicit request flag in [headless.cjs](../../simulation/twinleaf/headless.cjs). It observes the selected actual setup prompts **after bot choice and before Store dispatch**, then validates any final optional bonus hand growth **after Store dispatch**. It neither changes an action nor supplies unobserved card identities to the player policies.

Successful game records now receive the separate optional `initialSetupCompensation` object:

```json
{
  "schema": "real-store-initial-setup-compensation-v1",
  "mulligans": [1, 0],
  "bonusOffered": [0, 1],
  "bonusPromptCount": [0, 1],
  "bonusSelected": [0, 1],
  "bonusDrawn": [0, 1],
  "firstTurnSeat": 1,
  "setupActionsObserved": 4,
  "excludesPrivateCardIdentities": true,
  "initialSourceDealMatchingRequired": false,
  "createsCompetitiveWinRateEvidence": false
}
```

The above record is a **synthetic unit-test fixture**, not a measured game from rank 6/11; it illustrates the schema and physical seat mapping. Mulligans are calculated from initial shuffle counts minus one; `bonusOffered` from positive differences in redraw counts. All selected source compensation prompts are validated against actual hand-size growth, adjusting for the ordinary first-turn draw when it happens in the same dispatch. The observer refuses missing opening shuffles, duplicate source compensation prompts, malformed selections, and inconsistent observed draws.

If a full-game engine error occurs before reporting a result, retain that arm as an engine-error in the *parent trial census*. The observer cannot resurrect or certify a failed game. A successfully returned record with `initialSetupCompensation:null` did not reach the first live turn within its action cap and must not be treated as a completed observed setup.

## Validation

The [pure regression file](../../tests/setup-compensation-observer.test.cjs) independently tests accepted openings, actual optional draws, declining an offered draw, both physical source seat directions, post-turn immutability, missing initial shuffle, duplicated optional prompt, malformed values, and pre/post-dispatch state accounting. The [compiled Store smoke file](../../tests/headless-initial-setup-compensation-smoke.test.cjs) tests the real pinned headless runner on both identical smoke 60s and an authentic published champion-versus-rank6 pair. Its randomized replay executes the same seed and deck with and without the observer and compares action trace and terminal evidence to reject observational interference.

**CI verification:** The manual-only [Twinleaf Aichi mulligan calibration run 39243444471](https://github.com/FlareZ123/experiment-01/actions/runs/39243444471), on exact commit `38166869b4196f8182e485ab03634eb698606641`, **passed**, including both new test files against compiled pinned vendor and the existing 2000-game source matchup setup calibration. The passing test contract certifies only the tested actions and bounded seeds, not the full card-pool rule semantics.

## How to use in Agent 41's bilateral v2

For each precommitted arm, enable both `captureSetupCompensation:true` and `captureInitialSourceDealFingerprintSeat:<rank6/rank11 physical source seat>`. Retain, at minimum, `initialSetupCompensation` and `initialSourceDealFingerprint` fields side by side in the machine-readable full trial record. The array indices are **physical engine seats**, not candidate-relative first/second labels; map candidate/source from the actual registered trial slot.

Compare across arms:
- `sourceBonusOffered`, `sourceBonusSelected`, `sourceBonusDrawn`, and candidate/source `mulligans`;
- the pre-action first-source fingerprint and actual draw-log verified first player;
- complete unconditional registered attempt count regardless of setup equality or subsequent source-pressure outcome.

If a source fingerprint differs, the new count data helps distinguish a **legitimate mulligan-mediated change** from other setup/RNG divergence. Matching counts do not prove matching original source deck permutations, hands or Prizes; the strict complete-position fingerprint remains appropriate for the separately labeled matched mechanical replay gate.

## Limits

A game-level setup observer cannot independently prove initial uniform RNG, comparative causal identification, owner-safe full-game bot decisions, genuine Aichi timed matchplay, or source exact print legality. The existing headless bot has documented hidden-information and policy failures. Maintain **29/32 source 60s, zero competitively qualified games and no demonstrated 99.5%**.

Related [exact opening treatment-coupling analysis](../statistics/agent39-mulligan-posttreatment-source-alignment.md). The original paired-source equality gate remains useful for selected mechanically identical setups; never reinterpret a conditional subset's win fraction as an unconditional deck improvement.
