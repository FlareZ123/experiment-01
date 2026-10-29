# All 32 original registered games: read-only owner-held Lillie exposure

**Agent25, 29 October 2026. Evidence class: original-Store action-space observation, not competitive strength.**

[Preregistration](registrations/agent41-prospective-canonical-32-20261029.json) fixes 32 historical original Store games using 16 unique rank/seat seeds, both exact original rank6/rank11 source 60s, two candidate 60s and unchanged original acting policies. [Original unobserved native archive](https://github.com/FlareZ123/experiment-01/actions/runs/40918541683/artifacts/12917901362) recorded 20 engine terminal games, 12 root-action-cap censorings and zero native errors. The exact pinned Twinleaf commit is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

Read-only rerun [manual CI 40945820327](https://github.com/FlareZ123/experiment-01/actions/runs/40945820327), [archive 12929317388](https://github.com/FlareZ123/experiment-01/actions/runs/40945820327/artifacts/12929317388) (ZIP SHA256 `907b1ee3b640dd468fd805e04001741e9213a9691280df753d149c26976bf7b0`), executed the **same immutable registration** with `AGENT25_LOWHAND_LILLIE_CENSUS_DEV=true` and selection OFF. Independently comparing both ZIPs gives **32/32 exact trial IDs, physical source deals, first-player identities, complete root-action SHA256 ledgers and terminal/censor statuses matching**. This establishes the observer's noninterference in the checked frame.

| Source rank | Original-Store games | Authenticated owner-root reads | Held Lillie root reads | Eligible owner-root reads |
| --- | ---: | ---: | ---: | ---: |
| 6, Iron Thorns | 16 | 790 | 251 | **0** |
| 11, Absol/Garbodor | 16 | 969 | 229 | **3** |
| **Total** | **32** | **1,759** | **480** | **3** |

Among the **480 held reads**, **474** were excluded by the strict own-hand size greater than three, **three** by first-player first-turn Supporter restriction, and **three** passed the purely structural selection threshold. Each root read is an opportunity *observation*, so these are **correlated repeated state reads**, never 480 independent chances or 3 independently verified legally settled Supporters.

The three eligible reads occur only in **two champion-reference rank11 games**, as naturally dealt: `11:2:A:champion-reference` at engine global turns 2 and 4 (each 3-card hand), and `11:1:B:champion-reference` at turn 4 (3-card hand). All New Moon cases are ineligible under the heuristic despite many held Lillies. This creates a legitimate **pre-existing native source-dealt positive-control opportunity** for a separately opted-in both-seat root rule, now being assessed with Agent24's full printed shuffle/draw postcondition observer.

**Limitations:** no paper-clock calibration; weak opponent and candidate player policies; two source archetypes only; three missing original Top32 lists; 20 terminals remain noncompetitive and 12 caps unresolved; positive eligibility does not prove Store acceptance, printed effect settlement, tactical value or game win. **0 competitively qualified games; no demonstrated 99.5% win rate.**

Reproduction: `simulation/evaluation/agent25-registered-scout-owner-census.cjs`, `tests/agent25-registered-scout-owner-census.test.cjs`, `simulation/twinleaf/agent25-lowhand-lillie-frontier.cjs`, `agent34-actor-only-root-policy.cjs`, and existing manually dispatched `supporter-decision-regression.yml`. Do not treat this observer-on replay as a new independent random sample.
