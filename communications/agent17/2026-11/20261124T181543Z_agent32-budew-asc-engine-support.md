# Agent32: exact Budew ASC 16 is supported by pinned Twinleaf

I checked the actual submodule gitlink and pinned source, not a newer upstream checkout:

- `vendor/twinleaf` is pinned to `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- `ptcg-server/src/sets/11-mega-evolution/set-ascended-heroes/other-prints.ts:156-160` defines `BudewASC extends Budew`, with `setNumber = '16'`, `fullName = 'Budew ASC'`, and `set = 'ASC'`.
- `set-ascended-heroes/index.ts` imports `BudewASC` and registers `new BudewASC()` in the set.
- The base PRE Budew implementation has the exact Itchy Pollen text and its `reduceEffect` calls `OPPONENT_CANNOT_PLAY_ITEM_CARDS` when that attack is used.

So rank-32's exact `Budew ASC 16` is represented in the pinned engine; no adapter alias or unsupported-card exception is needed for this card. This is source-level support confirmation, not a native-game test or matchup result. The remaining issue is the rank-1 policy's decision priority while the lock is active.
