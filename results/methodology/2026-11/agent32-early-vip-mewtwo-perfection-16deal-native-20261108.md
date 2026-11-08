# Early owner VIP solves real first-turn Passes, but funded Perfection bundle is not ready

**Agent32, 8 November 2026.** This precommitted live-native experiment introduced **an actual new first-turn line** to the existing two-seat common owner policy. The new opt-in Battle VIP Pass search prioritizes Mewtwo & Mew-GX UNM plus Gengar & Mimikyu-GX TEU **only after an owner-authorized native deck-search prompt**, if both physical Basics exist in that owner's current deck and at least two Bench spaces remain. The native prompt validator chooses and benches them. An early-public Energy recipient option and existing donor-specific Bench funding are combined with the previously validated paid Perfection root. The other arm has paid Perfection without those early setup extensions.

## Executed native field

The second distinct fresh [16-deal frozen registration](../../aichi-2026/registrations/agent32-fresh-early-vip-perfection-20261108.json), committed **before execution** at `b1dfbc90777f5c6fd8dbdf5a02393185f77ee4db`, covers original authenticated Aichi ranks **1, 3, 5, 6, 9, 11, 13, 26**, both candidate seats, and one fixed New Moon 60. [Native CI 42535963768](https://github.com/FlareZ123/experiment-01/actions/runs/42535963768) ran at source commit `0c036b48bc6afaa7cb67b9d73e82c0fb2a718ba4`. Its new syntax and **8 pure registration/choice tests** passed. Its native command deliberately exited nonzero due to real bot errors and retained the full [32-game artifact 13639382854](https://github.com/FlareZ123/experiment-01/actions/runs/42535963768/artifacts/13639382854).

| Genuine native measure | Perfection-only control | Perfection + early VIP/recipient |
| --- | ---: | ---: |
| Registered original 60-card matches | 16 | 16 |
| Physically matching initial/source deal pairs | 16 of 16 | 16 of 16 |
| Accepted physical Battle VIP Pass Items | existing policy | **11** |
| Settled owner-deck VIP search prompts | existing policy | **11** |
| Confirmed physical Basic-to-Bench movements | existing policy | **11** |
| VIP selections specifically pairing Mewtwo + Gengar donor | existing policy | **4** |
| Treatment Pass-to-accepted-VIP first divergences | n/a | **7** |
| Owner VIP searches left pending | n/a | **0** |
| Paid Perfection root intents | **4** | **0** |
| Native terminal games | 9 | 6 |
| Root-260 caps, unfinished | 6 | 7 |
| Native engine errors | 1 | 3 |
| Native terminal win reversals | n/a | **0** |
| Competitively qualified games | 0 | 0 |

The 11 accepted VIP placements occurred in **seven distinct treatment games**. Every chosen target was submitted through the genuine owner-deck search and the original native Store; in four searches the specific Mewtwo/Gengar pair was selected. Seven physical deals first diverged at the expected early **control PassTurnAction → treatment PlayCardAction(Battle VIP Pass)**. This is meaningful causal evidence that owner-held first-turn VIP turns a Pass into a native settled action, with real physical Bench changes.

**Perfection itself remained unconverted.** The Perfection-only control used four paid Perfection roots on original rank-11 seat B, seed **872485317**, copying Horror House-GX on global turn 14 and Poltergeist on turns 24, 26 and 28. The enhanced arm of **that same physical deal aborted with a redacted native bot-decoder failure**; neither complete ledger nor competitive game was returned. Consequently the 4-to-0 difference in Perfection counts is partly censored, and it is **not valid evidence that VIP or recipient funding suppresses Perfection**. Two other control native terminals became treatment root caps, and one control root cap became a treatment error. No terminal game reversed in the claimed direction.

## Decision and next directly useful intervention

**Keep the default shared VIP recipient unchanged.** The optional target logic is mechanically viable on a native owner-deck search, with actual Mewtwo/donor placement proved. Its gameplay benefit is unestablished: the larger setup bundle did not produce an additional paid copied attack, worsened native liveness in several pairs, and lacks skilled opponent policy and paper-clock qualification.

The next minimal diagnostic should **isolate VIP-only against this same already frozen common-policy source cohort** (a retrospective exploratory third arm, with no claim of fresh prospective inference). Retain the accepted owner Items/physical donor pair while removing competing early Energy-recipient and Bench funding switches. That isolates whether the extra root hooks caused the newly observed abort/cap differences. If VIP-only preserves liveness, then a separate *prospectively frozen* Energy allocation experiment can earn integration based on true Perfection attack and the opponent reply. Do not blindly promote a bundle on setup-count metrics.

## Source, tests and qualification boundary

- Original exact physical registration: `results/aichi-2026/registrations/agent32-fresh-early-vip-perfection-20261108.json`.
- Reusable owner's native VIP search, default off: `simulation/twinleaf/agent9-battle-vip-owner-after-pass.cjs`, optional `preferMewtwoDonorRecipient`. Native user-side deck-search prompt only, no opponent-hidden reads.
- Comparison runner: `simulation/evaluation/agent32-fresh-early-vip-perfection.cjs`, import of original common v8 two-seat prompt/Volt/Thorns layers with exact native root cap 260.
- Tests: `tests/agent32-perfection-vip-recipient.test.cjs` (5) and `tests/agent32-fresh-early-vip-perfection.test.cjs` (3), all 8 passed in CI.
- Original pinned Twinleaf: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The field remains 29/32 authenticated original inventories, with zero competitive games qualifying. No 99.5% benchmark, selected final fixed 60, paper-print legality certification or tournament-clock fidelity is established by this test.
