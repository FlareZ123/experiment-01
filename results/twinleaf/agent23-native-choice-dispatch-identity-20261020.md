# Agent 23: native selected-action to live Store input identity

**20 October 2026.** This is a developer-only instrumentation advance against the canonical two-player playing-policy qualification gate. It does not change the frozen champion/New Moon 60s, create a matchup sample, or make any win-rate claim. **Competitive-qualified games: zero.**

## Correctness problem

The existing native proposal observer records action class, name, hand index, and owner-held printing. That projection is non-injective: distinct selected targets or prompt results can appear identical. A coarse root-ledger digest can likewise agree when actual Store inputs differ. Agent 41 previously identified this exact gap in [its canonical native proposal review](agent41-canonical-native-proposal-validation-integration.md). A reliable same-world action replay must bind the selected action's full portable parameters to the actual live dispatch.

## Delivered implementation

- [Witness](../../simulation/twinleaf/agent23-native-decision-dispatch-witness.cjs), version `agent23-native-decision-dispatch-witness-v1`: reversible nested wrapper around native `SimpleTacticsAi.decodeNextAction` and `Store.dispatch`. It observes only decisions for the authentic current owner, at the original State object of a live Store identified via `AddPlayerAction`. Separate genuine Stores get separate indices.
- The witness uses existing research codecs [typed action transport](../../simulation/twinleaf/source-action-value-codec.cjs) and [prompt-reference transport](../../simulation/twinleaf/source-prompt-action-codec.cjs). Only the SHA-256 of the typed input envelope is retained. Unknown prompt kinds, class-reference payloads and serialization failures return explicit `unsupported`, leaving `unchangedPortableInput:false`. No hidden-zone card content is published in the audit.
- The chosen object reference must itself reach real Store dispatch; captured proposal and dispatch input hashes must match before `unchangedPortableInput` is true. A dispatch returning without throwing is recorded as `dispatchReturnedWithoutThrow`, not independently certified legal resolution. Native rejected dispatches keep an attached interrupted audit and restore both method descriptors.
- The report preserves unmatched Store dispatches, rejected/mutated selected actions, unproved inputs, bounded records and overflow. Setup dispatches naturally contribute unmatched entries. The aggregate deliberately leaves `fullyLinked:false`, because accepted Store calls alone cannot certify full-game equivalence or decision competence.

## Validation

- Local Node 22.16.0 pure six-case prototype tests passed, including target distinction, mutation after choice, prompt selection, unsupported prompt, dispatch rejection and restoration. Those local tests use injected codecs and are developer diagnostics.
- The [repository six-case regression](../../tests/agent23-native-decision-dispatch-witness.test.cjs) includes the actual existing pinned typed codec as well as an unsupported nested engine-class negative control.
- [Manual CI run 39509156060](https://github.com/FlareZ123/experiment-01/actions/runs/39509156060) succeeded with the new six-case repo regression plus existing pinned engine compilation and smoke; this CI ran before the additional genuine Store probe and later owner/multi-Store guard improvements.
- [Genuine Store smoke](../../simulation/twinleaf/agent23-native-witness-smoke.cjs) was added to the *existing manually dispatched* [policy RNG workflow](../../.github/workflows/twinleaf-policy-rng.yml). It runs the same seeded 60-card engine smoke baseline twice, requiring full returned game-result equality under the new observer. The later compiled run must be checked before a native noninterference claim is made.

## Integration route and limitations

Agent 41's existing canonical bilateral runner is the integration owner. Install this witness at the innermost *actual* policy decision boundary after actor-only components are installed, or it may capture only delegated native fallback decisions rather than the final selected actions. Record its `gameIndex`, proposal ordinal, reference match, typed identity and authentic owner State. Reconcile against existing original Store dispatch transcript and same-world RNG tape before attempting a concealed-world comparison. Never infer identical actions from coarse card-name/hand-index projections. A syntactically captured typed action still requires subsequent Store settlement/public-state and paper-rules validation.

The observed original Store may be replaced by a new Store on the next genuine `AddPlayerAction`. If upstream headless changes begin creating speculative AddPlayerAction Stores, the live-store classification itself must be tightened and requalified. This wrapper has no validated tournament clock, no guarantee that every action came from the interceptable bot, and no separate K0/K1 owner-knowledge certificate.

**Evidence status:** one narrow, useful input-identity prerequisite with successful pure compiled regression. No complete source-pressure/reply match is certified by this change; no field opponent, candidate win, or 99.5% claim follows.
