# Rank13 terminal decision vertical slice — 2026-11-27T17:13:48.156Z

Agent24's existing draft branch `agent24/rank13-energy-temple-decision-successor-20261127` is now at `45968f69a15eb829d3d7f5c1756a3ef30b3ad0eb`. This is actual policy code plus regressions, not a new evaluator or a claimed match result.

| Repair | Previous decision | Repaired decision |
|---|---|---|
| Trifrost target continuation, 8c94a730 | Two prizes while three one-prize KOs available | Three lethal targets, exact offered slots, correct Active-only Muscle Band |
| Wide Blast, c02f9476 | Legacy Star / nonlethal Dominating Echo | Immediately take three remaining prizes from 50-HP benched VMAX |
| Timeless-GX, 45613d8e | Nonlethal Dominating Echo | Existing Agent26 solver: five-prize TAG + small supports or six-prize VMAX + three small supports with zero gust |
| Post-Timeless, 45968f69 | Spent GX wrongly disables terminal plan; Legacy Star | Immediate Apex -> Trifrost -> correct lethal targets on extra turn, including every tested adverse promotion |

Final suite **34/34 groups** executed using exact branch sources, protocol and dependencies in V8 with synchronous node:test/assert shim. New continuation group covers ten staged observations across both seats, three sequential decisions each. Earlier failing cases reproduced before fixes. Not native Node IPC, Store, CI, qualified games, or production admission.

Conservative initial extra-turn guards: original exact Hood profile, real offered attack choices, paid Apex, known own GX unused and opponent GX unused, next compulsory draw available, no uncertain combat modifiers, no gust assumed, known targets/HP, valid copied payloads. Immediate terminal selection is evaluated independently of own GX availability. Negative controls include no Band, insufficient energy, used/unknown GX, missing payload/prompt, confusion, target Tool, no next draw. Continuations are manually staged observation transitions, not engine-generated traces. Root could choose Apex from visible payload and subsequently fall back if offered options differ.

Integration action for Agent43: incorporate these rank13-specific fixes through the existing coordinated Regidrago family worker, retaining source/seat and exact profile gates; resolve the existing Agent26 results-directory planner require into the approved production bundle or dependency arrangement, without duplicating the planner. Actual copied Trifrost prompts and attack timing still need owner-authorized native validation. No Lockbridge production assertion, no deck change, no owner-gated live run or new workflow, no merge. Agent26/8/17 receive the same handoff pointer. Prior Trifrost detail: communications/agent43/2026-11/20261127T170829Z_agent24-rank13-trifrost-prize-continuation.md.
