# Agent 7: original rank 6 Shadow Mist lock-window sequence in a 96-root source game

**5 November 2026. Retrospective source replay. Native Store root sequence confirmed; printed effect and hypothetical arithmetic only. Competitive games qualified: zero.**

## Research question

Does the steward-selected bilateral evaluation already contain a candidate-side, game-state-continuous opponent denial line with an immediate original-source response, and does extending the native action cap turn that line into a Prize or game result?

The original rank-6 Iron Thorns source, seed 100, source seat 1 versus the **unchanged champion-reference 60** shows a remarkable *public selected-root sequence*, even though neither the chosen 48-root profile nor the retrospective 96-root extension produces a complete match. The relevant card is Shadow Rider Calyrex V (Chilling Reign, `swsh6-74` and print variants); its **Shadow Mist** attack costs one Psychic Energy, declares **10 damage**, and says that during the opponent's next turn they cannot play Special Energy or Stadium cards from their hand. This is an effect on the opposing player when the attack actually resolves, not a general ban on other actions. The attachment-only original rank-6 source has substantial Special Energy exposure in its printed list, making that attack potentially relevant. The exact native player-restriction flags and the source's hand-legal alternatives still require independent physical/state verification.

## Authentic immutable evidence

- Steward-selected native **48-root** v4 archive: [run 42057548673](https://github.com/FlareZ123/experiment-01/actions/runs/42057548673), [artifact 13429583493](https://github.com/FlareZ123/experiment-01/actions/runs/42057548673/artifacts/13429583493). Uncompressed `issue25-steward-v4.json` SHA-256 `4301660d49f7308c2910b665d17a547f6f8ed7c189d8b8d2e7a669983d37386e`.
- Same original registration, **retrospectively extended 96-root** control/treatment archive: [run 42054155507](https://github.com/FlareZ123/experiment-01/actions/runs/42054155507), [artifact 13429450224](https://github.com/FlareZ123/experiment-01/actions/runs/42054155507/artifacts/13429450224). Uncompressed `agent4-issue25-capture-retro96-source-roots.json` SHA-256 `6e1190d120569131bfe0b0cfae75ad593ecbd93dbd9fd20b60c2ae8f68194100`. Read this as an independent frozen retrospective branch. The original selected limit remains 48.
- Genuine original attempt ID in both files: `6:100:A:champion-reference`; physical source seat **1**, candidate seat **0**; source initial-deal fingerprint `700f0f6e1fa884906c79cf2275741f036d212428fae01c8f2c132dc9ada086b2`. The 96-root *control* and *Capture-treatment* versions have identical 96 public root rows, exact same physical source and complete original-deal fingerprints, and the same unqualified cap disposition. Hence the observed line is stable under this particular null treatment; it is not a fresh sample or independent opponent outcome.

The 96-root public ledger records source-seat1 **Speed Lightning Energy** placement at global turn 1, root ordinal 13, followed by its normal Pass at 14. Candidate seat0 attaches Psychic Energy (ordinal 17) and announces Shadow Mist at global turn 2, ordinal 18. All remaining 96-root nonprompt actions are exclusively ten candidate Shadow Mist declarations, the source's Pass actions, and the candidate's other card plays.

| Consecutive candidate Shadow Mist attack | Native root ordinal | Global turn | Next original-source Pass ordinal / turn |
|---:|---:|---:|---|
| 1 | 18 | 2 | 22 / 3 |
| 2 | 25 | 4 | 29 / 5 |
| 3 | 32 | 6 | 36 / 7 |
| 4 | 39 | 8 | 43 / 9 |
| 5 | 47 | 10 | 51 / 11 |
| 6 | 55 | 12 | 59 / 13 |
| 7 | 68 | 14 | 72 / 15 |
| 8 | 76 | 16 | 80 / 17 |
| 9 | 83 | 18 | 87 / 19 |
| 10 | 90 | 20 | 94 / 21 |

The original rank-6 source has **ten post-Shadow-Mist consecutive turns with Pass as its only voluntary nonprompt action**, from turns 3 through 21. Across all 96 accepted root actions, there are **68 prompt resolutions**, including **53 Wait prompts**, 11 source Passes (including the pre-Shadow-Mist turn 1), ten candidate Shadow Mist attacks, and seven card plays total. The source has exactly **one** public `PlayCardAction` (the opening Speed Lightning), **zero** `AttackAction`, and **zero** subsequent card plays through its turn 21. The last state remains capped, `finished:false`, with no native winner. The 48-root archive contains the first five Shadow Mist declarations and the first four source responses, with the fifth attack at its final accepted root.

## Paper damage and tempo interpretation, conditional

The uploaded card database identifies Iron Thorns ex (`sv6-77`) as **230 HP**, weak to Fighting, and Shadow Rider Calyrex V's Shadow Mist as **10 base Psychic damage**. In the *hypothetical* case of a fresh 230-HP active Iron Thorns ex, no other damage, no modifiers/healing and all ten hits on that same Pokémon, ten attacks would contribute 100 damage. Twenty-three such attacks would be required to Knock Out one 230-HP Iron Thorns ex, leaving thirteen nominal attacks after this observed ten-attack sequence. **The public ledger does not report the actual Active Pokémon's full damage evolution or attack-effect application, so 100 damage/130 remaining HP is illustrative arithmetic, not a measured Store damage outcome.** A Prize route could involve other attacks, targets and switching; the 23-hit calculation is strictly this hypothetical tactic.

This line illustrates a potentially valuable decision tension: denying Special Energy and Stadium plays with a 10-damage attack may prolong source inability to act, but remaining on the same low-damage attack consumes many active turns and is not by itself proof of an attainable timed six-Prize win. Also, the source's actual Pass does **not** establish that an available non-Special-Energy play was absent; a weak bot can pass despite legal plays. We have verified a sequence of accepted attack declarations and opponent replies, **not** a causally verified forced lock, exact rule-flag persistence, printed damage settlement, official 25-minute adjudication, strategy dominance, or completed game.

## Concrete next acceptance experiment

On the **same genuine physical source state** immediately before each original rank-6 Pass, add a read-only, owner-safe observation of (a) the *actual* player's `cannotPlaySpecialEnergyCards` / `cannotPlayStadiumCards` flags, (b) count of Special Energy and Stadium cards genuinely held in that player's hand, (c) whether a held printing would otherwise meet ordinary attachment/Stadium conditions, and (d) any independent legal public escape (attack, switch, basic attachments or other Trainer). Record the attached Energy and Active HP after each settled attack. Do not read the opposing player's hidden cards from the wrong actor's decision context, and do not alter the steward-selected v4/v5 profile when adding a diagnostic. Re-run with both player seats, preserve 48 versus 96 caps separately, and only call the lock *forced* if a paper-legal option is demonstrably removed from that source state. A later native opponent decision and attack/Prize settlement must be verified separately.

**Result:** a credible retrospective public sequence of **10 declared attack → original-source Pass** windows, but zero competitively qualified games, no native terminal, and no 99.5% inference.
