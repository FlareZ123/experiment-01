# Agent 2 selected-v8 common-policy rank13/rank3 first-owner-root canary

**Status: two-seat first-owner-root gate passed. No complete game or competitive matchup was played.**

## Question

Does the selected v8 common actor-only policy reach a first unsupported owner-visible decision in both physical orientations of the original Aichi Open League 2026 rank-13 Regidrago versus rank-3 Snorlax Stall lists?

This is a bounded policy-coverage and native-execution diagnostic. It is not a matchup win-rate experiment.

## Preregistered inputs and execution

- Candidate: original Top 32 rank 13 Regidrago, unchanged published 60-card name/count list.
- Source: original Top 32 rank 3 Snorlax Stall, unchanged published 60-card name/count list.
- Candidate/source physical seats: A then B, with the candidate in seat 0 and seat 1 respectively.
- Seed: `290134` for both orientations.
- Native accepted-root cap: `128`.
- Twinleaf: pinned commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Execution: selected v8 wrapper stack through `runDevelopment`, which composes the canonical actor-only policy around `executeDevelopment`.
- Active registration: one trial per orientation, registered source rank `[3]`, candidate ID `agent2-original-rank13-v8-common`, `single-candidate-arm`.
- Source admission: `allowAdditionalOriginalSourceRanks: true`. This admits published 60-card name/count lists for simulation. It does not certify Japanese physical-print identities, language or paper legality.
- The selected-v8 diagnostic intentionally keeps `mysteriousTreasureRoot: false`; the canary captures the unsupported root before proposing a treatment.

The corrected manual workflow is [run 42442029797](https://github.com/FlareZ123/experiment-01/actions/runs/42442029797), research head `504c924e8cb49b11b25b6b4b5266ce416ff265fc`. Twinleaf checkout, dependency installation, compilation, seven pure release-gate contract tests, the native canary and artifact upload all succeeded. The uploaded `agent2-v8-common-first-owner-root` artifact is ID `13601957584`, 21,095 bytes, SHA-256 `3f5cf9aca63f369103c8d7522a877a52ade118d79633f9d7bb15942bfff56b70`.

## Result

The corrected release gate requires exactly two rows, one per physical candidate seat, and checks the active `runDevelopment` registration plus the owner-root quarantine receipt. The successful workflow therefore confirms that both orientations returned a first owner-root capture with the required registration and quarantine evidence.

The first complete detailed receipt, run [42441051875](https://github.com/FlareZ123/experiment-01/actions/runs/42441051875), records the following owner-visible roots and hashes. The later corrected run 42442029797 passed the same two-seat release gate with the same registered inputs and seed.

### Candidate seat 0, source seat 1

- Trial: `3:0:A:agent2-original-rank13-v8-common`.
- Root owner: seat 1; global turn 1, phase 2.
- Active Pokémon: Snorlax PGO; no Benched Pokémon.
- Owner hand: Plumeria BUS, Team Rocket's Handiwork FCO, Night Stretcher ASC, Enhanced Hammer TWM, Trainers' Mail ROS, Penny SVI, Tropical Beach BWP 50.
- Owner-view SHA-256: `d2fb700dd41640d705d045a1f26f8b2f9bcfdf65c6207f3496628c0b20be7ad9`.
- Root-ledger SHA-256: `dbbfe9a9080cfc742be44db99c02c7219f40a6399fc5daf7db7a51a495f796ab`.
- Action ordinal / accepted root count: `7 / 7`.

### Candidate seat 1, source seat 0

- Trial: `3:0:B:agent2-original-rank13-v8-common`.
- Root owner: seat 1; global turn 1, phase 2.
- Active Pokémon: Dedenne-GX UNB with one Grass Energy attached; Regidrago V SIT on the Bench.
- Owner hand: Crispin SCR, Muscle Band XY, VS Seeker PHF, Battle Compressor PHF, Mysterious Treasure FLI.
- Owner-view SHA-256: `3d9219260f4841894aa40014aa069f178d30082d85947d5e4ec59dc357046672`.
- Root-ledger SHA-256: `99eeda9cce51000050e7d4f3b88054a423b0f2a1aba5f789d85a73d740f60c2a`.
- Action ordinal / accepted root count: `8 / 8`.

### Shared root and quarantine properties

Both first-root provenance records identify an owner-policy `Pass` with reason `no-supported-owner-visible-root`. These are ordinary owner-root decisions, not blocked prompts. Each row records one unsupported pass, a detached owner view that excludes hidden source identities, and the fail-closed `OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED` result. The original native decoder did not execute; the selected-v0 audit reports `rawDecoderExecuted: false` and one fallback call. Action ordinals reconcile with accepted root counts.

The runner initially misread the audit schema twice: it expected `originalNativeDecoderExecuted` on the actor counter object, then expected a derived `firstUnsupportedOwnerRootCaptured` property on that raw object. The raw actor audit instead carries the `firstUnsupportedOwnerRoot` object; the compact row summary derives the boolean. The gate now validates the actual raw actor field and separately checks the selected-v0 decoder quarantine. Runs 42441051875 and 42441603937 are retained as false-negative gate attempts; they still contain useful owner-root receipts. Run 42442029797 is the corrected passing gate.

## Interpretation

1. **The selected v8 common policy has an immediate owner-root coverage gap in both orientations.** Its first unsupported intent is Pass because the policy has no supported owner-visible root for the presented state. This is a policy frontier witness, not evidence that Pass is the best play.
2. **The rank-13 root exposes a concrete sequencing hypothesis.** The owner hand contains Mysterious Treasure, Crispin, VS Seeker and Battle Compressor while Regidrago V is Benched. A candidate line is Mysterious Treasure discarding Crispin to find Regidrago VSTAR, VS Seeker recovering Crispin for a later turn, and Battle Compressor placing Dragon attack donors into the discard pile for Apex Dragon. The canary does not execute or validate this line, and the selected v8 runner deliberately disables the Mysterious Treasure root.
3. **The rank-3 root also needs owner-only action coverage.** Its visible hand contains Trainers' Mail and Tropical Beach, among other cards. Their legal and strategic value should be tested from the exact root; no action is asserted as optimal here.
4. The roots occur at turn 1 / phase 2, before any prompt settlement. Prompt handling is not the explanation for these two Pass decisions.

## Limits

- Two seat orientations of one fixed seed are not a matchup sample.
- No complete game, Prize sequence, terminal result or opponent continuation was evaluated.
- No competitive games are qualified; this result supplies no win-rate estimate.
- The rank-3 source list is admitted by published 60-card name/count only. Exact Japanese physical printing and event-inventory provenance remain separate legality questions.
- No 99.5% claim is supported.

## Next work

1. Agent41 independently reviews the root receipts and corrected release gate.
2. Agent36 uses these owner-visible roots to identify and implement the missing root actions without weakening information boundaries or native quarantine.
3. Agent2 extends the staged native physical-sequence probe to verify Crispin discard/recovery and Battle Compressor's selected Dragon donors, then folds it into the existing shared manual CI gate rather than creating another per-card workflow.
4. Evaluate any new root policy prospectively across both seats and complete games, then test the same fixed candidate against all 32 authenticated opponents with matchup-level outcomes and uncertainty.
