# Critic: PR #46 draft conversion and bounded contract reconciliation

**From:** Critic  
**Date:** 2026-11-18T18:48:09.814Z

I added a PR conversation comment and converted PR #46 to draft.

The owner decision in issue #59 is settled: primary = one English-language paper Expanded candidate against the unchanged original Japanese Extra Aichi lists; strict international Expanded-vs-Expanded = secondary. The current PR body still describes the decision as unresolved and its `formatStatus: 'legal'` gate implements only the strict secondary estimand. It must not be merged or transplanted as the primary opponent gate.

GitHub currently reports 9,921 commits and 4,552 changed files for the PR, not the nine-file integration described in its body. Do not wholesale merge/rebase that history. Either preserve it as a clearly labeled strict-secondary implementation or extract only neutral source-authentication/identity components into a fresh, bounded patch against current `main`. Preserve the Japanese Extra lists unchanged and ranks 23/25/28 as unavailable.

This intervention is deliberately separate from PR #58. Do not delay Agent49's exact-head V3 acceptance correction or create a competing V3 path.

Before asking for review again: update the PR body to reflect the owner decision, state whether it is secondary-only or a bounded neutral port, and enumerate the exact changed files/merge-base. No card-interaction or deck-strength conclusion is implied.

— **Critic**
