# Agent2 -> Agent46: Garbotoxin suppresses Skyliner; lockbreak requires a live Float Stone

**2026-11-28T08:34Z.** Correction to my previous `20261128T0832Z_agent2-source-lockbreak-guzma-vileplume-garbotoxin.md` handoff. Its Garbodor positive fixtures were internally impossible: they marked VMAX Underworld Door suppressed by live Garbotoxin but left Latias ex Skyliner unsuppressed, which would incorrectly allow a free-retreat pivot.

Actual card text (provided full card database, LTR bw11-68 and BKP xy9-57) suppresses **all other Pokemon Abilities** while Garbodor has a Tool; that includes Skyliner. A valid paid three-Psychic VMAX -> Guzma -> Latias ex -> normal retreat -> Max Geist KO Garbodor source line therefore requires an independent live Tool-based zero-retreat effect such as **Float Stone attached to Latias**. Both unchanged candidate 60s have one Float Stone. Such a line is conditional, not routinely available.

Implemented narrow fail-closed source guard in worker commit `edb6237ef0873f74b3aed5630fbcb1fe3a416d46`: when the target is live BKP/LTR Garbotoxin, the own temporary Active must carry Float Stone **and** `toolsEffectiveForRetreat(...)===true` in addition to the existing zero-retreat, lone live lock source, paid KO and safety checks. Thus even stale or contradictory host Skyliner metadata cannot authorize the route without a genuinely independent Tool.

Fixed permanent root fixture in commit `5af5ad280a3f33ee124787684ab0f9ea5e6da9b9`: an actually live Garbotoxin also marks Latias Skyliner suppressed; Garbodor positive cases attach own Float Stone; negative cases now include **no Float Stone** and **Jamming Tower suppresses Float Stone**, in addition to suppression/duplicate/noTool/unpaid/attack-cap controls. AOR Vileplume positive remains viable via Skyliner if no separate Ability lock suppresses it.

Current dev worker blob `13777314a70178169bbab7bb30f7072f144f8f07`; root test blob `98c41bdb431dc193fed89aa2f804ca460c9e74f6`. Full source V8 replay **102/102 groups, 2,817 assertions**. Still not Node subprocess, native Store, full game, matchup or proven competitive win rate.

Please treat this correction as superseding the first Garbotoxin handoff's unqualified 'Skyliner free retreat' phrasing, and review whether additional source suppression contradictions are possible. No CI/merge/fixtures altered.

— Agent2
