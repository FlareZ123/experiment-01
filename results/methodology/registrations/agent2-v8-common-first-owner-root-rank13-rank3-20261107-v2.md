# Agent 2 selected-v8 common-policy first-owner-root canary (v2)

Status: preregistered diagnostic only. This version corrects v1's runner wiring. No v2 result is observed at registration time.

## Question

What is the first unsupported owner-visible root reached by the selected v8/common-policy execution path when original Aichi Top 32 rank 13 Regidrago faces original rank 3 Snorlax Stall? Does the same root appear in both physical candidate/source seat orientations?

This is a policy-coverage and native execution diagnostic. It does not estimate matchup strength or qualify a competitive game.

## Fixed inputs

- Candidate: original Aichi Open League 2026 Top 32 rank 13 Regidrago, unchanged printed 60.
- Source/opponent: original Aichi Open League 2026 Top 32 rank 3 Snorlax Stall, unchanged printed 60.
- Native engine: Twinleaf pinned commit a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.
- Seed: 290134 in both physical orientations.
- Candidate seat: 0 then 1; source seat is the opposite physical seat.
- Native action limit: 128.
- Trial IDs:
  - 3:0:A:agent2-original-rank13-v8-common
  - 3:0:B:agent2-original-rank13-v8-common
- Candidate printed cards are injected from rank 13 in results/aichi-2026/full-decklists.json through runDevelopment's explicit registeredCandidateDecks option. Source rank 3 is resolved from the authenticated Aichi roster inside runDevelopment.
- Both printed lists are resolved through planAichi and must contain exactly 60 cards.

## Corrected execution path

The v1 mistake was calling executeDevelopment directly. That low-level function does not compose the canonical actor-only policy. V2 must invoke runDevelopment, which composes withCanonicalActorOnlyPolicy around executeDevelopment and applies the source-independent common policy.

For each physical orientation, runSelectedIssue25V0 receives a custom runner that calls runDevelopment with:
- registeredTrials containing exactly the corresponding rank-3, candidate-slot, seed-290134 trial;
- registeredCandidateDecks containing the original rank-13 printed 60 under the explicit candidate ID above;
- allowSingleCandidateArm=true and a unique registeredFrameName;
- actorOnlyComposition=true, sourceIndependentCommonPolicy=true, bilateralSpecialEnergyRoot=true, nativeAcceptedTargets=true;
- nativeRootActionLimit=128;
- nativeOwnerTrainerFallback=true and ownerFallbackDiagnosticView=true;
- firstBlockedPromptContractObserver=true;
- mysteriousTreasureRoot=false, so this baseline diagnostic observes the current common policy before the proposed Crispin/VS Seeker extension is enabled.

The selected v8 wrapper composition is:
1. outer Volt transfer wrapper;
2. innermost owner Prize/promotion prompt wrapper (v5);
3. common Thorns root environment wrapper (v6);
4. selected v0 raw-State quarantine and setup stack: GO_FIRST, Agent50 all-eligible starting Basics, public mulligan/Wait acknowledgements, mandatory ShowCards acknowledgements;
5. v4 printed owner-attack frontiers and Capture Energy search;
6. runDevelopment's canonical actor-only common policy around executeDevelopment;
7. first-blocked-prompt contract observer inside the canonical actor wrapper, when explicitly enabled.

The default v10b runner and its registration remain untouched. The diagnostic-only flags are explicit options for this one canary.

## Required evidence

For each orientation preserve:
- runDevelopment manifest and diagnostic, including the actual canonical policy composition and registered custom candidate ID;
- selected v0 setup/quarantine audit and all v8 outer-wrapper audits;
- detached firstUnsupportedOwnerRoot view and owner-visible SHA-256;
- actual native abort code/message, action ordinal, accepted root count, root ledger SHA-256 and bounded sanitized prefix;
- actor fallback counters and proof that the original native decoder did not execute;
- owner-matched blocked-prompt contract if a prompt, rather than a root pass, blocks progress;
- actual GO_FIRST coin-winner and selected first-player seat;
- Twinleaf pin, repository commit, loaded-module digest, source/policy hashes, seed, deck hashes and action cap.

A root capture is valid only if the actor-only policy was actually composed by runDevelopment, exactly one unsupported owner pass is captured for that game, the owner view is detached and excludes hidden source identities, the action ordinal/root count reconcile, and the raw-State quarantine prevents original native decoder execution. A setup or prompt failure is a distinct diagnostic outcome. No competitive game is qualified.

## Interpretation limits

- Two single-seed orientations are not a matchup sample.
- GO_FIRST choices are fixed harness defaults, not turn-order strategy.
- The v2 canary tests only original rank13 vs rank3.
- No competitive win rate, paper legality certification, full Expanded coverage, or 99.5% claim is authorized.
