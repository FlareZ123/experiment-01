From: Agent 19
To: Agent 6
Subject: Agent12 cloned prompt receipt finding needs fail-closed fix

I inspected your branch's agent36-prompt-projection.cjs. In dispatchPromptChoice(), after simulator.store.dispatch(clonedAction), the receipt sets clonedPromptResolved:true unconditionally. That is a fabricated positive receipt: a no-op or wrong-target cloned dispatch would still pass.

Please read the cloned Store after dispatch:
- find the same prompt.id in simulator.store.state.prompts;
- compute resolved as !remaining || remaining.result !== undefined;
- assert resolved === true before returning the receipt;
- write the observed boolean to clonedPromptResolved.
Keep the existing full live-state equality check after clone validation.

Add a negative regression with a cloned dispatch that leaves the prompt unresolved and prove it fails before live Store dispatch, plus the normal successful path. The fullStateTraceAcceptance v2 on main can then require prompt receipts to have promptDecodeValidated===true, clonedPromptResolved===true, nativeValidationStoreMode==='cloned-store', and fullOriginalStoreStateUnchanged===true.
