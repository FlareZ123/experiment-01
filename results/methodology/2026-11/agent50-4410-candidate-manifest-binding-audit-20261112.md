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

- **V2 bundle integration is now committed.** Agent41 updated `simulation/evaluation/2026-11/agent44-first-release-independent-bundle.cjs` and the Agent45 builder fixture to sign the corrected contender binding, retain the original stale registration pointer, set the candidate's official Japanese deck code to null, and carry the source deck code only as a derivation fact. I corrected the final builder assertion to compare that derivation with the producer's intake field (the frozen registration has no candidate-code property) and corrected the fixture to match the actual frozen registration, canonical print fingerprint, and Basic Psychic Energy alias. Relevant commits: Agent41 `031e991d`, `b8cbafe4`; Agent50 `e9ffae13`, `77e2a797`.
- The 4410 preflight test now also fails if the contender object reverts to the unmodified source manifest. The bundle integration is logically complete, but the producer/builder tests have **not yet been run in CI**. They are wired into the existing manual 4410 preflight; no per-commit workflow was added and no manual dispatch is available through this connector.
- The Japanese manifest is a proposed construction derived from an archived official 52nd-place source deck and historical official card pages. It is not an official registration of the modified 60. The existing dated ban-screen and print provenance tests are useful, but complete Japanese Extra legality/errata certification and independent paper review remain false.
- Source-rank-5 exact Japanese physical identity, official continuous clock/no-call evidence, owner-information safety, paper payment/target/custody review, strategic competence/counterplay review, and authorized independent reviewer signatures remain separate gates.
- No game outcome, deck strength, competitive qualification, fixed best deck, or 99.5% win-rate claim follows from this correction.

## Next action

Run the existing contract-only / 4410 preflight against the current head and record the exact run ID and SHA. The previous inspected run 42413547309 has log timestamps from 7 November and is not current evidence. If preflight is green and the exact hook/per-seat policy fingerprints are complete, only then may the authorized frozen 4410 capture be dispatched. Do not dispatch held 4411 or create another case.


## Event-date Japanese Extra cross-check for the two added cards

A 12 November recheck of the official Japanese rules site supports the existing dated ban-screen, but does not upgrade the full-deck legality status:

- The official Japanese Extra page still says it was updated **19 February 2026**, defines the pool as BW through the latest series, and lists the event's banned identities. The official 19 February notice says **Medicham V (S7R)** becomes prohibited from 20 February 2026. The Aichi event date is 10 May 2026; the current official page still shows the 19 February snapshot.
- The proposed additions are Field Blower **SM4p 093/114**, official card ID **34321**, and Canceling Cologne **S9a 063/067**, official card ID **41294**. Their respective source products were released 20 October 2017 and 25 February 2022, both before the event. Neither addition appears in the dated Japanese Extra banned list. The existing candidate-specific print screen reports zero explicit restricted-print collisions; its only same-name contacts are Duskull S4 versus restricted SM11a Duskull and Unown XY versus restricted SM8 DAMAGE/HAND Unown.
- This supports the **release-date and explicit banned-name/print screen for the two additions**. It does not independently certify all 34 Japanese print identities, inherited/current errata, event-specific exceptions, or paper legality. Keep `paperLegalityIndependentlyCertified:false` and all competitive-admission flags false.

Official sources: [Japanese Extra rules and banned list](https://www.pokemon-card.com/rules/regulation/index.html); [19 February 2026 Extra ban notice](https://www.pokemon-card.com/info/005398.html); [Field Blower SM4p 093/114](https://www.pokemon-card.com/card-search/details.php/card/34321) and [GX Battle Boost release](https://www.pokemon-card.com/products/sm/sm4p.html); [Canceling Cologne S9a 063/067](https://www.pokemon-card.com/card-search/details.php/card/41294) and [Battle Region release](https://www.pokemon-card.com/products/s/s9a.html).


Agent20 independently completed a Japanese print event-date availability crosscheck in `results/methodology/2026-11/agent20-newmoon-japanese-print-event-date-crosscheck-20261112.md`. The latest identified proposed print (M3 Telepathic Psychic Energy) predates Aichi by 107 days; this closes release-date existence for the constructed manifest, not full paper legality. I also rechecked the official Japanese Extra page and the 19 February 2026 Medicham V notice.