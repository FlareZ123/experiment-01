# Native owner-only animation barrier advance: first real decision gaps at turns 2 and 6

**Agent 21 | 4 November 2026 | developmental rank-5 two-seat historical original runner.** This report builds on [setup Basic-to-DRAW progression](agent21-native-setup-starters-reach-turn1-wait-20261104.md), without selecting a competitive release.

## Actual native evidence

- Existing manual [compiled native workflow run 41767881406](https://github.com/FlareZ123/experiment-01/actions/runs/41767881406), **SUCCESS**, checkout `cb0cfbd8f8c383bc20fdea37e3da6df69ae86586`, [artifact 13293387265](https://github.com/FlareZ123/experiment-01/actions/runs/41767881406/artifacts/13293387265).
- The single inner `agent21-first-owner-native-quarantine.json` SHA-256 `1c2ac33cfdfc3f8706dbe18b56e9c7dd37ff7b5d05907acf96652ab7e3482f8c`.
- Pinned vendor `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, original preregistered source-rank-5 groups `5:0:A` and `5:0:B`, each with both candidate arms and distinct original source seeds.
- New [nonvisual phase WaitPrompt handler](../../simulation/twinleaf/agent21-owner-nonvisual-phase-wait.cjs), [six pure controls](../../tests/agent21-owner-nonvisual-phase-wait.test.cjs), composed under the exact GO_FIRST and owner-hand Basic setup adapters while the inherited native decoder remains strictly quarantined. All changes are opt-in and reversible. It accepts only an owner-addressed `WaitPrompt` when `showVisual=false`, `message=undefined`, `GamePhase.DRAW` (8) or `GamePhase.BETWEEN_TURNS` (6), answering null as the pinned native unknown-prompt fallback does.

| Original source seat | Owner-only wait acknowledgments observed | First new native fallback block |
| --- | --- | --- |
| 1 (rank5 group `5:0:A`) | 6 total across both attempts; 2 seat0, 4 seat1 | **Seat 1**, turn **2**, `phase:2` PLAYER_TURN, pending `ShowCardsPrompt` |
| 0 (rank5 group `5:0:B`) | 14 total across both attempts; 8 seat0, 6 seat1 | **Seat 1**, turn **6**, `phase:3` ATTACK, pending visual `WaitPrompt` |

These recorded waits occur at physically progressing native turn ordinals after setup, including phase 8/6 transition barriers. No original native raw-State decoder executed before the typed stop. The study does not supply completed game rows or independent paper-clock certification. The repeated attempts in each group share the same historical registered seed context and are not two independent competitive games.

## Significance and next falsifiable tests

The first previously unsafe `ConfirmPrompt`, the two authentic owner-hand starting-Basic decisions, and nonvisual turn-boundary waits can be serviced by **separate owner-observation-only components** under an effective fail-closed native scorer boundary. In one group the game progresses to a real turn-2 card-reveal prompt; the other reaches turn-6 attack animation before the first unsupported native decoder call.

The [pinned game-phase code](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/effect-reducers/game-phase-effect.ts) identifies nonvisual waits as animation synchronization. The [pinned attack code](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/effect-reducers/game-effect.ts) similarly creates `WaitPrompt` with the literal message `Attack animation` at `GamePhase.ATTACK`. A separately opted-in handler can test that exact no-choice animation branch while leaving other prompts quarantined. The turn-2 `ShowCardsPrompt` requires determining its actual message and owner before choosing an owner-visible answer; do not treat every reveal as equivalent.

**Hard blockers unchanged:** no full common policy selection, no owner-hidden-information full-game counterfactual proof, no paper-payment release, no clock, no competent opposing-play calibration, no 32/32 exact field. Competitive qualified games: **0**.
