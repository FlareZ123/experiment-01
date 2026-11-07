# Agent49: rank31 direct Fog Crystal native Store witness

**7 November 2026 | Agent49 | Manual workflow 42356150722**

## Question

Can the rank31 original-60 owner, using a genuine owner-root observation and a held Fog Crystal, resolve the direct Fog Crystal → Basic Psychic Energy → Unown AOR Hidden Power line in the pinned Twinleaf Store, including the physical Prize and opponent promotion?

## Source inventory and K0 boundary

The authenticated rank31 original 60 expands to exactly 60 cards with:

| Printing | Copies |
| --- | ---: |
| Fog Crystal CRE | 4 |
| Unown AOR | 3 |
| Psychic Energy MEE 13 | 2 |
| Secret Box TWM | 0 |

The test passes that exact owner-only 60-card list to `proposeOwnerDirectFogOneEnergyKo`. It uses a live `actorObservation` from the actual staged Store state. The K0 list supports the line as not disproven by visible owner information; it does not reveal hidden deck or Prize membership.

## Native test and provenance

- Test module: `simulation/twinleaf/agent49-owner-direct-fog-one-energy-native.cjs`.
- Test file: `tests/agent49-owner-direct-fog-one-energy-native.test.cjs`.
- Existing manual workflow extended: `.github/workflows/agent36-bilateral-competence-v9.yml`. No new workflow and no per-commit CI were introduced.
- Successful workflow: [42356150722](https://github.com/FlareZ123/experiment-01/actions/runs/42356150722).
- Research commit tested: `fd6c1b28a3f7afbe764d092db3f67fdfa7afb186).
- Pinned submodule: `vendor/twinleaf` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Node.js: `20.19.0`.
- The workflow's native server compilation, syntax checks, test step, registered v9 source-family replay and evidence-preservation step all completed successfully. The test suite contained 116 tests: 110 passed, 0 failed, 6 skipped.
- Workflow artifact: [13567456610](https://github.com/FlareZ123/experiment-01/actions/runs/42356150722/artifacts/13567456610).

The first run, [42355883147](https://github.com/FlareZ123/experiment-01/actions/runs/42355883147), exposed a test-authoring mismatch: the pure planner returns `source`, `printedDamage`, and `opponentRemainingHp`, not `kind`, `damage`, or `remainingHp`. The native Store was not reached in those two failing cases. The assertions were corrected to the actual planner schema; the subsequent full test step passed.

## Staged native Store sequence

Both physical seats passed the same test.

1. Stage the rank31 owner's Active Unown AOR, one Fog Crystal CRE in hand, and the remaining relevant source copies in the deck: three Fog Crystal CRE, two Unown AOR and two Basic Psychic Energy. This preserves the source-list counts for these relevant printings. The fixture is a physical subset, not a complete source deck.
2. Stage the opponent's Active Trubbish FST with 60 damage on 70 HP, leaving 10 HP, and two physical Bench Pokémon.
3. Build the live owner observation and ask the direct-Fog planner. It proposes Hidden Power for 10 printed damage against 10 remaining HP. The exact rank31 original 60 is supplied as K0.
4. Play Fog Crystal CRE. The native `ChooseCardsPrompt` is bound to the source owner, has source card Fog Crystal CRE, message `CHOOSE_CARD_TO_HAND`, and its `cards` collection is the owner's actual deck. Both Basic Psychic Energy copies are offered; one physical card is selected and passes the native validator.
5. Resolve the search tail. Fog Crystal moves to the owner's discard and the selected Basic Psychic moves to hand. The deck decreases by one.
6. Attach the physical Basic Psychic Energy to the Active Unown. The direct-Fog planner correctly stops proposing the line after the Fog is spent and again after the Energy is attached.
7. Submit Hidden Power. The native Store accepts the attack, knocks out the staged Trubbish, presents a physical Prize prompt, and then presents the opponent's Bench-promotion prompt. Both are resolved with valid physical objects.
8. Final assertions: Trubbish is in the opponent's discard; the source's Prize count changes 6→5; the opponent remains at six Prizes; the opponent promotes a Bench Pokémon; Unown remains Active with the Basic Psychic attached; Fog Crystal is in the source discard; and no pending prompts remain.

Twinleaf's native Basic Energy fullName is `Psychic Energy MEE`; the authenticated paper roster identifies the source printing as `Psychic Energy MEE 13`. The test records both identities explicitly.

## Limitations

This is a **conditional, staged native Store witness**, not a naturally dealt matchup or a competitive game.

- The source's full 60 physical cards are not instantiated. Only the relevant Fog Crystal, Unown and Basic Psychic printings are staged; the source Prize slots are inherited from the fixture.
- The opponent's full deck is not instantiated. Trubbish FST and the two Bench Pokémon form a synthetic board.
- The target's 60 pre-existing damage is a staged precondition. The test does not model how the source places that damage, including the rank31 Dusclops/Dusknoir Cursed Blast package or its self-KO Prize cost.
- The test does not implement an opponent decision policy, play a full game, or qualify a matchup.
- The K0 original-60 check is not a claim that a Basic Psychic Energy must be in the actual hidden deck in every game state. The native fixture explicitly stages two in the deck and verifies the genuine search.

## Research implication

The direct Fog/Unown line is now native-tested independently of Secret Box. Rank31's source list has the required counts and no Secret Box, so this is a separate path from the root93 New Moon Box/Fog treatment. Future matchup work should test whether the staged 10-HP target is realistically reachable and whether the one-Prize conversion compensates for the resources and setup required.

**Benchmark status:** no competitively qualified games; no final fixed 60 selected; no demonstrated 99.5% win rate against the Aichi Open League 2026 Top 32.
