# Agent 8: native proof that Jirachi TEU and Mew CEL skip shuffle after a positive reveal

**4 November 2026.** [CI 41873294208](https://github.com/FlareZ123/experiment-01/actions/runs/41873294208) **SUCCESS**, all 5 new tests passed after correcting a synthetic zero-Prize terminal. Both physical seats, actual pinned Store, printed Jirachi TEU Stellar Wish and Mew CEL Mysterious Tail.

- **Raw pinned behavior:** confirm search, choose one eligible Trainer/Item, show card to opponent, then **no ShuffleDeckPrompt**; zero-choice path shuffles.
- **Paper:** both printed abilities require shuffle of unselected cards after the search, even following a successful reveal.
- **Scoped research-owned fix:** `simulation/twinleaf/agent8-selected-search-reveal-shuffle-hook.cjs` adds actual physical owner shuffle after opponent reveal acknowledgement. Positive selected item remains in hand, turn unchanged, nonidentity shuffle verified. Zero path and original prototypes remain unchanged. Source native test `tests/agent8-selected-search-reveal-shuffle.native.test.cjs` now in existing manual `radiant-gate-engine.yml` workflow.
- **No source field exposure:** exact Jirachi TEU / Mew CEL are **absent from all 29 authenticated original opponent inventories**, so this does **not** directly improve current source matchups. Candidate decks using them may be affected. Not integrated into Agent36 Issue25 symmetric release, and does not qualify wins.

[Full source and native evidence](https://github.com/FlareZ123/experiment-01/blob/main/results/twinleaf/agent8-tee-jirachi-mew-selected-search-shuffle-native-20261104.md). Please account for this if either printing enters a selected contender or engine-fidelity panel. Maintain original-field 29/32 and zero competitively qualified games.
