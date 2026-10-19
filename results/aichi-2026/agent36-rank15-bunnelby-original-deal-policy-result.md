# Rank-15 authentic paired Bunnelby resource-policy test: no dual lock in eight aligned deals

**Agent 36, 19 October 2026. Evidence class: compiled pinned-Twinleaf source-dealt, fixed-60, paired development-policy diagnostic. Zero competitively qualified games.**

## Preexisting fixed protocol and compilation

The previously written [paired runner](../../simulation/twinleaf/newmoon-rank15-bunnelby-policy-pair.cjs) tested the exact published Aichi rank-15 Lopunny/Vileplume 60 against the unchanged New Moon Lockbreaker v1 English-mechanics proxy 60. Both comparison arms used the same initial physical deal for each of eight fixed seed/physical-seat streams: four repeat indices `0..3` from `deriveSlotSeeds(20261018,'pilot',15,repeat)`, each with the candidate in seat A or B. Both arms used the 260-root-action cap and pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The generic arm retained the generic `SimpleTacticsAi`; the source-aware arm enabled `bunnelbyK0SafeEvolution`, `bunnelbyObservedK1`, `bunnelbyTargetAwareEvolution`, `bunnelbyGuzmaHalaMode1` and `bunnelbyGuzmaHalaSearch`. The candidate 60 stayed unchanged. The policy was installed through existing shared headless flags, and all matching initial real-zone SHA-256 digests, actual draw-log first-player identities and physical deck hashes were asserted equal. The read-only source Prize gate classified the *initial* six Prizes before any policy-dependent actions.

**Compiled manual CI passed:** [run 39245816323](https://github.com/FlareZ123/experiment-01/actions/runs/39245816323), research head `cdc030e791ab839741899879d839a6e1333b550d`. The source observer and policy-root tests passed first. [Full paired JSON artifact 12183891165](https://github.com/FlareZ123/experiment-01/actions/runs/39245816323/artifacts/12183891165) has artifact ZIP SHA-256 `011d26ebdbaadfed70c1e71c73ed4ad3774d8028c7ad6d64d4cc3022fa7bcd48`. This ZIP checksum was independently recomputed from the downloaded artifact; all eight `identicalPrepolicySourceDeal` assertions were true.

## Root-Store board findings

| Repeat | Candidate seat | Candidate actually first? | Initial unprized dual-stage prerequisites? | Generic AOR first turn | Enhanced AOR first turn | Generic/Enhanced BUS or dual lock |
| ---: | ---: | :---: | :---: | ---: | ---: | --- |
| 0 | A | Yes | Yes | absent | absent | none / none |
| 0 | B | No | Yes | absent | absent | none / none |
| 1 | A | No | No | 27 | 27 | none / none |
| 1 | B | Yes | No | absent | absent | none / none |
| 2 | A | No | Yes | absent | absent | none / none |
| 2 | B | No | No | absent | absent | none / none |
| 3 | A | No | Yes | 45 | 45 | none / none |
| 3 | B | Yes | Yes | 38 | absent | none / none |

- **5/8** original physical deals had both Oddish, both Gloom, BUS singleton and at least one AOR Vileplume outside the initial six Prizes. These are merely necessary prerecovery physical conditions, as formalized in the [exact rank-15 Prize ceiling](rank15-dual-vileplume-prize-ceiling.md).
- Generic policy put an AOR Vileplume on the true source board in **3/8** streams. The enhanced policy did so in **2/8**. BUS Vileplume reached the board in **0/8** on either arm, and a simultaneous AOR plus Active BUS lock reached the board in **0/8**.
- Under the five initially eligible deals, generic AOR appeared in **2/5** and enhanced AOR in **1/5**. Neither arm established a BUS even in the five deals that had the essential cards initially accessible without Prize recovery.
- The policies visibly diverged in source action choices in three streams. On `0:B`, generic played zero `TM: Evolution`, one Jet Energy and one Grand Tree, while enhanced played two `TM: Evolution`, two Jet Energy and zero Grand Tree. On `2:B`, enhanced played one TM where generic played none. On `3:B`, generic eventually established AOR while enhanced did not, with Guzma & Hala played three vs two times. These counts are original root `cardsPlayedBySeat` events, not evidence that those resources generated useful attack/evolution effects.
- The existing `rootPolicyTrace` extractor found zero `Evolution` attack-name fields on root action-ledger rows in both arms. **This is not an exhaustive attack-resolution audit:** delegated Tool attacks and other prompt-mediated attacks may lack the same root-action representation. Verify native attack declarations and resolved TM targets before asserting zero actual Evolution uses.

## A concrete Bench-slot contention observation

At one read-only post-dispatch board snapshot in stream `repeat 0, candidate seat B`, the source had **all five Bench slots occupied on global turn 4** by Tatsugiri, Oddish, Budew, Buneary and Bunnelby, with Fan Rotom Active. That is just **one Oddish evolution-line slot** despite the source's *initial* dual-stage Prize prerequisites being wholly unprized. The same source board was observed under both policies at the first candidate Dusclops appearance. In stream `repeat 2, candidate seat A`, the source Bench was likewise full by the first observed candidate Dusclops turn (global turn 18): the generic arm had **zero** Oddish/Gloom/Vileplume chains in play and the enhanced arm had **one Gloom**. The occupied Bench alone then prevented adding a new Basic Oddish from hand until a Bench slot could legally be cleared.

These are **selected live-board snapshots**, not a comprehensive time-to-full-Bench exposure statistic and not proof that the source could never open room by switching, a Trainer effect, a Knock Out or other legal action. They show a concrete *additional* setup dimension beyond six-Prize availability: Bench allocation and exact Stage-chain occupancy. Before choosing between Artazon, Grand Tree, TM Evolution, Jet Energy and extra support Basics, an opponent policy should reserve realistic evolving slots where the dual lock is the intended winning line.

## Interpretation and next research decision

The tested Bunnelby/Guzma & Hala resource adjustments **did not expose** the opponent's intended dual Vileplume in the authentic deals. The two policies are not proven equally effective: one AOR board was lost under the enhanced arm, and this small, correlated, action-capped sample gives no calibrated performance estimate. The source 60 contains a Grand Tree ACE SPEC and two Artazon; changing resource searches without measuring the alternative Stadium and Supporter uses has apparent connector-domination risk. Bunnelby Evolution also needs a suitable Active and Tool position, Stage-capable Bench targets, legal timing, and subsequent Stage-2 decisions; the present instrument does not certify this whole line.

A productive next test should **first classify exact source-root missed decisions** on the five eligible deals: did a legal Bunnelby TM attack become available, was its Tool/Jet/stage line reasonably payable, which actual attack was selected after prompts, and was Grand Tree selected over a more useful search branch? Any additional source-policy variant should be compared against the same initial full physical deal and record genuine accepted attacks and their effects. Avoid launching another large generic full-game sample while these conversion barriers are unresolved.

The published 2026 Aichi field still has 29/32 exact full registrations (ranks 23, 25 and 28 remain missing). Neither arm's engine terminal is a competitively qualified game; no 99.5% win-rate claim follows from this diagnostic.
