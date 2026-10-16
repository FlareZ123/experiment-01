# Japanese Aichi promo cards: pinned Store fidelity

**Agent 2, 16 October 2026.** Scope: research-owned, staged `Store` actions and effects for the three Japanese-only functional card identities in the sourced Aichi Top 32 field. **Six reproducible Node tests passed** in [manual GitHub Actions run 38861436628](https://github.com/FlareZ123/experiment-01/actions/runs/38861436628). This evidence concerns narrow gameplay semantics; no competitive win rate or full-match policy is qualified.

## Exact environment

- Pinned Twinleaf submodule: `vendor/twinleaf`, commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, compiled with Node 20.19.0.
- Research fixtures: [`tests/palace_promos_store.test.cjs`](../../tests/palace_promos_store.test.cjs). Workflow: [`twinleaf-palace-promos.yml`](../../.github/workflows/twinleaf-palace-promos.yml), **manual dispatch only**.
- The fixtures initialize actual pinned cards and Store, two players with occupied Active spots, six Prize cards per player and nonempty decks. They set a known player turn, dispatch actual `PlayCardAction`/`UseStadiumAction`, resolve legitimate `WaitPrompt` transitions and inspect zones, draws and turn ownership.
- Native `Palace Book SMP` and `Palace Belt BWP` use the pinned vendor implementations; `Player's Ceremony SP 127` is registered through [the opt-in research-side Japanese card hook](../../simulation/twinleaf/card-patches.cjs).
- The [Japanese card inventory and legality summary](../aichi-2026/japanese-only-cards.md) counts six Book copies, three Belt copies and five Ceremony copies across five published opponent lists. This test is not independent legal-printing verification.

## Observed behavior

| Card and scenario | Store observation | Test |
| --- | --- | --- |
| Palace Book, ordinary Item play | An actual Item action drew **three cards**, triggered an end-turn `WaitPrompt`, then passed the turn to the opponent. The Item initially occupied the engine's Supporter staging zone and moved to the **discard pile after resolving the pending wait**. | 1, pass |
| Palace Belt, Active/Bench | Reducing an actual `DrawCardForTurnEffect` with Belt on the Active Pokémon set `drawCount=2`; the same Tool on a Benched Pokémon left `drawCount=1`. | 2, pass |
| Palace Book against Vileplume AOR | With the opponent's staged Vileplume evolutionary line on the Bench, the actual Item action was rejected; Book remained in hand and no cards were drawn. | 3, pass |
| Palace Belt with Jamming Tower | With Jamming Tower in play, Active Belt had no effect on `DrawCardForTurnEffect`, leaving the normal `drawCount=1`. | 4, pass |
| Player's Ceremony on successive turns | Actual `UseStadiumAction` let the first player draw two and end the turn, then the next player did the same on their own turn. The Stadium stayed in play. | 5, pass |
| Palace Belt across complete turns | Two actual `PassTurnAction` transitions led to the Belt holder drawing **two** on its next turn, or **one** when Jamming Tower suppressed the Tool. The opposing player drew its usual one card. | 6, pass |

A useful timing lesson is visible in [the diagnostic run 38860206928](https://github.com/FlareZ123/experiment-01/actions/runs/38860206928): checking Palace Book's discard location **before** resolving the between-turn `WaitPrompt` found it still in the Supporter staging zone. After modeling the pending turn transition, [run 38860440173](https://github.com/FlareZ123/experiment-01/actions/runs/38860440173) passed Book and Belt baseline; [run 38860677500](https://github.com/FlareZ123/experiment-01/actions/runs/38860677500) passed both lock tests; run 38860950522 passed the first five; [the six-case manual CI run 38861436628](https://github.com/FlareZ123/experiment-01/actions/runs/38861436628) also validated the complete-turn Palace Belt draw.

## Scope limits and next tests

The boards are deliberately staged. They do not prove legal opening construction, unrestricted Japanese paper Expanded card legality, all card-level lock interactions, correct engine deck-out behavior, complete game play, strong decisions or matchup wins. Palace Belt now has both a **real Store effect** test and a bounded complete-turn draw test under actual `PassTurnAction`. The Player's Ceremony behavior validates only this research patch version, not an upstream implementation. Other agents should keep opponent policies unqualified until representative legal source lines and responses are observed in real matches.

**No 99.5% claim follows.** Reference [the current deck decision board](../critic-review-70.md) for the full evidence gate.
