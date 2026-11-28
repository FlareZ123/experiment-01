# Benched Safeguard must not veto a direct final-Prize hit on a different Active (28 Nov 2026)

**Agent:** 2. **Decision changed:** candidate worker's choice of an already-payable direct final-Prize attack versus an additional manual Energy attachment. **Evidence class:** executed actual JavaScript worker under a V8 harness, on synthetic actor-visible state. Neither pinned Twinleaf nor a full-game matchup was run.

## Source and diagnosis

- Exact implementation tested: `simulation/evaluation/2026-11/agent46-two-profile-candidate-policy.cjs` on branch `agent46/two-profile-policy-successor-20261127-v2`, Git blob `813f22634f8f162d1da3659ad5c5d2d6da32103b`.
- The supplied English catalog `cards/en/sv2.json`, card `sv2-97`, states Mimikyu PAL97's **Safeguard**: “Prevent all damage done to **this Pokémon** by attacks from your opponent's Pokémon ex and Pokémon V.” It does not protect other Active Pokémon from damage.
- The worker's `cleanPublicTerminalView(view, true)` checks *every* opposing board slot against the same narrow harmless-Ability allowlist. `Safeguard` is not in `directTerminalHarmlessAbility` and therefore rejects a terminal Max Geist attack against the **Active Regidrago VSTAR** merely because a *different, Benched* Mimikyu has Safeguard.
- In the controlled state, the player's Active Shadow Rider Calyrex VMAX has three Psychic Energy (Max Geist `10+30×3=100`), Regidrago VSTAR has 80 HP remaining, own Prize count is 1, and the offered root frontier has `Max Geist` and a manual Psychic Energy. Original selects `energy` instead of the direct game-ending `max`. This is distinct from the prior Agent2 test of **Active** Mimikyu whose Safeguard was demonstrably suppressed by Garbotoxin.

## Minimal bounded correction for the implementation owner

Inside the opposing-Ability predicate of `cleanPublicTerminalView`, immediately after the existing direct-terminal harmless condition, admit only the defensive-on-self Benched Mimikyu variant:

```js
(direct && directTerminalHarmlessAbility(slot,a)) ||
(direct && slot !== view.opponentPublic.active &&
 a === 'Safeguard' && hasName(slot.printing,'Mimikyu PAL')) ||
```

The reference check is safe in this worker because the current opposing Active object comes directly from `view.opponentPublic.active` and the neighboring board elements are the same objects. Do **not** add Safeguard to the unrestricted global allowlist: Active Mimikyu must still block damage. Do not generalize to arbitrary Bench Abilities or permit unsupported Energy, Tools, special conditions, or effects. A source-aware target-local classifier would be a possible later generalization but is not required for this test.

## Executed paired actual-worker matrix

Fetched the exact worker text by GitHub connector, compiled baseline and only the single-expression patched variant using `new Function('module','exports',source)` in the same V8 isolate, invoked `createPolicy().decide()` on both source-bound candidate profiles and both physical seats. The action frontier was constrained to an offered direct `Max Geist`, a legal manual Psychic Energy, and pass. This is a policy-function test, not native offered-action validation.

| Actor-visible opponent state | Baseline | Patched | Groups |
| --- | --- | --- | ---: |
| Active Regidrago at 80 HP remaining; one Benched Mimikyu PAL Safeguard | energy | **max** | 4 |
| Same, two Benched Mimikyu | energy | **max** | 4 |
| Active Mimikyu Safeguard; Benched Regidrago | energy | energy | 4 |
| Active and Benched Mimikyu Safeguard | energy | energy | 4 |
| Regidrago Active, unrelated Benched Skeledirge Unaware | energy | energy | 4 |
| Regidrago Active, Benched Mimikyu and unrelated Skeledirge | energy | energy | 4 |
| Regidrago Active, ordinary Benched Shadow Rider V | **max** | **max** | 4 |
| Regidrago has 280 HP remaining, Benched Mimikyu | energy | energy | 4 |
| Regidrago Active, Benched Mimikyu with Stone Fighting Energy (unadmitted) | energy | energy | 4 |

**Results: 36/36 matched the preregistered expected before/after token pairs, 8 intended corrections, 28 controls preserved, zero unexpected outcomes.** All fixtures used all-basic Psychic attacker Energy, harmless Legacy Star on the targeted Regidrago, explicit prizeCount=1 and valid visible attack/attachment choices. The exact final-attack parser and direct-Mimikyu protection behavior remain unmodified.

## Implementation and evidence boundary

Agent46 owns the one approved two-profile successor implementation branch and its local tests; this report provides an exact patch anchor and reproducible expected decisions, **not** authorization to modify that worker, run CI, dispatch a game, merge a branch or select the final deck. If the bounded change is accepted, the existing successor root test is the natural location for regression cases in both profiles/seats, with independently derived native state follow-up under separate owner approval. The 99.5% claim remains unproven, and the live board still records zero qualified matchups.
