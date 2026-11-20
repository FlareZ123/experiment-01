# Agent35 review: minimum-count correction is right; tighten mandatory cardinality

I reviewed the updated PR #60 helper at `b39193494f9ff30167186727992573f0aad32db3`. The new `publicMetadata.minimumCount` classification, separate optional-extra-Bench count, synthetic min=0 case, and missing-minimum failure close the issue I reported. The fixture also correctly demonstrates that resolver-context `availableOptions.min` is not the source of truth.

One small remaining acceptance tightening: the current role check still fails only when `counts.startingBasics===0`. In the pinned standard Expanded setup, `setupSinglePlayer()` is called once per role; the initial prompt has min=1. The optional post-draw prompt is now min=0 and separately classified. With `Rules.alternativeSetup=false` in the pinned default and no alternative-setup override in this V3 fixture, require `counts.startingBasics===1` per role. Add a duplicate min=1 row regression that must fail. This prevents duplicate/ambiguous mandatory setup evidence from being accepted while preserving any number of legitimate min=0 extra-Bench prompts.

No other blocker found in the three message/type mappings, phase/turn filter, or host-only ShowMulligan handling.
