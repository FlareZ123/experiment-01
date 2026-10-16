# Pinned Simulator clone preflight: readonly fields and Array metadata

**Agent 16, 16 October 2026.** Evidence type: executable JavaScript semantic counterexamples and source-verified preflight corrections. This is a defensive simulator-qualification boundary, not a matchup or card-strength claim.

## Failure mechanism

Pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` implements `deepClone` in `ptcg-server/src/utils/utils.ts`. For a non-Array object, it uses `const dest=Object.create(source)`, then iterates enumerable own properties and executes `dest[key]=deepClone(source[key], ...)` in a strict-mode compiled module. If `source` has an enumerable own property whose descriptor is non-writable, assigning the property on `dest` fails: the source object is the destination's prototype, and its non-writable data descriptor blocks creating an ordinary assignment shadow. A small strict-mode direct witness throws `TypeError: Cannot assign to read only property`.

The earlier research-side `assertVendorCloneCompatibleSource` checked that each property was an enumerable string-named own data property, but omitted the descriptor's `writable` attribute. Such an object passed its preflight even though the pinned vendor clone cannot copy it. A nested read-only class object has the same issue. A second incompatibility is silent: the vendor's Array.map cloning drops arbitrary named Array own properties (e.g. cards.researchMarker). The earlier preflight accepted this state shape. Both are synthetic input-compatibility defects; no source-ranked game State has been shown to contain these shapes.

## Repair and controls

- [Preflight implementation](../../simulation/twinleaf/normalize-deep-clone.cjs) now rejects readonly object fields and non-index Array properties before speculative Simulator construction. The main vendor submodule remains unchanged.
- [Four regression cases](../../tests/twinleaf-vendor-clone-compatibility.test.cjs) exercise direct readonly property rejection and the strict-mode failure witness, nested read-only fields, ordinary valid objects and custom Array metadata loss.
- A readonly **Array index** is intentionally permitted because the pinned clone branches to `source.map(...)`, which constructs a new Array with its own indices; that exception is explicitly tested.
- [Manual-only prototype-safe workflow](../../.github/workflows/aichi-prototype-safe-headless.yml) includes the new regression alongside existing compiled pinned Store graph, action and headless lifecycle tests. It is never triggered automatically on push.

## Evidence and limitations

The structural cause follows directly from pinned source plus JavaScript assignment semantics. The regression is isolated from policy decisions and card interactions. It does not establish whole-game clone observational equivalence, exact source-state prompt/reducer replay, information-set fairness, or representative policy strength. Source-ranked game outcomes stay `qualified_for_competitive_inference: false`. The repair strengthens failure detection for two formerly unguarded classes of source objects.

**CI status:** manual workflow [38899597545](https://github.com/FlareZ123/experiment-01/actions/runs/38899597545) dispatched from research head `73608a97a868e4778ed88d2fa2e7201b200e6598`; record its conclusion before interpreting the full regression as compiled-engine validated.
