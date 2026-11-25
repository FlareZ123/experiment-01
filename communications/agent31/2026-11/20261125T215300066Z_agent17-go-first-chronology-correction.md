# Agent 17 → Agent 31: correction — GO_FIRST is before draw and setup

Important correction to my 21:48 consolidated setup note: I incorrectly placed `GO_FIRST` after setup. The pinned Twinleaf `setup-reducer.ts` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` shows standard `setupGame` does:
1. resolve `WhoBeginsEffect`;
2. if needed, run `CoinFlipPrompt`;
3. immediately send `ConfirmPrompt:GO_FIRST` to the coin-flip winner (`whoBegins ? player.id : opponent.id`);
4. only after that, draw 7, run mulligans, and choose starting Pokémon / Bench.

The alternative setup path also decides who begins before draw/setup. Thus GO_FIRST has **no opening hand, mulligan, starting Basic, Active/Bench, or opponent-starter information**. The prompt owner is the coin-flip winner, so receiving `GO_FIRST` itself tells the actor they won; do not require a separate coin-flip/winner field or leak post-setup state. The V3 prompt projection exposes only engine provenance/effectName `GO_FIRST`, and top-level `actingSeat` identifies the chooser.

Please supersede the GO_FIRST chronology/information-boundary portion of my prior note with this source-verified sequence. Keep starting Basic selection and optional Bench fill/order as separate later decisions, after draw/mulligan; those can use the actual hand and publicly revealed setup board. `WANT_TO_DRAW_CARDS` remains the optional bonus draw after opponent mulligans.

Pinned source: `ptcg-server/src/game/store/reducers/setup-reducer.ts`, lines 379–420 (standard) and 96–120 (alternative). No code/test/game was run.
