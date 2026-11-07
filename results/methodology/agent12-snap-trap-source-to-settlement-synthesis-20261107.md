# Snap Trap: source identity, public-zone provenance, and native settlement evidence

**Agent 12 | 7 November 2026 | evidence synthesis**

## Executive status

The research now has three separate, successful evidence layers for Galarian Stunfisk SSH's Snap Trap:

1. A **phase-A source/zone diagnostic** joins the exact native reducer prompt to its live Store prompt ID and the opponent Active Pokémon's public attached-Energy sublist. The prompt remains quarantined and is not resolved in that diagnostic.
2. A separate **native ordinary-Energy response fixture** creates a real Snap Trap prompt after a real attack, uses a test-local public-zone-only resolver, and verifies that the actual callback moves the same physical Psychic Energy reference from the attacking Pokémon's Active list into discard.
3. A separate **native Prism Star destination fixture** verifies that the actual callback requests discard but the pinned reducer routes the same physical Beast Energy ◇ reference to the Lost Zone, with exact prompt-result identity and same-prompt-ID settlement assertions.

All three run under pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. A fourth, separately versioned test now joins the source marker, public-zone observer, response resolver and Prism Star settlement in one fixture; it is committed and added to the manual workflow, but has not yet been run. None of these is a competitive game.

## Evidence layers

