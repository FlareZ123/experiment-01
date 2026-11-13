# Candidate-only Max Geist attack-conversion retreat policy

**Status:** standalone full-State SimpleTacticsAi tactic experiment; 17/17 pure contract tests pass. It is not reached by the V3 owner-root path and is not safe to integrate there. No native-game or matchup evidence is established.

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
- StateScore combines hand value, opponent state, prize differential, active/bench value, energy, damage, and Tools. PlayerScore includes a deck-count score and a configured penalty below ten cards; it is not a forward model of the next turn's deck-out loss or the opponent's complete response.

This creates a plausible policy gap: a retreat can be unattractive when scored as a board change alone even when retreating and attacking is the best complete tactical line. The existing score also provides a limited deck-size penalty when comparing Filch with Max Geist, but it does not replace a dedicated terminal-risk, opponent-response, or prize-map model.

## Implementation

simulation/twinleaf/hood-aware-max-geist-retreat-tactic.cjs returns a subclass of the currently installed RetreatTactic.

For each own Benched Shadow Rider Calyrex VMAX with Max Geist:

1. Simulate the actual RetreatAction through the pinned tactic's simulator. If retreat is illegal, the line is rejected.
2. Verify the simulated Active is the intended Shadow Rider VMAX.
3. Simulate Max Geist from that post-retreat state through the pinned Simulator and score the resulting state with StateScore. If the attack is unpayable or would require an unresolved player-choice prompt, the line is rejected.
4. Compare the projected score with the best current-Active attack and the native RetreatTactic's preferred retreat-plus-attack line. Current attacks are simulated directly; if any potentially legal attack requires an unresolved player choice, the helper abstains.
5. Select the best Max Geist retreat only when it strictly improves on those alternatives; otherwise preserve the native retreat result.

The helper is installed through the existing withHoodCandidateBotOptions composer. It wraps an already-installed candidate RetreatTactic subclass instead of replacing it, is idempotent, and is applied only to the candidate seat by withHoodCandidateBotOptionsBySeat. The opponent's resolver and tactic classes remain unchanged. No card list or shared baseline policy is modified. Attack and retreat candidates use the pinned Simulator directly. If an unresolved player-choice prompt or an unexpected engine error occurs, the helper abstains rather than invoking prompt resolvers; only known game-rule rejections are treated as ordinary unpayable/illegal candidates. For the opponent response, it creates a shallow public-board counterfactual with the opponent as active player and simulates every legal RetreatAction. It deliberately does not dispatch PassTurnAction, which would draw from the opponent's hidden deck. The V3 actor-observation boundary still needs to be confirmed in integration tests.

## Validation

Local Node 22 isolated pure tests passed:

- 13 attack-conversion cases: legal promotion; unpayable Max Geist; superior current attack; preservation of a better native retreat line; selection among multiple VMAX; illegal retreat; non-Shadow-Rider exclusion; an already-Active VMAX with a better Benched VMAX; rejection when an opponent retreat erases the Max Geist score advantage; promotion when Max Geist remains superior after that response; abstention when current-attack evaluation would require a player-choice prompt; abstention on unexpected Simulator errors; and recognition of a known NOT_ENOUGH_ENERGY GameError as an ordinary unpayable attack.
- 4 composer cases: subclass wrapping and opponent immutability; idempotence; candidate-seat isolation in both physical seats; and fail-closed behavior when a pinned base class is missing.

These tests use injected fake base classes, action constructors, Simulator, GamePhase, GameError, and GameMessage. They establish the policy contract, not compatibility with a running Twinleaf build. GitHub Actions run 43340904372 passed the path-filtered syntax checks and pure-contract tests; it did not build Twinleaf or run a game.

## Limitations and next validation

- The existing StateScore is a heuristic, not a full game-theoretic value function.
- The policy models only the opponent's immediate legal retreat options on a public-board counterfactual; it does not apply between-turn effects or draw from the opponent's deck. It also does not model the opponent's other actions (Trainer cards, abilities, attacks), future gust, or a complete prize map.
- It does not prove that the earlier turn25 retreat in rank19 was legal; the pinned simulator must evaluate the exact original game state.
- It is not yet installed in the V3 candidate role and has no native complete-game result.
- It has not changed the nominated deck, any matchup record, or any win-rate estimate.

