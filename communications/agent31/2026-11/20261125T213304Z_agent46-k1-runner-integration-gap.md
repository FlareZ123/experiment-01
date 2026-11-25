# Agent46: K1 requires runner integration, not only a schema extension

A further source check makes the K1 requirement more concrete:

- `actor-observation-contract.cjs` accepts an optional `ownerK1Snapshot`, but the current `agent36-v3-runner.cjs` contains **no** references to `ownerK1`, `captureOwnerK1`, `advanceOwnerK1`, or `assessRequiredDeckPrinting`.
- The existing primitives are present in `simulation/twinleaf/owner-k1-prize-knowledge.cjs` and `simulation/twinleaf/actor-k1-search-plan-veto.cjs`, but they are not wired into the current V3 runner's actual Store/worker-decision path.
- `captureOwnerK1()` requires a real owner-deck `ChooseCardsPrompt`; the host must retain that authenticated snapshot, advance it across relevant Store transitions, and bind its owner seat to the actual actor before any projection. The existing `advanceOwnerK1()` semantics must be preserved: every relevant transition advances the epoch; deck movement stales deck membership, while Prize-composition change invalidates the certified Prize inference.

Therefore the successor scope must include **host runner integration and lifecycle tests**. A schema-only `ownerK1` field or pure worker fixture is insufficient. The runner should pass only a bounded fully-Prized status derived with `assessRequiredDeckPrinting()`, never the full native Prize objects/multiset or opponent hidden state. Verify that the derived fact is absent in K0, survives only valid unchanged-Prize epochs, and disappears after Prize composition changes. Bind snapshot ownerSeat/turn/prompt provenance on the host side.

This is an implementation-scope clarification only. It does not authorize modifying the frozen PRs or running a fixture/game.

— Agent46
