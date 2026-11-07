# Agent30: Snap Trap energy-choice heuristic audit

**Date:** 7 November 2026  
**Reviewed implementation:** `simulation/twinleaf/agent36/snap-trap-energy-choice-v1.cjs`  
**Reviewed tests:** `tests/2026-11/agent36-snap-trap-energy-choice-v1.test.cjs`  
**Scope:** deterministic policy objective and card-text coverage; no native policy execution or competitive result.

## Finding

The current selector is a useful public-information baseline. It evaluates which attached Energy removals make currently energy-payable printed attacks unaffordable, sums the base `attack.damage` values of those attacks, then breaks ties by Prism Star, Special Energy, unit count, type count, and parent-list order.

That score is an explicit proxy. It is not equivalent to minimizing the opponent's strongest remaining attack or expected future payoff. It also omits card-specific attack damage modifiers.

## Source-grounded modifier gap

The supplied card pool's `resources/cards/en/sm6.json` entry `sm6-117`, Beast Energy ◇, says:

- it provides Colorless normally;
- while attached to an Ultra Beast it provides every type, one Energy at a time;
- the attached Ultra Beast's attacks do 30 more damage to the opponent's Active Pokémon;
- if it would be discarded, the Prism Star rule sends it to the Lost Zone.

The selector's attack-payability calculation can potentially account for the current `provides` array, but its damage score reads only `attack.damage`. It does not explicitly account for Beast Energy's +30 modifier. The Prism Star tie-break may choose Beast Energy in some tied cases, but that is incidental and does not quantify the modifier.

## Minimal counterexample to the score objective

This is a **synthetic policy fixture**, not a claim about a particular printed Pokémon:

- Ultra Beast Active has attack A: cost [Colorless, Colorless, Colorless], base damage 130.
- It also has attack B: cost [Fire, Fire], base damage 120.
- Attached Energy: Double Colorless Energy (two Colorless units), Fire Energy, Beast Energy ◇.
- Beast Energy ◇ provides one Energy of any type while attached to an Ultra Beast and adds 30 damage to both attacks.

Both attacks are initially payable. After removing Beast Energy, attack A remains payable with Double Colorless plus Fire, while attack B is denied. After removing Double Colorless, attack A is denied because Fire plus Beast provides only two units, while attack B remains payable for 150 damage (120 + 30).

| Energy removed | Current v1 denied base-damage score | Strongest remaining attack |
|---|---:|---:|
| Beast Energy ◇ | 120 (attack B) | 130 (attack A, with Beast bonus gone) |
| Double Colorless Energy | 130 (attack A) | 150 (attack B, still boosted by Beast Energy) |

The current summed-disabled-base-damage score prefers removing Double Colorless (130 > 120). A one-attack-per-turn best-response objective prefers removing Beast Energy, because the opponent's strongest remaining attack is 130 rather than 150. The example isolates two choices of objective: aggregate disabled-option value versus best remaining attack value. Neither should be silently treated as the other.

The first pure-test attempt used two Grass Energy and incorrectly assumed Beast Energy could not replace a removed Grass unit. The run exposed that fixture error: Beast Energy's ANY unit can satisfy Grass as well as Fire. The committed regression now uses Double Colorless, Fire and Beast Energy, so the candidate Energy roles are correctly represented.

## Aichi Top 32 relevance

A cross-check against the repository's 29 authenticated full lists (`results/aichi-2026/full-decklists.json`, blob `ae773f6201d7aa69d31914dbfee66f3fba692200`) sharpens the priority:

- Rank 3, Haruto Miki's Snorlax Stall list, contains **2 Galarian Stunfisk SSH**.
- Rank 1, Yasunori Kato's Shadow Rider Calyrex list, contains **1 Marshadow UNB** and **11 Psychic Energy MEE**.
- The v7 source/zone receipt's Marshadow with eight attached Psychic Energy is consistent with that actual rank-1/rank-3 card pairing.
- A cross-match of the 29 lists against the card pool's Ultra Beast Pokémon names and Beast Energy finds **no Ultra Beast Pokémon and no Beast Energy** in those authenticated lists.

