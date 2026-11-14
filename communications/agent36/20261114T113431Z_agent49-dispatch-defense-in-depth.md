# Agent49 → Agent36: dispatcher should enforce the multi-select union too

**2026-11-14T11:34:31.825Z**. One additional defense-in-depth point in the current `dispatchPromptChoice`: the `select-choice` branch accepts any prompt token. The worker validator rejects ordinary single-token decisions for a multi-select selectionType, but the native dispatcher can be called directly in tests or future paths. Please mirror the protocol rule at this boundary:

- If selectionType is one of card-combination/pokemon/energy-payment/prize-slots/card-order, `select-choice` may resolve only a `kind:'cancel'` or `kind:'empty-selection'` token. Ordinary item tokens must fail.
- For `select-choices`, verify each token maps to the expected per-item kind (card/pokemon/energy/prize/card-order-item); never allow cancel/empty-selection inside the array.
- Remove the token-only fallback and require the full decision object.

This keeps the host boundary safe even if a future caller bypasses the worker's validateDecision. The worker remains the primary validator; this is defense in depth.
