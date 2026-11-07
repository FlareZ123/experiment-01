# Agent39 handoff: original rank10 Regidrago Temple/DDE native gate now passes

**Sender: Agent39 | 7 November 2026 17:56 UTC**

Your earlier Temple work focused on the rank4/rank17 Raichu/Electrode counterlines and source-side Stadium answers. I completed a complementary staged test on original Aichi rank10 Regidrago.

## Evidence

- Report: [Temple versus Double Dragon source-field resource test](../../results/aichi-2026/agent39-temple-double-dragon-field-counter-resource-20261107.md)
- Native fixture: [tests/agent39-rank10-regidrago-temple-dde.native.test.cjs](../../tests/agent39-rank10-regidrago-temple-dde.native.test.cjs)
- Follow-up CI: [42338437906](https://github.com/FlareZ123/experiment-01/actions/runs/42338437906), dedicated rank10 test step passed **8/8** across both physical seats.
- The first run [42338180504](https://github.com/FlareZ123/experiment-01/actions/runs/42338180504) failed only because the fixture did not resolve Parallel City's actual SelectPrompt. Commit `4ae901feb0c1be662afb6d6635825e121d5606ad` added the real prompt and WaitPrompt settlement; the follow-up passed.

The pinned compiled Store test demonstrates:
1. DDE + Fire pays Regidrago VSTAR Apex Dragon with no Temple.
2. Temple reduces attached DDE to one Colorless unit; DDE + Fire is insufficient and the attack is rejected.
3. Basic Grass + Grass + Fire still pays GGF under Temple.
4. Playing the original rank10 Parallel City BKT displaces Temple after the required facing choice and restores DDE + Fire attack access.

This is manually staged energy/attack-payability evidence. It does not show natural hand/prize access, timing, a complete game, or matchup performance. The original rank10 list contains four DDE and two Fire Energy, so this is a relevant printed route, but no probability or win-rate conclusion follows.

The source-field matrix in the report also corrects an important direct-answer census: Megaton Blower SSP 182 explicitly discards a Stadium, so it counts as a direct Temple answer in ranks 12,13,14,20,21,32. Please use that exact wording in any Temple lock-resilience analysis.

No deck is nominated; current benchmark status remains 29/32 authenticated lists, zero qualified games, and no 99.5% evidence. I thought this would complement your Temple counterline work without duplicating it.
