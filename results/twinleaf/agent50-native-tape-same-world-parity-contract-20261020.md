# Agent 50: authentic policy tape, same-world parity prerequisite

**20 October 2026, normal research mode, Agent 50.** Scope: executable integrity gate for actor-decision replay under pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This is a **pure diagnostic contract**, not yet a native twin Store replay and not a match-performance result.

## Native evidence being integrated

Agent 38's paired native rank-24 source-seat B ordinal-23 owner decision (global turn 4) has a genuine, unmodified **74-draw** `Math.random` transcript, digest `b07e0f9e2170171526c8201bf33dbbb777f6cbc08ea0acd666aa8aec0190b2e9`. Original 105-root source Store ledger matched the uninstrumented control (SHA-256 `396e7fac95a2976d82032b256818425d683217a7b14a4d5699aa1a57333392aa`) in [compiled CI 39426008630](https://github.com/FlareZ123/experiment-01/actions/runs/39426008630). This authentic tape is available in its JSON artifact at `nativeProposalValidationTrace.boundedStoredDecisions[22].rngTape`. The packet supplies the RNG source; a physically identical, policy-faithful replay remains an open requirement.

Agent 22's later [compiled restoration audit](agent22-authentic-supporter-proposal-state-mutability.md) established that **36 genuine temporary Supporter-marker writes were restored by the existing canonical Supporter correction** before final bot exit and Store dispatch. Earlier speculation that these particular writes persisted into real game State is superseded.

## New executable contract

- `simulation/twinleaf/native-policy-random-tape.cjs` now rejects **swallowed overread errors**. Previously a tactic could catch a thrown replay-tape-exhaustion error and return normally at exactly the expected draw count; the wrapper would then report a false successful replay. The capture limit has the symmetric protection. The original `Math.random` is restored in `finally`.
- `simulation/twinleaf/native-same-world-tape-parity.cjs` requires an independently cloned physical root that fingerprints identically, exactly the recorded policy RNG draws, a replay action matching the actual native action, and an unmodified original source root. It records every failed prerequisite as an unqualified result. Its `replayDecision` callback must instantiate the **actual policy and adapters**, not a generic default bot.
- `tests/native-policy-random-tape.test.cjs` and `tests/native-same-world-tape-parity.test.cjs` add adversarial overread, under-consumption, clone mismatch, action mismatch, live-alias mutation and exception-path cases.

[Manual existing CI 39446375343](https://github.com/FlareZ123/experiment-01/actions/runs/39446375343) passed after the overread correction. [Manual existing CI 39446938360](https://github.com/FlareZ123/experiment-01/actions/runs/39446938360) passed at commit `a5d6fa3c`, including both strict tape and new same-world parity synthetic regressions and the other configured compiled native diagnostic tests. No new workflow was created; only the existing manual-only `source-deal-fingerprint-smoke.yml` smoke test list changed.

## Required native next step

The Agent 38 ordinal-23 **actual** source decision must retain the physical pre-decode root, same actor's instantiated tactic/adapter closure and owner K0/K1 evidence. After the real Store game completes, clone that root faithfully and run `verifyNativeSameWorldTapeParity` with the already recorded 74 original policy draws. Capture the real Store decision's native action signature for exact comparison; do not substitute a new seed, a hand-constructed action, a fresh default tactic list or a retrospectively chosen favorable root. If the replay action or draw count differs, preserve the first divergence and mark the information-set inference unqualified. Only after exact same-world parity should an actually owner-hidden component be varied, with known-top and K1 knowledge constraints proved separately.

**Limit:** Passing eight synthetic same-world tests proves that the fail-closed checker behaves as designed on those fixtures. It establishes neither authentic replay parity nor source pressure, paper legality, human-strength decision quality, complete game resolution, a matchup win or a 99.5% result. The exact-field public status remains 29/32 independently verified 60s, zero competitively qualified games.
