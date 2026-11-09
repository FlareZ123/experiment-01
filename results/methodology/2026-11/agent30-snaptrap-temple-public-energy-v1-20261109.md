# Agent 30: owner-public Temple of Sinnoh correction for Snap Trap Energy scoring

**Date:** 9 November 2026. **Scope:** one default-off paper-resource-model correction in the developmental Galarian Stunfisk Snap Trap owner policy. This supplies no competitively qualified game and changes no decklist.

## The concrete defect and correction

`simulation/twinleaf/agent36/snap-trap-energy-choice-v2.cjs` computes attack-cost availability from public attached cards' `provides`. Its `specialEnergyBlocked` option suppresses the Beast Energy-specific dynamic ANY and +30 handling but does not change other Special Energy's printed provision. Under the actual public **Temple of Sinnoh ASR** Stadium, the printed effect is: all attached Special Energy provide one Colorless Energy and have no other effect. The existing pinned actual-Store Temple-versus-Double Dragon Energy fixture is `simulation/twinleaf/2026-11/agent22-temple-paid-native-fixture.cjs`; its test requires DDE's native provision to change from two units to one after a paid Stadium play.

Added `simulation/twinleaf/agent30/snap-trap-public-temple-energy-options-v1.cjs`: `getSnapTrapPublicTempleEnergyOptions(state,prompt,attackerActive,types)` reads only the live public `players[].stadium.cards`, the exact prompt owner and the physical attacking Active. With precisely one known Temple of Sinnoh ASR, it supplies an EnergyMap replacing **each Special Energy** with exactly one Colorless unit, preserving all Basic Energy and original physical card references. It passes `specialEnergyBlocked:true` to suppress the Beast-specific dynamic effect. With no verified Temple, an unrecognized Stadium, or a physically contradictory multi-Stadium board it abstains by returning `{specialEnergyBlocked:null}`. It does not use concealed hand/deck/Prize zones or invoke `Store.reduceEffect`.

The existing `withOwnerSnapTrapPromptResolutionV2` now optionally accepts `deps.getEnergyOptions`, evaluated once **after live owner/source/prompt/physical-card verification** immediately before `chooseEnergy`. The previous `deps.energyOptions` default remains unchanged when this callback is not installed. Callers must explicitly opt in; no frozen registration or common bilateral release has silently changed.

## Exact counterexample represented in test fixtures

A synthetic public Active has two attacks: **Two Colorless** (cost [C,C], 200 damage) and **One Psychic** (cost [P], 100 damage). It holds one printed **Double Colorless Energy** (two C normally) and one Basic Psychic Energy. Both attacks are payable before any removal because a Psychic Energy can pay Colorless costs.

| Active public state / candidate removal | Best payable attack remaining |
| --- | ---: |
| No Temple; remove DCE | One Psychic, 100 |
| No Temple; remove Psychic | Two Colorless, 200 |
| Temple; remove DCE | One Psychic, 100 |
| Temple; remove Psychic | None, 0 |

The old static model picks the DCE. With the genuine public Temple provision of one Colorless from DCE, the corrected score picks the Basic Psychic. It is an attack-payability counterexample rather than a claim that a printed Pokémon has these specific two attacks, or that a one-turn choice is strategically optimal. The full card list and native tests support Temple's printed semantics; this fixture isolates the selector.

Tests:
- `tests/2026-11/agent30-snap-trap-energy-choice-v2.test.cjs`: synthetic Temple decision, both source seats, absence/unknown/multiple-Stadium abstention, untouched physical Energy identities, hidden-zone access tripwires.
- `tests/2026-11/agent36-snap-trap-owner-prompt-policy-v2.test.cjs`: callback count and identity at the **actual live owner decode boundary**, plus both physical seat orientations and one same-card Store settlement.
- Existing manually dispatched workflow `.github/workflows/agent36-snap-trap-owner-policy-v2.yml` runs the pure tests, compiled pinned-engine integration tests, and the standing owner policy/marker fixtures. No new workflow or on-push trigger was added.

## Release boundary and remaining work

The first verification dispatch was [GitHub Actions run 42590504678](https://github.com/FlareZ123/experiment-01/actions/runs/42590504678), at head `4ba058a40d305bf81000e36bb4220ba56cb7535b`, and failed an initial synthetic expectation: a Psychic Energy can pay Colorless, so the Temple pre-removal 200-damage attack remains payable. The corrected second [run 42590933796](https://github.com/FlareZ123/experiment-01/actions/runs/42590933796) passed 37/38 compiled owner-policy tests, including the new Temple callback in **both physical owner seats**. Its one inherited headless failure was a turn-zero `WANT_TO_DRAW_CARDS` setup prompt that reached the quarantine before Snap Trap. This was outside the Temple selector.

**Completed same-native-path resolution:** Reused Agent8's existing typed `SelectPrompt` owner adapter behind a new `simulation/twinleaf/agent30/owner-mulligan-bonus-select-v1.cjs` entry that recognizes **only** `WANT_TO_DRAW_CARDS` in native setup with exactly the complete, ordered `Draw N card(s)` option family. It delegates all other prompts to the quarantine and chooses index 0, the full optional mulligan allowance. Inserted the reversible wrapper in the actual headless Snap Trap test, with both-seat positive and negative tests; preserved existing root policies and fixture decks.

The [third native workflow run 42592362851](https://github.com/FlareZ123/experiment-01/actions/runs/42592362851) on research commit `e93c68a17b09b492644cd80dada882716a3fdf73` **succeeded**. Pinned server compile and tests all green. The first test step: **40 tests passed, zero failed**, including 2 new owner-mulligan tests and both Temple tests. The second step: **22 tests passed, zero failed**. In the real native `headless.runMatch` fixture, source Galarian Stunfisk SSH faced attacking Marshadow UNB on two synthetic full-60 game decks. Both source-seat orientations returned without native raw-state fallback, and actual source-marked Snap Trap `ChooseCardsPrompt` settled **8 times per source seat (16 total)**. Every selection recorded physical Energy removal and exact root Store/source prompt identity; `physicalSettlements: [8,8]`, `rawStateFallbackCalls: [0,0]`. This is real Store source-to-payment gameplay on synthetic decks, not an original-field match, strategy competence proof or paper win sample.

This helper only models one exact printed Stadium. Other Special Energy suppressors, dynamic Energy providers, Pokémon effects and damage modifiers require separate independently demonstrated public derivation; the `unknown` case remains a developmental baseline, not paper-certified scoring. The conditional native selection under this helper remains unqualified. The single fixed 60 is still unselected, the authenticated original field remains 29/32 and paper-competitive games remain zero.
