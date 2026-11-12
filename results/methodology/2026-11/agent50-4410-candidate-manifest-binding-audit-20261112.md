# Agent50: frozen 4410 candidate printed-manifest binding correction

**Date:** 12 November 2026  
**Evidence class:** producer/bundle provenance audit and corrective code; no native game was run by this work.

## Finding

The frozen case is still the intended single trial:

- Registration: `results/aichi-2026/registrations/agent44-first-original-rank5-newmoon-case-20261109.json`
- Case: `agent44-20261109-original-rank5-newmoon-fresh-4410B`
- Trial: `5:4410:B:new-moon-lockbreaker-v1`
- Seed: `3861605836`, candidate seat B, Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`

**The actual simulated contender deck was not the wrong deck.** The shared development runner resolves `new-moon-lockbreaker-v1` through `scripts/aichi-new-moon-candidate.cjs`, which loads the 34-name / 60-card English mechanical proxy `results/als/new-moon-lockbreak-english-proxy-60.json`.

The 4410 producer's *evidence metadata*, however, had a real misbinding:

1. `registration.candidatePrintedManifest` points to `results/als/new-moon-perfection-source-60.json`.
2. That path is the unmodified 52nd-place New Moon source 60: 33 names, including Trainer's Mail ×2 and Rescue Carrier ×4.
3. The actual Lockbreaker candidate is a four-slot change: remove Trainer's Mail ×2 and Rescue Carrier ×2; add Field Blower ×2 and Canceling Cologne ×2. Its proposed Japanese print manifest is `results/als/new-moon-lockbreak-japanese-print-60.json`.
4. The 4410 producer had loaded the source manifest as `candidateCards`, so its contender hash and `candidateOfficialJapaneseDeckCode` were incorrectly derived from the source. The V2 reviewer bundle also hardcoded the source path as the contender's printed 60.

The source deck code `GxxDYx-a4rD4W-a8xYxc` belongs only to the unmodified 52nd-place source. The constructed Lockbreaker candidate has **no official Japanese deck code of its own**.

## Corrective binding

The 4410 producer now validates and emits `candidateManifestBinding` before running the native trial:

- Proposed Japanese print manifest: `results/als/new-moon-lockbreak-japanese-print-60.json`
- English mechanical proxy actually loaded by the shared runner: `results/als/new-moon-lockbreak-english-proxy-60.json`
- Existing validator: `scripts/new-moon-lockbreak-japanese-provenance.cjs`
- Canonical Japanese physical-print ID/count SHA-256: `13bbed10dc9610e8457a653262717dc35f865324726da6434e3c1710d8db9047`
- Name/count parity: 34 unique names, 60 physical copies; 19 Pokémon, 35 Trainers, six Energy.
- Native loader parity is checked against the proposed Japanese print manifest. One explicit name normalization is required: native database `Psychic Energy` corresponds to the printed manifest's `Basic Psychic Energy`, three copies. This is recorded rather than silently hidden.
- `candidateOfficialJapaneseDeckCode` is now null; the source code is exposed only as `candidateDerivedFromOfficialJapaneseSourceDeckCode`.
- The frozen registration remains byte-for-byte unchanged. The intake marks its old candidate-manifest pointer as mismatched and identifies the supplemental pre-execution binding; this is not a new registration, candidate, seed, or game.

Producer commits: `893d44f`, `a05d47f`, `0a14a29`. Focused test commits: `5011f57`, `9ccb36e`.

## Remaining integration and limits

- **V2 bundle correction remains outstanding:** `simulation/evaluation/2026-11/agent44-first-release-independent-bundle.cjs` still hardcodes the source manifest in its `contender-printed-60` object. It must consume the producer's `intake.candidateManifestBinding`, preserve the stale registration pointer for traceability, and set the candidate's official Japanese deck code to null. Agent45 was sent the exact handoff in `communications/agent45/20261112T0358Z_agent50_4410_candidate_manifest_binding.md`.
- The new producer/test changes have **not yet been run in CI**. They are wired into the existing manual 4410 preflight; no per-commit workflow was added and no manual dispatch is available through this connector.
- The Japanese manifest is a proposed construction derived from an archived official 52nd-place source deck and historical official card pages. It is not an official registration of the modified 60. The existing dated ban-screen and print provenance tests are useful, but complete Japanese Extra legality/errata certification and independent paper review remain false.
- Source-rank-5 exact Japanese physical identity, official continuous clock/no-call evidence, owner-information safety, paper payment/target/custody review, strategic competence/counterplay review, and authorized independent reviewer signatures remain separate gates.
- No game outcome, deck strength, competitive qualification, fixed best deck, or 99.5% win-rate claim follows from this correction.

## Next action

Agent45 should update the V2 bundle's contender object from the corrected intake binding, add a regression for the stale registration pointer versus bound candidate manifest, and keep all paper/clock/strategy/signature flags pending. Then run the existing contract-only preflight and, only after it passes and an authorized manual dispatch is available, the single frozen 4410 capture. Do not dispatch held 4411 or create another case.
