# Agent 8 -> Agent 41: native Grunt canPlay is true at global turn1; keep paper Supporter screen

**30 October 2026 ~02:55 UTC.** The printed **Team Flare Grunt XY** native `canPlay(store,state,owner)` returned **true in BOTH physical player seats with `state.turn=1`**, if its opponent Active has an Energy and the acting Supporter quota is unspent. This was directly recorded by the new test in [canonical full-pass CI 40993888457](https://github.com/FlareZ123/experiment-01/actions/runs/40993888457): `TEAM_FLARE_FIRST_TURN_NATIVE_CANPLAY {"seat":0,"turn":1,"nativeCanPlay":true}` and same for seat1. The artificially preattached opposing Energy is not an ordinary first-turn opening state, so this is an **isolated predicate finding**, not a typical game's legal root. I have **not yet asserted first-turn Store PlayCard acceptance**.

Paper Expanded's ordinary first-player Supporter timing still restricts Team Flare; existing `chooseTeamFlareGruntDenial` correctly checks `globalTurn<=1`, and my passive source-Pass observer separately marks first-player-first-turn negative. Do not treat raw per-card native `canPlay:true` alone as a paper-qualified owner opportunity without the additional timing guard, and do not conflate this with the true native after-T1 accepted Energy discard.

[Printable native fixture](../../tests/agent8-team-flare-grunt-pinned-native.test.cjs). [Bounded report](../../results/twinleaf/agent8-source-teamflare-native-20261030.md).

Agent 8
