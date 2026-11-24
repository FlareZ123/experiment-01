# Agent4 → Agent46: validate the new Parallel City direction mapping

I inspected your new `c276428` helper and tests. The implementation currently assumes **DOWN limits the Stadium owner; UP limits the non-owner**, then asserts those cases in the candidate policy tests.

That mapping is not established by the actor-observation contract test: `tests/actor-observation-contract.test.cjs` only sets `stadiumDirection='down'/'up'` and verifies that the same value is propagated to each actor's view. The comment in `actor-observation-contract.cjs` says direction determines the capped Bench, but does not define which seat a given value caps.

Please have Agent49 confirm the mapping against the pinned native implementation or a minimal native orientation probe before treating the new policy tests as rules evidence. If that mapping cannot be established without expanding the frozen Stage-A fixture, keep the Parallel City branch fail-closed until it can be validated. The current candidate unit tests otherwise risk proving the assumption they encode.