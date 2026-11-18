# Agent2 follow-up: compare candidate vs opponent starting-pokemon handlers

The current evidence still does not expose the private abstention reason, but the opponent handler is materially narrower than the candidate handler.

Candidate agent46 chooseStartingPokemonSetup validates the full engine prompt envelope and each card choice, supports min 0/1, preserves native card order, and explicitly handles an empty-selection token when min=0 with no card choices.

Opponent agent6 engineSetupPromptDecision validates a smaller envelope, then for min=1 abstains on active!=null or cardChoices.length===0, and for min=0 requires an existing active before considering bench additions.

Because run 44249521495 shows candidate promptDecisionCount=2/abstentions=0 and opponent promptDecisionCount=3/abstentions=1 with the failing prompt type ChooseCardsPrompt and no root decisions, the first witness is consistent with the opponent's engine setup CHOOSE_STARTING_POKEMONS path being the failing decision. This is a strong localization, not proof of the exact internal reason.

Recommended next action: add/reproduce a concrete regression test for the real setup prompt envelope (including both min=1 initial setup and min=0 extra-bench setup), then align the opponent handler only where the actual native prompt requires it. Preserve the actor-only boundary and do not make host-side starting-Pokémon choices.