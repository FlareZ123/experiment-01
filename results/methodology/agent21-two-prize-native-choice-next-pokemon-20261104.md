# Native ordinary KO Prize selection: two concealed Prize slots, no face read

**Agent 21, 4 November 2026.** The native test of a narrow owner-only first-occupied Prize response advances a rank5 historical game from attack animation to the next field-position prompt. Neither game is complete and neither counts toward win-rate evidence.

## Native evidence and pin

- Existing manual [CI run 41769584851](https://github.com/FlareZ123/experiment-01/actions/runs/41769584851), **SUCCESS**, checkout `f57b7304ab97845e7e43c5f1e921f0de8f926d4a`, [artifact 13293529701](https://github.com/FlareZ123/experiment-01/actions/runs/41769584851/artifacts/13293529701). ZIP SHA-256 `4dc153c96943af2d855954391d8ad3645fed32b41358ca0c73bb4c7e8847c6a0`, inner JSON SHA-256 `b1a0bb8e19539f9047f1683a3e9896414baed27fb2ebd1921e9fec52ab5602a7`.
- Exact original rank5 registered two candidate arms for each physical source seat and original pre-registered physical-seed groups, inherited prototype restored on exit. Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- New [owner-only ordinary Prize selector](../../simulation/twinleaf/agent21-owner-first-prize-reveal.cjs) and [unit controls](../../tests/agent21-owner-first-prize-reveal.test.cjs), matching the pinned [ChoosePrizePromptResolver](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/prompt-resolver/choose-prize-prompt-resolver.ts). It matches only owner `CHOOSE_PRIZE_CARD` prompts with `useOpponentPrizes:false`, no blocked slots, noncancellable, one to six Prizes, and validates the selected actual Prize objects under the native prompt. It inspects only own physically occupied Prize slots, never their identities, never the opponent's concealed zones.

| Source rank5 physical seat | Proof of actual native Prize response | First subsequent unsupported native prompt |
| --- | --- | --- |
| 1, group `5:0:A` | None reached before boundary | Seat 0, turn 2 `phase:2` PLAYER_TURN, nonvisual `WaitPrompt` with exact public message `Deck shuffle animation` |
| 0, group `5:0:B` | Seat 1, turn 6 `phase:3` ATTACK, native `CHOOSE_PRIZE_CARD` **requested 2**, **6 occupied slots**, **2 selected**; native validation passed | Seat 0, turn 6 `phase:3` ATTACK, `ChoosePokemonPrompt` |

The first genuine owner Prize response comes after the exact accepted `Attack animation` wait from the [previous stage](agent21-owner-animation-barrier-turn2-turn6-20261104.md). It supplies a real native transition through a two-Prize-taking decision, although the subsequent changes to the player's hand and Prize stacks have not been fully independently audited from the original source physical deal. This fixed first-occupied choice is a legal-information baseline, potentially suboptimal once K1 Prize knowledge exists. No claim is made about optimal Prize selection or final game outcome. **The generic raw-State decoder executed zero times** before typed fail-closed stoppage.

Next source-seat0 frontier: inspect pinned `ChoosePokemonPrompt` semantics (promotion after KO versus attacks that gust/switch, board availability and legally eligible Active Pokémon). Choose with owner-only public board information and validate on actual native Store, or keep fail-closed. Opposite source-seat1 frontier: exact pinned silent shuffle wait, already implemented and separately dispatched via manual `first-owner-with-prizes-and-shuffle` variant.

**Qualification remains 0 competitive games**, 29/32 source inventories, no prospective common-field release, no paper-clock confirmation, no proven 99.5%.
