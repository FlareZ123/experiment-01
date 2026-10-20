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

## Subsequent compiled genuine-Store validation: full portable selected-input coverage

The [manual-only pinned-engine run 39510427272](https://github.com/FlareZ123/experiment-01/actions/runs/39510427272) **succeeded** against the same real two-player 60-card smoke at head `fe13b28a2518aa3c6f137b7e4da158f0bbb1a0f5`. The observer's new version `agent23-native-decision-dispatch-witness-v2-prompt-values` uses existing exact prompt-reference transports first and safely falls back to the existing strict typed-action codec for primitive/plain-value prompt results, always verifying matching pending prompt ID and retaining its class. Nested card instances remain unportable and fail closed.

Extracted directly from that successful original Store job's `storeAudit` log, without treating the runtime as a competitive game:

| Native decision action | Selected objects and genuine Store dispatches | Exact portable input match |
| --- | ---: | ---: |
| ResolvePromptAction | 62 | 62 |
| PlayCardAction | 13 | 13 |
| PassTurnAction | 8 | 8 |
| UseAbilityAction | 1 | 1 |
| AttackAction | 10 | 10 |
| **Total** | **94** | **94** |

The real seeded baseline and instrumented `runMatch` returned deeply equal complete results. There was one identified genuine Store, 94 actor-owned decisions, 94 corresponding **same-object** Store dispatches, **zero changed portable inputs**, **zero unsupported paired inputs**, **zero native dispatch exceptions**, and eight additional unlinked live Store setup dispatches. These numbers are instrumented object identity and typed argument comparisons. They say nothing about optimal move selection or whether the default bot respects the player's information set. Full code result and version remain anchored to the CI head, not projected from these counts.

The v1 first native run [39509690724](https://github.com/FlareZ123/experiment-01/actions/runs/39509690724) had 50 unportable prompts and 44 portable matches, while all 94 references dispatched. Its early `changedChoiceToDispatch` counter incorrectly combined unportable comparisons with actual mutations. That classification was corrected with separate `unsupportedInputComparisons` and `changedChoiceToDispatch` fields before v2's zero/zero values were reported. **No observed mutation was established by that earlier counter.**

The [canonical bilateral runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs) now supports default-off `AGENT23_NATIVE_INPUT_WITNESS_DEV=true` installed at the real innermost `runMatch` boundary so the actor-only policy wrappers are already installed. The [historical four-arm parity runner](../../simulation/evaluation/agent23-canonical-native-input-pair.cjs) compares the same composed policy with witness disabled/enabled and fails on a reported-game mismatch; it remains retrospective and unqualified. A manually dispatched comparative CI result must be checked independently before making claims about four-arm noninterference.

## Canonical actor-only four-arm native Store identity parity

[Manually dispatched Actions run 39511299980](https://github.com/FlareZ123/experiment-01/actions/runs/39511299980), head `734262df6315f07a383bd4db6c77984ad3ceae18`, completed **successfully**. This run used the frozen four historical rank-6 and rank-11 arm seeds, the existing canonical actor-only composite policy, mandatory option legality handling and paper Supporter quota. The [paired runner](../../simulation/evaluation/agent23-canonical-native-input-pair.cjs) executed each arm without and with the new observer and required deep equality of the **complete existing reported development record** after removing only the added instrumentation field.

| Frozen arm | Live native choice objects matched by original reference and full typed input | Unlinked setup/other dispatches |
| --- | ---: | ---: |
| Rank 6, champion reference | 30 / 30 | 7 |
| Rank 6, New Moon | 191 / 191 | 11 |
| Rank 11, champion reference | 253 / 253 | 9 |
| Rank 11, New Moon | 255 / 255 | 7 |
| **All four** | **729 / 729** | **34** |

Every arm retained the exact source-deal and actual root-ledger fingerprints; no selected input mutations, rejected matched dispatches or unportable selected inputs were observed. The recorded `exactSameReportedNativeDevelopmentGameData` flag was true, with four control and four instrumented arms. The 34 unlinked genuine Store calls remain explicit rather than silently being attributed to chosen policy actions.

This authentic original-game evidence validates the narrow observer's placement inside the already-composed policy. It does **not** validate each action against paper Expanded rules, prove correct handling of concealed-zone history, restore a cloned native-policy RNG history, or establish the field's competitive game strength. All four arms were selected retrospectively and **zero games qualify for the target win rate**. The original frozen champion and New Moon candidates remain unchanged.
