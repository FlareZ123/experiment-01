# Boost Shake EVS142: genuine native Grimer→Muk, complete prompt chain, and physical Item discard

**Agent 2 | 3 November 2026 | staged two-seat regression, zero qualified game results.**

## Question and history

Previous staged tests correctly observed Boost Shake EVS142 search an actual Alolan Muk SUM58 from the owner's deck and evolve a just-played Alolan Grimer SUM57, including the official Wobbuffet PHF36 Ability-lock cascade. However, the first two CI probes ([41539648987](https://github.com/FlareZ123/experiment-01/actions/runs/41539648987) and [41540368753](https://github.com/FlareZ123/experiment-01/actions/runs/41540368753)) failed an exact **same-object Item-in-discard** assertion. The second probe showed an unresolved `ShuffleDeckPrompt`; premature inspection cannot prove a card-handling defect. The next probe [41570596488](https://github.com/FlareZ123/experiment-01/actions/runs/41570596488) resolved shuffle and exposed a silent `WaitPrompt` during the game's end-turn transition. That still was an incomplete Store sequence.

The pinned implementation explicitly chains the card's effects: choose evolution from deck, choose eligible owner Pokémon, physically move evolution onto the target, shuffle deck, and end turn. The Store's trainer finalizer defers Item cleanup until the action and its prompts complete. The pinned silent phase transition itself also runs through prompts.

## Successful reproduced pinned native result

[**Manual Actions run 41571061520**](https://github.com/FlareZ123/experiment-01/actions/runs/41571061520) **SUCCESS**, with research checkout HEAD `248bf9249cc592e3fcb9d5943f26478ddfe9f3cd`, native Twinleaf git submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Both native tests passed after compilation. Archived [machine artifact 13201960160](https://github.com/FlareZ123/experiment-01/actions/runs/41571061520/artifacts/13201960160), ZIP SHA-256 `85542651f2157f43385142a69c611ddc465c2ded1469019cbf21782a23413b95`.

Research-owned executable source and assertion:
- `simulation/twinleaf/agent2-muk-wobbuffet-boostshake.cjs`
- `tests/agent2-muk-boostshake-first-grimer-turn.native.test.cjs`
- `.github/workflows/agent2-muk-wobbuffet-native.yml` (existing manual-dispatch only)
- Original independent hand-evolution control: `simulation/twinleaf/agent2-muk-wobbuffet-native-order.cjs`

The 4/4 strict cases cover candidate physical seat 0/1 and original-rank7 Wobbuffet Active/Benched. Each begins in a deliberately staged state with the candidate's just-entered Grimer and actual **Boost Shake in its hand**, Muk physically in its own deck. The test dispatches a genuine native hand `PlayCardAction`, resolves owner `ChooseCardsPrompt` for that exact Muk, the owner `ChoosePokemonPrompt` for that exact Grimer, the `ShuffleDeckPrompt` with an engine-validated complete permutation, then the silent `WaitPrompt` phase transitions. No compiled vendor file or native card reducer is patched.

**All four native rows independently report**: no unresolved prompts, Boost Shake absent from hand and deck, **same Boost Shake card object in original owner's discard**, Muk absent from deck and on top of target Grimer, no Ability-state mismatches, turn **3→4**, phase **PLAYER_TURN**. The CI log records the four receipts explicitly for both seats and both Wobbuffet positions: `pending:[]`, `hand:false`, `deck:false`, `discard:true`, `turn:4`, `phase:2`. Native `CheckPokemonPowersEffect` and `IS_ABILITY_BLOCKED` predicates agree with the prior official Wobbuffet/Muk interaction. The previously failing Item-zone assertion now passes with **no vendor correction**.

## Interpretation and limits

This answers one narrow source-payment/fidelity question: the apparent missing Boost Shake discard in the previous fixtures arose because the research driver had not completed the native prompt chain. It was **not** evidence of a paper fidelity failure. More generally, observer code must not classify an in-progress Trainer parked in the native `supporter` play zone as missing/discarded until every `ShuffleDeckPrompt`, silent transition `WaitPrompt`, and deferred cleanup has settled.

The setup is staged at turn 3; it is not an original shuffled 60/60 game. The rank7 opponent's full printed deck is not played, there is no source-owned choice or attack, no opposing turn response/clock, no K0 random starting hand and no competitive policy. This native fixture does not establish a reliable first-turn Muk, an answer to opponent Item lock, or a game win against original Wobbuffet/Iron Thorns source decks. The 29 authenticated original 60s, missing ranks 23/25/28, **zero competitively qualified games**, and unresolved 99.5% target are unchanged.

**Next:** preserve this complete prompt/custody pattern as a regression when the immutable candidate is admitted to an actually selected, symmetric, two-seat original-source evaluation. Move beyond staged Ability predicates toward an owner-paid natural action, actual opponent continuation, and game-clock qualification.
