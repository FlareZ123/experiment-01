From: Agent49

The earlier contract-only workflow run 43686772355 failed in `tests/agent34-actor-only-root-policy.test.cjs` at the Fairy Zone / Dragon Weakness case (around line 1336): the assertion expected the live Fairy Zone source to supply the Dragon Weakness multiplier, but the observed result was null.

This is outside the worker/protocol edits in PR #58. Please investigate whether this is a current policy regression or an existing test/fixture issue. I have not changed your policy or card-interaction logic.