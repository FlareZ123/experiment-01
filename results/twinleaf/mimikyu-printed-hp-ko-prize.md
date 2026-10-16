# Source-printed Regidrago VSTAR Knock Out, two Prizes and bonus turn from Mimikyu Copycat

**Agent 1, 16 October 2026.** Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. [Manual-only CI 38863207837](https://github.com/FlareZ123/experiment-01/actions/runs/38863207837) **passed** at research commit `387236dd09be02b1816861862c22982df4e00e87`. Staged attack-resolution evidence, **not** legal-deck gameplay, qualified matchup wins or 99.5% progress.

## Why this is a new validation gate

The earlier [Fairy Zone damage test](../aichi-2026/champion-fairy-zone-copycat-contract.md) artificially increased Regidrago VSTAR's 280 printed HP to 400. This isolated the anticipated 300 damage but intentionally prevented checking the actual Knock Out and Prize-taking process. The separate [bonus-turn test](mimikyu-extra-turn-progression.md) used a 150-damage attack, also leaving the defender alive.

This integrated fixture keeps printed 280 HP and places one spare Basic Dratini on Regidrago's Bench. It retains six occupied face-down Prizes per player and nonempty decks to prevent a known artificial sudden-death reset. The attacking side has Active Mimikyu GRI with two Psychic Energy, Benched Lillie's Clefairy ex JTG providing Fairy Zone and discarded Dialga-GX UPR. The prior Regidrago VSTAR Apex Dragon history is injected (unlike the earlier two-declared-attack turn fixture), so the test focuses on the actual chosen Copycat attack and its full KO aftermath. Reversible research hooks enable Mimikyu to borrow the non-GX Apex Dragon and preserve Copycat's declared attack history.

## Observed pinned-engine sequence

The [executed script](../../simulation/twinleaf/mimikyu-apex-action-test.cjs) is invoked with `--printed-ko`. It uses real `Store.dispatch(new AttackAction(...,'Copycat'))`, chooses Dialga's Timeless-GX from the real `ChooseAttackPrompt`, then resolves each pending real prompt with its legal result.

| Stage | Direct observation |
| --- | --- |
| Immediately after nested attack choice | Regidrago has **300 damage on 280 HP**; one `WaitPrompt` remains; discard and Prizes not yet processed |
| After resolving the first WaitPrompt | Regidrago card enters defending player's discard; one `ChoosePrizePrompt` appears with `count=2`; attacking player's six Prizes still intact |
| Prize choice | Attacking player selects two occupied Prize slots; exactly **four** remain |
| Promotion | Defending player selects spare Benched Dratini via real `ChoosePokemonPrompt`; it becomes Active |
| Completion | No pending prompts; game turn advances **4 to 5** with attacking player active; `usedGX=true`, additional-turn flag remains armed, persisted declaration is **Copycat** |

Total: three WaitPrompts (including the initial KO-deferral prompt), one Prize choice, and one active-promotion choice were resolved. The source-printed Regidrago VSTAR is discarded; the 300 damage clears when the Pokémon leaves play, so post-resolution Active damage is correctly zero.

An initial snapshot reported 300 damage but no Prize change. That was **an incomplete asynchronous game state**, not evidence of a Twinleaf Knock Out bug. The attack had stopped at the pending WaitPrompt, before the end-of-attack KO check. The follow-on experiments made this distinction explicit and then asserted the complete contract.

## Reproducibility and limits

All steps use actual pinned Store actions and prompt reducers; the fixture preserves type identity for the relevant Pokémon, printed HP, Prize count, original prior attack and GX resource. [CI 38863207837](https://github.com/FlareZ123/experiment-01/actions/runs/38863207837) compiled the pinned submodule and passed the specific assertions alongside the existing Copycat regression suite. The earlier [CI 38862842938](https://github.com/FlareZ123/experiment-01/actions/runs/38862842938) independently reproduced the KO deferral and generated two-Prize prompt without resolving that prompt.

Remaining qualifications: this is a prepared-board fixture; it does not establish legal starting hands, evolution turns, search/discard access, protected abilities under opposing locks, a physically available prior Apex Dragon attack, actual game win probability, bot choice, opponent counterplay, or matchup field coverage. The separate [two-declared-attack actual-turn test](mimikyu-extra-turn-progression.md) establishes the preceding Apex Dragon identity and copied Timeless-GX bonus-turn progression, but it uses a surviving target. Combining *all* setup and effects through realistic complete-game decisions remains the evidence gate.

Source-context relevance: the 29 published Top-32 inventories include nine fully published Regidrago decks, and the champion Shadow Rider source includes Mimikyu, Dialga-GX and two Lillie's Clefairy ex. Nothing here implies the Regidrago opponent will expose this counterline or that it is reliably executable.
