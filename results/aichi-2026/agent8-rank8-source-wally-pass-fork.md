# Rank-8 Absol/Garbodor: actual first-turn Wally instead of Pass

**17 October 2026, Agent 8 invocation 202.** Current fixed source-ranked opponent policy test. The claim is a source-legal omitted action and a changed subsequent engine trajectory under one frozen physical deal. **Zero qualified competitive games and no matchup win-rate inference**.

## Reproduction and immutable source

- [Manual compiled CI 39047644369](https://github.com/FlareZ123/experiment-01/actions/runs/39047644369): **success**, repository head **c667c967a23f480eb313acc88e671adcda6d096e**, pinned Twinleaf **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**, current rank8 opponent code and fixed-core DDE-v4 default policy.
- [Raw source fork artifact 12106591917](https://github.com/FlareZ123/experiment-01/actions/runs/39047644369/artifacts/12106591917), ZIP SHA-256 **d56dc91f6bff0c3263055b666c27166f7fa03825368d4f2b944d6089aa582b5c**. Script [absol-rank8-wally-source-fork.cjs](../../simulation/twinleaf/absol-rank8-wally-source-fork.cjs); [own-information-source predicate tests](../../tests/absol-rank8-wally-source-fork.test.cjs).
- Aichi rank8 **Yusuke Kobayashi's exact published Absol Garbodor 60** as physical engine A against frozen **Temple Shadow Rider v1 60** as physical B. Predeclared **decorrelated-slots-v3** trial **pilot:8:0:temple-v1:B**, seed **4168858073**, plan digest **01ab9959e9b94f8d89fe6dc010072b9959ce3dfa2c4d670f9864ed3d237c9d60**. Player B **actually went first**, so the rank8 opponent's global turn2 was their **first turn going second**. Source printed Wally ROS is allowed on that turn.
- The previous independently archived rank8 pilot at [CI 39041216040](https://github.com/FlareZ123/experiment-01/actions/runs/39041216040) recorded that rank8 had **Crobat V Active with one Darkness Energy**, Benched **Trubbish PAR**, and hand **Wally ROS, two Quick Ball, two Dark Patch** on its turn2 Pass, with no Float Stone directly visible then. This is a concrete own-hand/public-board policy opportunity; a hand lacking Float Stone does not certify an immediate Garbotoxin lock.

## Source-constrained intervention

The fork calls the ordinary bot and replaces **only** the opponent's first global-turn2 proposed **PassTurnAction** when its own actual hand includes Wally ROS and its own real Bench includes Trubbish. It plays the in-hand Wally through a genuine **PlayCardAction** and lets pinned engine prompts and the original bot resolve and continue thereafter. It does not inspect the candidate's hidden hand/deck/prizes to select the override.

- First divergent true Store root dispatch: **step 21, global turn2, rank8 player101**, control **PassTurnAction**, alternate **PlayCardAction** for Wally ROS from hand index 0.
- Identical physical pre-action source-zone digest: **2cea0c9f9f89847b6e920e278c15fa7101cea87013640f0694a905d00b9ad5dc**. Subsequent after-action zone digests diverge as expected.
- On real branch root22 the engine prompts **CHOOSE_CARD_TO_EVOLVE**. Root23 **CHOOSE_POKEMON_TO_EVOLVE** selects the **rank8 player's Benched Trubbish PAR** at Bench index0. ShuffleDeckPrompt and waiting prompt follow. This proves the Wally action is accepted and executes a Pokémon-evolution selection, though a complete independent card-evolution-effect audit remains outstanding.
- The untouched source repeat after the branch has **identical complete game summary and typed root action signature** to the first control. The branch used the same source-dealt initial card and Prize configuration, with ordinary engine randomness/reducer semantics.

## Observed follow-through

| Frozen source arm | Rank8 opponent attacks | Shadow Rider attacks | Engine winner | Turns | Root actions | Remaining Prizes: rank8, Temple |
| --- | --- | --- | --- | ---: | ---: | --- |
| Ordinary source policy: Pass | **None** | Max Geist turns 3, 5, 7, 9, 11 | Temple Shadow Rider | 11 | 97 | 6, 0 |
| Forced Wally on rank8's first turn | **Crobat V Venomous Fang at turn4** | Max Geist turns 3, 5, 7, 9 | Temple Shadow Rider | 9 | 100 | 6, 1 |

The opponent's first attack changes from absent to present after this one Wally decision. A real Stage 1 evolution requires no ordinary turn wait when Wally's printed exception applies. Since Wally **searches and shuffles the deck**, the later random card stream can differ between arms. This test does **not** prove the turn4 Crobat attack was caused specifically by Garbotoxin, by Wally's evolution text, or by a stronger attack policy. A few later draws and decisions now differ. Both engine terminal results still favor the Temple candidate; the earlier terminal under Wally is not an argument that Wally worsens the human matchup.

## Limits and next independent source check

The fork obtains the generic bot's proposed Pass once before substituting Wally. As already seen elsewhere, evaluating a speculative bot action can theoretically affect the live Store through imperfect cloned-state isolation. The verified equal first-root physical zone digest and repeated control are useful checks, yet they do not prove full live Store graph/closure observational equivalence. The opponent's deck-search choice, energy decision policy, Garbotoxin Tool access, legal impact on Underworld Door, post-shuffle RNG, and later opponent attack timing remain to be reviewed with actual prompts and source card text.

The next high-value check is **one step narrower**: read the actual Wally evolution card choice and post-resolution public board, confirm whether Garbodor was Tool-equipped (likely not given the hand), then independently evaluate the opponent's next energy/Supporter options without forcing favorable draws. Afterward reproduce the source decision in both true starting-order strata and other Absol/Garbodor registrations before estimating any competitive probability.

**Qualifications: sourceReplayMechanicsVerified:false, qualifiedForCompetitiveInference:false. Current field coverage: 29 exact published full lists, three missing, zero competitively qualified games.**
