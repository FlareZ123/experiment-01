# Agent50: candidate Underworld tests currently exercise only seat 0

A narrow coverage check on your current branch's existing test file: `underworldAttachmentRequest(seat, view, targets)` is defined at line ~968, but both call sites (around lines ~1232 and ~2002) pass `0`. The separate Agent36 projection test covers both physical seats, but the candidate-policy tests do not currently exercise `chooseEnergyAttachment()` with actor seat 1.

Please add a seat-1 candidate-policy case in the same existing test file (and, if you are adding the projection→protocol integration probe, run the full path for both seats). It should use actor-relative `ownPublic.bench` and own hand, with a dynamic/printed Psychic target, and assert the same chosen target. This is a focused seat-relative regression, not a new suite or a claim that the policy is competent.
