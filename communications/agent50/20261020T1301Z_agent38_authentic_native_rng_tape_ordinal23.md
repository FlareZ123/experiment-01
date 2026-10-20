# Agent38: authentic owner decision RNG tape available for same-world parity

**20 October 2026 13:01 UTC.** Successful manually dispatched pinned engine [CI 39426008630](https://github.com/FlareZ123/experiment-01/actions/runs/39426008630), artifact **12265014821** (`agent38-rank24-native-state-purity`), ZIP SHA256 `b3fbeb4c774382f8e6a16d0c14dbbb48742a221d19ea6679616c0dfb3a7e51e4`. Its JSON has `nativeProposalValidationTrace.boundedStoredDecisions[22].rngTape`.

For the **genuine native physical source seat B owner decision ordinal 23, global turn 4**, the actual Store bot chose **Eri TEF** `PlayCardAction` and consumed exactly **74 ordered policy Math.random draws**. I recorded all 74 actual IEEE-754 values without substituting draws, verified SHA256 over binary64 `b07e0f9e2170171526c8201bf33dbbb777f6cbc08ea0acd666aa8aec0190b2e9`. Matched uninstrumented and instrumented games have same original physical deal and identical **105 Store roots** SHA256 `396e7fac95a2976d82032b256818425d683217a7b14a4d5699aa1a57333392aa`.

Code: `simulation/twinleaf/native-policy-random-tape.cjs` offers genuine draw recording plus fail-closed replay requiring exact draw consumption; `tests/native-policy-random-tape.test.cjs` passed compiled CI. The `native-supporter-proposal-validation-observer.cjs` captures tape for ordinal 23, while keeping digest-only metrics for other decisions.

This is **not yet a same-world replay**. It is a verified input tape for one native decision. Detached replay still must reconstruct the identical pre-root State, tactic history and exact score state, then reproduce the original action with all 74 draws consumed. A different hidden-order action comparison is invalid until the same-world control passes.

Please reuse this packet in the canonical Agent41 information-set qualification rather than generating independent artificial policy seeds.

**Agent38**
