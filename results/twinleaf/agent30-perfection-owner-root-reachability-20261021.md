# Agent30: a payable Perfection attack is unreachable through the present actor-only root

**21 October 2026, genuine pinned Store staged counterexample, not a dealt match.**

The common root policy in `simulation/twinleaf/agent34-actor-only-root-policy.cjs` handles Benching, ordinary Energy, certain Items, direct printed attacks and pass. When Mewtwo & Mew-GX UNM is the Active Pokémon, its single own printed attack `Miraculous Duo-GX` is unaffordable with one Psychic, and the actor policy does not produce a `UseAbilityAction('Perfection')` root. The existing `simulation/twinleaf/perfection-attack-ordinal-boundary.cjs` proves the real pinned Store permits Mewtwo to initiate Perfection and choose an attack printed on a donor in its own discard. Our new test measures the precise actor/root gap in **the same staged public state**.

## Exact setup and observed outcome

`tests/agent30-pinned-perfection-root-gap.native.test.cjs`, commits `2d0900f`, `1ebae61`; registered in existing manually dispatched workflow by `7aad589`. In genuine pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, stage:

- Owner physical seat1, Active `Mewtwo & Mew-GX UNM` with exactly one `Telepath [P] Energy M3` attached; `Gengar & Mimikyu-GX TEU` in the owner's **public discard**.
- Opponent physical seat0 has only an Active `Pidgey MEW`, with no lock. Owner hand contains no Energy. Both owners have six prizes and a small face-down deck. Global turn2, bona fide PLAYER_TURN.
- The detached `actorObservation(state,1)` only contains owner hand and fully public board/discard information; no opponent concealed hand/deck or Prize identities are used.
- The current pure `chooseActorRootIntent(view,catalog,{energyRecipientFrontier:true,specialEnergyRoot:true})` chooses **`pass`**.
- On that exact Store state, native `UseAbilityAction(owner.id,'Perfection',Active)` instead **opens a genuine `ChooseAttackPrompt`** containing the Gengar source. `Horror House-GX` is native-valid with the single attached Telepath, and the test resolves that source attack. The Store marks `owner.usedGX===true` after the copied GX attack.

**[Compiled manual workflow 39570400605](https://github.com/FlareZ123/experiment-01/actions/runs/39570400605)** passed at head `7aad589aba510767dbcdd6ed568e76f8c7f6eda0`. The combined pinned native Telepath-and-Perfection tests passed; all four existing actor development arms passed strict audit coverage with no actor root dispatch rejection. This is an exact reproducible positive native action counterexample to `PassTurnAction` in a valid synthetic owner root.

## Research implication and specific guardrails

A default move to `Perfection` would be unsafe: Mewtwo's Ability may be disabled by opponent Iron Thorns ex `Initialization`, Garbodor `Garbotoxin`, or other applicable public locks. Candidate source rank6 had Latias ex Active and active Iron Thorns pressure; this staged result **does not** establish that Perfection could be used there or that the candidate would win. Ability-blocking source evidence must be explicit, and an actor-owned planner should only propose Perfection when some genuine public Bench/discard GX/EX donor attack can be paid by the currently attached known Energy. The **owner prompt** can then choose the exact donor card + attack from the native ChooseAttackPrompt, preserving source printing identity and respecting one GX allowance.

For the entire Aichi field, this is a higher-value missing move class than tweaking an attack ordering heuristic inside printed attacks: one of the fixed candidate's central attacks is absent from the actor root proposal set in states where it is actually payable.

Suggested controlled next integration: a narrow, reversible `Perfection` actor-owned root candidate with authentic source/donor enumeration, Store acceptance, hidden-opponent invariance, explicit public Ability-lock veto and prompt-source identity, paired against unchanged state/deal. Avoid treating a native prompt opened as completed attack or overlooking native GX and blocked-attack checks. Existing `agent13-actor-only-choose-attack.cjs` and `copy-attack-source-identity-hook.cjs` handle important parts of the downstream prompt but have their own fidelity limits.

No field-wide win rate or 99.5% claim is supported; current exact field coverage remains 29 of 32.
