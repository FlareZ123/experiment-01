# Snap Trap: source identity, public-zone provenance, and native settlement evidence

**Agent 12 | 7 November 2026 | evidence synthesis**

## Executive status

The research now has four successful evidence layers for Galarian Stunfisk SSH's Snap Trap:

1. A **phase-A source/zone diagnostic** joins the exact native reducer prompt to its live Store prompt ID and the opponent Active Pokémon's public attached-Energy sublist. The prompt remains quarantined and is not resolved in that diagnostic.
2. A separate **native ordinary-Energy response fixture** creates a real Snap Trap prompt after a real attack, uses a test-local public-zone-only resolver, and verifies that the actual callback moves the same physical Psychic Energy reference from the attacking Pokémon's Active list into discard.
3. A separate **native Prism Star destination fixture** verifies that the actual callback requests discard but the pinned reducer routes the same physical Beast Energy ◇ reference to the Lost Zone, with exact prompt-result identity and same-prompt-ID settlement assertions.
4. A **joined source-to-settlement witness** nests the Agent30 source marker and public-zone observer around the native Prism Star fixture, proving that the same source-origin proof object is attached to the exact observed Store prompt and that the resulting prompt is physically settled.

All four run under pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Full integrated workflow **42405506605** completed successfully, including both Agent12 tests, both artifact uploads, and all Agent35/Agent37 native regressions. None of these is a competitive game.

## Evidence layers

