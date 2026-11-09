# Agent46 original rank1/rank10 Treasure dual-axis follow-up, 9 Nov 2026

**Result:** A reversible owner-visible Mysterious Treasure dual-axis policy was implemented and passed actual pinned Store tests for physical Dialga-GX discard and Mimikyu retrieval in both seats. Across the preregistered original-source comparison, however, the current native tactic never proposed proactively playing the Treasure card. This is a negative *setup triggering* result, not evidence against the printed card's tactical potential.

## Frozen original-source comparison

- Original unmodified full-60 Aichi rank1 Shadow Rider Calyrex versus rank10 Regidrago, both physical seats and 8 fixed new seeds, `maxActions=140`.
- Exactly **32 native game attempts in 16 physically matched starting-position pairs**, Fog-only control against Fog plus Treasure dual-axis treatment.
- GitHub Actions native [corrected completed run 42588683550](https://github.com/FlareZ123/experiment-01/actions/runs/42588683550) passed native physical-card tests and frozen full-source A/B after the setup guards were repaired. The `agent46-mimikyu-treasure-dual-axis-source-ab` JSON artifact preserves every arm.
- Treatment recorded **zero proactive Treasure tactic proposals**, **zero policy-proposed physical Dragon discard prompts**, and **two callback selections of Mimikyu within qualifying native search prompts**. A callback may be triggered by a speculative simulator branch; the proper accepted-action witness is the native attack trace and settled card zones.
- Actual native attack traces recorded **zero Mimikyu Copycat attacks in either arm**.
- The native physical-card Store fixture **does** demonstrate a legal Mysterious Treasure hand-discard-and-deck-search transfer with the exact target. This demonstrates execution *when explicitly proposed in a qualifying fixture*, not natural source-policy availability or tournament win percentage.

## Correction and limitation

An earlier first experiment run [42587523048](https://github.com/FlareZ123/experiment-01/actions/runs/42587523048) incorrectly allowed the Treasure discard resolver to intervene outside its registered Regidrago setup window. That first run reported ten discard-proposal callbacks and two Mimikyu selection callbacks. Its policy-specific trial findings are not admitted, and the corrected run supersedes it. The corrective code restricts all Treasure prompt interventions to visible Regidrago and the actual Mimikyu-missing open-Bench window.

The mechanism is still strategically plausible because one Treasure can discard a Dragon payload and search an eligible Mimikyu. For future natural play, an actor-only source policy needs to choose this Item during the correct first available turn, with actual positive target and affordable discards, before late-game lock/Bench constraints. The current native random or score-based bot does not consistently do so.

**Status:** 0 competitively paper-qualified games and no demonstrated contribution to the aspirational 99.5% target.

## Reproducibility

- Frozen protocol: `results/methodology/registrations/agent46-mimikyu-treasure-dual-axis-source-ab-20261109.md`
- Policy: `simulation/twinleaf/2026-11/agent46-mimikyu-treasure-search-setup.cjs`
- Native Store tests: `tests/2026-11/agent46-mimikyu-treasure-search-setup.native.test.cjs`
- Original-source runner: `simulation/evaluation/2026-11/agent46-mimikyu-treasure-dual-axis-source-ab.cjs`
