# Paper-public opponent Shadow Rider veto: 32 paired native original-source openings

**Agent26, 10 November 2026.** The tested immutable Hood Shield v1 printed 60 and authentic Aichi original ranks 1, 7, 11 and 13 are unchanged throughout. [Registration before outcomes](../../../results/aichi-2026/registrations/2026-11/agent26-hood-public-mirror-veto-fresh32-20261110.json), blob `a55b7a41d879db07a6657bed01709a60c58d403b`. Pinned native engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Fresh 32 matched physical candidate/source opening groups, eight per original rank and four per candidate physical seat, 64 actual headless games, identical other bilateral policy choices, hard 260-action cap. **No paper-qualified games**.

## Real intervention and implemented result

Underworld Door's owner-only root is available. Both study arms enable Active Psychic funding priority; the treatment additionally abstains from that priority when the **opponent's publicly revealed current Active or Bench** has Shadow Rider Calyrex V (CRE) or VMAX (CRE). This leaves the original Underworld Door root available. It is implemented with a pure public-only observer in `simulation/twinleaf/2026-11/agent26-shadow-rider-mirror-funding-veto.cjs`, reversibly connected through `simulation/twinleaf/agent34-actor-only-root-policy.cjs` and the actual bilateral runner. Unit checks verify that concealed opponent cards are never consulted.

The successful **effective** run is [Actions 42729794087](https://github.com/FlareZ123/experiment-01/actions/runs/42729794087), [full raw 64-native-attempt artifact 13723997725](https://github.com/FlareZ123/experiment-01/actions/runs/42729794087/artifacts/13723997725). Its actor ledger **explicitly asserts** `underworldActiveFundingMirrorVetoOptIn` is false for control and true for every treatment game, protecting against a silently dropped config. All 32/32 physical pairs match and 6/6 native test cases pass.

| Original | Physical pairs | First native action diverged | Candidate native wins, blanket / public veto | Candidate settled attacks, blanket / public veto | Unresolved native caps in each arm |
| --- | ---: | ---: | ---: | ---: | ---: |
| Rank 1 Shadow Rider Calyrex | 8 | **3** | 6 / 6 | 67 / 67 | 1 |
| Rank 7 Snorlax Stall | 8 | 0 | 1 / 1 | 135 / 135 | 5 |
| Rank 11 Absol Garbodor | 8 | 0 | 6 / 6 | 53 / 53 | 1 |
| Rank 13 Regidrago | 8 | 0 | 6 / 6 | 51 / 51 | 2 |
| **Total** | **32/32** | **3** | **19 / 19** | **306 / 306** | **9** |

Across all 32 pairs, control/treatment accepted candidate Active Psychic roots were identical 69 / 69. The veto's three first native divergences are concretely paid `PlayCardAction` Psychic to Active (blanket) versus `UseAbilityAction` Underworld Door (veto) on rank1 originals:

- `1:0:A`, seed `2672565815`, turn 8 / action 54, **original-source seat 1**, candidate wins both.
- `1:2:A`, seed `2390320593`, turn 14 / action 77, **original-source seat 1**, candidate wins both.
- `1:3:B`, seed `3422861095`, turn 16 / action 80, **candidate seat 0**, candidate wins both.

Native terminal identities and total settled candidate attacks are unchanged in this registered sample. The apparent equality is therefore a **non-result for win-rate improvement**, while confirming real correct scoped decisions and zero disruption in the other original ranks. The sharp candidate native win difference interval remains **[-9,+9]** across 32 pairs because nine pairs cap in both arms and their eventual game winners are not established. It is consistent with zero effect and hidden long-game effects; no performance superiority is supported.

## Rejected first run, fixed failure mode

[Actions 42728989054](https://github.com/FlareZ123/experiment-01/actions/runs/42728989054) compiled and ran the same registered openings **before** the bilateral runner's `actorUnderworldActiveFundingMirrorVeto` argument was wired into the actor. Its audit showed `underworldActiveFundingMirrorVetoOptIn=false` in **both** arms and every decision matched. That run was a **non-applied treatment** and must not be used as evidence that the strategic veto failed. The infrastructure repair is in `simulation/evaluation/agent41-bilateral-v2-development.cjs` commit `25f7d83337944098e5b0c220825fdd68f122d179`; a hard treatment-audit assertion was added before re-execution. The same prior-registered starts were reused after fixing the failed experiment plumbing, transparently distinguished from a fresh-independent replication.

## Decision

Keep the veto default-off for the shared canonical policy, as no win improvement was proven, but retain the reversible implementation and native tests. The principle is sound: a public current opponent Shadow Rider signal can cause meaningful different Underworld/Active decisions with no illicit opponent-deck access. It is not complete matchup identification because the opponent may have revealed a Shadow Rider earlier and no longer have one on the board.

A separate prospective 32-pair test in `results/aichi-2026/registrations/2026-11/agent26-hood-late-active-funding-fresh32-20261110.json` tests a complementary **public global-turn 25 threshold** intended to preserve early Underworld acceleration while permitting late Active funding, using new independent physical starts across the same four original ranks.

There is still no paper-valid full-field rate and no basis for claiming the 99.5% target.
