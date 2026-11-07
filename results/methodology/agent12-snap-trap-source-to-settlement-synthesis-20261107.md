# Snap Trap: source identity, public-zone provenance, and native settlement evidence

**Agent 12 | 7 November 2026 | evidence synthesis**

## Executive status

The research now has two separate, successful evidence layers for Galarian Stunfisk SSH's Snap Trap:

1. A **phase-A source/zone diagnostic** joins the exact native reducer prompt to its live Store prompt ID and the opponent Active Pokémon's public attached-Energy sublist. The prompt remains quarantined and is not resolved in that diagnostic.
2. A separate **native Store response-contract fixture** creates a real Snap Trap prompt after a real attack, uses a test-local public-zone-only resolver, and verifies that the actual Snap Trap callback moves the same physical ordinary Psychic Energy reference from the attacking Pokémon's Active list into its discard pile.

Both layers pass under pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. They are not yet one combined end-to-end run. They establish a narrow card-interaction witness, not a competitive game.

## Evidence layers

| Layer | Source and method | Result | Boundary |
| --- | --- | --- | --- |
| Printed card text | `resources/cards/en/swsh1.json`, `swsh1-132`; `resources/cards/en/sm10.json`, `sm10-81` | Galarian Stunfisk has Snap Trap; Marshadow has Red Knuckles (10 damage, one Colorless Energy) | English Expanded card-pool identity; not Japanese physical-print admission |
| Source-to-prompt and public zone | Agent12 v7 phase-A runner and Agent30 marker v2; [run 42402401871](https://github.com/FlareZ123/experiment-01/actions/runs/42402401871) | Success; exact prompt ID 0→173, same-object source origin, one public Active attached-Energy zone match | Eight attempts: six native terminals, one root cap, one engine error; prompt quarantined; no selection or discard |
| Response contract | [Agent30 prompt-resolution contract](agent30-snap-trap-native-prompt-resolution-contract-20261107.md) | Documents full-list index semantics, attached-Energy membership, prompt validation, ResolvePromptAction, MoveCardsEffect and Prism Star destination exception | Contract documentation; not itself a completed test |
| Native ordinary-Energy settlement | Agent35 `simulation/twinleaf/agent35/snap-trap-choice-response-contract-native.cjs`; [integrated run 42403132882](https://github.com/FlareZ123/experiment-01/actions/runs/42403132882) | Success; real attack-animation WaitPrompt advanced, genuine ChooseCardsPrompt created, validated physical Psychic Energy selected, and same object moved to attacker discard by the Snap Trap callback | Test-local resolver and isolated fixture; no production-policy or complete-game claim |

### Phase-A source/zone identity join

The v7 source/zone diagnostic observed Galarian Stunfisk SSH using Snap Trap against Marshadow UNB on turn 54 after Red Knuckles. The live prompt was a mandatory, non-secret, one-card `ChooseCardsPrompt` filtered to Energy. Its `cards` object was the attacking Active PokemonCardList, and `cards.energies` was the exact attached-Energy sublist.

The Store assigned prompt ID `173` to the source invocation's unassigned prompt sentinel `0`. The marker and observer matched the same prompt object, with one public-zone match and one independent quarantine match. Eight Psychic Energy cards were offered from the opponent Active Pokémon's attached-Energy zone.

The phase-A observer did not resolve the prompt. Agent4 quarantine remained fail-closed. This separation is intentional: source attribution and public-zone provenance were established before testing a response.

Detailed source: [Agent12 v7 source/zone report](agent12-v7-snap-trap-source-zone-join-success-20261107.md). The namespace-only rerun and registration are recorded there; the original frozen registration remains unchanged.

### Native ordinary-Energy response and settlement

Agent35's separate fixture constructs a native Store state with Galarian Stunfisk SSH Active against Marshadow UNB. The real Red Knuckles attack first yields an attack-animation `WaitPrompt`. The fixture resolves that exact WaitPrompt with `ResolvePromptAction(waitPrompt.id, null)`; only then does the attack generator proceed to damage and the genuine Snap Trap `ChooseCardsPrompt`.

The test-local resolver:
- Reads the parent `prompt.cards.cards` list and confirms that the selected physical Card object also belongs to `prompt.cards.energies.cards`.
- Applies the Energy filter and blocked-index rule.
- Selects one deterministic eligible physical Energy and calls `prompt.validate([selected])`.
- Returns `ResolvePromptAction(prompt.id, [selected])` through `SimpleTacticsAi.resolvePrompt`.
- Blocks concealed card-identity reads from hand, deck and Prize zones while permitting list-length metadata.
- Captures the actual `MoveCardsEffect` and verifies the attacking Active PokemonCardList as source, the attacker's discard as destination, the exact selected Energy reference, Galarian Stunfisk as sourceCard, and Snap Trap as sourceEffect.
- Verifies the same Energy object leaves both Active-list arrays and appears in discard, while the unselected Energy and attacking Pokémon remain.

The integrated manual workflow **42403132882** completed successfully on head `6159f360f95c6c4a416d1e0553136120032b153f`. It compiled the pinned Store, passed the Agent35 Snap Trap response-contract step, and passed all subsequent Agent37 native regressions. The run did not upload a separate artifact; the reproducible evidence is the committed source plus the Actions run and its job logs.

### Why the attack-animation WaitPrompt matters

Pinned Twinleaf's `UseAttackEffect` yields an `Attack animation` WaitPrompt before applying `BeforeDoingDamageEffect` and `DealDamageEffect`. The Snap Trap prompt is downstream of positive damage and its `AfterDamageEffect`. A harness that looks for ChooseCardsPrompt immediately after `AttackAction` is inspecting the wrong point in the native effect sequence.

Resolve the exact pending WaitPrompt with `null`, not `undefined`: the Store uses `undefined` as the unresolved sentinel. Preserve the returned State before the next dispatch. Agent39 and Agent36 independently reviewed this sequence; see [the reusable broadcast](../../communications/broadcast/2026-11/20261107T185154202Z_agent12_twinleaf-attack-waitprompt-sequencing.md).

## Remaining acceptance gaps

The current native ordinary-Energy fixture is a useful first settlement witness, but the source file at the time of run 42403132882 still lacks these explicit assertions or branches:

1. Assert that the resolved ChooseCardsPrompt's `result` contains the exact selected physical Energy reference.
2. Assert the pending prompt queue is settled (for example, `store.hasPrompts()` is false where appropriate). Resolved prompt history remains in `state.prompts`; do not require the historical prompt object to disappear from that array.
3. Add a separate Prism Star Energy branch. The repository card pool provides:
   - `Beast Energy ◇`, `sm6-117`, Special Energy / Prism Star, Expanded legal, in `resources/cards/en/sm6.json`.
   - `Super Boost Energy ◇`, `sm5-136`, Special Energy / Prism Star, Expanded legal, in `resources/cards/en/sm5.json`.
   
   Both card texts route a Prism Star card that would go to discard into the Lost Zone. Beast Energy ◇ still provides Colorless Energy when attached to a non-Ultra Beast, making it a clean candidate for a Marshadow fixture. Assert that the exact selected object leaves the Active list and Energy sublist and enters Lost Zone, with no copy in discard.
4. Only after those tests pass, create a separate versioned integrated witness joining the source marker, observer, public-zone proof, response resolver and physical settlement. Keep the current phase-A registration and Agent4 quarantine unchanged.

## What this does not establish

- It is not a full paper game.
- It is not an end-to-end run combining v7 source-marker identity and the Agent35 resolver in one fixture.
- The test-local resolver is not a validated competitive playing policy.
- It does not prove Japanese physical-print legality for the Aichi field.
- It does not produce a matchup win, a complete-game sample, treatment attribution, or a win-rate estimate.
- It provides no evidence that any fixed deck approaches the 99.5% objective.

The benchmark remains 29/32 authenticated original Aichi Top 32 60-card lists, no selected final deck, and zero competitively qualified games.

## Next gate

Complete the prompt-result/pending-queue assertions and the Prism Star Lost Zone branch in a separately versioned native test. Then independently join source origin, public zone, response validation and physical movement without enabling the resolver in the frozen phase-A diagnostic. Only after that should the work be promoted into complete paper-valid games with strong opponent policies and all 32 authenticated source lists.
