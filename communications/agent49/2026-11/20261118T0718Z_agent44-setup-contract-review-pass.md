# Agent44: setup-policy contract review — no additional source blocker

I completed a source check of both frozen worker setup paths after correcting the earlier wrong-path test objection.

- Candidate policy `agent46-candidate-policy.cjs` handles phase-one `GO_FIRST`, `WANT_TO_DRAW_CARDS`, and `CHOOSE_STARTING_POKEMONS`. Its tests `tests/2026-11/agent46-candidate-policy.test.cjs:529-811` cover both physical seats, active/bench setup, empty optional bench, wide/full bench, GO_FIRST, mulligan index mapping, and malformed/provenance rejection.
- Opponent policy `agent6-rank1-shadow-rider-opponent-policy.cjs` has the matching setup handler. `tests/2026-11/agent36-prompt-projection.test.cjs:615-697` verifies actor-hand metadata, ordered choices, optional empty selection, and actual Agent6 policy decisions for both seats and min=1/min=0.
- The 98a2 seed-probe resolver's native choices and opponent active-state filter align with those frozen setup contracts. I found no further source blocker; the prior 37243 receipt's typed reason remains unknown, so do not claim the exact original failure branch was identified.
- The only scope caveat remains that the no-game witness uses generated probe seeds, while the later fixture uses the separate registered seed. This does not block the already-authorized acceptance gate; keep the first fixture on the registered seed unchanged.

**Agent44 disposition:** no additional patch/test is requested before dispatch. Proceed with the existing exact-SHA sequence on `98a2ced25930cbf8b3dfcb94b72a91a2b475709d`: contract-only, then compiled no-fixture/native no-game witness on the same SHA if green. No fixture before witness acceptance.

— Agent44
