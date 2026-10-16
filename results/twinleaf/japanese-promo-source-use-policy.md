# Source rank-6 Japanese promo use: two-seat bot diagnostic

**Agent 2, 16 October 2026.** [Manual CI run 38862052028](https://github.com/FlareZ123/experiment-01/actions/runs/38862052028) completed the two cases below using the exact published Aichi rank-6 **Iron Thorns** 60 against the rank-1 **Shadow Rider** reference 60, each held fixed and played in both physical engine slots. The new [bounded source driver](../../simulation/twinleaf/japanese-promos-source-probe.cjs) and [manual workflow](../../.github/workflows/aichi-japanese-promos-use.yml) permit repeatability. This is **generic-bot policy execution evidence**, with no win-rate inference.

## Reproduction

- Source: `results/aichi-2026/full-decklists.json`; matching source rank-6 unique prints `Palace Book SMP` x1, `Palace Belt BWP` x1, `Player's Ceremony SP 127` x1. Both decks resolved as 60 concrete engine cards.
- Twinleaf engine pinned to `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, tested in GitHub Actions after `npm ci` and `npm run compile`. Research adapter `simulation/twinleaf/headless.cjs`.
- Opt-in flags common to both games: `captureDecisionTrace`, `isolatePolicyRandomness`, `strictPromptValidation`, `supporterDecisionCorrection`, `forestSealSearchCorrection`, `leleEntryAbilityLockCorrection`, `radiantGateLockCorrection`. Remaining bot strategy uses `SimpleTacticsAi/defaultStateScores`.
- Fixed RNG seeds below, 600 action cap per game. Both ran to engine completion and passed the prompt-validation gate. Their traces are **selected meaningful actions**, not replayable comprehensive logs.

| Engine deck slots | Seed | Total actions / turns | Source Palace Book played | Source Palace Belt attached | Source Ceremony played | Source Ceremony used | Source attacks |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rank 6 / rank 1 | 2026101616 | 401 / 68 | 1, turn 10 | 1, turn 66 | 1, turn 56 | **0** | 4 Volt Cyclones |
| rank 1 / rank 6 | 2026101617 | 318 / 42 | 1, turn 1 | 1, turn 41 | 0 | **0** | 1 Volt Cyclone |

The first record **played Ceremony into the Stadium zone on turn 56**, then completed the game without a `UseStadiumAction`. The second record held Ceremony in hand immediately before placing Palace Belt on turn 41, yet never played or used Ceremony. Both source lists contained all three promo identities. These results show that the native or research-patched card identities can occur in full source-game actions, and they identify a Stadium decision gap that merits focused policy analysis.

## Code-backed policy hypothesis

Pinned upstream `simple-bot/simple-tactics/use-stadium-tactic.ts` calls `evaluateAction(..., passTurnScore)` with `passTurnScore = defaultStateScores.tactics.passTurn = -1000`. The shared `SimpleTactic.evaluateAction` adds that penalty if the hypothetical post-action turn advances. Player's Ceremony **ends the user's turn**, so this is a plausible large discouragement of its optional draw-two action. In contrast, upstream `PlayTrainerTactic` calls `evaluateAction` **without** that extra turn-transition penalty when considering Palace Book, whose printed effect also ends the turn. This asymmetry is directly visible in the pinned source. Whether it caused either observed choice is **unproven** until a controlled policy-state counterfactual is executed.

## Evidence gates

1. Stage a legal-action state with Ceremony in play, a small hand, a stocked deck and no immediately affordable attack; show that `UseStadiumAction` is permitted and compare baseline policy with a scoped lower-penalty counterfactual. Confirm simulated turn advancement.
2. If a counterfactual improves legal action reachability, check alternative uses of the turn, deck-out, hand value, Item/Supporter lock and whether the Stadium effect is helpful before applying it to full games.
3. Re-run the same seeds and physical seats with a versioned policy and consistent correction flags. Preserve source deck digests and action evidence. Continue flagging weak attack frequencies and incomplete replays.

The six-case [pinned Store promo contract](japanese-promos-store-fidelity.md) separately verifies the three effects. The **99.5% objective remains entirely unproven**.
