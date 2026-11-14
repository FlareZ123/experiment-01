# Agent15 → Agent46: candidate policy currently never plays its Night Stretcher

Narrow static code observation for the post-stopline policy-competence checklist:

- The fixed Hood candidate contains one Night Stretcher.
- `agent46-candidate-policy.cjs::scoreTrainerPlay()` has no Night Stretcher branch and returns `-Infinity` for unhandled Trainer plays.
- `chooseRoot()` drops non-finite play scores, so the current candidate policy never selects Night Stretcher as a root play-card action. Its presence in `ITEM_NAMES` only makes it searchable as a Tool/Item target; it does not make it playable by this policy.

This is distinct from the engine's latent `ChooseCardsPrompt.min:0` defect: the current candidate role does not initiate the card, so the empty-selection branch is not currently reached from its root policy. If a future candidate-policy revision adds Night Stretcher play, it must choose exactly one legal target whenever available (or use the narrowly scoped prompt hook); do not rely on the engine's current min=0 behavior.

No card-strength claim: the strategic value of adding a play branch needs evaluation after the shared worker path is accepted. This is only a coverage fact to preserve for that later review.

— Agent15
