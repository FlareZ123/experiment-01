# Native Get Lost destination false negative caused by a zero-Prize staged board

**Agent 1, 5 November 2026.** **Scope:** a paper-rule fidelity regression for the pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. **Competitive games qualified: 0.** This is an evaluation fixture correction, not a card-power or win-rate conclusion.

## Reproduced symptom

In the initial native probe `tests/agent9-source-stamped-getlost-exact-destination.native.test.cjs`, the original printed Girafarig LOT Get Lost attack resolved a selection from the opponent's public discard, but the subsequent test saw both the opponent's Lost Zone and discard empty. Previously discarded cards and even the opponent's former Active Pokémon appeared in their deck. The apparent result, if interpreted without checking the board, would be that Get Lost sent cards into the deck rather than the Lost Zone.

The original fixture manually built a `State` and two players, with a valid Active for each and a public opponent discard, but had **zero Prize cards for each player**. This is not a live ordinary Pokémon TCG board at the start of an attack.

## Mechanism, verified against pinned source

The original pinned `Girafarig.reduceEffect` calls a genuine `ChooseCardsPrompt` on `opponent.discard` and its resolution callback invokes `MOVE_CARDS(store,state,opponent.discard,opponent.lostzone,{cards:selected,...})`.

The real `Store.dispatch(ResolvePromptAction)` invokes `checkState` after the prompt chain finishes. In the pinned `effect-reducers/check-effect.ts`, `checkWinner` interprets the empty Prize zones as both players satisfying a loss condition, invokes `initiateSuddenDeath`, and collects all zones into the decks, specifically including `player.lostzone`, `player.discard`, `player.active` and `player.hand`. In a zero-Prize synthetic board, this terminal resolution silently invalidated the post-dispatch Lost Zone assertion.

## Corrected true-positive regression

The same staged source/owner/deck tests now place one physical card into each of six Prize slots for both players before using Get Lost. Both remaining Prize counts are asserted to be six. The only change to source-decision semantics is making the staged board nonterminal.

- [Isolated native CI run 41938495279](https://github.com/FlareZ123/experiment-01/actions/runs/41938495279): eight of eight tests pass. Opponent public discard piles of 0/1/2/3 cards are covered for both physical source seats. With one card available, that card was in the same opponent's Lost Zone after resolving the native prompt. With two or three cards, exactly two selected physical card instances entered the Lost Zone; if three, the unselected card remained in discard. No unselected deck changes occurred.
- [Native CI run 41938908183](https://github.com/FlareZ123/experiment-01/actions/runs/41938908183): nine of nine tests pass, including the preceding eight positive cases and a **negative control** that deliberately uses zero Prize slots. In that controlled invalid board, a selected card is absent from the Lost Zone at the end and appears in the opponent's deck, along with the former Active Pokémon. This reproduces the misleading symptom at the same pinned engine revision without altering Get Lost's code. The negative control log states `opponentDeckAfter:2`, `opponentLostZoneAfter:0`, `stillInOpponentDeck:true`.

Both workflows run `npm ci`, compile the pinned native engine and then use real `Store.dispatch(ResolvePromptAction)`. The correction and negative control are committed at `tests/agent9-source-stamped-getlost-exact-destination.native.test.cjs`, exercised through `.github/workflows/agent1-getlost-prizes-fixture-native.yml`.

## Implications

Do not infer a card-effect destination bug from only final post-resolution zones when a synthetic fixture has prematurely satisfied a terminal condition. For card-effect native tests, either construct a live nonterminal board with sufficient Prize state and Active Pokémon, or take a separate explicitly marked pre-terminal observation. For all such tests, preserve physical source, destination, selector, and game phase before/after the action.

The corrected Get Lost destination contract is now demonstrated in this narrow original-source test, including opponent-discard scarcity and both physical seats. It does not establish the competence of the generic opponent bot, other paper-rule fidelity, a whole tournament game, or the 99.5% objective. The source owner hook still limits its selection policy to the first two public discard cards.
