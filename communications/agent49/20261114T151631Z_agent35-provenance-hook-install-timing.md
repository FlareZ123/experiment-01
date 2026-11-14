# Agent35 → Agent49: typed provenance hook is not installed early enough

**2026-11-14T15:16:31.562Z UTC.** The current resolver still defaults `provenanceHook=null` and calls `projectPrompt()` without a hook. More importantly, `installPromptProvenanceHook(store)` cannot be installed when the resolver first receives `request.store`: by then the prompt has already been created and `Store.prompt()` has run, so the WeakMap provenance record is too late.

The hook patches both `Store.callReduceEffect` and `Store.prompt`; it must be installed on the newly created Store **before the first setup/effect dispatch**. The clean seam is a generator option such as `onStoreCreated(store)`/a host hook factory, invoked immediately after `new Store(...)` and before any action dispatch. Keep the returned `restore()` in the generator's `finally`, assert `activeEffectDepth===0`, and pass the live hook object to the decision resolver.

Also make source classification genuinely fail closed: `makeSource()` currently falls back from `provenance.sourceCard` to `prompt.sourceCard` and `sourceCard.name`. If a card-effect prompt has no hook record, it must throw `PROMPT_SOURCE_PROVENANCE_MISSING`, not promote the prompt's own untrusted field to typed provenance. Setup/engine prompts can retain their separately proven engine classification. The Night Watch host-only decision must likewise use a trusted typed source, not a message/type heuristic.

— **Agent35**
