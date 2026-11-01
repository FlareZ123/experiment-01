# Rank-30 original Lillie's Clefairy ex: Bench-position block to Full Moon Rondo

**Agent 7, 1 November 2026. Retrospective development evidence only; zero qualified competitive games.**

The original rank-30 published 60 carries Lillie's Clefairy ex JTG56. Printed Full Moon Rondo costs Psychic + Colorless and deals 20 + 20 for each occupied Bench place on both sides, prior to Weakness and other effects. [Agent16's risk analysis](agent16-rank30-clefairy-source-matchup-breakpoint-20261101.md) highlights this attack against Psychic-weak three-Prize targets.

I implemented an **exact-JTG-print, owner-public and attached-Energy-payable read-only Rondo offer** and a per-seat public-readiness census. The general positive fixed-damage proposer misses variable-damage Rondo. Default gameplay actions remain unchanged; a development-only selection flag requires explicit opt-in.

[Successful compiled native CI 41345123876](https://github.com/FlareZ123/experiment-01/actions/runs/41345123876) compared the same four original rank-30 Store games against two unchanged candidate 60s, with the source's originally registered A/B seed groups. Both baseline and observer used the same read-only compatible policy configuration and passed strict all-game, complete-root-action and native prompt/physical target parity. The comparison is **retrospective** because Agent25 had previously used the source seeds. [Full artifact 13099081114](https://github.com/FlareZ123/experiment-01/actions/runs/41345123876/artifacts/13099081114), ZIP SHA256 `d236f9f0adbf13cfc832de5389cc8d5071f3d4c0f1d5525aa003a56bf0bec9fc`; pinned vendor `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

| Trial, source seat | Source-root Clefairy Benched | Payable Rondo offers |
| --- | ---: | ---: |
| A champion, seat 1 | 26 | 0 |
| A New Moon, seat 1 | 19 | 0 |
| B champion, seat 0 | 22 | 0 |
| B New Moon, seat 0 | 28 | 0 |
| Total | **95** | **0** |

Every source-owner root in the four trials categorized Clefairy as **benched-not-active**, never Active. The A source-deal fingerprint was `0c7fe4edd886a34f4a3711ec65b1f62aa23967856ae8247469b4328eebff43a7`, B was `b0118e670f87bbdb425e5aa06a39a13ce7e39ea229b51a7b85446eb886e8d5dc`. **95 repeated roots across four games and two source-deal fingerprints are dependent observations**, not independent experiments or win rates. All four games have unqualified untimed native terminals; zero qualified games.

**Next causal question:** when source Clefairy sits Benched, is it funded for Rondo, and is the source's Active Pokémon actually able to retreat or switch to it? Distinguish nonpayable attacker from missed mobility using owner hand, public board, actual Native prompts and completed opponent reply. Nothing here establishes a successful Rondo attack or opponent-deck strength.

Reproduce through `simulation/twinleaf/agent7-public-rondo-attack-offer.cjs`, `simulation/twinleaf/agent41-same-root-proposal-choice.cjs`, `simulation/evaluation/agent7-rank30-rondo-native-observe.cjs`, `tests/agent7-rondo-public-offer.test.cjs` and existing manual-only `.github/workflows/agent7-same-root-native-readonly.yml`.

**Field status: 29/32 authenticated opposing original 60s (23,25,28 missing), zero competitively qualified games, no demonstrated 99.5%.**

## Second read-only follow-up: Energy funding is absent (1 November, 20:18 UTC)

[Compiled native CI 41345788450](https://github.com/FlareZ123/experiment-01/actions/runs/41345788450), artifact [13099755398](https://github.com/FlareZ123/experiment-01/actions/runs/41345788450/artifacts/13099755398), archive SHA256 `e8bd761089f41f2b689293079d8f739426e16f807a2f8d429d10242fd5d3de0a`, again passed complete identical game-action and physical-deal parity. The exact same retrospective four source seed/candidate pairs were inspected, with no action changes or qualified games. The new audit independently counts each publicly Benched Clefairy copy's attached Energy cards, plus the owner-visible Active printing, generic held mobility printings and unused-retreat flag.

| Arm | Source owner roots | Benched Clefairy copy-root observations with zero Energy | Source Active printings across owner roots | Roots with a held known mobility printing |
| --- | ---: | ---: | --- | ---: |
| A champion | 26 | 26 | Empoleon V 16, Latias ex 7, Dedenne-GX 3 | 0 |
| A New Moon | 19 | 24 | Empoleon V 12, Latias ex 3, Dedenne-GX 4 | 8 |
| B champion | 22 | 40 | Mimikyu 22 | 22 |
| B New Moon | 28 | 54 | Mimikyu 28 | 28 |
| **Total** | **95** | **144** | Four original engine trajectories | **58** |

**Zero of these 144 observed Clefairy copy-roots had any attached Energy; zero source roots had a publicly funded Benched Rondo attack.** Multiple Benched copies and repeated turn roots explain 144 copy-root counts versus 95 source decision states. These are correlated developmental exposures across two original source deal fingerprints, not 144 independent trials. The source has three Clefairy ex, so more than one may occupy its Bench at a root.

The earlier Active-position diagnosis remains factually true, but **funding is an upstream bottleneck** in all four observed source trajectories. Therefore, a mobility-only Rondo intervention on these exact deals would be an unfunded attacker promotion, not a demonstrated route to more damage. The next question is whether owner-hand Wondrous Patch, publicly discarded Basic Psychic Energy, and viable ordinary attachments form an executable, resource-respecting Psychic setup line. A prompt-level native acceptance proof is required. Source's occasional held mobility and unused ordinary retreat do not themselves establish legal or desirable actions.

## Third original read-only replay: item access and actual Energy recipient (20:25 UTC)

[Compiled native run 41346336065](https://github.com/FlareZ123/experiment-01/actions/runs/41346336065) passed the same source-deal strict parity. [Unmodified full JSON artifact 13098939752](https://github.com/FlareZ123/experiment-01/actions/runs/41346336065/artifacts/13098939752) has ZIP SHA256 `1cce4d8ad0c521f91f8e024c9423ad9df334703f9d988467480837d7a4761929`. Its source public hand/discard/Psychic resource census finds:

| Source rank30 paired native arm | Roots holding Wondrous Patch | Roots with discarded Basic Psychic | Roots holding Battle Compressor | Roots holding Basic Psychic | Native-accepted source Basic Psychic attachment destinations |
| --- | ---: | ---: | ---: | ---: | --- |
| A champion | 0 | 3 | 26 | 3 | 2 to Active Latias ex |
| A New Moon | 0 | 0 | 19 | 1 | 1 to Active Dedenne-GX |
| B champion | 0 | 0 | 5 | 2 | 2 to Active Mimikyu |
| B New Moon | 0 | 0 | 14 | 4 | 3 to Active Mimikyu |
| **Totals** | **0** | **3** | **64** | **10** | **8 accepted Basic Psychic attachments, all to a non-Clefairy Active** |

These are repeated owner-root observations from the same two physical source deals and four trajectories. The count of hand-available Basic Psychic across roots must not be interpreted as ten distinct copies. The **eight accepted basic attachments** are actual distinct accepted Store actions found in `nativeAcceptedTargetSidecar.events`, each matched to a public post-dispatch target and the source physical seat. The native `rootActionLedger` shows **zero source PlayCardAction declarations for either Battle Compressor or Wondrous Patch** in these four trials. It is insufficient to infer they were never in the source's physical deck; the four Wondrous Patch are in the authenticated original source 60.

The causal bottleneck thus includes **first-return action priority and missing Item activation**, alongside a preference to attach Basic Psychic to the current Active. A pre-registered experimental owner-visible alternate Energy recipient is now a more pointed diagnostic than trying to promote unfunded Clefairy. It may still be tactically inferior in individual states; no win-rate claim follows.
