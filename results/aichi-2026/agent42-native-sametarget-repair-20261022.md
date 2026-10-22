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