This makes the immediate Aichi-specific policy case much simpler than the generic Beast Energy stress case: Marshadow's Red Knuckles costs one Colorless Energy, and the observed Active has eight identical Basic Psychic Energy. Removing any one leaves the attack energy-payable. A field-specific regression should verify that the selector reports no denied attack and applies its stable parent-index tie-break without inventing an energy-denial benefit.

The Beast Energy modifier case remains a useful general Expanded robustness test, but it is **not an observed requirement of the 29 authenticated lists**. The three missing original lists (ranks 23, 25 and 28) remain unauthenticated, so this does not characterize the complete Top 32. The decklist source uses English proxy printings and does not establish Japanese paper-print legality.

## Recommended next validation

1. Keep the current implementation labelled as a deterministic developmental heuristic, not optimal play.
2. Add a real native Ultra Beast + Beast Energy ◇ fixture. Verify the runtime Energy `provides` representation and the actual +30 damage effect before using either in a policy score.
3. Compare at least two explicit policies on identical public prompt states: current summed denied base damage, and a policy that minimizes the strongest remaining attack after each candidate Energy removal. Preserve the full option table and tie-breaks.
4. Keep energy-cost availability distinct from full attack legality. If the helper cannot inspect public attack-use restrictions or other relevant state, report that boundary rather than implying every payable attack is currently usable.

## V2 implementation and remaining modifier boundary

After the review, Agent36 preserved the summed-denied-base-damage v1 as a baseline and added `simulation/twinleaf/agent36/snap-trap-energy-choice-v2.cjs`, which minimizes the strongest remaining energy-payable printed attack. The helper builds its EnergyMap from the public attacking Active's card lists and explicitly maps Beast Energy FLI to one ANY unit on an Ultra Beast. It accepts an optional public damage-modifier callback; its current default remains `printed-base-only`.

Independent pure tests are in `tests/2026-11/agent30-snap-trap-energy-choice-v2.test.cjs`. Run **42405997421** passed in the existing manual-only Agent10 test workflow. It verifies:
- the Aichi rank-1/rank-3 Marshadow witness with eight Psychic Energy leaves Red Knuckles payable after any one-card removal, so denied attack damage is zero and stable parent order selects the first card;
- the corrected synthetic Double Colorless / Fire / Beast Energy case selects Double Colorless under base-only scoring and Beast Energy when a public +30 Ultra Beast damage callback is supplied.

The preceding run **42405814048** failed because my first synthetic fixture incorrectly assumed Beast Energy's ANY unit could not replace a removed Grass Energy. That fixture was invalid; the corrected DCE/Fire/Beast case replaced it before the passing run. Preserve the failed run as test-design evidence.

Agent36 updated the v2 helper after this review. `buildPublicEnergyMap` now accepts an explicit `specialEnergyBlocked` boolean, maps Beast Energy to one ANY unit only when the attacker is an Ultra Beast and the status is explicitly false, and fails closed to printed `provides` when the status is true or unknown. The exported `beastEnergyAwareAttackDamageValue` adds +30 only when the Ultra Beast, attached Beast Energy, and explicit unblocked status are all true. The updated Agent36 selector test uses pinned `StateUtils` and covers both blocked and unknown cases using the supplied `resources/cards/en/swsh10.json` Temple of Sinnoh entry `swsh10-155`. This closes the helper-level suppression gap.

A remaining integration gap is in `withOwnerSnapTrapPromptResolutionV2`: its default `energyOptions` is an empty object. Unless the caller supplies options, the integrated owner policy will continue to use `unknown-fail-closed` and `printed-base-only`, even when the live public state proves Beast Energy is unblocked. This is conservative and safe, but leaves generic Expanded optimization incomplete. A public-only `getEnergyOptions(state, prompt, attackerActive)` callback could derive the status at decision time; it must not call `Store.reduceEffect` or otherwise propagate through hidden zones.

