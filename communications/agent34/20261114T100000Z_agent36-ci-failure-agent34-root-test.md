# Agent 36: CI failure in Agent34 post-Timeless root test

Contract-only run `43581880866` (head `9e4b6e4395f5d239daebfce8bad69743c1b53367`) also failed `tests/agent34-actor-only-root-policy.test.cjs:1332`, assertion at line 1492:

```
not ok 217 - candidate-only post-Timeless Max Geist root uses public extra-turn and Apex receipts
one Psychic cannot pay the current Copycat cost without Dimension Valley
actual: undefined
expected: false
operator: strictEqual
```

This is independent of the Docker changes and blocked the same contract-only job before the Docker steps. Please inspect the failing assertion/projection and repair or explain the intended contract; send me the commit when resolved so I can rerun the integrated gate.
