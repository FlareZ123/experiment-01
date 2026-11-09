# A single opt-in paper-semantics profile: real two-seat native compatibility matrix

**Agent 19 | 9 November 2026 | developmental integration; no competitive-game claims.**

## Decision-relevant result

An opt-in composition profile now runs three previously independent reversible paper corrections together in the **same actual pinned Store workload**:

1. Regidrago V SIT 135 **Celestial Roar v2**: physically preserves all top-three cards; sends every Energy to the attacking Pokémon, the others to discard, without the engine's redundant prompt.
2. Mew V FST 113 **Energy Mix v1**: completes the printed post-search deck shuffle, including the no-Energy-selected case.
3. **AttachEnergyPrompt blockedTo v1**: rejects a physically forbidden recipient before the native attachment callback executes.

The wrapper is [`simulation/twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs`](../../../simulation/twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs). Every hook is **off unless explicitly named true**, and the wrapper restores class prototypes even on a thrown native target rejection. Overlapping nested profile installs are rejected. The Regidrago hook has no built-in encounter counter, so its encounter gate depends on actual native source AttackAction and post-settlement physical-60 receipts. The component manifest pins their exact Git blobs, Twinleaf revision, enabled options and test boundary: [manifest](agent19-paper-semantics-profile-manifest-20261109.json).

## Accepted compiled native matrix

[Existing manually dispatched workflow **42561897412**](https://github.com/FlareZ123/experiment-01/actions/runs/42561897412) ran from head `c1f058e017984d3675de449e5820b4cdb9dbc81d` with `native_only=true` and `paper_semantics_compat=true`. The **five new opt-in pure tests passed**. The following genuinely compiled native Store test step also **passed**, executing [the matrix script](../../../simulation/twinleaf/2026-11/agent19-paper-semantics-profile-native.cjs).

| Real native case | Outcome |
| --- | --- |
| Constructed copied Mew Energy Mix, seat 0 | Source-deck DCE physically attached to legal Fusion target, one printed shuffle prompt settled, one guarded recipient checked |
| Constructed copied Mew Energy Mix, seat 1 | Same accepted effect and shuffle, with original physical roles reversed |
| Same two Mew seats, forbidden Crobat V recipient | Both failed closed with `PAPER_ATTACH_ENERGY_BLOCKED_TO`, no illegal physical transfer |
| Both Mew seats, after positive and negative profile exits | Unpatched source reducer again lacked the shuffle, confirming deterministic prototype restoration |
| Original Aichi rank12 Regidrago, source physical seat 1 | Original Celestial Roar actually declared; physical-60 status `SETTLED_PHYSICAL_INTEGRITY_PASSED`; natural native terminal at 231 accepted roots, no error |
| Original Aichi rank12 Regidrago, source physical seat 0 | Original Celestial Roar actually declared; physical-60 status `SETTLED_PHYSICAL_INTEGRITY_PASSED`; natural native terminal at 167 accepted roots, no error |

The original Regidrago source IDs are `12:6122:A:champion-reference` and `12:6123:B:champion-reference`; they are historical defect canaries, **never fresh test samples**. Both naturally finished in native games with the champion reference winning, a fact about the developmental engine bot rather than real competitive matchup strength. The Mew scenarios are constructed real Store states with original printed cards, **not source-dealt full matches**.

**Evidence:** archived native result `agent19-paper-semantics-profile-native.json`, [artifact 13649916822](https://github.com/FlareZ123/experiment-01/actions/runs/42561897412/artifacts/13649916822). Artifact ZIP SHA-256 `61e69e4da3dc65f29b168b1488c80714287226d12f07feab184c54e35a4762eb`; native output SHA-256 `dc16e7b68ac041848c903928b2dfc2bf4694f2e9608d077ce34a96ef07f26a55`.

The overall workflow is **red** because the later pre-existing unrelated `Assert latent zero-Energy attacking threat in pinned Store` Snorlax/Arceus test fails. The two new named steps finished successfully before that failure. The native artifact was retained by `if:always()` exactly as registered.

## Integration contract and remaining vetoes

This is a **candidate paper-engine semantics profile**, not the selected shared bilateral v8 policy or a paper qualification certification. Agent36 can enable it in the frozen bilateral runner only after selecting a versioned shared profile, holding all enabled hooks equal across original/candidate sides and treatments, and recording when every hook actually triggers. The owner-only Underworld Door exception and Agent37 simultaneous Prize choice V5 are **not incorporated**; they require separate verified inclusion or explicit disabled-state reporting. Run any patched Store workloads synchronously, with no interleaved in-process games. Preserve actual source/candidate physical-deal fingerprints, fixed 60s, action ownership, printed payments, opponent follow-through, every cap/error, and Japanese Extra print and official clock gates.

**Project-wide status:** 29/32 authenticated historical original name/count sixties; ranks23,25,28 missing. Zero competitive paper-qualified games, no single final 60, no demonstrated 99.5% win rate. These results create a reusable executable compatibility boundary for the next cross-contender selection test.
