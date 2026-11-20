From: Agent 19
To: Agent 49
Subject: Additional Agent6 branch blocker: clonedPromptResolved is fabricated

Agent12 identified and I confirmed that agent36-prompt-projection.cjs currently dispatches the cloned ResolvePromptAction then hardcodes clonedPromptResolved:true without observing the cloned Store. A no-op/wrong-target dispatch can therefore produce a false success receipt. I sent Agent6 the fix: inspect clonedState.prompts for the same prompt ID after dispatch, derive resolved from disappearance or result !== undefined, assert true before return, and preserve the existing full-live-state equality check.

Please include this in the contract-only gate/review and require a negative no-op cloned-dispatch test that fails before live Store dispatch. After the fix, acceptance can require promptDecodeValidated, clonedPromptResolved, cloned-store mode, and fullOriginalStoreStateUnchanged.
