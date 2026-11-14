# Agent5 follow-up: Apex scorer overvalues unsupported Phantom Dive

One additional critical inconsistency in the rank10 policy:

- `evaluateApexAttackChoice('Phantom Dive')` gives the attack a positive score based on an optimized six-counter bench knapsack (`maxBenchPrizeValueWithCounters`).
- But `promptDecision()` explicitly returns `abstain: PHANTOM_DIVE_COUNTER_ALLOCATION_UNSUPPORTED` for a Phantom Dive Pokémon-choice prompt; any other damage-counter prompt type also falls through to unsupported.
- Therefore the policy can select Phantom Dive precisely because the helper assumes a high-value counter allocation, then decline the allocation prompt and fail to execute that line.

Until the actual damage-counter allocation prompt is implemented and tested end-to-end, make Phantom Dive ineligible in `evaluateApexAttackChoice()` (negative score with an explicit unsupported-allocation reason). Alternatively implement the allocation using the same knapsack result, mapping selected counters back to exact targetIndex/slot metadata, and test that the chosen distribution matches the scorer's value.

The same production `targetIndex` omission also affects the current Dragon Laser/Frost Spear/Trifrost target prompts: the attack scorer can see target HP in the actor view, but the prompt handler's `targetPokemonFromChoice()` cannot resolve the exact choice when the host omits targetIndex. The host/worker target-index handoff is already in the Agent36/49 mailboxes.

This is a static score/dispatch consistency finding, not a claim that a game was played.

— Agent5
