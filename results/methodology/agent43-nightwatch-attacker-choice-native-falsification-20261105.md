# Pinned Night Watch selects opponent-hand cards instead of randomizing

**Agent 43 | 5 November 2026 | paper-fidelity falsification, source and compiled Store.**

## Decision consequence

**The pinned Twinleaf implementation of Trevenant & Dusknoir-GX (SMP SM217) does not implement the printed random hand selection.** It gives the attacking player a ChooseCardsPrompt over the opponent's hand. The default ChooseCardsPromptResolver scores those exact card objects from the answering player's perspective and chooses the highest-ranked cards. A compiled native Store experiment confirms an attacker can select different pairs from the same three-card opponent hand, and the chosen identities move to the opponent's deck.

This is an independent **paper-randomness and owner-information review veto** for the [original rank1-versus-rank3 Skyliner winner reversal](agent2-original-skyliner-free-pivot-native-winner-reversal-20261105.md), which used **six Night Watch attacks**. The observed native attacks, KO/Prize accounting and native winner reversal remain genuine native results. The six-attack trajectory cannot be treated as a paper-qualified competitive game without corrected random-selection and actual opponent-response analysis. No game or win percentage has been qualified.

## Pinned printed and executable sources

- Printed Night Watch costs three Psychic, deals 150 damage and requires **two random opponent-hand cards** to be revealed and shuffled into the owner's deck. The supplied Advanced Player's Rulebook, D-04 / E-36, explicitly distinguishes a random opponent-hand card from cards that a player deliberately chooses.
- Pinned upstream SHA **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**, [trevenant-dusknoir-gx.ts](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-sun-and-moon-promos/trevenant-dusknoir-gx.ts): Night Watch constructs ChooseCardsPrompt(attacker, CHOOSE_CARD_TO_DISCARD, opponent.hand, secret, exact count), then transfers the attacker-selected card objects into the opponent's deck. The attacker is explicitly the prompt owner.
- Pinned [choose-cards-prompt-resolver.ts](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/prompt-resolver/choose-cards-prompt-resolver.ts) reads prompt.cards.cards, calculates stateScore.getCardScore(state, prompt.playerId, card) for each, sorts descending, and returns the first cards after validation. **No random sample is performed** in this path.
- The secret option does not randomize the choice or stop the in-process bot resolver from accessing opponent-hand card objects. This does not independently prove what a remote human client displays.

## Native Store falsification and reproducibility

- [Native two-seat regression](../../tests/agent43-nightwatch-randomness-native.test.cjs), created in commit **94fe948ffff95f6aeea4515ef936ca1facfdc4c4**.
- Existing manually dispatched workflow [agent43-guzma-recipient-native.yml](../../.github/workflows/agent43-guzma-recipient-native.yml) at head **9ae926ee13cd46ba29147035b908679460596c25**, [Actions run 42133034365](https://github.com/FlareZ123/experiment-01/actions/runs/42133034365), compiled the pinned upstream and **passed both dedicated Night Watch tests**.
- The full workflow finished **red on a later unrelated existing Guzma test**, tests/agent43-canonical-guzma-prompt-composition.test.cjs. Its expected options object omits two newly present false fields, forcedGuzmaNominalKo and rank9SpecialFundedGuzma. The complete workflow is not reported as green.
- Each attacker seat (0 and 1) staged Trevenant & Dusknoir-GX Active with three real Psychic Energy, defender Rotom V Active, and the defender's distinct three-card hand **Psychic Energy, Water Energy, Grass Energy**. This is a small **staged native fixture**, without full original-60 conservation.
- On both seats an actual AttackAction(Night Watch) created ChooseCardsPrompt owned by the attacker and pointing to the defender's hand. The prompt accepted both **[Psychic, Water]** and **[Psychic, Grass]** as valid choices. Resolving the first physically left **Grass** in the defender hand; resolving the second left **Water**. The selected cards moved into the defender deck.
- Two native tests passed, encompassing **four Store hand-transfer branches** across two seats. Following that movement, ShowCardsPrompt and ShuffleDeckPrompt were still pending when the witness stopped. This demonstrates the selection and physical zone movement, **not** complete attack/Prize/game settlement.
- With an actual uniformly random two-card subset from a three-card hand, each of the three unordered pairs has probability one third. Native resolution instead allows the attacker to choose a pair by its card identity.

## Evidence boundary and next action

**Evidence class:** pinned source defect and two-seat compiled native chosen-card transfer. No originally dealt game was rerun, no retrospectively changed winner was reported, and **zero competitively qualified games** arise here.

A default-off paper-random diagnostic can select two distinct physical hand indices uniformly, using isolated seeded randomness and no inspection of their card names or scoring. It should be prospectively preregistered against the positive original rank1/rank3 Skyliner source deal, preserving all trajectories, Energy and Prize transitions, and opponent choices. This does not create new independent win samples. Initially scoped repairs must say whether they cover attacks copied by other Pokémon; the benchmark eventually requires all equivalent random-hand effects.

Issue #25's selected bilateral v4 was never altered by this experiment. The opponent's five passive postpivot turns and missing 25-minute adjudication remain separate independent vetoes. **Benchmark unchanged: 29/32 original name/count lists, zero qualified games, no selected final 60, no established 99.5%.**
