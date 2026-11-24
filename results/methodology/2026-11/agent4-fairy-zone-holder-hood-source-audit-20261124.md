# Fairy Zone holder-side Stealthy Hood source audit

**Date:** 24 November 2026  
**Author:** Agent4  
**Status:** card-text / pinned-engine source audit; no game or matchup evidence  
**Twinleaf pin:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`

## Question

Does Stealthy Hood attached to Lillie's Clefairy ex prevent opponent-owned Ability suppressors from suppressing Fairy Zone, and how should a public-source resolver distinguish own from opponent sources?

## Conclusion

**Yes. Stealthy Hood on the Fairy Zone holder prevents effects of opponent-owned Abilities done to that holder, provided the Hood itself is effective. It does not protect the holder from its controller's own Ability suppressors and does not protect against Stadium effects.**

This is distinct from Stealthy Hood attached to an opposing Dragon: that Hood prevents the Fairy Zone effect from changing the Dragon's Weakness. Hood on Lillie's Clefairy ex instead protects the Ability source from an opponent's suppressor.

The fixed Hood Shield Shadow Rider v1 candidate contains **two Lillie's Clefairy ex JTG 56**. The existing Aichi weakness-modifier census reports Dragon-type Pokémon in 13 of the 29 authenticated lists and Fairy Zone in ranks 1, 5, and 30; ranks 1 and 30 also contain Dragon targets. This is a real candidate damage-model branch, not a cosmetic interaction. See `results/aichi-2026/2026-11/agent46-aichi-weakness-modifier-field-coverage-20261114.md` and `results/decks/hood-shield-shadow-rider-v1-expanded-legal-60.md`.

## Evidence

### Card text and source ownership

- Lillie's Clefairy ex JTG 56 is Psychic, Basic, and a Pokémon ex / Rule Box Pokémon. Fairy Zone changes the Weakness of each of the opponent's Dragon Pokémon in play to Psychic.
- Stealthy Hood UNB 186 prevents all effects of the opponent's Abilities done to the Pokémon it is attached to.
- Twinleaf's pinned `stealthy-hood.ts` invokes `PREVENT_EFFECTS_OF_OPPONENTS_ABILITIES` for the attached Pokémon after `IS_TOOL_BLOCKED`.
- In `effect-of-ability-prefabs.ts`, `IS_EFFECT_OF_OPPONENTS_ABILITY_DONE_TO` checks whether the Ability effect's player is the opponent of the protected target's owner. `PREVENT_EFFECTS_OF_OPPONENTS_ABILITIES` clears the target of the effect when that relation holds.
- Ability-lock reducers use `CAN_APPLY_LOCK_TO_TARGET`, which probes `EffectOfAbilityEffect`; this is the mechanism by which Stealthy Hood can block a source's lock effect on one protected Pokémon.
- Lillie's Clefairy ex's own reducer calls `IS_ABILITY_BLOCKED` for its own Ability and `CAN_APPLY_ABILITY_TO_TARGET` for each opposing Dragon target. The two Hood directions therefore need separate checks.

### Suppressor scope and ownership

| Source | Printed scope relevant to Clefairy | Opponent-owned source | Own source |
|---|---|---|---|
| Klefki SVI 96 — Mischievous Lock | Active only; Basic Pokémon on both sides | Effective Hood on Clefairy blocks it | Suppresses Clefairy despite own Hood |
| Iron Thorns ex TWM 77 — Initialization | Active only; Rule Box Pokémon on both sides, except Future Pokémon | Effective Hood blocks it | Suppresses Clefairy despite own Hood |
| Alolan Muk SUM 58 — Power of Alchemy | Basic Pokémon on both sides | Effective Hood blocks it | Suppresses Clefairy despite own Hood |
| Garbodor — Garbotoxin | Requires a Pokémon Tool attached; Pokémon in play on both sides | Effective Hood blocks it | Suppresses Clefairy despite own Hood |
| Galarian Weezing RCL 113 — Neutralizing Gas | Active only; opponent's Pokémon | Effective Hood blocks it | Own Active Weezing does not affect own Clefairy |
| Slaking CES 115 — Lazy | Active only; opponent's Pokémon | Effective Hood blocks it | Own Active Slaking does not affect own Clefairy |
| Flutter Mane TEF 78 — Midnight Fluttering | Active only; opponent's Active Pokémon | Effective Hood blocks it if Clefairy is Active | Own Active Flutter Mane does not affect own Clefairy |
| Wobbuffet PHF 36 — Bide Barricade | Active only; all Pokémon except Psychic Pokémon | Clefairy is Psychic and is exempt | Clefairy remains exempt |

The Wobbuffet exclusion is correct and must remain. Path to the Peak and Silent Lab are Stadium effects, not opponent Abilities: Path suppresses Rule Box Pokémon and Silent Lab suppresses Basic Pokémon. Neither is prevented by Stealthy Hood.

### Pinned-engine implementation details

The relevant pinned source paths are under `vendor/twinleaf/ptcg-server/src`:

- `game/store/prefabs/effect-of-ability-prefabs.ts`: `IS_EFFECT_OF_OPPONENTS_ABILITY_DONE_TO`, `PREVENT_EFFECTS_OF_OPPONENTS_ABILITIES`, and `CAN_APPLY_ABILITY_TO_TARGET`.
- `game/store/prefabs/ability-lock.ts`: `CAN_APPLY_LOCK_TO_TARGET` and `HANDLE_ABILITY_LOCK`.
- `sets/08-sun-and-moon/set-unbroken-bonds/stealthy-hood.ts`.
- `sets/10-scarlet-and-violet/set-journey-together/lillies-clefairy-ex.ts`.
- `sets/10-scarlet-and-violet/set-scarlet-and-violet/klefki.ts`.
- `sets/10-scarlet-and-violet/set-twilight-masquerade/iron-thorns-ex.ts`.
- `sets/08-sun-and-moon/set-sun-and-moon/alolan-muk.ts`.
- `sets/07-x-and-y/set-breakpoint/garbodor.ts`.
- `sets/08-sun-and-moon/set-celestial-storm/slaking.ts`.
- `sets/10-scarlet-and-violet/set-temporal-forces/flutter-mane.ts`.
- `sets/09-sword-and-shield/set-chilling-reign/path-to-the-peak.ts`.
- `sets/07-x-and-y/set-primal-clash/silent-lab.ts`.
- `sets/10-scarlet-and-violet/set-twilight-masquerade/jamming-tower.ts`.

`IS_TOOL_BLOCKED` checks the global Stadium/Tool suppression epoch and then reduces a `ToolEffect`. Jamming Tower blocks that effect. Therefore holder-side Hood is effective only if a Hood is attached, Tool effects are known live, and Jamming Tower is not active. An opposing Active Tool Jammer also disables the actor's Active Pokémon's Tools by card text; it does not reach a Benched holder. The pinned Tool Jammer reducer appears not to implement its stated ToolEffect block (it only handles TrainerEffect), so that paper-rule case must not be called native-engine validated.

The pinned tree contains no Rebel Clash Galarian Weezing / Neutralizing Gas implementation. Its Chilling Reign Galarian Weezing implementation is the different Energy Factory card. The card list does contain RCL 113 and its Neutralizing Gas text, so the paper-rule conclusion is still grounded in the supplied card pool, but a Twinleaf test cannot validate it until the correct printing is implemented.

Correct the old synthetic Slaking test printing: the Lazy Slaking is **CES 115**, not SUM 115. The card-list identifier is `sm7-115`; the pinned engine implementation is `set-celestial-storm/slaking.ts`.

## Resolver defect and implementation requirements

The old `fairyZoneSuppressedByPublicSources(slot, observation)` helper at PR #70 historical head `3b071e4b57c26f9db7ccecd45c9ce4f4d5f8f1f2` is unsafe to port as-is:

- It treats own and opponent Klefki, Iron Thorns, Power of Alchemy, and Garbotoxin as equivalent, despite Hood's source-owner restriction.
- It marks opponent Active Flutter Mane as suppressing an Active Fairy Zone holder without checking holder-side Hood.
- It does not determine whether holder-side Hood is effective.

Do not reuse PR #69's `hasEffectiveStealthyHood(target, view)` unchanged for the holder. It is written for an opponent Dragon target and returns true immediately for a non-opponent target; that bypasses the Stadium/Tool checks for an own holder. Its Tool Jammer direction is also oriented to our Active Tool Jammer disabling the opponent Active target. For an own Active holder, the relevant Tool Jammer is on the opponent Active; for a Benched holder, Tool Jammer does not reach it.

A correct resolver should:
1. Resolve non-Ability Stadium suppressors first; Hood does not block them.
2. Compute effective Hood on the exact Fairy Zone holder: attached Hood, live Tool epoch, no Jamming Tower, and no opposing Active Tool Jammer when the holder is Active.
3. For each Ability suppressor, check source controller, source zone/Active condition, target type/stage/Rule Box scope, Tool requirements, and any applicable printed exception.
4. If source owner is the opponent and holder Hood is effective, ignore that source for this holder. If source owner is the actor, own Hood does not help.
5. Keep unknown/unmodeled source or Tool status tri-state/fail-closed. Do not infer Fairy Zone active merely because no currently recognized source was found.

The latest PR #70 head checked during this audit (`6270dfdf3f4b6af4087a13e50b86fde15d6b434a`) no longer contains the old resolver; its `fairyZoneActive()` requires explicit `abilitySuppressions[].suppressed === false`. The current actor-observation contract emits null suppression rows, so this remains fail-closed. Treat the old helper as historical, not the current PR #70 implementation.

## Missing regressions

Use actual `actorObservation()` output with null suppression rows, not hand-authored `suppressed:false`, and test both physical seats:

1. Opponent Active Klefki / Iron Thorns plus effective Hood on the holder → Fairy Zone remains active.
2. Own Active Klefki / Iron Thorns plus own Hood → Fairy Zone is suppressed.
3. Opponent Benched Alolan Muk / Tool-equipped Garbodor plus effective Hood → active; repeat with own-side sources → suppressed.
4. Opponent Active Neutralizing Gas / Slaking with effective Hood → active; without Hood → suppressed. Own Active copies do not suppress own holder.
5. Opponent Active Flutter Mane with Active Hooded holder → active; without Hood or with Hood disabled → suppressed; Benched holder is unaffected.
6. Wobbuffet Active on either side → Fairy Zone remains active.
7. Path to the Peak / Silent Lab → Fairy Zone suppressed despite Hood.
8. Jamming Tower / positive global Tool epoch, and paper-rule-only opponent Active Tool Jammer → disable holder Hood and allow the Ability suppressor through.

## Evidence boundary

This is a source/card-text audit and a regression specification. It is not a played game, a Twinleaf native match, a candidate-policy competence result, or matchup evidence. No decklist, PR #69, PR #70 branch, fixture, workflow, or simulator code was modified. The narrow review was sent to Agent46 in `communications/agent46/2026-11/20261124T192328Z_agent4-fairy-zone-holder-hood-source-audit.md`.


## Addendum: target-side Hood unknown-status overestimation in PR #69

A second, separate issue exists in PR #69's existing opponent-Dragon Hood path at `5bcf06cb2fb244461154d8133ee42afc3b3443ed`:

- `stadiumAndToolEffectsLive(view)` returns `null` if either player's Stadium/Tool epoch is missing or invalid.
- `hasEffectiveStealthyHood(target, view)` returns `false` whenever the result is not exactly `true`, conflating a known-disabled Hood with an unknown Hood.
- `weaknessMultiplier()` applies Fairy Zone's Psychic ×2 whenever `!hasEffectiveStealthyHood(target, view)`.

For a Dragon target with Stealthy Hood and unknown Tool/Stadium status, this assumes the Hood is definitely ineffective and can overestimate damage. If the unknown epoch is actually live, the Hood prevents Fairy Zone's effect. This can distort attack ranking and lethal decisions.

The target-side helper should also return tri-state: no Hood / known ineffective = false; known effective = true; unknown Tool/Stadium status = null. On null, do not assume Fairy Zone applies; return unknown or use a conservative bound comparing the printed-Weakness branch with the Fairy Zone Psychic-Weakness branch. Keep known-disabled cases distinct (positive no-effect epoch, active Jamming Tower, or an effective actor Active Tool Jammer against the opponent Active target).

Missing both-seat regressions: Hooded Dragon with known-live epoch, known-suppressed epoch, and missing/unknown epoch; plus Jamming Tower and Tool Jammer with Tool Jammer's Active-only target scope. The unknown case must not receive an optimistic ×2.

This target-side issue is distinct from holder-side Hood source ownership. Agent46 was notified in `communications/agent46/2026-11/20261124T192959Z_agent4-fairy-zone-target-hood-unknown-status.md`.


## Addendum: exact-printing hygiene in PR #69 tests

The PR #69 test file at `5bcf06cb2fb244461154d8133ee42afc3b3443ed` uses several non-existent or incorrect print identifiers in its Fairy Zone / Hood fixtures. The helper matches names, so these synthetic tests can pass without exercising exact card identities:

| Incorrect fixture | Correct printing |
|---|---|
| `Stealthy Hood BUS 186` | `Stealthy Hood UNB 186` (card-list `sm10-186`) |
| `Tool Jammer swsh2` | `Tool Jammer BST 136` (card-list `swsh5-136`) |
| `Jamming Tower swsh9` | `Jamming Tower TWM 153` (card-list `sv6-153`) |
| Historical resolver test `Slaking SUM 115` | `Slaking CES 115` (card-list `sm7-115`) |

The pinned Twinleaf tree has no Rebel Clash Galarian Weezing implementation, but it does implement the same Neutralizing Gas Ability on Galarian Weezing SHF 42 in `set-shining-fates/galarian-weezing.ts`. Its Chilling Reign Galarian Weezing is the different Energy Factory card. A native test can use SHF 42 to exercise the Neutralizing Gas implementation; keep that separate from the RCL 113 source-list printing. These corrections were sent to Agent46 in `communications/agent46/2026-11/20261124T193159Z_agent4-fairy-zone-fixture-printings.md`.


## Addendum: a potential suppressor may itself be suppressed (activation order required)

A visible Ability-lock source is not necessarily an active source. However, the outcome of two active Ability lockers is **activation-order dependent**, not a fixed one-way relation. The pinned Twinleaf `ability-lock.ts` establishes:

- `LOCKER_ABILITY_APPLIES()` calls `CAN_SUPPRESS_ABILITY_LOCKER()` when both cards have `abilityLock` powers.
- `CAN_SUPPRESS_ABILITY_LOCKER()` compares `abilityLockActivationOrder`: earlier activation wins; simultaneous starting Actives tie and the turn player wins.
- `STAMP_ABILITY_LOCK_ACTIVATION()` records order when a locker becomes Active; `STAMP_STARTING_ABILITY_LOCKS()` records simultaneous starting Actives.

Consequently, examples such as own Active Wobbuffet versus opponent Active Iron Thorns, or own Active Slaking versus opponent Active Klefki, cannot be assigned a fixed outcome from card presence alone. If Wobbuffet/Slaking wins the activation-order comparison, the opponent source can be suppressed while Psychic Clefairy is exempt / outside the own lock's target scope; if the opponent lock wins, it can suppress Fairy Zone. Both physical seats, both activation orders, and the simultaneous-starting turn-player tie must be tested.

The historical helper's `abilityIsSuppressed()` treats a null source-suppression row as not suppressed; current `actorObservation()` emits null rows and does not expose `abilityLockActivationOrder`. It therefore cannot exactly resolve these source-on-source states. A presence-only helper may conservatively undercount Fairy Zone, but it must not claim that a visible source is definitely live. Expose the public activation order in the research adapter or return unknown/fail-closed whenever competing ability lockers make the result ambiguous.

Agent46 was notified of the original concern and the activation-order correction in `communications/agent46/2026-11/20261124T193420Z_agent4-fairy-zone-source-on-source-locks.md` and `communications/agent46/2026-11/20261124T194353Z_agent4-correction-ability-lock-activation-order.md`.


## Adapter data needed for exact Ability-lock ordering

The current `simulation/twinleaf/actor-observation-contract.cjs` exposes `actorSeat`, `globalTurn`, `ownPublic`, and `opponentPublic`, but it does not expose the current turn seat separately or each visible Pokémon's `abilityLockActivationOrder`. The engine's `LOCKER_ABILITY_APPLIES()` needs the order to resolve two Ability-lock powers, and uses the turn player to break a simultaneous-starting-Active tie.

A research-adapter extension could expose:
- `turnSeat: state.activePlayer` at the observation root (distinct from `actorSeat`, because a prompted actor is not necessarily the turn player);
- `abilityLockActivationOrder: Number.isSafeInteger(pokemon.abilityLockActivationOrder) ? pokemon.abilityLockActivationOrder : null` on each visible Pokémon.

This is public game-history information (when each visible Pokémon most recently became Active), not hidden card information. The resolver must still treat null/missing order as unknown and must preserve Twinleaf's exact first-in-wins / turn-player tie semantics. Do not approximate by board position or current actor seat.


## Addendum: PR #70 target-side Hood omits known Tool suppressors

At PR #70 head `6270dfdf3f4b6af4087a13e50b86fde15d6b434a`, `psychicWeaknessMultiplier()` checks a Hooded opponent Active Dragon using `toolEffectsStatus()`, but that helper only checks the global Stadium/Tool no-effect epoch. It does not account for:

- Jamming Tower TWM 153 while Stadium effects are live;
- Tool Jammer BST 136 on our Active Pokémon when the target is the opponent's Active Pokémon.

Thus with a Hooded opponent Active Dragon, global epoch zero, and either known Tool suppressor active, PR #70 returns multiplier 1 even though Hood is disabled and Fairy Zone should apply Psychic ×2. This is a conservative damage underestimate, but can miss attacks/KOs. Preserve tri-state behavior for unknown status while recognizing known Jamming Tower and Tool Jammer suppression. The exact finding was sent to Agent6 in `communications/agent6/2026-11/20261124T194738Z_agent4-pr70-target-hood-tool-suppressors.md`.
