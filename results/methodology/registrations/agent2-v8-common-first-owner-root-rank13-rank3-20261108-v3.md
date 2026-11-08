# Agent 2 selected-v8 common-policy first-owner-root canary (v3)

Status: corrected preregistration for the same bounded diagnostic. This version supersedes v2 after the v2 runner failed before Twinleaf because it omitted the expanded source-roster admission flag. No gameplay outcome from v2 is retained or interpreted.

## Question

What is the first unsupported owner-visible root reached by the selected v8/common-policy execution path when original Aichi Open League 2026 Top 32 rank 13 Regidrago faces original rank 3 Snorlax Stall? Does the same root appear in both physical candidate/source seat orientations?

This is a policy-coverage and native execution diagnostic. It does not estimate matchup strength or qualify a competitive game.

## Fixed inputs

- Candidate: original Aichi Open League 2026 Top 32 rank 13 Regidrago, unchanged published 60-card name/count list.
- Source/opponent: original Aichi Open League 2026 Top 32 rank 3 Snorlax Stall, unchanged published 60-card name/count list.
- Native engine: Twinleaf pinned commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Seed: 290134 in both physical orientations.
- Candidate seat: 0 then 1; source seat is the opposite physical seat.
- Native action limit: 128.
- Trial IDs:
  - `3:0:A:agent2-original-rank13-v8-common`
  - `3:0:B:agent2-original-rank13-v8-common`
- Candidate printed cards are injected from rank 13 in `results/aichi-2026/full-decklists.json` through `runDevelopment`'s explicit `registeredCandidateDecks` option. Source rank 3 is resolved from the published Aichi roster inside `runDevelopment`.
- Both lists must contain exactly 60 cards.
- `allowAdditionalOriginalSourceRanks: true` is required in the injected `runDevelopment` options. This expands the helper from its historical `[6, 11]` default to all published roster entries whose positive card-name/count rows sum to 60. It admits rank 3 as a simulation source list only. It does not certify Japanese physical print identities, language, historical event inventory, or paper legality.

## Corrected execution path

The v2 failure was a preflight error: its custom `runDevelopment` call omitted `allowAdditionalOriginalSourceRanks: true`, so rank 3 was rejected before game construction. The v3 runner passes this flag and records the active `runDevelopment` registration separately from the historical `selectedV0Manifest`.

The v3 runner must invoke `runDevelopment`, which composes `withCanonicalActorOnlyPolicy` around `executeDevelopment`, and then preserve the selected v8 wrapper composition:

1. outer Volt transfer wrapper;
2. innermost owner Prize/promotion prompt wrapper (v5);
3. common Thorns root environment wrapper (v6);
4. selected v0 setup/quarantine stack: GO_FIRST, Agent50 all-eligible starting Basics, public mulligan/Wait acknowledgements, mandatory ShowCards acknowledgements;
5. v4 printed owner-attack frontiers and Capture Energy search;
6. `runDevelopment` canonical actor-only common policy;
7. first-blocked-prompt contract observer inside the canonical actor wrapper.

The frozen v10b runner and registration remain untouched. Diagnostic-only flags are explicit options for this one canary.

## Required evidence and release gate

For each orientation preserve:

- active `runDevelopment` manifest: exactly one registered trial, source rank `[3]`, candidate ID `agent2-original-rank13-v8-common`, and `single-candidate-arm` mode;
- explicit `allowAdditionalOriginalSourceRanks: true` admission receipt, labelled as published 60-card name/count roster admission only;
- selected v0 setup/quarantine audit and all v8 outer-wrapper audits;
- detached firstUnsupportedOwnerRoot view and owner-visible SHA-256;
- actual native abort code/message, action ordinal, accepted root count, root ledger SHA-256 and bounded sanitized prefix;
- actor fallback counters and proof that the original native decoder did not execute;
- actual GO_FIRST coin-winner and selected first-player seat;
- Twinleaf pin, repository commit, loaded-module digest, source/policy hashes, seed, deck hashes and action cap.

The workflow must fail unless exactly two rows return, one per physical candidate seat, and each row contains the active rank-3 manifest plus the expected first-owner-root quarantine receipt. The JSON receipt must still upload when this gate fails. A preflight abort, missing row, missing manifest, missing root, decoder execution, or wrong seat is a failed canary.

A root capture is valid only if the actor-only policy was actually composed by `runDevelopment`, exactly one unsupported owner pass is captured for that game, the owner view is detached and excludes hidden source identities, the action ordinal/root count reconcile, and the raw-State quarantine prevents original native decoder execution.

## Interpretation limits

- The v2 run `42422639543` is a negative preflight receipt only. Both rows aborted with `ERR_ASSERTION: Registered source rank requires an authenticated original 60`; no Twinleaf game, prompt, or owner root was reached.
- Two single-seed orientations are not a matchup sample.
- GO_FIRST choices are fixed harness defaults, not turn-order strategy.
- Rank 3's admitted list remains unqualified for exact Japanese physical printing. Simulation source-list admission is not paper legality.
- No competitive win rate, paper legality certification, full Expanded coverage, or 99.5% claim is authorized.
