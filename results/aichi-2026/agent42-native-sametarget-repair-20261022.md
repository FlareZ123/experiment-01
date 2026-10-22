# Agent42: native rank11 same-target Energy prompt repair, 22 October 2026

**Scope:** Replay of an already known engine-policy failure. Not a competitive win-rate test.

## Prespecified native replay

- Frozen Aichi rank11 Absol/Garbodor source 60, New Moon candidate 60, seed `2584586627`, source seat0, candidate seat1.
- Research base `242b57930c67b7c733a7f0ba4911f3be9125ed79`; pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- The complete original Agent50 workflow environment was reproduced, including actor Quick Ball, near-term Energy recipient and Emergency Rope seat1 settings. Earlier attempts omitted switches and are retained as negative diagnostic exposure in the registration.
- Registration: `results/aichi-2026/registrations/agent42-rank11-sametarget-recovery-20261022.md`. Runner and unit tests on branch `agent42-rank11-sametarget-recovery-20261022`.
- [Native replay 39698402358](https://github.com/FlareZ123/experiment-01/actions/runs/39698402358), [full artifact 12392320511](https://github.com/FlareZ123/experiment-01/actions/runs/39698402358/artifacts/12392320511). Artifact ZIP SHA256 `ccc84b03beeadbfa52c030d88f6cdaa288466b9c490a1729055f44e74283fdfd`.

## Four-cell evidence

| Resolver | Source stage OFF | Source stage ON |
| --- | --- | --- |
| Original pinned bot | Native error `invalid result to AttachEnergyPrompt (prompt 135)` | Identical error |
| Existing reversible same-target correction | Genuine engine terminal, 211 roots, candidate seat1 wins | Identical genuine engine terminal |

Both repair cells: final source/candidate Prizes `[6,0]`; 1 settled source attack, 6 settled candidate attacks. The repaired source physical-deal fingerprint matches across those cells: `5eef48b200403425e60d67dd227d250ae8fb5bccae45a62e49e2ed733af50783`. Identical accepted action ledger hash: `56e8e51324638c0ff7b9dd843d56a9736d39d94f8d974d162b3e0deee945daee`.

The preexisting Agent1 resolver fix, `simulation/twinleaf/same-target-attach-energy-hook.cjs`, fires **twice**, at native prompt **135** (`ATTACH_ENERGY_TO_BENCH`), preserving two selected Darkness Energy cards while using one destination `{player:2,slot:2,index:0}`. Native `prompt.validate` accepted the fix and game processing proceeded to terminal. The original errors happened before the enclosing runner returned a source-deal fingerprint, so direct baseline-versus-repaired physical-deal equality remains unverified. Fixed seed/decks/engine/environment were used for all arms.

The correction did not change the staged-vs-unstaged source line in this game. No causal claim about Guzma Energy staging follows.

## Qualification and CI

The specific native diagnostic step **succeeded**. The surrounding manual workflow was marked **failed** later when its unrelated default campaign step received diagnostic selector `agent42-sametarget-pair` and rejected that unscheduled campaign ID. Artifact and all native outcomes were retained.

The repaired games rely on a scoring bot with unresolved hidden-information and strategic-fidelity deficiencies. **Competitive-qualified games: zero.** No field-wide win rate, and no 99.5% evidence, follows. A stronger follow-up is an actor-visible, both-seat native same-target decision policy with direct Store acceptance receipts.

### Attack ancestry and printed restriction

The corrected native action ledger identifies source seat0 `AttackAction` **Motivate** at global turn53, root ordinal203, followed by an accepted `AttachEnergyPrompt` resolution at ordinal205. In the supplied card database, **Squawkabilly ex** (Paldea Evolved `sv2-169`) has Motivate for 20 damage and attaches up to 2 Basic Energy from the discard pile to **one Benched Pokémon**. This independently supports the prompt's `sameTarget:true` requirement. The baseline bot split its chosen two Darkness Energy between different Mega Absol ex benches. The corrected action targeted one. The very late first source attack illustrates why this is a weak-policy diagnostic.

### Why the corrected terminal is strategically unqualified

The complete accepted-root ledger contains **26 source PassTurnAction roots** and **21 candidate PassTurnAction roots**. The source plays just 9 cards (one Squawkabilly ex, one Mega Absol ex, support Basics and manual Darkness Energy), does not play a Supporter, and first attacks on global turn53. The candidate plays 9 cards and attacks with Psyray on global turns 44, 46, 48, 50, 52 and 54. The source rank11 printed 60 actually includes 3 Carmine, 3 Marnie, 2 Guzma, 4 Battle VIP Pass, 4 Quick Ball, 4 Professor's Letter and other setup cards, none executed in this trace. These observations directly demonstrate severe decision-policy inadequacy and explain why the candidate's six-Prize terminal cannot be generalized to a competitive matchup result.

### Clean CI and bit-identical independent replay

After excluding only this diagnostic trial selector from four unrelated default campaign steps, [replay 39699484292](https://github.com/FlareZ123/experiment-01/actions/runs/39699484292) at commit `5638081d8002d940db728c0782b5a71a1ed0b0bb` finished **successfully**. Its [artifact 12391962361](https://github.com/FlareZ123/experiment-01/actions/runs/39699484292/artifacts/12391962361) contains **205,069 bytes of JSON** with SHA256 `c872db1b67d9b829f5b34a8400ccee20f7115f919b104f0824fcd02d44dfb650`. A direct byte-for-byte comparison with the original run 39698402358 artifact JSON matched exactly. This confirms a reproducible full native correction and telemetry capture on the frozen seed. ZIP archives differ in metadata and therefore have different ZIP hashes. Both executions are the same historical fixture and count as no independent competitive trials.

### Frozen Agent50 four-seed failure census

The source [Agent50 full four-seed archive](https://github.com/FlareZ123/experiment-01/actions/runs/39692001898/artifacts/12389041814), `agent50-four-new-seed-energy-pairs.json`, contains eight originally attempted Store arms. Independent reinspection of all eight raw entries gives the following error class by source seed. This is the **original pre-repair** census, not a claim that the three remaining seeds have been replayed with the hook.

| Seed | Source staging OFF | Source staging ON |
| --- | --- | --- |
| `17984023` | native `NO_BENCH_SLOTS_AVAILABLE` after 178 actions | same error after 178 actions |
| `1407148205` | genuine terminal, 212 roots, candidate seat1 winner, final Prizes `[6,0]` | identical terminal |
| `2612415444` | native `LABEL_GX_USED` after 39 actions | native `NO_BENCH_SLOTS_AVAILABLE` after 50 actions |
| `2584586627` | native `AttachEnergyPrompt #135` invalid split target | same error |

**Original eight-arm census:** 2 natural terminals, 2 same-target prompt errors, 3 no-Bench-slots errors, and 1 GX-used label error. The two last-row prompt errors are the only ones directly corrected and replayed here. The full original historical four-seed panel with the correction was preregistered but has **not been executed**; do not present these eight originally attempted arms as post-correction outcomes.

The repository separately provides a *tested, scope-restricted* full-Bench Trubbish FST `Call for Family` paper C-11 hook, `simulation/twinleaf/agent38-paper-fullbench-callforfamily-hook.cjs`, and the canonical `AGENT38_PAPER_FULLBENCH_TRUBBISH_DEV` opt-in, with [a different rank11 seed's Store acceptance witness](../twinleaf/agent38-paper-fullbench-trubbish-fst-20261021.md). The three present `NO_BENCH_SLOTS_AVAILABLE` errors cannot be attributed to that printed attack without an action-name and public Bench trace at their actual failing roots. The canonical runner also already offers `paperSameTargetAttachEnergy` / `AGENT12_SAME_TARGET_ATTACH_DEV` default-off as a both-seat versioned wrapper around the same Agent1 hook. Future full-field reruns should reuse these existing scopes rather than duplicating incompatible versions.
