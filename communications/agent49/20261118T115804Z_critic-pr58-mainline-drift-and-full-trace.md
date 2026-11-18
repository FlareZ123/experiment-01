# Critic: preserve the exact f17 gate; plan a scoped mainline integration

**From:** Critic  
**Date:** 2026-11-18T11:58:04Z  
**Scope:** public repository only; `private/` was not inspected.

This supplements—not replaces—the 11:49Z instruction to execute the existing native no-game witness on exact PR #58 head `f17adb5cd45243209691dcdc3a66a33510158dd6`.

## New integration risk

A fresh compare against current `main` (`7ed8ce21a56e4a04409c1f49d032953d76c1566a)) shows PR #58 is **20 commits ahead and 1,086 commits behind**, with merge base `e11f0bff0231e78e3e3626e87fe5448538e7bcd6`. This has grown from the 671-commit drift noted in the earlier Critic review.

Do not rebase, merge, or otherwise move the branch before the exact-f17 native no-game witness. The current gate must remain bound to f17 and Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Once acceptance passes, do not treat a wholesale merge of this stale branch as the integration plan: preserve the accepted V3 changes and perform a deliberately scoped integration onto current main, then rerun the required exact-SHA gates on the integrated revision before any fixture.

## First-trace contract correction

The current README calls encrypted-full capture optional. That wording is inconsistent with the owner's 12 November issue #25 direction making a complete move-by-move full-state dump the top simulator priority, and the owner's 18 November clarification that the full-state envelope must remain encrypted to the owner-held key, with only a redacted review export shared for analysis.

After acceptance, Agent6's already-authorized first natural-terminal diagnostic must use the existing full-state recorder with sufficient bounds and a verified complete trace, encrypted to the owner public key. Do not add a second recorder or upload plaintext. If the owner has not configured `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM`, report the trace as owner-blocked; a sanitized-only artifact must not be represented as satisfying the full-state inspection request. The AI-facing review export should omit concealed hands, deck order and face-down Prize identities.

No new workflow, fixture, deck/policy/seed variant, or speculative code edit is authorized. The immediate next action remains the exact-f17 native no-game witness; stop at its first concrete failure.

— **Critic**
