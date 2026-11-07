# Agent 2 selected-v8 common-policy first-owner-root canary (v1)

**Superseded registration.** The first implementation (run 42421204451) called `executeDevelopment()` directly and therefore bypassed the canonical actor-only policy composed by `runDevelopment()`. Its successful workflow status is not evidence for the selected-v8 common policy. Do not use its artifact as a v8 policy result. The corrected preregistration is [v2](agent2-v8-common-first-owner-root-rank13-rank3-20261107-v2.md).

Status: superseded diagnostic plan. The v1 runner wiring was invalid.

## Question

What is the first unsupported owner-visible root reached by the selected v8/common-policy execution path when the original Aichi Top 32 rank 13 Regidrago 60 faces the original rank 3 Snorlax Stall 60? Does the same first unsupported root appear with the two physical candidate/source seat orientations?

This is a mechanism and policy-coverage diagnostic. It does not estimate matchup strength or qualify a competitive game.

## Fixed inputs

- Candidate: original Aichi Open League 2026 Top 32 rank 13 Regidrago, unchanged printed 60.
- Source/opponent: original Aichi Open League 2026 Top 32 rank 3 Snorlax Stall, unchanged printed 60.
- Native engine: Twinleaf pinned commit a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.
- Seed: 290134 for both physical orientations.
- Candidate seat: A, then B. Source seat is the opposite physical seat.
- Native action limit: 128.
- The two registered trial IDs are:
  - 3:0:A:agent2-original-rank13-v8-common
  - 3:0:B:agent2-original-rank13-v8-common
- Deck inputs are resolved from results/aichi-2026/full-decklists.json through the existing originalPrintings() function. That function asserts both printed lists total 60 and validates the rank-3 and rank-13 native printings through planAichi.

## Execution path

The canary uses executeDevelopment() from agent41-bilateral-v2-development.cjs, invoked through runSelectedIssue25V0() in its explicit single-prospective-game mode. It uses the same selected v8/common-policy layers and order:

1. common Thorns direct-root environment wrapper from common v6;
2. selected v0 raw-State quarantine and setup wrappers: GO_FIRST, Agent50 all-eligible starting Basics, public mulligan/Wait acknowledgements, mandatory ShowCards acknowledgements;
3. v4 three printed owner-attack frontiers plus owner Capture Energy search;
4. the source-independent common actor policy with bilateral Special Energy and native accepted-target support;
5. v5 innermost owner Prize reveal and promotion choices;
6. v7 owner Volt transfer.

The only additional policy-adjacent flags are nativeOwnerTrainerFallback=true, ownerFallbackDiagnosticView=true, and actorGenericFallbackAttribution=true. They are diagnostic instrumentation. Agent4's raw-State quarantine must abort before the original native decoder executes. The diagnostic fallback must never produce a native action or a competitive game.

A canary-local first-blocked-prompt contract observer records only the acting owner's prompt class/message, owner seat, turn/phase, response shape, numeric selection constraints, owner-visible prompt-card count, known setup-source mapping, and quarantine code/message. It never serializes card identities, State, Store, opponent hand, deck, or Prize identities.

## Required evidence

For each physical orientation, preserve:

- selected v0 setup/quarantine audit and all v8 outer-wrapper audits;
- actual native abort code/message and detached prompt contract if a prompt blocks progress;
- firstUnsupportedOwnerRoot actor observation and owner-visible SHA-256, if a root is reached;
- root action ordinal, accepted root count and bounded sanitized accepted-root prefix;
- exact intent kind/reason and candidate/source/actor seat context;
- raw-State quarantine call count and proof that the original native decoder did not execute;
- engine revision, repository commit, loaded-module digest, source/policy file hashes, seed, deck hashes and action cap.

A successful mechanism capture requires exactly one unsupported owner pass, one captured owner-root view, a valid action ordinal/root-count witness, and zero execution of the original native decoder. A setup prompt failure remains a distinct diagnostic outcome and does not count as a root capture.

## Interpretation limits

- Two single-seed orientations are not a matchup sample.
- The fixed GO_FIRST choices are test harness defaults, not turn-order strategy.
- The canary uses the v8/common-policy execution path but tests only this one original rank-13/rank-3 matchup.
- The selected v0 wrapper manifest's historical rank-6/rank-11 source registration is not reused; the explicit source rank for this diagnostic is 3.
- No competitive win rate, paper legality certification, full Expanded coverage, or 99.5% claim is authorized.
