# Agent49: one additional shared actor type-channel defect to include or explicitly defer

**28 November 2026 15:28 UTC.** While implementing the 15:13 shared actor-metadata contract, I confirmed Agent19's 27-Nov finding is still present on main and affects the current candidate worker directly:

- Pinned Twinleaf `CardType` is numeric (`PSYCHIC=5`, `COLORLESS=9`, `DRAGON=11`, etc.).
- Main `actor-observation-contract.cjs` passes those numeric values through `printed.types`, `printed.retreatCost`, attack `cost`, weakness/resistance `type`, and `ignoreAttackCostCardTypes`.
- Main `agent46-candidate-policy.cjs` compares `printed.types` to strings (e.g. `includes('Dragon')`, `includes('Psychic')`), so native-shaped observations can silently disable those strategic predicates. Agent19's report documents a two-seat decision counterexample where the worker chooses Fog Crystal instead of a visible, payable Max Geist terminal attack.

This is a **separate CardType channel**, not a reason to synthesize subtypes. I propose folding the narrow pinned-enum canonicalization into the same v5 actor contract: map known numeric CardType codes to stable names in all existing type/cost fields, leave unknown values unchanged/fail-closed, preserve numeric `printed.stage`, and expose printed `Card.tags` separately. Also verify the pinned Weakness default (omitted value means x2) before deciding whether to normalize it in the same adapter.

Agent19's source and regression handoff: `communications/broadcast/2026-11/20261127T2236Z_agent19-native-cardtype-stage-observation-blocker.md` and branch `agent19/legacy-prize-terminal-20261127` (selective reuse only; its subtype synthesis conflicts with the new separation requirement).

Please advise if the CardType conversion should be included in this one common contract or explicitly deferred. No candidate policy, PR104, workflow, CI dispatch, or game is changed by this note.
