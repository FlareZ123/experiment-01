# Agent29 independent archived v10 source-attack and opposing-return audit

**7 November 2026 | Independent postgame review requested by Agent36 | developmental native evidence only | zero qualified competitive games**

## Reproducible source

Existing, unchanged eight-arm rank6 v10 native run [42097805440](https://github.com/FlareZ123/experiment-01/actions/runs/42097805440), downloadable artifact [13446714975](https://github.com/FlareZ123/experiment-01/actions/runs/42097805440/artifacts/13446714975). Exact ZIP SHA256: `d594631b30fcb7370355ea91bd39b982755e231c4f41a245135cb41e0c3ab211`; the downloaded 36,679-byte archive and all three JSON SHA256 sidecars were independently checked:

- `agent5-v10-summary.json`: `52923b319f195f7747487dd9f9dfc8a59d34fba4ed0d9c7fe8e22e0365d36f11`
- `control-complete.json`: `05b7e999c26b34fe12981a160298383c95f31d387cd6e05b78bb70a1d40b13d3`
- `treatment-complete.json`: `d3bc7dba04defd223eedd2cde2d984c30c2f1efd425c10104857fbdc62e6115d`

The contemporaneous `agent5-v10-summary.json` does **not** have `treatmentSourceAttackSettlement` keys despite newer source code declaring them. This independent review joins `rows[].id` to `treatment-complete.json.attempts[].id`, and uses each archived `actualSourceAttackSettlement` instead of silently assuming the later schema.

## All eight registered arms

All eight control/treatment pairs have identical complete initial physical deals. All six nontarget rows have identical public accepted root tapes. Both target rows match their frozen registered source prefix through DCE attachment. The two targeted original source rank6 arms have source physical seat **0**, actual turn **2**.

| Original trial | Control → treatment disposition | Root counts control → treatment | Treatment accepted Volt Cyclone |
| --- | --- | --- | --- |
| `6:100:A:champion-reference` | returned-unqualified → returned-unqualified | 48 → 48 | No |
| `6:100:A:new-moon-lockbreaker-v1` | returned-unqualified → returned-unqualified | 48 → 48 | No |
| `6:101:B:champion-reference` | returned-unqualified → returned-unqualified | 48 → 48 | **Yes, ordinal 31** |
| `6:101:B:new-moon-lockbreaker-v1` | returned-unqualified → returned-unqualified | 48 → 48 | **Yes, ordinal 38** |
| `11:102:A:champion-reference` | returned-unqualified → returned-unqualified | 48 → 48 | No |
| `11:102:A:new-moon-lockbreaker-v1` | engine-error → engine-error | 14 → 14 | No |
| `11:103:B:champion-reference` | returned-unqualified → returned-unqualified | 48 → 48 | No |
| `11:103:B:new-moon-lockbreaker-v1` | returned-unqualified → returned-unqualified | 48 → 48 | No |

## Original source attack, physical consequence and real opposing action

**Rank6 against champion reference, `6:101:B:champion-reference`.** Accepted original-source `Volt Cyclone` `AttackAction` ordinal **31**, global turn **2**, settled through prompt completion root **35**. Native before/after public board shows opponent's Active **Latias ex**, damage **0 → 140**. Physical Prize counts were **[6,6] → [6,6]**. The original-source active Iron Thorns ex went from one Double Colorless Energy to zero; its own Benched Iron Thorns ex went from zero to one Double Colorless Energy. Hook receipt confirms **one actual settled mandatory DCE move**. The first accepted opposing nonprompt root in the immediately following global turn is **ordinal 36**, physical seat 1, `PlayCardAction` **Psychic Energy**, then ordinal **37 PassTurnAction**. `nextSourceSameEpochProven=true`; no replay reset intervened.

**Rank6 against New Moon, `6:101:B:new-moon-lockbreaker-v1`.** Accepted original-source `Volt Cyclone` `AttackAction` ordinal **38**, global turn **2**, settled through prompt completion root **42**. Opponent's Active **Mewtwo & Mew-GX** changed damage **0 → 140**. Prize counts again **[6,6] → [6,6]**. The same physical Active-to-own-Bench Double Colorless Energy movement is corroborated by the hook and public board. The first accepted opposing nonprompt root is **ordinal 43** on next global turn **3**, seat 1 `PlayCardAction` **Psychic Energy**, followed by ordinal **44 PassTurnAction**. `nextSourceSameEpochProven=true`.

Both target controls played Double Colorless Energy on the original source turn 2 and then **passed** without the added Thunder Mountain/Volt Cyclone line. The treatment added the accepted Stadium, attack, and printed mandatory Energy move. In each treated arm an opposing physical Energy attachment and Pass followed. That is a real same-epoch Store response, although **neither opponent attacked or produced a tactical counter in its next turn**. It is not evidence of independently strong opponent policy.

## Corrected classification and limits

The existing hook's `opponentResponseObserved=true` is insufficient alone because it can be set when control passes into an opposing prompt. Independently joining the archived real root tape establishes the stronger narrow fact: **both opposing players executed a real accepted Energy attachment and Pass**. The public attack recorder establishes **two attacks with settled prompt chains, actual 140 damage, and real opponent follow-through**. Both took zero Prizes. This is at most a source-line-plus-weak-native-response witness; it does **not** meet the meaningful adversarial opponent-response, complete-game, paper-fidelity, independent policy, or official 25-minute-clock gates required for competitive qualification. All eight attempts are capped or errored with **zero competitively qualified games**, and no win-rate inference follows.

**Reproduction:** extract the artifact, verify its ZIP and three sidecar SHA256 hashes, join `agent5-v10-summary.json.rows` with `treatment-complete.json.attempts` on exact `id`, examine `actualSourceAttackSettlement.attacks` and the `nativeSourceOwnerLineAudit.acceptedStages`; confirm `actionOrdinal`, `completionRootOrdinal`, `settledPromptChain`, `publicBoardBefore/After`, `prizesBefore/After`, `nextSourceSameEpochProven`, `nextSourceRoot`, and next-turn root actions. Never infer a next-root settlement from the hook's bare boolean.

Benchmark status remains 29/32 authenticated name/count original 60s, ranks 23/25/28 missing, no selected final deck, no evidenced 99.5% win rate.
