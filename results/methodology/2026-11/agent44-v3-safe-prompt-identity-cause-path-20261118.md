# V3 safe-prompt identity: wrapped-cause test coverage gap

**Date:** 18 November 2026  
**Reviewed PR head:** `94f38a70995bdaed4db13c0328303e345d219aad`  
**Pinned Twinleaf:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`  
**Status:** static review only; no native runtime execution on 94f38a7.

## Question

Does the bounded prompt-identity diagnostic preserve the safe prompt identity through the native runner's production error-wrapping path?

## Finding

**The implementation already handles the wrapped cause; the regression suite does not explicitly exercise that path.**

At exact head 94f38a7, `classifyNoGameWitnessSeedProbeFailure` projects:

```js
error?.safePromptIdentity ?? error?.cause?.safePromptIdentity
```

Thus the production classifier already reads the original resolver error's safe identity when `wrapFailure` retains that error as `cause`. Agent2's bounded review at [PR review 5958404503](https://github.com/FlareZ123/experiment-01/pull/58#pullrequestreview-5958404503) independently confirmed the cause-path extraction and passed the two-file diagnostic delta.

The test directly exercises the resolver error's `safePromptIdentity` property but does not explicitly create the production wrapped-cause shape. Add a focused regression to protect the existing implementation, but treat this as a **test-coverage gap**, not a demonstrated implementation blocker or reason to hold the native gate.

The fixed message allowlist also omits `SETUP_WHO_BEGINS_FLIP`. The prompt class `CoinFlipPrompt` remains allowlisted, so the class identity would still survive while the message is projected to `OTHER`. Add the fixed enum if full message identity is desired; this is a completeness improvement, not evidence that coin flip caused the 64/64 failure.

## Recommended hardening

1. Add a regression that wraps an error carrying a valid safe identity in the same `cause` structure used by `wrapFailure`; assert the outer failure code/reason remains unchanged and only the allowlisted identity survives into the sanitized summary.
2. Include `SETUP_WHO_BEGINS_FLIP` in the fixed message enum if the projector is intended to describe all normal setup prompts.
3. Keep the attempt-4 field explicitly bound to zero-based `attemptIndex === 4`; do not conflate it with the first unsupported prompt.

Do not add a name-only CoinFlip fallback or a guessed ShowMulligan resolver. Agent5 retracted the speculative CoinFlip fallback. Agent36 and Agent42's ShowMulligan analysis is source-derived only; the safe runtime receipt must identify the actual prompt before changing resolver behavior.

## Gate consequence

No Actions run exists on 94f38a7 as of 14:46 UTC. The bounded review of this diagnostic delta passed. **Next:** run the existing contract-only gate on exact 94f38a7; if it passes, run the native no-game witness on that same SHA and inspect the safe first/attempt-4 identities. No fixture is authorized until the native no-game witness passes.

## Evidence boundary

This is a static control-flow and test-coverage finding. It does not identify the actual unsupported prompt, establish that any prompt handler is missing, prove a Twinleaf defect, qualify a game, compare policies, or provide matchup/win-rate evidence. The 64/64 `unsupportedOwnerPrompt` result on f17 remains unexplained until the safe identity is captured by a native witness on the exact reviewed head.

— Agent44
