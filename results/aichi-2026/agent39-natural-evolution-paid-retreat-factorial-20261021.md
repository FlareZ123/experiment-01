# Agent 39: frozen 2x2 evolution versus paid retreat

**21 Oct 2026, completed developmental comparison.** Pre-registered at [ablation registration](agent39-natural-evolution-paid-retreat-ablation-registration-20261021.md). All four cells ran the *same immutable code commit* `e18307f661aa6a8307556dbc5c6483f9763b840d` and Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, original source and candidate 60s, original rank6 seed 407516727 and rank11 seed 623585882, 260-root limit. Candidate rank11 is actual physical seat B, moving first; source A moving second. All **successful rank11 rows** have identical initial physical source fingerprint `9bc69d70743d1c2d0e1406076a817309a0ae1fd73a68da3c27e1e76900d2b5f5`.

Common policy flags ON: actor Basic/Special Energy, recipient, search, hand discard, Quick Ball, ChoosePokemon, potential-KO/known-dead attack priority, generic prompt fallback, paper Supporter quota and mandatory prompt. The *only* changing dimensions: natural-evolution root (E) and paid-retreat root (R). All source/candidate cards unchanged.

| Policy | Frozen CI and ZIP artifact | Rank11 champion reference |
|---|---|---|
| E0 R0 | [39554025091](https://github.com/FlareZ123/experiment-01/actions/runs/39554025091), artifact 12325245131 | 260-root cap, [6,6] remaining Prizes, 22 candidate Get Lost |
| E0 R1 | [39554018637](https://github.com/FlareZ123/experiment-01/actions/runs/39554018637), artifact 12325140280 | **94 roots, candidate engine terminal at turn19, [6,0] Prizes**; three Get Lost then six Full Moon Rondo |
| E1 R0 | [39552361897](https://github.com/FlareZ123/experiment-01/actions/runs/39552361897), artifact 12323647891 | 260-root cap, [6,6] Prizes, 25 Get Lost and physically confirmed two Bench VMAX evolutions |
| E1 R1 | [39552367029](https://github.com/FlareZ123/experiment-01/actions/runs/39552367029), artifact 12324253384 | **Native error** at source-seat AttackAction ordinal246, global turn48, NO_BENCH_SLOTS_AVAILABLE; no completed game count |

Each run attempted four historical original games. Rank6 champion suffered a real native tiebreak turn4-to-0 reset, so all strict four-cell workflows failed; its second epoch is part of the same trial. Rank6 New Moon remained 75 roots with source engine terminal; rank11 New Moon 260-root cap [6,6] with repeated Future Sight across all four profiles. Actor audits covered 3/4 in E0R0, E0R1, E1R0, and 2/4 in E1R1. **Zero competitively qualified games.**

## Real prompt-settled E0R1 Prize line

The archived genuine candidate attack-settlement packet identifies Get Lost at turns 3/5/7, followed by Full Moon Rondo at:
- global turn9 root49: [6,6]→[6,6], source returns turn10 Pass
- turn11 root56: [6,6]→[6,6], source returns turn12 Darkness Energy
- turn13 root65: **[6,6]→[6,3]**, source returns turn14 Pass
- turn15 root76: **[6,3]→[6,2]**, source returns turn16 Pass
- turn17 root85: [6,2]→[6,2], source returns turn18 Pass
- turn19 root92: **[6,2]→[6,0]**, native engine terminal

All nine candidate declarations are prompt-settled; ordinary attacks have genuine next-source actions where applicable. This proves one native game reached a six-Prize terminal under an actor-visible funded-bench pivot. **The opponent source Boost Shake line never completed** (`sourceAudit.completed:false`), source declared only one attack, and the deal was retrospectively selected. The observed engine terminal is **not** a qualified win against a competent rank11 opponent, nor an estimate of any match win percentage.

## E1R1 actual error evidence

The read-only rerun [39553379778](https://github.com/FlareZ123/experiment-01/actions/runs/39553379778), artifact 12324980562, reproduced the exact **root246/turn48** native rejection. Before it, source seat0 had Active **Trubbish with Darkness Energy** and five Bench Pokémon: Tapu Lele-GX, Squawkabilly ex, Mega Absol ex, Crobat V, Oranguru V. Candidate Active was a two-Psychic **Lillie's Clefairy ex**, candidate Bench held two Shadow Rider Calyrex VMAX, Latias ex, Girafarig and a second Clefairy. Native logs contained two prior Full Moon Rondo **announcements**, after more than twenty Get Lost announcements. This interrupted game has no full attack/Prize settlement packet, and cannot be called a loss. The subsequent fully read-only [CI 39554951972](https://github.com/FlareZ123/experiment-01/actions/runs/39554951972), [artifact 12325945384](https://github.com/FlareZ123/experiment-01/actions/runs/39554951972/artifacts/12325945384), **confirmed `rejectedAttackName='Call for Family'`, the same ordinal246/source turn48, and public remaining Prizes [6,3] immediately before the rejection**. Thus the interrupted joint policy had already earned 3 candidate Prizes, but never produced a completed game. The source Active Trubbish FST 168's printed Call for Family searches one Basic Pokémon into the Bench and deals no damage. Advanced Player's Rulebook C-11 explicitly says a full-Bench attack of this kind ends without attempting deck search. Native `NO_BENCH_SLOTS_AVAILABLE` is an observed paper-rule compatibility failure at this particular declared legal attack. No opponent hidden cards were inspected.

The E1R1 original row mislabeled the native attack error as paper Supporter veto although there were **zero actual Supporter-dispatch vetoes**. Diagnostic branch `agent39-mobility-crash-audit-20261021` corrects the error classification and saves the predispatch public board. The first attempted diagnostic CI 39553014265 failed pure syntax tests; corrected rerun succeeded in archiving the original native error. The read-only rejected attack name and public Prize extension succeeded as documented above.

## Interpretation and next action

**Real interaction:** with this frozen decision code, natural evolution and retreat competed in the rank11 champion fixture. Retreat enabled while natural evolution disabled converted nondamaging utility attacks into a six-Prize native line by turn19. Natural evolution enabled without retreat developed VMAX on Bench but stayed at [6,6]. Their combination later reached a funded Clefairy but suffered a native source-side error, leaving terminal unknown. This is strong game-state evidence for *ordering* attack activation and optional Bench evolution. It cannot establish that natural evolution is generally harmful.

A prospective full-field policy must respond to funded Bench attackers, current Active, Energy and retreat legality, real lock conditions, opposing sources that complete their intended lines, and physical time limits. These source-first, legality and timing gates remain unresolved. The exact 32-field deck roster remains **29/32**; ranked 23,25,28 unknown. **0 qualified competitive games and no 99.5% claim.**
