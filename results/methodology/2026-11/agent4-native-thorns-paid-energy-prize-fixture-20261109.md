# Agent4: blocked Underworld → genuine paid Energy action (9 November 2026)

**Result:** corrected pinned Store midgame fixture proves **four of four** already defined owner-public Iron Thorns lock states can bypass a useless Underworld Door proposal and settle an actual ordinary Basic Psychic Energy attachment to the acting player's Active Shadow Rider V. This is a *staged action* witness; no original 60-card contest, source continuation, game win, or paper-qualified match has been established.

## Actual failure and correction

The earlier native workflows [42536841731](https://github.com/FlareZ123/experiment-01/actions/runs/42536841731), [42536997455](https://github.com/FlareZ123/experiment-01/actions/runs/42536997455), [42566659472](https://github.com/FlareZ123/experiment-01/actions/runs/42566659472), and [42566903358](https://github.com/FlareZ123/experiment-01/actions/runs/42566903358) failed the physical-recipient assertion. The concrete diagnostic at 42566903358 showed hand 1→0, Active Energy 0→0, and native pending prompts `ShuffleDeckPrompt`, `ShuffleDeckPrompt`, `WaitPrompt`.

The staged fixture had zero Prize cards on both sides. In pinned Twinleaf's `checkWinner`, `player.prizes.every(p => p.cards.length === 0)` is vacuously true for empty arrays, so a regular `store.dispatch(PlayCardAction)` triggers sudden death for both players. `initiateSuddenDeath` then sweeps Active, Bench and hand cards into the deck, explaining why the newly attached Energy disappeared before the after-Store assertion. The earlier negative result was **fixture invalidity**, not proof that the paid attachment is impossible.

The research-owned corrective commit [6c77369d](https://github.com/FlareZ123/experiment-01/commit/6c77369de8562182159125708f211d31ab8ab5e2) stages six face-down Prize-zone cards for each player before the genuine Store action. Prior commit [27c739ab](https://github.com/FlareZ123/experiment-01/commit/27c739ab06fff7a854ac730a99de6db317d219ea) makes the custody assertion read the actual returned native Store state rather than relying on a stale pre-dispatch holder. The owner-visible v3 guard, physical source identity and actual `PlayCardAction` are unchanged.

## Positive native release

[CI 42567251183](https://github.com/FlareZ123/experiment-01/actions/runs/42567251183) **SUCCESS**, full pinned native Store built at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The targeted `neutral-v3-manual-fallback` step completed successfully, with all four independent staged scenarios passing the existing assertions in [the native test](../../../tests/2026-11/agent4-thorns-field-neutral-v3-native-manual-fallback.test.cjs):

1. Sky Field ROS;
2. Float Stone BKT on the source VMAX;
3. Thunder Mountain Prism Star LOT;
4. Tropical Beach BWP plus Float Stone BKT.

Each fixture confirms the opposing Active Iron Thorns suppressed Underworld (`powerListed:false`, no blocked Ability attachment/draw), and that the legal manual play moved one actual physical Psychic Energy from hand to the acting owner's Active Pokémon (Active Energy **0→1**, hand **1→0**, object identity present in the actual after-Store Energy zone, no imitation root). The v3 veto reason is `known-ability-inert-stadium-tool-lock`.

This repairs a concrete false negative in the research harness and provides a reusable native payment proof. **Next required gate:** run the *same alternative action* via the actual two-player actor policy on frozen original-rank6 physical deals, recording source opponent response, Board/Prize changes, all caps and native errors before claiming any matchup improvement. Keep v3 scoped/default-off pending that integrated result.
