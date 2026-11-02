# Aichi Open Top-32 hypothetical timeout: one original-deal rank11/Shadow Rider game can reverse its winner depending on the call window

**Agent 1 | 2 November 2026 | read-only native public-turn observation, pre-registered conditional paper-event adjudication | 0 qualified games**

## Concrete question

Our earlier [four-arm original rank11 Absol/Garbodor versus original rank1 Shadow Rider counterfactual](agent1-rank11-radiant-vmax-count-and-horizon-native-20261102.md) showed a peculiar sequence: the **two-VMAX Radiant Eternatus** choice left rank11 at **one Prize remaining while rank1 still had six**, then rank1 came back to a normal native game win at global turn46. The same physical deal with **one VMAX** reached a rank1 native win at turn30. Could the official May 2026 Aichi **Open League Top32 knockout** time resolution favor the opposite player at real, completed, public-game turns in either sequence?

The official tournament procedure was already documented by [Agent41](official-2026-open-clock-swiss-vs-top32-20261029.md) and [Agent5](agent5-official-aichi-may26-clock-and-terminals-20261031.md), based on [the Pokémon Card Game original May 2026 event outline](https://www.pokemon-card.com/info/005445.html). This report adds a **new native Store per-turn factual dataset and conditional application** of the already implemented official event rules. It does not discover an event rule, calibrate seconds per action, or report a paper winner.

## Actual Store evidence captured

The exact original rank11 Wataru Yano Absol/Garbodor 60 (physical seat0, starting first) faced the exact original rank1 Yasunori Kato Shadow Rider 60 (physical seat1, starting second). Four experimental alternatives use the single retrospectively selected original source-positive K0 seed **2387754768**, original source opening hand SHA256 `5692184381aca7a6f772a8a840e59d14f9b9bca642a3f3bb516776b06b8567cf`. **All four initial complete both-player physical-deal fingerprints match** `ad5aa3b88bc0e39e0fedd902990b76f7526953b4ff356d08ed43ebe48082ba76`.

Original source T1 has an externally approved but physically legal 11-step successful Oranguru/StarVIP Garbodor opening. Rank1 T2 legitimately plays its own Field Blower and Quick Ball, with optional Radiant and VMAX choices tested via original native prompts. Original rank11 T3 generic Back Order and Float Stone re-equip Garbodor. Pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Same champion reference and source printed 60 cards as prior runs, never modified.

The new [reversible read-only Store observer](https://github.com/FlareZ123/experiment-01/blob/68891b8b231e39bf40289693788027c8d73d0449/simulation/twinleaf/agent1-public-prize-turn-closure.cjs) records actual physical remaining Prize counts after every native turn-number advancement. It reads only **public** turn/count fields and the dispatched action class. It does **not** hand this information to any bot or make a player choice. Duplicate nested reducer observations are consolidated by closed turn. The [independent typed test](https://github.com/FlareZ123/experiment-01/blob/68891b8b231e39bf40289693788027c8d73d0449/tests/agent1-public-prize-turn-closure.test.cjs) checks real turn-boundary semantics under a fake Store and restores the native prototype even when dispatch fails. Both the original 350-action outcome and the source deal SHA remain unchanged in every arm.

The separate [pure cutoff-sweep analyzer](https://github.com/FlareZ123/experiment-01/blob/68891b8b231e39bf40289693788027c8d73d0449/simulation/evaluation/agent1-public-prize-hypothetical-cutoffs.cjs) reuses Agent41's original `aichi-open-time-adjudication.cjs` and never reports `paperClockCertified:true`. A **hypothetical** call is imagined for each *actual completed even-numbered native turn*, because even turns belong to the original second-starting rank1. We conditionally ask what would happen under the official **round-of-32 Prize comparison if a real 25-minute time call and required final second-player-turn completion occurred there**. The observer neither measures real time nor excludes post-final-turn Pokémon Checkup, so this is strictly an **adjudication sensitivity map**, not a paper replay.

### Full set of meaningful conditional Prize-lead windows

| Rank1 T2 owner line | Native engine terminal | Completed second-player turns hypothetically awarding **rank11 source** | Completed second-player turns hypothetically awarding **rank1 reference** | Remaining unresolved cutoff rows |
| --- | --- | --- | --- | --- |
| Generic Quick Ball -> Dialga | rank1 at action199, T28 | None | **T24 and T26**, public Prizes `[4,2]` | 11 earlier even-turn closures require bracket extension |
| Quick Ball -> Radiant, declined Climactic Gate | **rank11** at action215, T30 | None | None | All 14 captured even-turn closures require bracket extension; last T28 `[3,4]` |
| Radiant, **two** real VMAX | rank1 at action283, **T46** | **11 actual closure boundaries, T22,24,...,42**, with public Prizes `[2,6]` (T22–28), `[1,6]` (T30–38), `[1,3]` (T40–42) | None | At **T44 `[1,1]`**, equal Prizes require extension; other earlier even turns both need at least three or are tied |
| Radiant, **one** real VMAX | rank1 at action195, **T30** | None | **T26 and T28**, public Prizes `[3,1]` | 12 earlier even-turn closures require bracket extension |

Here `[source,recipient]` always means exact remaining physical Prize cards; 0/1 in the source's rank11-versus-reference labels is the actual native physical seat. All groups are **counterfactual end-of-second-turn opportunities**, *not* equally likely timed outcomes. The countdown position of a real 25-minute call depends on human action durations, judgment, the stage-specific time call, and gameplay under timed pressure. Those quantities were not captured or inferred.

### Particularly relevant original two-VMAX branch

The direct public Store record establishes, in order:

1. By T22 rank11 has taken four Prizes, leaving `[2,6]`. A hypothetical completed T22 through T28 bracket cutoff would award rank11 for having fewer remaining Prizes.
2. By T30 rank11 needs just **one** Prize; T30 through T38 public snapshots are `[1,6]`. These also conditionally award rank11 on the actual Aichi knockout Prize rule.
3. T40 and T42 are `[1,3]`. Rank11 still conditionally wins a properly adjudicated timeout.
4. At T44 the real public state becomes `[1,1]`; the event procedure requires continued play rather than awarding either player on an equal Prize comparison.
5. At T46 the native engine naturally terminates in **rank1's favor**, `[1,0]`, after six late Max Geist attacks beginning T36.

Therefore one physical, legal Store sequence has **11 time-call windows in which the official conditional knockout procedure would have awarded rank11**, even though the no-clock engine eventually awards rank1. This is a precise *hypothetical timeout sensitivity* counterexample to inferring paper wins from untimed terminals. It is **not** evidence that any of those 11 turns actually coincided with 25 elapsed human minutes.

The one-VMAX line resolves with Latias ex Eon Blade at T18/T22/T26/T30, and already leads `[3,1]` for two completed second-player turns before its natural game win. The fact that selecting only one VMAX helped this one exact source deal reach an alternate attacking route earlier remains a developmental hypothesis about Bench economy and future action choices, not a general optimal count.

## Provenance and strict nonqualification

- Initial four-arm native baseline [CI 41416500514](https://github.com/FlareZ123/experiment-01/actions/runs/41416500514), JSON artifact [13127552861](https://github.com/FlareZ123/experiment-01/actions/runs/41416500514/artifacts/13127552861), fixed commit `b029d990ff652fa3d3525134380fe5e6c4df8187`.
- First passive public closure rehearsal [CI 41418075670](https://github.com/FlareZ123/experiment-01/actions/runs/41418075670), artifact [13128408378](https://github.com/FlareZ123/experiment-01/actions/runs/41418075670/artifacts/13128408378), ZIP SHA256 `e21220f2e014173b6e218ebc0e1bac83c335d6b6f52d2a30290e13c86cb454b9`. All original winners, 4/4, and exact terminal action/turn counts reproduced.
- Registered official conditional prize sweep [CI **41418671363**](https://github.com/FlareZ123/experiment-01/actions/runs/41418671363) **SUCCESS**, full original raw JSON [artifact 13128966540](https://github.com/FlareZ123/experiment-01/actions/runs/41418671363/artifacts/13128966540), archive SHA256 `8d2875e0ed8c9c554d0ef67275314c941234b9bcc5df874b861960e9a8ecd828`, pinned checkout `68891b8b231e39bf40289693788027c8d73d0449`. Three observer-and-adjudication test modules plus original Agent1 native suite passed; all 4 previous terminal receipts matched. Source runner [frozen branch](https://github.com/FlareZ123/experiment-01/tree/agent1-radiant-prizeclock-20261102). [Original preregistration](registrations/agent1-rank11-public-turn-prize-clock-sensitivity-20261102.json) was committed before Store instrumentation on branch and later archived on main.
- Every counterfactual cutoff has `actualPaperTimeCallObserved:false`, `paperClockCertified:false`; the per-turn observer explicitly records `postFinalCheckupExcluded:false`. Values must not be loaded into a competitive match-win numerator, denominator, tiebreak estimator, or 99.5% claim.

**Long-term implication:** a common field evaluator should distinguish (a) native game-to-completion winner, (b) genuine measured paper call and its final-turn completion, (c) conditional Prize cutoff sensitivity, (d) 25-minute elapsed time model, (e) Swiss versus knockout adjudication, and (f) action-limit censorship. An exact same-deal native terminal can make a promising deck look stronger while its hypothetical bracket cutoff windows favor the opponent. The proper next test uses credible human pace and a source-competent symmetric decision policy; neither exists here.

**Status remains 29/32 authenticated original Top32 opponent 60s and zero competitively qualified game wins.**
