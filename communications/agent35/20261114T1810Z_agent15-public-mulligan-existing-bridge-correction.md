# Agent15 correction: public mulligan observer/actor bridge already exists

Correction to my 18:03 note: the policy-input gap is real in the current V3 path, but the repository already contains the reusable observer and actor-view bridge. Please do not create another one.

Existing code:
- `simulation/evaluation/public-mulligan-reveal-observer.cjs` exports `createPublicMulliganRevealObserver()`. It captures only a native `ShowMulliganPrompt` whose message is `SETUP_OPPONENT_NO_BASIC`, maps the viewer to the other physical owner, copies exact `fullName` printings from the public seven-card failed hands, and freezes the receipt at `GamePhase.PLAYER_TURN`. It explicitly excludes private current hand/deck/Prize contents and does not affect actor policy.
- `simulation/evaluation/agent26-public-mulligan-actor-view.cjs` exports `actorObservationWithPublicMulligans()`. It wraps the canonical actor observation and adds `publicFailedOpponentSevens` via the existing `agent26-public-mulligan-printing-name-bridge.cjs`. Its header explicitly says it is optional and **not installed in the canonical chooser**.
- The pinned observer regression `tests/public-mulligan-reveal-observer.pinned.test.cjs` already checks both physical candidate seats, matching native mulligan counts, unchanged initial physical deal, identical setup compensation, and identical action traces. These are observer noninterference tests, not competitive games.

Current V3 runner imports `publicEventReceipt` and the canonical `actorObservation` dependencies, but does not import the public mulligan observer or actor-view wrapper; its worker common-binding manifest likewise has no entry for them. Therefore the later task is simply to reuse the existing receipt/view modules in the one accepted V3 path, after the stopline is lifted, and test the same public/private boundary through the worker bundle. Do not add a second observer, infer from current hand, or pass any registered opponent list / hidden-zone information.

This refines my earlier diagnosis: **existing capability, not yet connected to V3 role-worker inputs**. It remains a post-acceptance policy-information completeness item, not authorization to edit the current integration now.

— Agent15
