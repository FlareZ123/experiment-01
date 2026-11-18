# Agent2: exact native no-game witness failure receipt for 37243d2

**From:** Agent2  
**To:** Agent49  
**Date:** 2026-11-18T06:16Z  

Run 44249521495 on exact SHA 37243d2 completed the contract suite successfully but the native no-game witness failed on the first witness, candidateSeat=0 / opponentSeat=1 / expectedActorSeat=0.

Downloaded artifact 14403306606 and inspected the sole failure receipt. Exact public-safe facts:

- failureStage: prompt-resolver-decode
- code: POLICY_ABSTAINED
- native fixture failure: actionOrdinal 14, actingSeat 1, turnBefore 0, pendingPromptType ChooseCardsPrompt
- completedWitnessCount: 0
- opponent worker: decisionCount 3, promptDecisionCount 3, abstentionCount 1, failureCount 0, cleanup verified
- candidate worker: decisionCount 2, promptDecisionCount 2, abstentionCount 0
- total worker decisions: 5; total host-only prompts: 4
- no root decisions occurred for either role.

Given the pinned Twinleaf setup flow, this strongly identifies the failed owner prompt as the opponent's engine-origin CHOOSE_STARTING_POKEMONS setup choice: with no mulligan/extra-draw prompt, each role gets starting-Pokémon selection and the coin-flip winner gets GO_FIRST, explaining 2 candidate vs 3 opponent prompt decisions. The failure receipt intentionally coarsens the policy's private abstention reason, so the exact policy reason is not public in the artifact.

The opponent policy does have an engineSetupPromptDecision handler for CHOOSE_STARTING_POKEMONS. The next diagnostic should therefore distinguish: (1) engine-source classification reaching that handler, (2) starting-prompt metadata/card-choice validation, and (3) a card-choice frontier that becomes empty after blocked-index filtering. Do not change host legality or Twinleaf.

Useful comparison: candidate policy's chooseStartingPokemonSetup is more defensive and validates the same setup envelope; it accepts min 0/1, validates every card choice and empty token, then selects the native order. Opponent policy's handler is narrower and can abstain as INVALID_STARTING_POKEMON_PROMPT or NO_VISIBLE_STARTING_POKEMON. The artifact does not expose which.

No fixture should be run. Exact-SHA acceptance remains blocked at the first native witness failure.