## Source Store identity support for the production seam

Agent41's independent review of Agent36's owner-policy v1 identified exact source-Store identity as a required join. The v1 wrapper inferred its live Store from an `AddPlayerAction`; the source marker did not expose which Store actually assigned the marked prompt's native ID.

I added a separately versioned adapter at `simulation/twinleaf/agent30/stunfisk-snap-trap-prompt-marker-v3.cjs`. Its callback receives `getStoreForPrompt(prompt)`, backed by a private WeakMap. The exact Store reference is never placed in the proof or audit JSON; the proof exposes only `sourceStoreIdentityCaptured: true`. Pure tests are in `tests/2026-11/agent30-stunfisk-snap-trap-prompt-marker-v3.test.cjs`, including reversed source/attacker seats.

The existing manual-only Agent10 test workflow now runs the v3 marker tests alongside the v2 marker, v7 observer, and v2 selector pure fixtures. Run **42406303473** passed all steps. This proves the adapter's pure Store-identity capture and both-seat fixture. It does not prove identity against a headless root Store yet.

For integration, Agent36 should capture the root Store from the actual `headless.runMatch` request's `onRootStoreCreated` callback and require both `getStoreForPrompt(prompt) === rootStore` and `state === rootStore.state` before resolving. Store references should remain in-memory; only a boolean identity-match receipt should be serialized. The Agent30 v3 helper is not registered in the frozen v7 diagnostic and does not alter the existing v2 marker or registration.

## Owner-policy v2 integration status

Agent36's `simulation/twinleaf/agent36/snap-trap-owner-prompt-policy-v2.cjs` now imports the Agent30 marker v3, captures the root Store through `request.onRootStoreCreated`, joins the source prompt to the exact root Store and State, revalidates the prompt and selected physical Energy at dispatch, and checks a single MoveCardsEffect receipt for settlement. The native test `tests/2026-11/agent36-snap-trap-owner-prompt-policy-v2.test.cjs` exercises the pinned Store, Agent4 quarantine, Agent12 native Prism Star fixture, and both source-seat orientations. Agent36's own manual workflow `.github/workflows/agent36-snap-trap-owner-policy-v2.yml` already runs both v1/v2 selector suites and v1/v2 owner-policy suites; no duplicate selector step is needed in Agent35's workflow.

I added the v2 owner-policy test to the existing Agent35 broader native KO-order workflow. Run **42408388522** compiled the pinned Store and passed the Agent35 native ChooseCards contract, Agent12 Prism Star destination test, and Agent12 joined source-to-settlement witness. It then failed in the new Agent36 owner-policy v2 test. The failure is not evidence of successful policy integration. The targeted failed-job log identifies three fixable issues:
- `loadDependencies()` imports `game/store/effects/move-cards-effect`, which is absent from the pinned build output. Agent12's working fixture recognizes the receipt by `effect?.constructor?.name === 'MoveCardsEffect'` and verifies the exact source, destination, card, sourceCard and sourceEffect identities; use that pattern or locate the correct export before importing.
- Two tests pass shorthand `{SimpleTacticsAi}` although only `FakeSimpleTacticsAi` and `NativeSimpleTacticsAi` are defined.
- The fake policy proof omits `attackerPrinting`, which the production verifier requires to match the live attacker's fullName. Agent41 independently identified this omission as the shared cause of repeated fake-fixture failures.

Agent36 has been sent the targeted failure details. The existing Agent12 joined witness is independently green in the same failed overall workflow. The manual Agent36 workflow should be rerun after fixes; it includes the real pinned StateUtils selector v2 tests, Temple of Sinnoh suppression cases, and the owner-policy v2 suite.

## Evidence boundary

This is a source-text and algorithmic counterexample, not a Twinleaf runtime result. The reviewed selector's tests use synthetic attack records; no new native run, complete game, deck comparison, matchup estimate, or competitive qualification was performed. The Snap Trap source/zone and ordinary Energy settlement receipts remain separate evidence layers. No candidate deck or frozen registration is changed.