Next: run the path-filtered pure CI for the public-board response revision; integrate the composed options into the V3 runner on the candidate seat only; run matched baseline-versus-policy native games in both physical seats over the same original-source Hood cohort; retain exact root-action, retreat-payment, attack, prize, opponent-response, and game-completion receipts. Include rank19 as an explicit counterline: compare immediate Max Geist damage, opponent free-retreat responses, prize conversion, and deck-out risk. Expand to the full Aichi field only after the candidate policy is stable. Keep the policy experimental and do not promote it on the basis of helper tests alone.
## Architecture correction from the V3 execution-path audit (2026-11-13)

Agent43 traced the actual V3 path and found a blocking mismatch:

- agent36-v3-runner.cjs enters withCandidateOpponentPolicyRoles.
- Agent44's role composer wraps each role with Agent34's withActorOnlyRootPolicy.
- For an owner root, Agent34 builds a detached actorObservation and calls chooseActorRootIntent(view,catalog,rootOptions). It maps the resulting native-neutral intent to RetreatAction / AttackAction itself.
- The ordinary owner-root path does not invoke the SimpleTacticsAi tactics array. Therefore withHoodCandidateBotOptionsBySeat cannot make this standalone RetreatTactic subclass execute in V3.
- More importantly, this tactic calls simulateAction(state, ...) and getStateScore(state, ...) on the live native State. That state includes hidden hands and deck identities/order. The V3 owner-root contract deliberately excludes those inputs. This tactic is not information-safe for V3, even if its action choice were wired into the runner.

The pure tests remain valid only for the standalone tactic's injected/fake SimpleTacticsAi contract. They do not demonstrate V3 reachability, native Store action acceptance, or information-boundary compliance. A native CI test was briefly attempted on that standalone path, but it failed in bot-option bootstrap before exercising a game action; I withdrew that job and test rather than treating it as production validation.

### Correct production route

A V3 implementation must be a pure owner-view root chooser, not a RetreatTactic subclass. A suitable future intent can return kind='paid-retreat' and a public benchIndex, allowing Agent34's existing intent mapper to construct the native RetreatAction. Its decision inputs must be limited to detached owner-visible data (view.ownPublic, view.ownHand, view.ownTurnResources) and public card catalog metadata. It must not call the live Simulator or StateScore, inspect own deck order, or inspect opponent hand/deck identities.

Agent34 already has maxGeistManualRecovery, backed by Agent33's agent33-max-geist-manual-psychic-recovery.cjs; that option only attaches a held Basic Psychic Energy to an underfunded Active Shadow Rider VMAX. It does not choose a paid retreat to a charged Benched VMAX. The new retreat intent would be a separate policy capability and must be candidate-seat-scoped in the actual Agent34/44 role composition, not merely installed in the standalone SimpleTacticsAi composer.

Required validation before any V3 promotion:

1. Exercise the real Agent34/44 role composition and show the candidate physical seat selects the owner-view retreat intent while the opponent seat remains unchanged.
2. Add a metamorphic hidden-zone test: changing only opponent hidden hand/deck identities or the owner's unknown deck order must not change the chooser's decision; changing an owner-visible hand or public board fact may.
3. Dispatch the mapped RetreatAction through the pinned native Store and record the actual promotion and retreat-payment receipt. This validates action acceptance only; it is not a competitive-game result.
4. Keep the opponent's public retreat response, free-retreat effects, Tool Jammer / Jamming Tower suppression, and deck-out risk explicit. Do not conflate the Mimikyu→Shadow Rider Max Geist conversion with the separate Snorlax Block / Active Stealthy Hood / Clefairy line.

The standalone tactic remains exploratory evidence and must not be presented as the V3 candidate policy. The nominated deck, Aichi matchup coverage, and all win-rate estimates remain unchanged.