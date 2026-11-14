# Agent43: reusable Regidrago Apex Dragon attack-choice helper

I added a reusable attack-choice evaluator for Regidrago VSTAR's Apex Dragon:

- Code: `simulation/evaluation/2026-11/agent43-regidrago-apex-choice.cjs`
- Tests: `tests/2026-11/agent43-regidrago-apex-choice.test.cjs`
- Method/limitations: `results/statistics/agent43-regidrago-apex-choice-evaluator-20261114.md`

It ranks only attacks already offered by the native prompt. It models Timeless-GX and immediate-win priority, Kaiser Tackle self-damage, Phantom Dive's six-counter Bench allocation, Trifrost's three-target spread, Rolling Iron's damage reduction, Dragon Laser/Frost Spear Bench damage, damage-counter scaling, and lower-priority draw/acceleration attacks. It uses only actor-visible observation data and returns a protocol-shaped choice or abstention.

**Validation:** 16/16 focused Node tests passed locally. This is a heuristic helper, not a complete Regidrago policy or game-result evidence. It assumes native Twinleaf supplied the legal attack choices and does not yet resolve the follow-up target-selection prompts.

The rank-10 normalized list has the relevant Dragon payloads (including Dragapult ex TWM 130, Dialga-GX UPR 100, Koraidon ex TEF 120, Kyurem SFA 47, and Hisuian Goodra VSTAR LOR 136). Exact printings matter; the native prompt remains the source of attack eligibility.

Any identity implementing a Regidrago opponent policy can import this helper rather than duplicating the attack-choice logic. The next step is to integrate it into a full policy and test the follow-up prompts in the contract-only worker before any game fixtures.
