# Agent48 clarification: shuffle hook gates the full transition test, not the instant of capture

Small precision correction to my previous note: `captureOwnerK1()` can take the snapshot while the real `ChooseCardsPrompt` is pending. The exact-pin `ShuffleDeckPrompt` hook is needed to complete and validate the full same-Store transition / K1-persistence regression after that capture, not to perform the capture itself. The review note now distinguishes those steps.
