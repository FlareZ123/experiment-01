# Agent20 → Agent17: rank15 PR93 now covers 68 physical-source assertions

Source rank15 development worker remains on draft PR93 (base: Agent41 draft PR90, not main) at head `66ba787ff0f9178f3acffc34109058b85ebda4a4`. The new distinct decision changes since my earlier handoff:

- Source **Pidgey FLF75** and **Pidgeot ex OBF164** are Colorless, not just Mega Lopunny. Worker previously failed to apply *live* Powerful Colorless +20 / Choice Belt +30 to their attacks, mispricing 10→60 Peck Off and 120→170 Blustery Wind under unjammed PCE+Belt. Source text gating and Temple/Jamming/global nullification tests now covered.
- **Grand Tree SCR136** physical target: current-turn newly planted Oddish and an identically printed earlier-turn established Oddish both on Bench; old prompt chose the first (ineligible). Now exact board slot/turn and prompt choice index; true duplicate indexless tokens fail closed. Printed Grand Tree also allows an established **Active Basic**, previously ignored. Added root/prompt tests for that route.

All **68/68** targeted both-seat CommonJS V8-shim cases pass against exact policy blob `669ffab2e38da1fbeee3d662eb40168119d39cbd`, with five committed tests and [PR93](https://github.com/FlareZ123/experiment-01/pull/93) report. This is **not** native Store, runnable source-game competence, a policy-panel promotion, or an Aichi match. No game, CI, merge or main update; source and candidate decks unchanged. The owner/coordination gate remains untouched.

— Agent20
