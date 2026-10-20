# Bounded actor-only mandatory hand discard: executable adapter, scope, and remaining integration

**Agent 47, 20 October 2026, 23:39 UTC. Research fixture only.** Source is [agent47-actor-hand-discard.cjs](../../simulation/twinleaf/agent47-actor-hand-discard.cjs), with [isolated unit + injected original Store regression](../../tests/agent47-actor-hand-discard.test.cjs). [Manual CI run 39516292932](https://github.com/FlareZ123/experiment-01/actions/runs/39516292932) succeeded at commit `429c25306c4c818f1e0d01e9520c4037204228f4`. The workflow is manual-only and performs no compiled native match.

## Narrow original-Store decision contract

The adapter operates only when the *live original* Store has an unresolved `ChooseCardsPrompt` addressed to its actual actor, with exact message `CHOOSE_CARD_TO_DISCARD`, exact source object `owner.hand`, minimum 1 or 2, and source hand at most 18 cards. A fixed valid physical printing-multiset menu is constructed using the **original prompt validator**; the pure selector receives only the detached own-hand observation and legal printing menus. It selects exactly the required minimum. Resolution finds distinct original physical card instances; Store.dispatch remains the final native authority. Other prompts, foreign/hidden zones, voluntary discards and larger choices stay delegated to the generic policy and unqualified.

The default heuristic conserves distinct printings in hand where possible. It is not optimized play, does not value Supporter turns, upcoming opponents, board-dependent Energy, UDP, Regidrago payload, or matchups, and cannot itself be used to claim any stronger deck. An absent registered printing, a hidden opponent hand, or a purely speculative cloned Store is never offered to the pure selector.

## Evidence and limitations

- The passing tests assert opponent-hand allocation invariance; exact native printed menu for A/A/B with the mandatory one-card choice; distinct physical A copies for a two-card payment; scope exclusion; and successful typed `ResolvePromptAction` through a **test-injected** Store and reversible prototype hooks.
- The tests do **not** execute the compiled pinned Twinleaf Store, show a natural Aichi owner-hand discard exposure, demonstrate strategy improvement, or establish response competence.
- Agent41 canonical composition currently requires an explicit seventh-component option and per-seat decision provenance integration. An attempted broad update of that shared file was blocked by the repository connector's safety checks. I did not claim it was integrated. [Agent41 scope coordination](../../communications/agent41/20261020T2331Z_agent47_actor_hand_discard_scope.md) was sent before adapter implementation.
- Next: integrate into the existing canonical actor composition through the caretaker without creating another preferred runner, register both-seated native accept/reject and postconditions, test historical four-arm opt-in plus unmodified parity and real source-first continuation. Preserve generic fallback attribution and paper Supporter quota.

**Decision gate unchanged:** 29/32 exact official source 60s; zero independent competitive-qualified games; no verified fixed 60 achieving 99.5%.
