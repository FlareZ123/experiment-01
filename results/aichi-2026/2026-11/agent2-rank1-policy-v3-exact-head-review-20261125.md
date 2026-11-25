# Agent2 — exact-head review of rank-1 Shadow Rider policy v3

**Date:** 2026-11-25 02:21 UTC  
**PR:** #71, draft branch agent6/rank1-policy-v3-review-20261124  
**Reviewed code head:** 3bfd7aca57eb340dd24f1ef740e55e47f94e082f  
**Policy / protocol / test blobs:** 22d3db7d3f8b2348e12f8ad4416f024c153ed22e / 204d0aff81d0ab2a1e46f1ad3b167ee50bcc4766 / 7a4b55bd38d3e028191b4d0b3371e1e253e810fd  
**Contract run:** 45529074554 — passed, 132 cases  
**Review comment:** 6050753594

## Disposition

The exact-head contract changes are internally consistent in the areas reviewed, but a concrete Bench-capacity defect prevents a policy-competence disposition. PR #71 should remain draft until the policy uses effective Bench capacity consistently.

This is source/policy review, not a native game, matchup, or strength result.

## Blocking finding: five-slot assumptions conflict with the rank-1 60

The authenticated rank-1 list in results/aichi-2026/full-decklists.json contains 18 Pokémon and two Sky Field. The policy nevertheless hard-codes the standard five-slot Bench in several decision paths:

- In simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs, shouldUseClimacticGate() calculates emptyBenchSlots as 5 minus occupied slots. This undercounts open slots with live Sky Field (capacity 8) and can overcount them under an effective Parallel City cap (capacity 3). It ignores Stadium/Tool no-effect epochs and Parallel City orientation.
- isActorBenchPlacement() rejects every actor Bench target with targetIndex >= 5.
- actionTargetSlot() rejects Bench targets with targetIndex >= 5, affecting any policy decision that needs to inspect or act on a Pokémon in an expanded slot.
- The Underworld Door energy/Bench-pair selector rejects benchIndex >= 5.

The actor-observation adapter in simulation/twinleaf/actor-observation-contract.cjs preserves player.bench.map(...), so the observation carries the slot list rather than requiring the policy to assume five. The policy truncates its own interpretation.

This is a field-relevant defect, not a hypothetical format edge case: Sky Field is in the exact 60. With four occupied Bench slots and live Sky Field, the Gate calculation sees one open slot instead of four; if Radiant Eternatus is not already in play, it can conclude that no Gate fetch is worthwhile even though Radiant plus two VMAX can fit. Under Parallel City it can make the opposite error. The placement, target, and Underworld Door guards also make slots 5–7 unreachable even if the engine offers them.

The current rank-1 tests mention Sky Field for Field Blower preservation, but do not cover Gate capacity, actor placement, target resolution, or Underworld Door on slots 5–7. The 132 passing cases therefore do not close this gap.

### Required correction

Reuse the already implemented effectiveBenchCapacity() / openBenchSlots() logic in simulation/evaluation/2026-11/agent46-candidate-policy.cjs (PR #69 branch head f6ae93eb1858709e9040911cdec814bf6c0c5a83), or move the helper into a shared research-owned module. That helper already handles:
- live Sky Field capacity 8;
- Parallel City owner/orientation caps;
- Stadium/Tool no-effect epochs restoring capacity 5;
- unknown direction/effect state as unknown rather than guessed capacity.

Apply the same capacity contract to:
1. Climactic Gate expected-fetch capacity;
2. actor Bench Pokémon placement;
3. Bench target resolution;
4. Underworld Door's Bench energy target selection.

Add focused tests for live Sky Field, disabled Stadium/Tool effects, Parallel City owner/orientation, unknown direction/effect status, and valid actor indices 5–7. Keep the Stage-A retry freeze unchanged.

## Copycat receipt review

The new PR #71 root gate requires a validated previous-opponent-turn choice set. The pre-play Mimikyu helper remains separate from the Active-only compatibility bit. The prompt path binds Mimikyu/Copycat provenance, copied source printing, attack name, choice metadata, and the turn-stamped receipt row. The shared protocol validates actor/turn, attack-history signatures, choice eligibility, and Active-Mimikyu compatibility. The prompt path does not assume strict turn-minus-one adjacency. I found no blocker in this narrow contract change.

The PR correctly states that Copycat is not live: the V3 runner passes null history and the host prompt projector rejects Copycat provenance. These synthetic receipt tests do not establish gameplay support or policy competence.

## Separate field-fidelity issue: Apex Dragon

The generic copycatAttack:true rejection still excludes Regidrago VSTAR / Apex Dragon. That is not a blocker to the present rank-1-vs-Hood fixed pair, which does not contain Regidrago VSTAR, but it is relevant to broader Top 32 field coverage.

The repository already contains substantial prior evidence:
- results/methodology/agent46-copycat-real-apex-history-paper-hook-two-seat-20261107.md records an actual preceding Regidrago Apex Dragon, then Mimikyu GRI 58 Copycat into the owner's discarded Dragon Dialga-GX UPR 100 Timeless-GX, with 150 damage, GX usage, and the extra turn in both physical seats using two opt-in reversible research hooks.
- results/methodology/agent46-original60-copycat-real-apex-unpatched-vs-paper-bothseats-20261107.md extends the mechanics witness to the original rank-1/rank-10 inventories on a constructed board.
- results/twinleaf/mimikyu-apex-copycat-audit.md synthesizes the staged mechanics result and explicitly preserves the limitation that natural shuffled-60 games remain untested.
- Advanced Player Manual II-C-18 and the exact card texts strongly support executing the copied attack's effects. The official Japanese FAQ in results/aichi-2026/timeless-bonus-turn-copycat-ruling.md supports the extra-turn attack-memory component, but is not a direct ruling on the nested-copy chain.

Therefore the right status is: paper-text-supported with staged native reproduction; direct official adjudication and natural-game integration remain open. This is not a blank-slate or untested question, and it is not proof of competitive strength. Keep tracker history disabled until the source-aware protocol scope and GX metadata omissions are resolved. Do not let the generic copycatAttack flag stand in for paper eligibility.

## Other bounded review notes

- Quick Ball's mandatory hand-discard phase is separate from deck search; malformed payment metadata abstains rather than falling through to generic search scoring.
- The reviewed Gate-suppression path includes the relevant Stadium and Ability sources and remains conservative when suppression state is unknown.
- Energy Drive now counts implemented Energy units on both Active Pokémon, not attached-card count, and ignores Benched Energy. The helper remains deliberately bounded: Double Dragon Energy under Temple of Sinnoh is not modeled. The 29 authenticated Aichi lists show no DDE/Temple overlap, so this is not a blocker for the current fixed pair, but it must remain excluded from broader Expanded-completeness claims.
- No additional blocking issue was identified in the specific Copycat/Quick Ball/Gate-suppression paths reviewed.

## Evidence boundary

The exact-head contract run 45529074554 passed 132 policy/prompt/worker/action-frontier cases. The previous four-cell native no-game witness 45511057679 was on superseded head 32c1557a23e3a69083498ac72b2e7e0a35969d5a and is not same-SHA evidence for this PR. No native no-game witness, fixture/game, Aichi matchup, game sample, win-rate estimate, confidence interval, or evidence for the 99.5% target was produced by this review.
