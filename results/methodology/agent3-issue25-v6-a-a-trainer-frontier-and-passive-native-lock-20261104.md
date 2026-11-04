# Issue #25: the original rank6 passive lock works natively, while both source actors repeatedly decline offered Trainer roots

**Agent3, 4 November 2026.** Evidence: retrospective **read-only native observation** on eight previously registered source rank6/rank11 arms. **No new source seeds, no changed contender or original decklist, no optimization selection, zero competitively qualified games.**

## Exact A/A replay and evidence custody

The eight source-rank, contender, physical-seat, and seed combinations are frozen in [Agent1's v6 registration](../aichi-2026/registrations/agent1-issue25-mirrored-r6-r11-20261104.json). This experiment separately precommitted all **eight** v6 source physical-deal SHA256, entire physical deal SHA256, accepted Store-root action-ledger SHA256, action count, disposition, original-source seat and starter: [v9 retrospective observer registration](../aichi-2026/registrations/agent3-issue25-v6-readonly-opportunity-pressure-retro-20261104.json).

Baseline: manual pinned native [CI 41894027367](https://github.com/FlareZ123/experiment-01/actions/runs/41894027367), artifact **13353289881**, ZIP SHA256 `7f8f8ab3f95f6cc7eb17ec12d5d37ff666924216a007b934ccaf662b4e905178`, raw JSON SHA256 `7ce7d32391074d9802a92c56056641b89b71ac16cd1e52f38f0fb2d0933b7f59` (145,149 bytes). This independent original-root audit is [documented separately](agent3-issue25-v6-real-source-action-starvation-20261104.md).

New retrospective [native CI 41902322503](https://github.com/FlareZ123/experiment-01/actions/runs/41902322503), artifact **13358807540**, ZIP SHA256 **`0f774fef6d375f15c227f718c210ab4be1ca4e5cfa75c0757169f912caec4f66`**, raw JSON SHA256 **`524cb93295e36ac672210643430aea925cde9edf9c29cd8803dcf0a4e76dd576`** (40,874 bytes), both independently downloaded and verified including archive sidecar.

Native original engine pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Committed source [Agent3 v9 read-only A/A](../../simulation/evaluation/agent3-issue25-v6-trainer-lock-readonly-v9.cjs), [7 pure adversarial tests](../../tests/agent3-issue25-v6-trainer-lock-readonly-v9.test.cjs), and [native test](../../tests/agent3-issue25-v6-trainer-lock-readonly-v9.native.test.cjs).

**Exact eight-arm parity: PASS.** All 8 of 8 independent baseline identity columns match the v9 rerun exactly: original source physical deal, full physical deal, entire Store-accepted root action list digest, accepted action count, disposition, actual source seat, and starter. This includes the original rank11/champion 25-root engine error, which remains an error and is not omitted. It is strong **same-observed-action read-only compatibility evidence for these eight frozen cases**. It does not prove general causal inertness of the observers or competitive quality.

**Corrected PASSING native CI:** [41902973898](https://github.com/FlareZ123/experiment-01/actions/runs/41902973898), artifact **13358498048**, ZIP SHA256 **`da0862806c18b95cf6b3214241007aa7da91fb359f376a6716a39c1abb252911`**, extracted JSON SHA256 **`1d5d72a792fab32208c1a488c1277f9c22699b2ee5b7636e076fe8f9e6fcf9ec`** (41,049 bytes), all independently downloaded and hashed. All eight baseline root/physical/state identity gates pass, and all seven nonerror arms carry actual owner Trainer observation. The engine-error arm still has no returned owner observer and is explicitly counted as unresolved, not silently excluded from the original eight.

## Two existing read-only observers, unchanged actual actor policy

The v9 diagnostic adds only the existing `runDevelopment` options `ownerGenericTrainerFrontier:true` and `nativePressureWindows:true` to the same v6 joined symmetric source-independent two-seat policy and same 48-root action cap. The first reuses Agent5/Agent29's owner-only native Trainer enumerator and conservative eligibility screen. The second reuses Agent39/Agent41's true pinned-Store passive Initialization and Garbotoxin windows. Neither observes opposing private zones to choose an action; the owner-private Trainer copy identities are **omitted from the v9 public artifact**. The flagged pure test ensures mismatch in any native ID/physical deal/accepted action digest cannot be promoted as exact paired evidence.

The original **rank11/champion engine error** does not produce a returned `actorOnlyDecisionCoverage` audit; therefore read-only Trainer observation is complete for **7 of 7 returned nonerror arms** and **7 of 8 registered attempts**. The first compiled CI **failed** a too-strong `8/8 trainer observer present` assertion despite matching all eight underlying native roots. The corrected and separately executed CI **passed** while retaining the engine-error evidence as **missing observer custody**, not a fake zero-opportunity row or a dropped trial. Both raw artifact versions remain immutable.

## Native source Trainer frontier: full observed denominator

| Original source rank / contender | Source seat | Genuine source-owner roots observed | Accepted Pass with generic-unblocked Trainer | Native-offered Trainer copy appearances | Generically unblocked Trainer copy appearances | Selected source Trainer roots |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 6 / Champion, 100:A | 1 | 5 | 5 | 40 | 38 | 0 |
| 6 / New Moon, 100:A | 1 | 5 | 5 | 40 | 38 | 0 |
| 6 / Champion, 101:B | 0 | 5 | 5 | 40 | 40 | 0 |
| 6 / New Moon, 101:B | 0 | 4 | 4 | 34 | 34 | 0 |
| 11 / Champion, 102:A | 1 | *not observed, engine error* | *not observed* | *not observed* | *not observed* | *not observed* |
| 11 / New Moon, 102:A | 1 | 6 | 5 | 40 | 40 | 0 |
| 11 / Champion, 103:B | 0 | 8 | 6 | 40 | 40 | 0 |
| 11 / New Moon, 103:B | 0 | 5 | 4 | 21 | 21 | 0 |
| **7 observed attempts** | | **38** | **34** | **255** | **251** | **0** |

In all **38 of 38** returned source-owner decision snapshots, the owner held at least one **generically unblocked** Trainer according to the existing read-only screen. Source rank6 made 19 owner-root Pass choices despite ≥1 such Trainer in **19/19** situations; source rank11 made 15 such Pass choices over 19 observed owner roots. No source Trainer was selected in any observed native arm. This makes the earlier explanation “perhaps the original actors held no Trainers” untenable as a universal explanation for these seven recorded runs.

Each `nativeOffered` and `genericUnblocked` count is **an appearance of a physical copy across repeated owner-turn snapshots**, possibly the same held card appearing many times. These 255 and 251 appearances are not independent card draws, 251 legal moves, 251 gameplay opportunities, or evidence that choosing a Trainer would improve results. In particular, payment/target constraints, Item/Tool locks, owner Supporter quota, K0 prize uncertainty, DCI and action contention remain relevant. Native ActionEnumerator output is heuristic and not equivalent to Pokémon's full paper legality.

**Observed bottleneck:** the currently executing joined resource/attack actor policy repeatedly chooses an accepted native Pass even while many printed Trainer cards are held, generically eligible and enumerator-offered. This is a policy-coverage diagnostic applicable to **these actual frozen native games**. The one engineered read-only reviewer does not suggest a paper legal line, identify the optimal Trainer or prove a winner.

## Passive Initialization: genuine native suppression, distinct from active Trainer choices

The original rank6 paper 60 contains **exactly four Iron Thorns ex (TWM 77) as its only Pokémon**. Every legally started game has that Pokémon in the Active Spot. `Initialization` is a continuously active Ability when Iron Thorns ex is Active; selected roots are not required to activate it.

The separate pinned-Store observer did see a real rank6 source-first t1-to-candidate-t2 continuous Active Iron Thorns ex and called the native `IS_ABILITY_BLOCKED` predicate on public printed candidate Powers:

| Frozen source-first trial | Native printed candidate Power checked at candidate turn 2 | Native blocked result | Rooted source turn 1, candidate turn 2 and source turn 3 |
| --- | --- | --- | --- |
| 6:100:A:champion-reference | Lillie's Clefairy ex JTG, **Fairy Zone** | **true** | **yes** |
| 6:100:A:new-moon-lockbreaker-v1 | Mewtwo & Mew-GX UNM **Perfection** and Squawkabilly ex PAL **Squawk and Seize** | **true for both** | **yes** |

Agent41's classifier returned `native-capability-suppression-with-rooted-turn-continuity` on **2 of 2 source-first rank6 arms**. Candidate-first rank6 trials are labeled `source-was-not-first`, making a source-first passive-window claim inapplicable to those rows. Rank11 uses its own Garbotoxin read-only window with no compatible source-first rank6 certificate.

These are **real native effect query results**, conditional on actual in-play board state. They do not prove the printed Power would have had a usable or beneficial action opportunity that turn. For example, Fairy Zone matters for Dragon Weakness but original Iron Thorns ex is Lightning. Perfection requires copyable attack access and funded Energy, and Squawk and Seize has time and discard conditions. Suppression may be genuine while tactical impact is zero or unknown. An independent effect counterfactual with an actually usable printed Ability is needed before crediting a game-disruptive benefit. Native engine correctness relative to paper interactions is separately unqualified.

## Qualification and next work

1. **Maintain both measured axes:** original source active Trainer/attack opportunities and passive Ability pressure should be checked separately. They can coexist in the same match.
2. Agent36's selected whole-policy release should include an owner-visible native offered/paid/targetable Trainer candidate competition on **both** seats, then compare against Pass within the same Supporter channel. Preserve possible deliberate strategic Pass decisions.
3. Qualify live passive lock through actual denied *usable* Ability opportunities, beyond mere native PowerEffect status. Require candidate reply and original source continuation after a real effect.
4. Audit errors and capped games with a lossless denominator, and retain the original v6 source-pair mismatch in rank6 101:B. Read-only A/A pairing for *a given contender* does not repair mismatching source openings **across different contender decks**.
5. Keep full printed original Top32 inventory requirement, payment/prompt semantics, action competence, owner information noninterference and 25-minute clock as separate release vetoes.

**Final status:** observer A/A physical and action parity verified on eight developmental native attempts; seven Trainer audits, two source-first native lock observations; one engine error persists; **0 competitively qualified games, no final fixed 60, no demonstrated 99.5% field win rate.**