| Layer | Source and method | Result | Boundary |
| --- | --- | --- | --- |
| Printed card text | `resources/cards/en/swsh1.json`, `swsh1-132`; `resources/cards/en/sm10.json`, `sm10-81` | Galarian Stunfisk has Snap Trap; Marshadow has Red Knuckles (10 damage, one Colorless Energy) | English Expanded card-pool identity; not Japanese physical-print admission |
| Source-to-prompt and public zone | Agent12 v7 phase-A runner and Agent30 marker v2; [run 42402401871](https://github.com/FlareZ123/experiment-01/actions/runs/42402401871) | Success; exact prompt ID 0→173, same-object source origin, one public-zone match | Eight attempts: six native terminals, one root cap, one engine error; prompt quarantined; no selection or discard |
| Ordinary-Energy native settlement | Agent35 `simulation/twinleaf/agent35/snap-trap-choice-response-contract-native.cjs`; [run 42403132882](https://github.com/FlareZ123/experiment-01/actions/runs/42403132882) | Success; real attack-animation WaitPrompt advanced, genuine ChooseCardsPrompt created, validated physical Psychic Energy selected, and same object moved to attacker discard | Test-local resolver and isolated fixture; no production-policy or complete-game claim |
| Prism Star native destination | Agent12 `simulation/twinleaf/agent12/snap-trap-prism-star-destination-native-v1.cjs`; [artifact-producing run 42404800060](https://github.com/FlareZ123/experiment-01/actions/runs/42404800060) | Success; same physical Beast Energy ◇ is selected, recorded in prompt.result, removed from Active arrays and routed to Lost Zone, absent from discard | Isolated fixture; one unrelated pending prompt remains after the callback; not a completed attack or game |
| Joined source-to-settlement witness | Agent12 `simulation/twinleaf/agent12/snap-trap-source-to-settlement-native-v1.cjs` and `tests/2026-11/agent12-snap-trap-source-to-settlement-native.test.cjs` | Implemented and added to the existing manual workflow | Pending first CI validation; do not cite as a pass yet |

## Phase-A source/zone identity join

The v7 source/zone diagnostic observed Galarian Stunfisk SSH using Snap Trap against Marshadow UNB on turn 54 after Red Knuckles. The live prompt was a mandatory, non-secret, one-card `ChooseCardsPrompt` filtered to Energy. Its `cards` object was the attacking Active PokemonCardList, and `cards.energies` was the exact attached-Energy sublist.

The Store assigned prompt ID `173` to the source invocation's unassigned prompt sentinel `0`. The marker and observer matched the same prompt object, with one public-zone match and one independent quarantine match. Eight Psychic Energy cards were offered from the opponent Active Pokémon's attached-Energy zone.

The phase-A observer did not resolve the prompt. Agent4 quarantine remained fail-closed. This separation is intentional: source attribution and public-zone provenance were established before testing a response.

Detailed source: [Agent12 v7 source/zone result](agent12-v7-snap-trap-source-zone-join-success-20261107.md). The namespace-only rerun and registration are recorded there; the original frozen registration remains unchanged.

## Native ordinary-Energy response and settlement

Agent35's separate fixture constructs a native Store state with Galarian Stunfisk SSH Active against Marshadow UNB. The real Red Knuckles attack first yields an attack-animation `WaitPrompt`. The fixture resolves that exact WaitPrompt with `ResolvePromptAction(waitPrompt.id, null)`; only then does the attack generator proceed to damage and the genuine Snap Trap `ChooseCardsPrompt`.

The test-local resolver:
- Reads the parent `prompt.cards.cards` list and confirms that the selected physical Card object also belongs to `prompt.cards.energies.cards`.
- Applies the Energy filter and blocked-index rule.
- Selects one deterministic eligible physical Energy and calls `prompt.validate([selected])`.
- Returns `ResolvePromptAction(prompt.id, [selected])` through `SimpleTacticsAi.resolvePrompt`.
- Blocks concealed card-identity reads from hand, deck and Prize zones while permitting list-length metadata.
- Captures the actual `MoveCardsEffect` and verifies the attacking Active PokemonCardList as source, the attacker's discard as destination, the exact selected Energy reference, Galarian Stunfisk as sourceCard, and Snap Trap as sourceEffect.
- Verifies the same Energy object leaves both Active-list arrays and appears in discard, while the unselected Energy and attacking Pokémon remain.

The integrated manual workflow **42403132882** completed successfully on head `6159f360f95c6c4a416d1e0553136120032b153f`. It compiled the pinned Store, passed the Agent35 Snap Trap response-contract step, and passed all subsequent Agent37 native regressions. This ordinary-Energy test is preserved as a separate positive case.

## Native Prism Star destination exception

Agent12's separate fixture is in `simulation/twinleaf/agent12/snap-trap-prism-star-destination-native-v1.cjs`, with assertions in `tests/2026-11/agent12-snap-trap-prism-star-destination-native.test.cjs`. It keeps Beast Energy ◇ attached alongside an ordinary Psychic Energy, advances the real attack-animation WaitPrompt, obtains the genuine Snap Trap ChooseCardsPrompt, and resolves it through the test-local public-zone resolver.

The test verifies:
- The same physical Beast Energy object is present in the prompt result.
- The same Snap Trap prompt ID is no longer pending after response.
- The real `MoveCardsEffect` still records the attacker's discard as its requested destination, with the attacking Active list as source and Galarian Stunfisk/Snap Trap as source metadata.
- The selected object leaves both Active-list arrays, appears in the attacker's Lost Zone, and is absent from discard.
- The unselected Psychic Energy and Marshadow remain attached/Active.
- Hidden card identities from hand, deck and Prize zones are not read by the test-local resolver.

The first global pending-queue assertion was deliberately narrowed after the fixture showed one other pending prompt after the Snap Trap callback. The accepted assertion is scoped to the same Snap Trap prompt ID. The result records the type/message summaries of other pending prompts. This proves Snap Trap prompt settlement, not that the whole attack generator or all animation prompts have completed.

The full manual workflow **42404800060** completed successfully on head `a3c90e7872bcaf168f1e5faa8cf4b20f2892bc4a`, including the Prism Star test and all subsequent Agent37 regressions. Artifact `13587400278` (`agent12-snap-trap-prism-star-destination-v1`) was uploaded successfully, size 854 bytes, SHA-256 `e448ea097c6de77834f0bdb1e8e53ee0785547fd9dc4b6171ffa2c48be67504e`.

The repository card pool identifies Beast Energy ◇ as `sm6-117`, Special Energy / Prism Star / Expanded legal, in `resources/cards/en/sm6.json`. Super Boost Energy ◇ (`sm5-136`) is a second Expanded-legal Prism Star candidate in `resources/cards/en/sm5.json`. The successful native fixture uses the Beast Energy candidate. The ordinary Psychic Energy case remains separate so the discard positive and Lost Zone exception are not conflated.

## Why the attack-animation WaitPrompt matters

Pinned Twinleaf's `UseAttackEffect` yields an `Attack animation` WaitPrompt before applying `BeforeDoingDamageEffect` and `DealDamageEffect`. The Snap Trap prompt is downstream of positive damage and its `AfterDamageEffect`. A harness that looks for ChooseCardsPrompt immediately after `AttackAction` is inspecting the wrong point in the native effect sequence.

Resolve the exact pending WaitPrompt with `null`, not `undefined`: the Store uses `undefined` as the unresolved sentinel. Preserve the returned State before the next dispatch. Agent39 and Agent36 independently reviewed this sequence; see [the reusable broadcast](../../communications/broadcast/2026-11/20261107T185154202Z_agent12_twinleaf-attack-waitprompt-sequencing.md).

## Joined source-to-settlement witness in progress

The new Agent12 runner nests the Agent30 source marker around the Agent30 public-prompt-zone observer, passing the marker's WeakMap lookup into the observer as `getSourceOriginForPrompt`. The inner fixture is the already-passing Prism Star native Store scenario. Its assertions require:
- exactly one printed Snap Trap source invocation and one marker proof;
- the observer to receive the exact same proof object for the exact same prompt object;
- Store-assigned prompt ID and the observer's live Store state;
- the attacking Active PokemonCardList as the public prompt parent and its Energy sublist as the selectable subset;
- Red Knuckles as the triggering attack;
- the same prompt result, MoveCardsEffect provenance and Lost Zone settlement already verified in the separate Prism Star test.

Files: `simulation/twinleaf/agent12/snap-trap-source-to-settlement-native-v1.cjs` and `tests/2026-11/agent12-snap-trap-source-to-settlement-native.test.cjs`. The test and artifact upload are added to the existing manual Agent35 workflow. This is a new joined witness, not a modification to the frozen phase-A registration or Agent4 quarantine. It remains **unvalidated until a run passes**.

## Remaining gaps and limits

- The joined source-marker/observer/resolver/settlement witness must pass its first CI run.
- The unrelated pending prompt recorded after the Prism Star callback should be identified and understood; do not describe the whole attack sequence as complete until it is resolved or justified.
- The fixtures use a test-local resolver, not a validated competitive playing policy.
- Both fixtures are isolated native interactions, not complete paper games.
- They do not prove Japanese physical-print legality for the Aichi field.
- They do not produce a matchup win, complete-game sample, treatment attribution, or win-rate estimate.
- They provide no evidence that any fixed deck approaches the 99.5% objective.

The benchmark remains 29/32 authenticated original Aichi Top 32 60-card lists, no selected final deck, and zero competitively qualified games.

## Next gate

Run and validate the joined source-to-settlement witness, inspect its JSON artifact, and resolve the unrelated pending prompt's meaning. Keep the phase-A registration and Agent4 quarantine unchanged. Only after the joined native witness is stable should the work be promoted into broader board/seat tests and then complete paper-valid games against all 32 authenticated source lists.
