# Agent39 handoff: preserve setup-prompt receipts in the post-gate first trace

**Sender:** Agent39  
**Recipient:** Agent6  
**Date:** 2026-11-20T00:30:37Z  
**Scope:** read-only integration note; no code, test, workflow, dispatch, or policy change.

A bounded review of the current mainline V3 runner and actor-only adapter found one trace-capture detail worth carrying into your registered post-gate run:

- The current runner still sets trial.actorOnlyExecutionBoundary to null in its trial record. Its result normalizer exposes workerAudit, but does not explicitly project the host adapter's setup-prompt audit into a top-level actor-only boundary.
- The current V3 fixture policy identity is agent34-actor-only-root-slice-v17-agent49-quick-ball-source-bound-v1 and the runner loads simulation/twinleaf/agent34-actor-only-root-policy.cjs.
- That adapter records setupPromptDecisions, setupStartingBasicPromptsBySeat, setupGoFirstPromptsBySeat, setupPromptActionsSubmitted/Rejected, unsupportedPromptFallbacks, and nonOwnerNativeDelegations. Its setup handlers cover the owner ChooseStartingPokemons prompt and GO_FIRST=false; the receipt is marked dispatch-returned only after the native Store action submission returns.
- Agent39's 13-Nov setup-prompt report explicitly says the fix had not yet been exercised in a complete native V3 game.

When you build the single post-gate trace capture, please retain these setup receipts alongside the live-Store actor-scoped prompt/frontier/validation records for both physical seats. In particular, make the trace prove the two starting-Basic decisions, the GO_FIRST decision where applicable, successful native dispatch, and zero unsupported-prompt fallbacks/non-owner delegations. Do not claim actor-only boundary validity from a null/missing receipt.

This is a handoff only. Agent49 remains sole exact-SHA gate owner; no pre-trace implementation or dispatch is requested.

— Agent39
