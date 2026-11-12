# Hood Shield versus champion: attack-sequence audit of the three champion-favorable reversals

**Agent 7, 12 November 2026.** Post-hoc descriptive audit of the already completed 116-game native development run. No games were rerun and no candidate inventory was changed.

## Evidence and scope

- GitHub Actions run: [42578010606](https://github.com/FlareZ123/experiment-01/actions/runs/42578010606), artifact **13656062292** (\`agent3-hood-vs-shadow-all29-native\`).
- Registered field: 29 exact published source 60s, 58 source groups, ranks 23/25/28 explicitly missing.
- Pinned Twinleaf: \`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05\`.
- Experiment code revision: \`ba5c02bf5741daefd7befe31cdc0d515ed080eac\`.
- Compared fixed lists: champion-reference and Hood Shield v1. The old common policy did not install the later candidate-only Hood/Arven policy.

This audit isolates the six native games for source ranks 7, 11, and 12—the three ranks with champion-favorable winner reversals in the report. Outcomes remain developer-policy native outcomes, not paper-qualified competitive games.

## What the six games actually did

| Source rank / archetype | Registered slot | Champion result | Hood result | Champion Max Geist | Hood Max Geist | First VMAX play, champion / Hood |
| --- | --- | --- | --- | ---: | ---: | --- |
| 7 Snorlax Stall | A | loss | loss | 2 | 0 | turn 4 / turn 4 |
| 7 Snorlax Stall | B | win | loss | 2 | 0 | turn 3 / turn 3 |
| 11 Absol Garbodor | A | win | loss | 2 | 0 | turn 8 / none |
| 11 Absol Garbodor | B | win | win | 0 | 2 | turn 8 / turn 4 |
| 12 Regidrago | A | win | loss | 3 | 0 | turn 17 / turn 29 |
| 12 Regidrago | B | win | win | 0 | 0 | none / none |

**The old Hood policy made zero accepted Stealthy Hood plays and zero Arven plays in all six Hood candidate games.** The two new cards' intended counterline was never exercised in this cohort.

The attack sequences expose a second, separate policy limitation:

- **Rank 7, slot B:** the champion candidate made two Max Geist attacks and won; Hood made no attacks and lost. Slot A's Hood arm managed only one Shadow Mist attack, versus two Max Geist plus one Shadow Mist for the champion.
- **Rank 11, slot A:** Hood used Mimikyu's Filch 15 times and never attacked with Shadow Rider; the champion used six Filch attacks followed by two Max Geist attacks and won. In slot B, Hood did reach two Max Geist attacks and won.
- **Rank 12, slot A:** Hood used Marshadow's Red Knuckles **20 times**, played Shadow Rider V only on turn 27 and VMAX on turn 29, then made no Max Geist attack. The source made seven Cruel Arrow attacks with Fezandipiti ex and won. The champion arm played Tapu Lele-GX on turn 9, Shadow Rider V on turn 15, VMAX on turn 17, and made three Max Geist attacks; it won. Slot B was won by both lists using 15 Energy Drive attacks.

Across these six groups, the champion arm made **nine Max Geist attacks**; Hood made **two**. This is not proof that the fixed Hood list is weaker: the same old policy was not competent at activating its Hood/Arven package, and the observed sequence mixes list composition, random physical draws, and policy behavior. It does show that the 9 November aggregate cannot isolate the value of the Hood slots.

## Decision-changing implication

Do not respond to these reversals with another cosmetic card swap or by attributing the result to Stealthy Hood. Treat the old comparison as a **deck-plus-policy** comparison. The next integrated candidate policy needs to demonstrate, on owner-visible information and under native validation:

1. Early Shadow Rider setup when a V/VMAX line is actually available, rather than defaulting to a low-impact tech Basic.
2. A coherent VMAX energy/promotion/Max Geist line when it is payable; a VMAX merely appearing on the Bench is not enough.
3. Conditional Arven-to-Hood and Hood attachment when a live opposing Ability lock makes the protection useful, without spending the Supporter on irrelevant turns.
4. A functional alternate attacker line when the Shadow Rider route is unavailable.

The existing Agent41 Hood candidate-options work and the V3 runner integration are the appropriate place to test this as one candidate role, not as another detached micro-helper. The first full-state fixture still requires the owner-controlled diagnostic public-key variable; this report does not authorize dispatch or substitute for that prerequisite.

## Limits

- Post-hoc, six selected source groups; not an independent holdout.
- The source lists are the exact registered printed lists, but missing ranks 23/25/28 remain absent.
- The common policy was not the later candidate-only Hood/Arven policy.
- Native engine/policy outcomes are not paper-qualified games.
- No matchup win-rate estimate, fixed-deck promotion, or 99.5% claim follows.

**Conclusion:** the most actionable weakness exposed here is candidate-policy competence—early Shadow Rider access and conversion into actual Max Geist attacks—while the anti-lock package was never activated. Integrate and evaluate a competent candidate policy before deciding whether Hood Shield's deck construction deserves promotion or cuts.
