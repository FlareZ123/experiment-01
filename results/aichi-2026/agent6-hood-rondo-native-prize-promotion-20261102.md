# Agent 6: native Stealthy Hood Rondo KO, two Prize cards and opposing promotion

**2 November 2026 | genuine pinned Twinleaf Store | four synthetic staged both-seat cases | 0 qualified games**

## Exact bounded question

When an uncharged Active Latias ex SSP with an attached Stealthy Hood UNB faces an opposing Active Iron Thorns ex TWM with Initialization, can it use its native Skyliner Ability to Retreat into a funded Benched Lillie's Clefairy ex JTG and execute Full Moon Rondo? Does Tool Jammer BST on that opposing Active prevent the same move? The question matters because the 29 authenticated original Aichi sixties include Tool Jammer in ranks3,6,7,24,29, Stealthy Hood in ranks2,3,15,32, and Latias ex in 14 ranks. This is a potential field interaction, not a naturally encountered original match.

Twinleaf pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` implements Tool Jammer with the operative Tool suppression commented out; [source-level explanation and 30-case Tool-family audit](agent6-tool-jammer-four-tools-native-30case-20261102.md). The reversible default-off [research ToolEffect guard](../../simulation/twinleaf/agent6-tool-jammer-tool-effect-guard.cjs) intercepts an unblocked opposing Active Tool Jammer and allows the engine's native `IS_TOOL_BLOCKED` helper to recognize the suppression. No vendor submodule file was modified.

## Experimental fixture and genuine action chain

The opt-in `runHoodAttackRepair()` in [agent6-skyliner-public-suppression-native.cjs](../../simulation/twinleaf/agent6-skyliner-public-suppression-native.cjs), env `AGENT6_HOOD_ATTACK_FOLLOWUP_DEV=true`, starts from a deliberately **hand-staged board**, not the original two shuffled decklists:

- Owner Active Latias ex SSP, no Energy, physically attached Stealthy Hood UNB.
- Benched Lillie's Clefairy ex JTG with two Basic Psychic Energy; four other owner Bench Pokémon.
- Opposing Active Iron Thorns ex TWM with 20 damage and the native Initialization Ability; five opposing Benched Pokémon including Pidgey MEW.
- Each side has six actual Prize-card positions (synthetic Psychic Energy). Under ordinary paper damage, Clefairy's Full Moon Rondo hits for 220 with ten Benched Pokémon, enough to Knock Out the damaged 230-HP Thorns.
- The paired opposition arm attaches Tool Jammer BST directly to the Thorns in the staged state.
- Entire four-case matrix is tested in the genuine Store in both source seats 0 and 1.

For each unjammed case, the researcher first checks actual native `IS_ABILITY_BLOCKED` and `CheckRetreatCostEffect` under the opt-in ToolEffect guard. The Store then receives a real `RetreatAction`, followed by a real `AttackAction('Full Moon Rondo')`. After the attack is accepted, the runner resolves genuine animation `WaitPrompt` instances via `ResolvePromptAction(waitId,null)`. It then validates and resolves the Store's actual `ChoosePrizePrompt` using two visible staged Prize-card objects, validates and resolves the opposing `ChoosePokemonPrompt` with the first physically present Benched Pidgey, and drains the subsequent wait prompts. Each prompt is taken from the actual Store, within a 16-step bound. No native attack, damage or KO is synthesized in the adapter.

For the Jammer case, the Store's true `RetreatAction` rejects the unfunded movement with its original cost of two Colorless Energy, and the runner never submits an attack. The prior public-only [Hood-aware Skyliner selector](../../simulation/twinleaf/agent6-skyliner-hood-vs-thorns-frontier.cjs) offers the same retreat only without the opposing Active Jammer.

## Results and artifact integrity

[Manually dispatched native CI 41480765122](https://github.com/FlareZ123/experiment-01/actions/runs/41480765122), compiled head `d8816df50ac244700f96b1e2b365601d386bebd3` (includes Agent6 Prize reporter correction `175bf48`), pinned vendor `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. [Artifact 13160240899](https://github.com/FlareZ123/experiment-01/actions/runs/41480765122/artifacts/13160240899), ZIP SHA-256 `00e5c3a11bfe2e5d3e127424d7e99d6c7961461a41c05c4559d6ae293a39a493`, downloaded and independently checked against GitHub's artifact digest; inner member `agent6-hood-attack-native.json`.

| Opposing Thorns | Physical owner seat | Actual RetreatAction | Actual Rondo attack | Two Prize cards taken | Opponent Active after settlement |
| --- | --- | --- | --- | --- | --- |
| Stealthy Hood protects against Initialization; no opposing Jammer | 0 | Accepted, free | Accepted, full 220-damage KO | Yes, 6→4 remaining | Pidgey MEW |
| Same | 1 | Accepted, free | Accepted, full 220-damage KO | Yes, 6→4 remaining | Pidgey MEW |
| Active opposing Tool Jammer disables Hood | 0 | Rejected, cost 2 with no Energy | Unattempted | No, 6 remain | Iron Thorns ex TWM |
| Same | 1 | Rejected, cost 2 with no Energy | Unattempted | No, 6 remain | Iron Thorns ex TWM |

Machine audit: **4/4 staged rows, failedChecks=0, actual pending prompts empty for all rows**, no native errors. Each positive has one actual owner Prize-selection prompt, one actual opposing promotion prompt and three actual wait/animation prompts resolved. The Knocked Out Iron Thorns ex is in the actual opponent discard in both positives.

### Crucial reporter bug corrected

In [CI41479938732](https://github.com/FlareZ123/experiment-01/actions/runs/41479938732), the genuine two-Prize selection and opposing promotion occurred but the hand-built reporter used `mine.prizes.length`, which stays 6 because the Store retains six Prize *slot* objects even after their contents are removed. That initial audit incorrectly marked two Prize outcomes false. The fix counts `mine.prizes.filter(slot=>slot.cards.length>0).length`; the rerun above yielded the expected 4 in each actual native settled case. The misleading reporter result is preserved in the earlier artifact; the successful corrected rerun is distinct, never silently overwritten.

## Strict boundary

This is a **staged mechanics-and-tactical-effect test**, with manually inserted Tools/Energy, synthetic Prize cards, an artificially already damaged Thorns and manually chosen opponent's replacement Pokémon. The opponent did not select a new tactical turn, and no original rank6/24/29 or rank30 printed 60-card decks were naturally dealt into this state. The test does not prove the deck line is routinely reachable, that the forced response is optimal, that full paper Expanded legality is certified, or that any full game is won. The native Tool Jammer from hand play remains a separate verification target.

The original baseline remains intentionally red, while the new opt-in test step is green. Leave the shared frozen bilateral v1 manifest and unchanged main actor intact; any integration requires a registered immutable next profile with native source plays and a genuine opposing continuation.

**Benchmark stop line:** 29 authenticated original Aichi Top32 printed sixties, ranks23/25/28 missing; zero competitively qualified full-paper games, no proved best fixed 60 and no demonstrated 99.5% win rate.
