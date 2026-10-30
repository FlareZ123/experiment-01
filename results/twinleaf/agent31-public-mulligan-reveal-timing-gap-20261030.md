# Pinned Twinleaf deferred public mulligan reveals: a paper setup timing gap

**Agent 31 | 30 October 2026 | Evidence class: source-level proof from exact pinned reducer plus supplied official paper setup rule. No policy-induced outcome has been demonstrated.**

## Paper rule versus original pinned Store ordering

The supplied **Advanced Player's Rulebook Ver. 3.4, section I.G Step 5** requires:

1. After initial seven-card hands, players disclose whether either has a Basic Pokémon.
2. If **both** lack Basics, they **reveal their hands to each other**, shuffle the hands back into their decks, then **restart from setup Step 3**.
3. If only one lacks Basics, the other player proceeds through Bench placement and Prize setup first. The invalid player then **reveals their invalid hand** and redraws.

Therefore, when *both* players mulligan, each player legitimately knows the previous revealed seven cards of the opponent **before making a later starting Active/Bench choice**. This is legal pre-setup historical public information. The initial coin-flip/player-order choice occurred before those reveals.

The real pinned Twinleaf **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**, file [setup-reducer.ts](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/reducers/setup-reducer.ts) proves a different temporal sequence for *normal seven-card setup*:

- Lines **433–451**: when both are Basic-free, copy both invalid hands into two local arrays, move hands to decks, shuffle and redraw, **without showing a ShowMulliganPrompt yet**.
- Lines **456–471**: when only one player has a Basic, run setupSinglePlayer for the valid player, repeat the other's invalid draws, then run setupSinglePlayer for the other player.
- Lines **474–480**: issue the **first** opponent-facing ShowMulliganPrompt in that path, after both final starting-Pokémon choices.
- Lines **500–517**: symmetric branch, again perform both setupSinglePlayer calls before any ShowMulliganPrompt at lines **520–526**.
- Lines **547–550**: if both have Basics following any simultaneous Basic-free rounds, call both setupSinglePlayer selections **first**, then issue the delayed disclosure at lines **554–560**.

This last case is the clearest discrepancy. The original Store internally retains the correct failed printings, and shows them honestly **before the first normal turn**, as the compiled [native six-setup test](agent31-native-public-mulligan-parity-20261030.md) confirms. However, the original Store does **not** make the opponent's already-revealed failed seven observable to a paper-realistic actor **before a subsequent starting-Pokémon selection**.

This is a *timing* issue affecting possible information-aware decisions. The new [public ShowMulligan reader](../../simulation/evaluation/public-mulligan-reveal-observer.cjs) archives only the actual show-prompt evidence at the time it becomes visible in the native engine. It does **not** repair the upstream ordering or infer unrevealed identities early.

## Size of the exposed opportunity class

For any two independent 60-card decks with b_A and b_B Basics, the probability both seven-card opening hands lack a Basic on their **first attempt** is

P(both initial invalid) = [C(60-b_A,7)/C(60,7)] × [C(60-b_B,7)/C(60,7)].

- Original four-Basic Iron Thorns against rank-1 fourteen-Basic Shadow Rider: **8.32237557%** of original initial deals.
- Original four-Basic Iron Thorns against 17-Basic New Moon English proxy: **5.01042097%**.

These probabilities are exact combinatorial calculations. In the both-invalid branch the paper player sees opponent invalid-card identities *before retrying*, while the pinned engine delays display. There may be additional timing effects in one-invalid branches, but they are not quantified here. These are **discrepancy opportunity rates**, not rates at which the better-informed actor actually chooses a different starting Pokémon, obtains an improved board, or wins.

## Qualification and safe correction pathway

- Retain both the **actual shown-hand identity** and the **earliest paper-legal public knowledge time**. Their temporal difference is the relevant information-fidelity gap. Do not leak owner-private card/deck/Prize identities to the opponent.
- A possible adapter correction would need a carefully versioned **setup reducer hook**, not a silent edit to the upstream submodule. It must reveal failed seven cards at the official time, preserve physical shuffle/deal, selected active/bench/Prize order where decisions remain unchanged, and prevent duplicate later show prompts.
- An exact two-deck paired test should hold physical deck order and random draws fixed, then compare otherwise identical starting-Pokémon selection with or without legally early visible opponent mulligan printings. A changed choice alone is still only a decision-policy test until tactical value and both-player responses are validated.
- The existing five-public-signature-of-six native Store demonstration proves eventual *identity visibility* and read-only parity, not correct *timing* in the pinned reducer. It does not validate a policy using the information during setup.
- This result should be treated as a separate paper-realism gate alongside current early Trainer action coverage, Supporter legality and first-turn ability-lock tests. It does not invalidate faithful tests in which neither player needs mulligan history to choose a starting Active, and it does not automatically discard otherwise useful setup reproducibility evidence.

**Status remains 29/32 original exact Aichi 60s, zero competitively qualified games, and no demonstrated fixed 99.5% list.**
