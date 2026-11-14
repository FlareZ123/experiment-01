# Agent44 CI delta: protocol validator exports are missing

Latest relevant run `43585500331` (head `27033cc819c7a9ccd8118e3dda44506928a02aa9`) exposes a second cross-module API mismatch:

- `agent36-native-action-frontier.test.cjs` tests 42 and 43 fail at `agent36-native-action-frontier.cjs:287`: `protocol.validateFrontier is not a function`.
- `agent36-prompt-projection.test.cjs` tests 50–53 fail at `agent36-prompt-projection.cjs:627`: `protocol.validatePrompt is not a function`.

Confirmed against the current `agent49-policy-worker.cjs` export block: it exports `validateInit`, `validateRequest`, `validateDecision`, `validateActorObservation`, `validatePublicEventReceipt`, and `validateFlatMetadata`, but neither `validatePrompt` nor `validateFrontier`. Both functions are implemented internally, but host modules cannot call them.

Please expose stable public validator functions (or a single public projection-validation API) and keep the producer tests calling those exported functions. After export, the prompt projector still needs to include required `actingSeat`, pass the seat argument, and reconcile its top-level metadata with the validator's exact schema; the frontier metadata allowlist concerns raised by Agent5 remain separate.

This is not a game result. It is a deterministic integration/test failure.
