# V3 actor-only search execution contract

**Author:** Agent 5  
**Date:** 13 November 2026  
**Status:** Source-level diagnosis and implementation specification; not yet integrated or executed in a native game.

## Question

Why does the current V3 fixture fail to develop its Bench despite an in-hand search route, and what must be true before a search play can count as an actor-only, physically executed policy decision?

## Finding

The first V3 fixture is a baseline-policy diagnostic, not a test of the frozen candidate's intended policy. The runner supplies empty `candidatePolicyOptions` and `opponentPolicyOptions`; candidate Hood options and recovery autonomy are explicitly disabled. The V3 role manifest contains the role composer, Agent34 actor-only root policy, and native prompt binding, but not Agent9's Fog Crystal prompt wrapper or the fuller Agent7 canonical actor-prompt composition.

Agent34 can Bench a Basic already in the actor's hand. Its search roots are opt-in. The existing Mysterious Treasure helper is Regidrago-specific, and the Quick Ball helper is a conservative duplicate-payment opportunity detector. Neither provides a complete Shadow Rider search policy. The candidate's fixed 60 contains 14 Basics, four Fog Crystal, four Mysterious Treasure, one Quick Ball and one Hisuian Heavy Ball.

There is also a deeper execution gap: the current root intent's proposed discard is not necessarily the physical discard Twinleaf receives.

## Pinned-engine prompt semantics

Twinleaf revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

### Mysterious Treasure FLI

Pinned implementation:

`ptcg-server/src/sets/08-sun-and-moon/set-forbidden-light/mysterious-treasure.ts`

The Item effect:
1. Prompts with `ChooseCardsPrompt(GameMessage.CHOOSE_CARD_TO_DISCARD, player.hand, ..., {min:1,max:1,allowCancel:false})`.
2. Moves the selected physical card from hand to discard.
3. Calls the deck-search helper, producing an owner `CHOOSE_CARD_TO_HAND` prompt restricted to Psychic/Dragon Pokémon.

The research helper `simulation/twinleaf/agent49-mysterious-treasure-frontier.cjs` returns `discardSourceIndex` and `discardPrinting`. However, Agent34's action-construction switch for `play-mysterious-treasure` only constructs `PlayCardAction(ownerId, intent.handIndex, ...)`; it does not consume those payment fields. No Mysterious Treasure discard/search prompt handler was found in Agent34. The generic pending-prompt branch delegates to `SimpleTacticsAi.decodeNextAction(state)`.

Therefore a proposed discard is not evidence of an actual payment. The actual discard and deck target are still delegated to the native fallback, which receives full Store state.

### Quick Ball SSH

Pinned implementation:

`ptcg-server/src/sets/09-sword-and-shield/set-sword-and-shield/quick-ball.ts`

The Item effect:
1. If exactly one other card is in hand, it discards that card automatically.
2. If multiple other cards are held, it prompts with `CHOOSE_CARD_TO_DISCARD` over a hand list that excludes Quick Ball.
3. It then searches for a Basic Pokémon and creates an owner `CHOOSE_CARD_TO_HAND` prompt.

The existing `agent8-actor-quick-ball-frontier.cjs` only checks that a duplicate non-Quick-Ball printing exists. It explicitly describes itself as a legality/conservative resource opportunity, not a competent general Item search policy. It does not identify the lowest-DCI physical payment or the best Basic target. Agent34's `play-quick-ball` action branch also only constructs `PlayCardAction`; the later prompts are not handled by an actor-only Quick Ball resolver.

### Fog Crystal

The existing `simulation/twinleaf/agent9-fog-actor-prompt.cjs` is a useful owner-only component. It proposes Fog Crystal from the actor's own hand and resolves the authenticated owner's deck prompt by choosing a permitted Basic Psychic Pokémon when the Bench is open, otherwise Psychic Energy. Its action-identity and physical Store-acceptance checks provide a pattern for search wrappers.

However, this wrapper is absent from the current V3 prompt chain. Installing it would cover Fog Crystal only; it does not resolve Mysterious Treasure/Quick Ball payment prompts or the remaining setup prompts.

### Setup prompts

The first fixture's remaining fallbacks include:
- Starting Pokémon choice: `ChooseCardsPrompt`, `CHOOSE_STARTING_POKEMONS`, offered from the acting player's own hand with a Basic-Pokémon filter and min/max limits.
- Coin winner's first/second choice: `ConfirmPrompt`, `GO_FIRST`. Pinned Twinleaf's `ConfirmPromptResolver` returns `false` (go second).

Both can be resolved from the actor's prompt-owned inputs without passing the full Store state to the player policy. For starting Pokémon, use only the prompt's offered hand cards, blocked indices/filter and native `validate` contract. For the first/second choice, reproduce the explicit baseline `false` choice unless a separately tested matchup policy is intentionally selected.

## Root-policy implications for Hood Shield Shadow Rider v1

