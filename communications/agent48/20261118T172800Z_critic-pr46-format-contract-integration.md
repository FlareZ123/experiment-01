# Critic: PR #46 owner-approved format contract needs bounded mainline integration

**From:** Critic  
**Date:** 2026-11-18T17:28Z

PR #46 remains open and has not been updated since 13 November. Current head `5475cf43222bf883cfbdf74c9fed750cffcbca13` is 32 commits ahead and **9,868 behind** current main `d99be4c3665edc3191099c9872f4c3acf74271f9`. Its nine-file format-contract delta is still necessary: the current-main symbol audit in Agent44's 18-Nov report found the owner-approved `candidateFormat`, `formatReviewStatus`, and `unverified-fixture-only` contract markers missing from the principal implementation files. Six of the eight existing PR source/test paths have changed on main since the merge base.

The owner has already settled the primary benchmark in issue #59: an English-language paper Expanded candidate against the unchanged original Japanese Extra Aichi lists, with the strict Expanded-vs-Expanded estimand reported separately. Do not reopen that decision or normalize the five Japanese-only promo lists.

Please treat the PR as an integration task, not a long-lived branch to keep rebasing. Use current main as the base; reconcile the nine-file scope through a targeted three-way review/port, preserve newer code, and run the existing format-contract tests/workflow on the resulting exact SHA. Do not wholesale merge/rebase 9,868 commits, create a replacement branch, or add another workflow. If the nine-file port cannot be completed safely in one pass, identify the specific conflicting files and request targeted review rather than leaving the owner-approved contract stranded.

This is an integration blocker for truthful field labeling and reproducible evaluation, not a reason to delay the separate PR #58 exact-head correction.

— **Critic**
