# Candidate-only Max Geist attack-conversion retreat policy

**Status:** experimental implementation on a dependent draft PR; pure local tests and path-filtered CI pass; native-game validation pending.

## Question

Can the Hood Shield Shadow Rider candidate avoid leaving a legal, higher-value Max Geist attack stranded on the Bench while the current Active continues using a lower-value attack?

## Evidence motivating the change

The full 58-row Hood Shield v1 audit reports 50 Max Geist attacks in 31 completed wins, one in 13 completed losses, and five in 11 action-limit rows. Max Geist appeared in 16/31 completed wins but only 1/13 completed losses. The 13 losses contained 36 Filch and 20 Red Knuckles attacks (56/63 settled attacks). A separate six-game audit of ranks 7, 11, and 12 reports nine champion-reference Max Geist attacks versus two Hood attacks; that 2-versus-9 comparison is not the full-cohort count.

In the rank19 loss from the 58-row cohort, Mimikyu used Filch 12 times on turns 3 through 25 while a Benched Shadow Rider Calyrex VMAX carried three Psychic Energy on turns 21/23 and four on turn25. Mimikyu had one Psychic Energy and a printed one-Energy retreat cost; the root-action ledger records no RetreatAction on turns 21–27. Max Geist was eventually used on turn27. This makes an earlier promotion a high-value replay target, but the audit still does not prove the exact retreat was legal or better at each earlier turn because it lacks every hand/effect restriction and competing attack detail.

Important counterline from the same public board: the opponent's Active at turns21/23/25 was Latias ex (210 HP) with Skyliner, which gives the opponent's Basic Pokémon no Retreat Cost. At turn21, promoting VMAX by paying Mimikyu's one-Energy retreat cost would leave five Psychic Energy across the board (VMAX 3 + Clefairy ex 2), for 160 Max Geist damage; at turn25 it would leave six, for 190 damage. Neither is an immediate KO on Latias ex, and the opponent can retreat it for free. By turn27 the Active was Raging Bolt ex (240 HP); the public board shows VMAX with five Psychic Energy, Clefairy ex with two, and Mimikyu on the Bench still retaining its Psychic Energy, for 250 Max Geist damage and two Prizes. The public ledger records a PlayCardAction before that attack but does not expose its exact card choice. Therefore the earlier Max Geist line is a tactical hypothesis, not an established improvement; a one-turn score may overvalue damage that the opponent can answer by free retreat.

Relevant card text in the repository card pool:

- resources/cards/en/swsh6.json, swsh6-75 Shadow Rider Calyrex VMAX: Max Geist costs three Colorless Energy and does 10+ damage, adding 30 damage for each Psychic Energy attached to all of the player's Pokémon.
- resources/cards/en/sm2.json, sm2-58 Mimikyu: Filch costs one Colorless Energy and draws two cards; Copycat is a separate, conditional attack.
- resources/cards/en/sv8.json, sv8-76 Latias ex: Skyliner gives the opponent's Basic Pokémon no Retreat Cost.
- resources/cards/en/sv5.json, sv5-123 Raging Bolt ex: 240 HP.

The cost distinction matters: Max Geist is not a three-Psychic-cost attack. The engine should decide actual attack legality rather than a policy hard-coding an Energy count.

## Pinned engine behavior

The repository's .gitmodules points to vendor/twinleaf (https://github.com/twinleafgg/twinleafgg.git), pinned at a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.

At that revision:

- simple-bot-definitions.ts orders RetreatTactic immediately before AttackTactic.
- RetreatTactic scores the state immediately after retreat; it does not score the attack that becomes available after the retreat.
- AttackTactic evaluates attacks from the current Active Pokémon using SimpleTactic.evaluateAction and the same Simulator / StateScore machinery.
- StateScore combines hand value, opponent state, prize differential, active/bench value, energy, damage, and Tools. PlayerScore includes a deck-count score and a configured penalty below ten cards; it is not a forward model of the next turn's deck-out loss or the opponent's response.

This creates a plausible policy gap: a retreat can be unattractive when scored as a board change alone even when retreating and attacking is the best complete tactical line. The existing score also provides a limited deck-size penalty when comparing Filch with Max Geist, but it does not replace a dedicated terminal-risk, opponent-response, or prize-map model.

## Implementation

simulation/twinleaf/hood-aware-max-geist-retreat-tactic.cjs returns a subclass of the currently installed RetreatTactic.

For each own Benched Shadow Rider Calyrex VMAX with Max Geist:

1. Simulate the actual RetreatAction through the pinned tactic's simulator. If retreat is illegal, the line is rejected.
2. Verify the simulated Active is the intended Shadow Rider VMAX.
3. Evaluate Max Geist from that post-retreat state through the same evaluateAction / Simulator / StateScore path used by the native AttackTactic. If the attack is unpayable or otherwise invalid, the line is rejected.
4. Compare the projected score with the best attack from the current Active and the native RetreatTactic's preferred retreat-plus-attack line.
5. Select the best Max Geist retreat only when it strictly improves on those alternatives; otherwise preserve the native retreat result.

The helper is installed through the existing withHoodCandidateBotOptions composer. It wraps an already-installed candidate RetreatTactic subclass instead of replacing it, is idempotent, and is applied only to the candidate seat by withHoodCandidateBotOptionsBySeat. The opponent's resolver and tactic classes remain unchanged. No card list or shared baseline policy is modified. The helper itself does not inspect opponent hand/deck card identities; it reuses the native attack-evaluation path, so the V3 actor-observation boundary still needs to be confirmed in integration tests.

## Validation

Local Node 22 isolated pure tests passed:

- 8 attack-conversion cases: legal promotion; unpayable Max Geist; superior current attack; preservation of a better native retreat line; selection among multiple VMAX; illegal retreat; non-Shadow-Rider exclusion; and an already-Active VMAX with a better Benched VMAX.
- 4 composer cases: subclass wrapping and opponent immutability; idempotence; candidate-seat isolation in both physical seats; and fail-closed behavior when a pinned base class is missing.

GitHub Actions run 43333911226 completed successfully. It ran the existing path-filtered syntax checks and pure-contract tests; it did not build Twinleaf or run a game. The tests use injected fake base classes and action constructors. They establish the policy contract, not compatibility with a running Twinleaf build.

## Limitations and next validation

- The existing StateScore is a heuristic, not a full game-theoretic value function.
- The policy does not model the opponent's next-turn response, including the free-retreat response from Latias ex Skyliner, future gust, or a complete prize map.
- It does not prove that the earlier turn25 retreat in rank19 was legal; the pinned simulator must evaluate the exact original game state.
- It is not yet installed in the V3 candidate role and has no native complete-game result.
- It has not changed the nominated deck, any matchup record, or any win-rate estimate.

Next: integrate the composed options into the V3 runner on the candidate seat only; run matched baseline-versus-policy native games in both physical seats over the same original-source Hood cohort. Include rank19 as an explicit counterline: compare immediate Max Geist damage, opponent free-retreat responses, prize conversion, and deck-out risk. Retain exact root-action, retreat-payment, attack, prize, and game-completion receipts. Expand to the full Aichi field only after the candidate policy is stable. Keep the policy experimental and do not promote it on the basis of helper tests alone.