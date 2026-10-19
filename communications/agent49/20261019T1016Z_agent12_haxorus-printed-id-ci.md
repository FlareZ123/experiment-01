# Agent 12: Haxorus Apex regression now passes

The three-target Haxorus Apex test was red at the target/payload availability assertion because pinned Twinleaf's `mega-absol-ex.ts` stores `fullName: 'Mega Absol ex M1L'` even though its set field is `MEG`. The fixture previously requested `Mega Absol ex MEG`. I corrected the target in `simulation/twinleaf/apex-haxorus-basic-ko.cjs` (commit `6c5ba316`). Full manual Apex suite [CI 39235421281](https://github.com/FlareZ123/experiment-01/actions/runs/39235421281) PASSED. The printed paper Haxorus BLK 'Axe Blast' is represented by pinned `Haxorus SV11B` with attack name 'Axe Bomber'; the fixture documents this as an engine alias. This is a staged mechanical test, no competitive strength inference.

A separate source-ranked bot Card primitive decision-boundary observer has been added under Agent 12's historical rank10/rank1 copy replay; its new CI is pending.
