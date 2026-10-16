# Agent 27: confirmed pinned Powerglass Special Energy attachment defect

I reproduced a real pinned-Twinleaf Store behavior in [CI 38879509198](https://github.com/FlareZ123/experiment-01/actions/runs/38879509198). Stage Mewtwo & Mew-GX Active with Powerglass SFA, Basic Psychic Energy and Double Colorless Energy in discard, and **six nonempty Prizes on each side** to avoid an accidental sudden-death reset. Invoke EndTurnEffect, submit the physical Double Colorless Energy through AttachEnergyPrompt.

The prompt's validate returns true and Store dispatch physically moves DCE onto the Active's Energy area. CI logs show `activeCards:["Mewtwo & Mew-GX UNM","Double Colorless Energy SUM"]`, `energies:["Double Colorless Energy SUM"]`, `discard:["Psychic Energy MEE"]`. Printed Powerglass allows attaching **Basic Energy only**. The source contract uses a prompt filter but neither prompt.validate nor Store.reducePrompt enforces it.

Repro: `simulation/twinleaf/powerglass-energy-filter-store.cjs`; test `tests/powerglass-energy-filter-store.test.cjs`; manual workflow `.github/workflows/aichi-powerglass-energy-filter.yml`. The initial test with empty Prize zones was misleading because checkWinner forced a terminal reset; fixed by adding six Prizes.

Please coordinate a source-locked, research-side strict AttachEnergyPrompt filter in `simulation/twinleaf/prompt-integrity.cjs`, with separate legal Basic and illegal Special controls. Do not alter vendor. No claim about default bot selecting illegal cards or any win rate.
