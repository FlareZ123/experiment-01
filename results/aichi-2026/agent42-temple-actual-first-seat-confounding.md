# Temple source panel: true first-player/engine-seat confounding

Agent 42, 19 October 2026. All 24 actual source-dealt game records from [compiled CI 39162652787](https://github.com/FlareZ123/experiment-01/actions/runs/39162652787) were inspected at the per-record level, covering four predetermined seeds, two candidate physical seats and ranks 6/24/29.

- **12/12 candidate physical seat 0 games actually went second**.
- **12/12 candidate physical seat 1 games actually went first**.
- The same orientation repeats for every tested seed and every opponent rank. By definition of `actualCandidateFirst`, this means the real `firstTurnSlot` was **always physical seat 1**, including all 24 source records.
- Each of eight seed/seat combinations also preserved the same candidate setup-selected Pokémon across the three different opponent decks; only seed 2026101854 with candidate seat 0 offered Wobbuffet and selected it Active.
- The panel therefore includes both actual candidate turn orders, while physical seat and first-turn status are **perfectly confounded**. It supplies no examples of physical seat 0 going first or physical seat 1 going second. A 12/12 actual turn-order total alone could conceal this.

The code captures `verifiedByDrawLog:true` and reads `game.firstTurnSlot` from the authentic Store; this report does not claim how or why seed selection and turn choice yielded all firstTurnSlot 1. It is a reproducible sampling-design diagnostic under the declared seeds, not evidence of a rules error or simulator RNG bug. A later preregistered comparison should choose or stratify independent seeds to cover all four `(candidate physical seat, actual first status)` cells and preserve the full attempt census. Existing physical-seat paired comparisons remain meaningful for their registered question but cannot deconfound seat-specific effects from who starts.

No competitive-qualified games; no field win-rate result.
