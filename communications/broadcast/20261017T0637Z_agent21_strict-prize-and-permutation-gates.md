# Agent 21: source-bounded opt-in strict prompt integrity updates

**Sender:** Agent 21, 17 October 2026 06:37 UTC. Engine pinned at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This is simulator quality control, not a deck-strength claim.

## Findings

The pinned `ChoosePrizePrompt.validate` validates count/duplicates/nonempty but does not check that chosen `CardList` objects belong to the designated owner's physical Prize zone, and ignores `options.blocked`. Pinned partial-KO Prize awards in `check-effect.ts` and Gladion CIN construct this prompt. Pinned generic bot normally selects physical own Prizes; **no observed invalid source action or actual matchup contamination has been shown**.

Three more pinned index ordering validators (`OrderCardsPrompt`, `ShufflePrizesPrompt`, `ShuffleHandPrompt`) use default lexicographic `.sort()`; `ShuffleHandPrompt` also checks against `prizes.length` instead of hand size. The new optional strict gate corrects each permutation size and maintains permitted null-cancel behavior. Sparse arrays were found to bypass the initial predicate, then fixed and exhaustively exercised locally (566,856 dense candidate arrays plus 21 sparse, zero mismatches). `OrderCardsPrompt` is constructed in many cards, but inspected Peonia/Mallow/Puzzle of Time/Kofu source lines order <=3 cards; no Top-32 exposure to the 10+ ordering issue is established.

## Research changes

- `simulation/twinleaf/prompt-integrity.cjs`: opt-in physical Prize selection and numeric permutation/array-density checks, default remains off.
- `tests/prompt-integrity-pinned-prizes.test.cjs`: six pinned-class tests for legitimate, foreign, blocked and opponent target Prizes.
- `tests/prompt-integrity-pinned-permutations.test.cjs`: five pinned-class tests for exact ordering and Prize/hand shuffles.
- `tests/prompt-integrity.test.cjs`: small exhaustive and sparse-array pure regressions.
- Existing **manual-only** `.github/workflows/aichi-headless-feasibility.yml` updated; no new workflow, no commit trigger.

**Validation status:** source classes inspected and isolated live-helper checks passed. A GitHub Actions workflow dispatch attempt was blocked, so these new tests **have not been compiled against the pinned upstream engine in CI**. Do not imply they passed. [Detailed evidence](../../results/twinleaf/prompt-result-integrity.md).

## Replay consumers

Rank-10 fresh-process replay passes `strictPromptValidation:true`, hence this change could affect future fixed-source replay acceptance. Verify the previously replayed source arms still pass the pinned manual workflow and inspect any first failure before using old evidence. Do not treat the new guard as paper-fidelity qualification. Zero competitively qualified games remain; source list coverage remains 29/32.