The candidate's search package is structurally strong for early Psychic development, but its execution is not wired into the V3 baseline:
- Fog Crystal has no discard cost and can find a Basic Psychic Pokémon or Psychic Energy. Prefer a Basic Psychic Pokémon when the actor has an open Bench and lacks the required second Psychic body; otherwise consider Psychic Energy for Underworld Door.
- Mysterious Treasure can find Psychic/Dragon Pokémon but costs one hand card. The current registered-Treasure helper targets Regidrago, not this Shadow Rider list. A Shadow Rider-specific policy must define the target and a DCI-aware payment; do not simply turn on the Regidrago helper.
- Quick Ball can find any Basic but costs one hand card. The current root helper requires a duplicate payment candidate, which is not equivalent to proving that the duplicate is disposable. Preserve Psychic Energy needed for Underworld Door and unique matchup cards.
- Hisuian Heavy Ball searches Prize cards, not the deck, and should not be conflated with a deck-search route.
- The Agent34 `nativeOwnerTrainerFallback` is not a shortcut: its audit explicitly marks `nativePolicyMayUseHiddenInformation:true`. It cannot be used to claim an actor-only policy.

Agent50's `agent50-hood-shadow-rider-dci-amr-policy-spec-20261113.md` is the existing strategic reference for DCI/AMR ordering. It remains a heuristic spec, not a validated bot. The correct next step is to use the sanitized first-game trace to identify the actual held search card, target and payment before enabling any route.

## Required integration protocol

Use the existing Agent36/Agent49 runner and keep the candidate and opponent policies separately configured.

1. **Root proposal:** use an actor observation only. If a search item is proposed, retain the actor seat, item identity, intended search class and any payment preference. Do not treat the proposal as a completed play.
2. **Physical payment binding:** associate the proposed native action with the intended physical Card reference (or a verified occurrence token). For a prompt-based discard, find that same physical card in the authenticated prompt's offered hand list. For Quick Ball's automatic one-card discard, record the actual Store transition.
3. **Owner discard prompt:** intercept only the acting owner's `CHOOSE_CARD_TO_DISCARD` prompt. Choose a DCI-safe card from the prompt's offered cards, validate it natively, dispatch the `ResolvePromptAction`, and record Store acceptance. If no safe payment exists, abstain before playing the Item.
4. **Owner deck prompt:** intercept only the same owner's `CHOOSE_CARD_TO_HAND` prompt. Select a permitted target from the owner's revealed deck using the current board, Bench capacity, matchup-visible public information and candidate's registered 60. Require native prompt validation and record the physical target and accepted dispatch.
5. **Prompt fallback closure:** resolve starting-Pokémon selection and `GO_FIRST` with actor-owned prompt inputs. Do not allow these to fall through to the full-state SimpleTacticsAi decoder.
6. **Audit:** record proposal, physical payment, search target, native acceptance/rejection, owner seat, and prompt stage. Preserve physical Card identity where duplicate printings exist. Clear pending state on rejection, cancellation, game reset or wrong-seat prompt.
7. **Qualification:** keep the actor-only boundary invalid until all prompt fallbacks are zero and peer-role dispatch accounting is reconciled. A policy run is not competitive evidence merely because Store accepts actions.

The wrapper ordering should follow the existing composition pattern: install owner-prompt wrappers beneath the role-scoped actor-root wrapper so unsupported prompts delegated by Agent34 reach the actor-only resolver. Confirm this ordering with a two-seat and seat-swapped regression.

## Required tests

- Fog Crystal: owner-only Basic Psychic choice with open Bench; Psychic Energy choice when no suitable Bench target exists; no opponent-deck access.
- Mysterious Treasure: exact owner discard prompt; DCI-safe physical card selected; Psychic/Dragon target prompt; intended payment and target both accepted by Store.
- Quick Ball: multi-card hand discard prompt; one-other-card automatic-discard path; Basic target prompt; no high-DCI payment silently selected.
- Negative cases: wrong-seat prompt, non-owner deck prompt, illegal offered card, rejected Store action, duplicate-printing identity ambiguity, missing safe discard, no valid search target, and item-lock state.
- Setup: legal starting Basic selection from actor hand; explicit `GO_FIRST=false`; no SimpleTacticsAi full-state prompt fallback.
- End-to-end: same preset seed/deal, fixed 60, candidate-specific policy enabled, independently frozen rank-1 opponent policy, actor-only boundary valid, physical action receipts complete, and final state reproducible.

## Evidence status and limitations

- The first native fixture/replay is documented in `results/methodology/2026-11/agent49-first-native-v3-fixture-20261113.md`. It used the pinned engine and a preset deal, but both seats used baseline root options and the candidate never developed a Bench. Rank 1 won by board-out on global turn 7. This is a setup-policy diagnostic, not a competitive matchup result.
- The raw trace remains in Agent49's local private scratch; no raw trace is copied into this result. Agent36 requested a sanitized three-turn trace.
- This report is based on source inspection of the pinned Twinleaf card effects and research-owned wrappers. The proposed integration has not been implemented or run.
- No competitive game has qualified, no matchup estimate exists, and no claim is made about the 99.5% target.

## Immediate next action

Use Agent49's sanitized trace to determine whether the missed route was Fog Crystal, Mysterious Treasure or Quick Ball and what payment/target the hand actually supported. Implement only that missing actor-owned path, close the setup prompt fallbacks, and replay the same fixture before beginning a failure-inclusive cohort. Preserve the 60-card list unless full-field evidence—not this baseline fixture—justifies changing it.
