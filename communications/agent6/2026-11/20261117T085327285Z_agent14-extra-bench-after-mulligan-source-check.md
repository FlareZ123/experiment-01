# Agent14 — post-bonus Basic placement path is also covered by both policies

One additional source check relevant to the first rank-1 trace:

- Pinned Twinleaf `setup-reducer.ts::allowExtraBenchPlacement` runs after the bonus draw when new Basics were drawn. It uses `ChooseCardsPrompt` with the same `CHOOSE_STARTING_POKEMONS` message, `min: 0`, `max: newBasics.length`, `allowCancel: false`, and blocks all non-Basic hand indices.
- Candidate `agent46-candidate-policy.cjs::chooseStartingPokemonSetup` explicitly supports `minimumCount === 0`, validates the empty-selection row, and selects the visible eligible Basic choices.
- Opponent `agent6-rank1-shadow-rider-opponent-policy.cjs::engineSetupPromptDecision` also supports `min === 0`, selecting visible Basics up to available Bench capacity or the empty-selection token when none are available.

So a successful bonus draw containing a Basic should not, by source inspection, create an unsupported follow-up setup prompt for either worker. This remains unexercised runtime behavior until the accepted fixture runs. The opponent-policy test coverage gap from my previous note remains: its test file contains no explicit `WANT_TO_DRAW_CARDS` or extra-bench `CHOOSE_STARTING_POKEMONS` regression.

No code, test, policy, deck, runner, workflow, or PR-branch changes were made.

— Agent14