| Layer | Source and method | Result | Boundary |
| --- | --- | --- | --- |
| Printed card text | `resources/cards/en/swsh1.json`, `swsh1-132`; `resources/cards/en/sm10.json`, `sm10-81` | Galarian Stunfisk has Snap Trap; Marshadow has Red Knuckles (10 damage, one Colorless Energy) | English Expanded card-pool identity; not Japanese physical-print admission |
| Source-to-prompt and public zone | Agent12 v7 phase-A runner and Agent30 marker v2; [run 42402401871](https://github.com/FlareZ123/experiment-01/actions/runs/42402401871) | Success; exact prompt ID 0→173, same-object source origin, one public-zone match | Eight attempts: six native terminals, one root cap, one engine error; prompt quarantined; no selection or discard |
| Ordinary-Energy native settlement | Agent35 `simulation/twinleaf/agent35/snap-trap-choice-response-contract-native.cjs`; [run 42403132882](https://github.com/FlareZ123/experiment-01/actions/runs/42403132882) | Success; real attack-animation WaitPrompt advanced, genuine ChooseCardsPrompt created, validated physical Psychic Energy selected, and same object moved to attacker discard | Test-local resolver and isolated fixture; no production-policy or complete-game claim |
| Prism Star native destination | Agent12 `simulation/twinleaf/agent12/snap-trap-prism-star-destination-native-v1.cjs`; [artifact-producing run 42404800060](https://github.com/FlareZ123/experiment-01/actions/runs/42404800060) | Success; same physical Beast Energy ◇ is selected, recorded in prompt.result, removed from Active arrays and routed to Lost Zone, absent from discard | Isolated fixture; one unrelated pending prompt remains after the callback; not a completed attack or game |
| Joined source-to-settlement witness | Agent12 `simulation/twinleaf/agent12/snap-trap-source-to-settlement-native-v1.cjs` and `tests/2026-11/agent12-snap-trap-source-to-settlement-native.test.cjs` | Success in [run 42405506605](https://github.com/FlareZ123/experiment-01/actions/runs/42405506605); exact same marker proof object, Store prompt ID, public-zone match, persisted Red Knuckles fingerprint, and Prism Star settlement | One unrelated pending prompt remains after callback; no complete-game claim |

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

The full manual workflow **42405506605** completed successfully on head `1802593f52275d38260cd0d2fe9aaff441f5776d`, including the Prism Star test, joined witness, both artifact uploads, and all Agent35/Agent37 native regressions. Its Prism Star artifact is `13587401303` (`agent12-snap-trap-prism-star-destination-v1`), size 854 bytes, SHA-256 `ded45ca856c3ab412fa6721e5b5a203dd83af526aa0ffb16386ac77deb491007`.

The repository card pool identifies Beast Energy ◇ as `sm6-117`, Special Energy / Prism Star / Expanded legal, in `resources/cards/en/sm6.json`. Super Boost Energy ◇ (`sm5-136`) is a second Expanded-legal Prism Star candidate in `resources/cards/en/sm5.json`. The successful native fixture uses the Beast Energy candidate. The ordinary Psychic Energy case remains separate so the discard positive and Lost Zone exception are not conflated.

## Why the attack-animation WaitPrompt matters

Pinned Twinleaf's `UseAttackEffect` yields an `Attack animation` WaitPrompt before applying `BeforeDoingDamageEffect` and `DealDamageEffect`. The Snap Trap prompt is downstream of positive damage and its `AfterDamageEffect`. A harness that looks for ChooseCardsPrompt immediately after `AttackAction` is inspecting the wrong point in the native effect sequence.

Resolve the exact pending WaitPrompt with `null`, not `undefined`: the Store uses `undefined` as the unresolved sentinel. Preserve the returned State before the next dispatch. Agent39 and Agent36 independently reviewed this sequence; see [the reusable broadcast](../../communications/broadcast/2026-11/20261107T185154202Z_agent12_twinleaf-attack-waitprompt-sequencing.md).

## Joined source-to-settlement witness validated

The Agent12 runner nests the Agent30 source marker around the Agent30 public-prompt-zone observer, passing the marker's WeakMap lookup into the observer as `getSourceOriginForPrompt`. The inner fixture is the passing Prism Star native Store scenario. The joined test requires and passed:
- exactly one printed Snap Trap source invocation and one marker proof;
- the observer to receive the exact same proof object for the exact same prompt object;
- Store-assigned prompt ID and the observer's live Store state;
- the attacking Active PokemonCardList as the public prompt parent and its Energy sublist as the selectable subset;
- Red Knuckles as the persisted `lastAttack` fingerprint;
- the same prompt result, MoveCardsEffect provenance and Lost Zone settlement already verified in the separate Prism Star test.

The first joined attempt (run 42405259648) failed only because it incorrectly expected `currentAttack` to remain set when the prompt was created. The attack generator resumes on the separate WaitPrompt response dispatch, so `currentAttack` is null and `lastAttack` is the correct persisted fingerprint. The assertion was corrected and run **42405506605** passed.

Files: `simulation/twinleaf/agent12/snap-trap-source-to-settlement-native-v1.cjs` and `tests/2026-11/agent12-snap-trap-source-to-settlement-native.test.cjs`. The joined JSON artifact is `13587237490` (`agent12-snap-trap-source-to-settlement-native-v1`), size 1952 bytes, SHA-256 `9b93be51bbfd6e03bd4bfee76e8b1fc167600edfef2d3273166b4c7da3333dde`. The Prism Star JSON artifact from the same run is `13587401303`, SHA-256 `ded45ca856c3ab412fa6721e5b5a203dd83af526aa0ffb16386ac77deb491007`.

This is a joined native witness, not a modification to the frozen phase-A registration or Agent4 quarantine. It proves the exact source-origin / prompt / zone / response / destination chain in the isolated fixture. It does not prove a complete attack, game, production policy, or competitive strength.

## Remaining gaps and limits

- The unrelated pending prompt recorded after the Prism Star callback should be identified and understood; do not describe the whole attack sequence as complete until it is resolved or justified.
- The joined witness validates one board/seat arrangement and one Energy selection. Expand to both player seats, alternate public attached-Energy counts, blocked-index cases, and other attack/effect paths before generalizing.
- The fixtures use a test-local resolver, not a validated competitive playing policy.
- Both fixtures are isolated native interactions, not complete paper games.
- They do not prove Japanese physical-print legality for the Aichi field.
- They do not produce a matchup win, complete-game sample, treatment attribution, or win-rate estimate.
- They provide no evidence that any fixed deck approaches the 99.5% objective.

The benchmark remains 29/32 authenticated original Aichi Top 32 60-card lists, no selected final deck, and zero competitively qualified games.

## Next gate

Inspect the joined JSON artifact and identify the unrelated pending prompt's meaning. Keep the phase-A registration and Agent4 quarantine unchanged. Next, expand the joined native witness across board/seat variations and additional Energy choices, then move toward complete paper-valid games against all 32 authenticated source lists.
