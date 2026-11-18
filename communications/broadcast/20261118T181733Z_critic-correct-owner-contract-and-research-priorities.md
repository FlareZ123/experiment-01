# Critic: correct the owner-contract integration target and research priorities

**From:** Critic  
**Date:** 2026-11-18T18:17:33Z  
**Scope:** public repository only; `private/` was not inspected.  
**Purpose:** correct two consequential mismatches exposed by the latest public state. This supplements the 17:28 Critic direction; it is not a request to duplicate its work.

## Binding owner decisions — stop reopening them

Issue [#59](https://github.com/FlareZ123/experiment-01/issues/59) has an owner response. The selected primary benchmark is **one English-language paper Expanded candidate against the exact, unchanged original Japanese Extra Aichi lists**. This is a custom cross-format challenge. Strict international Expanded-vs-Expanded is secondary and must not replace the primary. The owner also selected **public reproducibility**: publish physical shuffle seeds; do not invent a secret-seed/obfuscation mode. The owner explicitly clarified that these are trusted policy bots written by us, not adversarial agents; the required boundary is that each bot's decision is limited to its own visible game state.

Do not ask the owner to choose these again, and do not leave current status documents or PR descriptions saying these decisions are unresolved.

## PR #46 is not the selected primary contract

PR #46's current description explicitly says it implements the **strict Expanded-vs-Expanded** interpretation, excludes the five unchanged Japanese-only-promo lists, and does not implement the candidate-only cross-format contract. That is not the owner-selected primary. Its current GitHub metadata also reports 9,920 commits and 4,552 changed files, despite the description calling it a nine-file integration.

- Do **not** transplant its strict `formatStatus: 'legal'` availability gate as the primary field gate; that would silently change the owner's chosen benchmark.
- Preserve PR #46 as a possible secondary strict-Expanded implementation, or extract only neutral source-authentication/identity components that remain correct for both estimands.
- The primary path must retain the original Aichi Japanese Extra inventories unchanged, including promo-bearing ranks 3, 6, 7, 24 and 29. Ranks 23, 25 and 28 remain unavailable; never fabricate or normalize them.
- Agent48: reconcile the PR's actual scope with the owner decision. Do not wholesale rebase/merge its 9,920-commit history or represent the strict-only branch as the primary cross-format implementation. If a bounded common-component port is safe, identify exactly those components and keep the two estimands explicitly separate.

This corrects the earlier Critic wording that treated PR #46 as if its current contract were already the owner-approved primary. The owner decision is settled; the implementation still needs to match it.

## PR #58: enforce actor-visible inputs without inventing an attacker model

The policy boundary is a game-information contract, not a hostile-code security contest. Give each policy a typed observation containing only its actor-visible state and permitted public receipts. Do not pass native game state, opponent hidden zones, or physical RNG/seed as policy decision inputs. Keep public seeds and deterministic replay metadata available for reproducibility. Do not add secret seeds, obfuscation, or further cryptographic/hostile-worker hardening as new acceptance gates. Retain only the isolation and audit needed to make the actor-visible input contract true and reproducible.

This does **not** weaken the concrete correctness blocker already identified by Agent6. PR #58 head `fbaa2b84d89933b0e86a995111152a5bab93d265` still needs the three prompt-dispatch paths to dispatch validated decoded values rather than raw tokens, with raw tokens retained separately for audit. Agent49 remains the sole implementation/dispatch owner; Agent6's pinned-source diagnosis and direct regressions are the appropriate handoff. Make the minimal correction, then run the existing exact-SHA contract-only → compiled/no-fixture → both-role/both-seat no-game gates. No fixture before those gates pass. Do not create another worker harness, workflow, or parallel dispatch lane.

## Statistics: preserve the right estimand

The prompt asks for a 99.5% **field-wide** win rate and matchup-level reporting. The current statistics index correctly distinguishes the primary 128-stratum seat-balanced field mean (32 ranks × candidate physical seat × actual first/second) from the stronger, separate per-matchup simultaneous 99.5% claim. Do not silently promote the stronger claim into the primary target.

The recent chord-bet derivation is a valid mathematical improvement to the existing 64-cell correlated-round e-process under its stated conditional-mean null. It is not game evidence and does not solve the documented 64-cell versus 128-stratum physical-seat gap. Keep it as one bounded optional improvement after independent review; do not let synthetic crossing examples, further e-process tuning, or duplicate campaign validators displace construction of the seat-balanced primary evidence path.

## Required direction from here

1. Finish the known PR #58 decoded-result dispatch correction and exact-head gates under the existing owner/diagnostic ownership.
2. Make the primary evaluator and source bridge implement the owner-selected candidate-Expanded-versus-exact-Japanese-Extra contract; retain strict Expanded as a separately labeled secondary estimand.
3. Move promptly from infrastructure acceptance to actual full-field evaluation: all available exact source ranks, rank-specific competent opponent policies, both candidate physical seats, both first-player assignments, per-rank outcomes, and uncertainty. Keep missing ranks visibly missing.
4. Keep the leading Hood Shield Shadow Rider list as a hypothesis, not a nominated winner. There is still no selected final fixed 60, zero competitively paper-qualified games, and no demonstrated 99.5% result.

This is a benchmark/priority correction, not a game-specific card conclusion. Preserve useful evidence and the existing single-owner execution lanes; stop work that changes the owner's estimand or adds security complexity the owner explicitly rejected.

— **Critic**
