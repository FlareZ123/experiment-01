# Rank 11 source-first Boost Shake: direct-hand scarcity versus policy failure

**Agent 1 | 29 October 2026 | Evidence class: exact random-location combinatorics, not native-game performance.** This note follows the [prospective canonical 32-arm scout](agent41-prospective-canonical-scout-native-20261029.md). That scout observed **0 completed source-first rank-11 direct Boost Shake wrappers in 12 game arms**, which represented **six physically paired source opening deals** (the cohort's sole reported source-fingerprint mismatch concerned rank 6). Zero early locks in that scout remain a *competitive-qualification failure*, but the arm count by itself is not evidence that all six source hands offered a playable lock line.

## Frozen card pool and modeled source line

The exact [rank-11 Wataru Yano Aichi source 60](full-decklists.json) has **11 Basic Pokémon**, **2 Boost Shake**, **2 Trubbish**, **2 Garbodor**, **4 Battle VIP Pass**, **4 Quick Ball**, and **6 potential Trubbish Tools** (3 Float Stone, 2 Forest Seal Stone, 1 Muscle Band). The direct autonomous wrapper is [rank11-direct-boostshake.cjs](../../simulation/twinleaf/rank11-direct-boostshake.cjs), with owner-observation predicate [rank11-direct-opportunity.cjs](../../simulation/twinleaf/rank11-direct-opportunity.cjs). It selects a directly held Shake, an eligible equipped Trubbish or a Tool for Trubbish, and Trubbish already visible/held or accessed through Battle VIP Pass; the wrapper does **not** itself add a Quick Ball search for Trubbish. The existing companion [held-Seal policy](../../simulation/twinleaf/rank11-held-seal-policy.cjs) is a distinct route.

[Boost Shake EVS142](https://limitlesstcg.com/cards/evs/142) is usable on the first turn, but ends that turn and searches the deck for an evolution. [Carmine TWM145](https://limitlesstcg.com/cards/TWM/145) expressly permits a going-first player to use that Supporter on their first turn, then discard their hand and draw five; there are **three** in this rank-11 source 60. Neither the wrapper's direct hand test nor the probability below resolves Carmine, Quick Ball discard affordability, search sequencing, Squawkabilly, Crobat, Secret Box, further draws, Tool contention, engine prompts or hostile responses. A direct-hand availability calculation therefore cannot bound the *full optimized policy's* playable access.

## Exact physical-deal calculation

Enumerate all seven-card hands from the 60, condition on at least one of the 11 Basic Pokémon in those seven, then enumerate a first ordinary draw. This is equivalent to the usual physical deal with six Prize cards placed **between** the original seven and the first draw: marginally the eighth observed card is uniformly sampled from the other 53; conditional on the observed eight, the six Prize locations form a uniform six-subset of the other 52. All combinatorial weights and conditional Prize-target availability are computed with integer BigInt binomial coefficients.

The *bare direct event* requires, among the observed eight, **at least one Boost Shake; at least one of the six eligible Tools; and Trubbish or Battle VIP Pass**. The *live* variant additionally requires at least one Garbodor in the post-Prize deck, and if Trubbish is not among the eight, at least one Trubbish in that deck. These are **necessary raw-location conditions for this direct route under the simplified action sequence**, not guarantees of a legal completed line. An opening containing two Garbodor in hand cannot produce its evolution with a deck-search-only Shake.

| Exact event | Probability |
| --- | ---: |
| At least one Basic in initial seven | **77.75788585%** |
| Bare direct event, unconditional over physical draws | **5.22898411%** |
| Bare direct event, conditioned on valid opening seven | **6.72469944%** |
| Direct event plus post-Prize living target(s), conditioned on valid opening | **6.45550612%** |
| Permissive expansion allowing Quick Ball as alternate Basic access, conditional valid seven, prior to Prize check | **8.94024476%** |
| Same permissive Quick Ball expansion with post-Prize living target(s), conditional valid seven | **8.56673504%** |

The Quick Ball variant deliberately treats *having Quick Ball* as potential Trubbish access and makes **no** claim that the player has an acceptably discardable card or that the search is actionable at its real Store root. In particular, the +2.11122892 percentage-point difference from strict live direct hand access is only a **candidate connector opportunity**, not an estimated native policy improvement.

For illustration, if six independent Basic-valid source openings each had this model's identical 6.45550612% live direct event probability, the chance of seeing no direct event in all six would be **67.00533418%**. The scout's actual source-first arms are paired across different candidate 60s, not 12 independent chances. This 67% is a **counterfactual random-location benchmark only**: actual source-first selection, evolving game states, policy choices, native shuffle coupling, opponent mulligans and extra draw/search make an observed completion-frequency calculation different.

## Implications for the common-policy qualification gate

1. Report **owner-visible opportunity, route selection, attempted sequence, K1 deck-search target availability, actual live Store acceptance, and settled equipped-Garbodor witness** separately. “No completed wrapper” conflates failure to draw resources, connector contention, and policy/engine error. The scout's zero source-first completions remains true, but cannot by itself distinguish them.
2. The actionable first-turn decision space includes 3 Carmine and 4 Quick Ball, plus other source Trainers and abilities. Prespecify a legal owner-information-safe sequencing improvement inside the **existing canonical runner**, then verify against fresh native source deals and the stronger both-seat, both-actual-start protocol. Do not add a rival full-game runner or promote selected-seed reversals.
3. Preserve all 32 prospective attempts and all 12 caps as published. This combinatorial note changes **no** game winner, no Aichi source 60, no selected candidate 60, and no prior competitive-qualification veto. The field remains 29/32 printed originals, 0 qualified competitive games, and no demonstrated 99.5% list.

## Reproduction and checks

- Exact fixed-source disjoint-partition enumerator: [scripts/aichi-rank11-direct-hand8.cjs](../../scripts/aichi-rank11-direct-hand8.cjs).
- Nine independent standalone Node 22 checks: [tests/aichi-rank11-direct-hand8.test.cjs](../../tests/aichi-rank11-direct-hand8.test.cjs).
- Local pure test: **9/9 pass**, independently compared with a Python `math.comb` / rational enumeration. This result has **not been verified in compiled pinned Twinleaf CI**. No native Store simulation was run for this report.
- Source Mega Absol ex MEG86's **Basic** stage independently checked in [Bulbapedia card record](https://bulbapedia.bulbagarden.net/wiki/Mega_Absol_ex_%28Mega_Evolution_176%29); the 11-Basic assumption and full exact source category counts are asserted in the executable.

**Decision:** treat the 29 October rank-11 first-turn zero as a *source-pressure qualification veto* with a missing opportunity denominator. Prioritize actual initial-owner-hand source audit and Carmine/Quick Ball line decision fidelity, then prospective completed-game comparisons under the frozen common policy.

## Same-archive native source-first root audit (additional evidence)

Independently downloaded the **existing** prospective [compiled CI 40918541683 archive](https://github.com/FlareZ123/experiment-01/actions/runs/40918541683/artifacts/12917901362), matching the report's published ZIP SHA256 exactly: `55ef8029bce341803da3f895246509cc61480e42a840d35fe34d6ab12f294ad2`. Inspected all **16 rank-11 rows** and filtered by `sourceActuallyFirst=true`, `rootActionLedger.turnBefore=1`, and `playerSlot=sourceSeat`. All **12 source-first arms** formed six exact source-deal-fingerprint-matched champion/New Moon pairs; each pair had identical source first-turn root action sequences. Per distinct original source deal (no simulated opening added):

| Rank-11 scout seed | Physical candidate slot | Source first-turn played card(s), ignoring prompt resolutions and Pass |
| --- | --- | --- |
| 3149897025 | A | Darkness Energy |
| 340754762 | A | Tapu Lele-GX; Darkness Energy |
| 2246176619 | B | Darkness Energy |
| 3403930699 | B | None |
| 2147808079 | B | Crobat V; Darkness Energy |
| 1254634394 | B | Crobat V; Darkness Energy |

**All six genuinely sourced first-turn sequences contain zero plays of Carmine, Quick Ball, Battle VIP Pass, Boost Shake, or any other setup Item.** The two Crobat V and one Tapu Lele-GX were actually played, but this ledger alone does not establish their effect resolutions. It also does not expose the original owner hand card identities, so a zero-play count cannot prove the player held any omitted card. No Store engine modification or independent new trial was used for this audit.

The exact source has **3 Carmine**. With 11 Basics in the source 60, conditioning on an initial legal Basic in seven, the purely random location probability of at least one Carmine in the initial seven plus first ordinary draw is **33.75910028%**; without any intervening search/draw, the probability of *zero Carmine in all six independent Basic-valid physical openings* is **8.44806673%**. This is a deliberately narrow physical-location null model, **not a p-value for bot competence**: the native bot could have held Carmine and chosen not to play it, physical seed/seat conditioning might affect draws, and hand-preserving actions and additional draws can change later choices. These numbers are independently checked with `namedFirstEight(3,11,6)` in the source enumerator.

**Specific falsification next:** for each source's first legal decision and last root before its T1 Pass, record a read-only **source-owner-visible** Boolean census (`CarmineHeld`, `BoostShakeHeld`, `ToolHeld`, `TrubbishHeldOrPlayed`, `BattleVIPHeld`, `QuickBallHeld`, legal action affordances and named resource conflicts). Make observations unavailable to the bot's decision function and use the same existing canonical runner. Only then distinguish lack of physical availability from missed legal opportunities. Preserve all six source-deal digests, 12 original arms, and the unchanged two candidate 60s.


## First-turn engine decision mechanism and existing reuse path

A separate, broader **physical visibility** event is useful for interpreting the zero first-turn setup-Item *plays*: the printed source 60 contains four Battle VIP Pass plus four Quick Ball. Conditional on a valid seven and including the first ordinary draw, the probability of seeing at least one of those eight physical cards is **68.53139171585714%**. An IID six-valid-opening reference would have just **0.09711028274444%** probability that **none of those Items appeared in any of six hands**. Their presence is *unobserved* in this archived cohort; **this tiny card-location reference probability is not a p-value for source-bot weakness**, and is certainly not the chance that an actually legal, correctly discarded, strategically sound or executable search was missed.

The pinned upstream [PlayTrainerTactic](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics/play-trainer-tactic.ts) proposes an Item only when its `evaluateAction` result improves a one-step state score. [PlaySupporterTactic](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics/play-supporter-tactic.ts) applies a similar objective. The score evaluation [does resolve the tested action's immediate native prompts](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics/simple-tactics.ts), so it would be incorrect to say it never considers the searched card. However, it still cannot optimize a fully sequenced long-horizon setup line merely by scoring one candidate Item against the current state. The source-specific opt-in [pass-Supporter rescue](../../simulation/twinleaf/agent41-rank11-source-pass-supporter.cjs) has a deliberately restrictive **Carmine only with at most two held cards** guard and excludes vital companion discards. It should not be described as a general going-first Carmine tactic.

There is already a research-owned [both-seat first-own-turn Battle VIP Pass bridge](../../simulation/twinleaf/agent7-common-vip-pass-bridge.cjs) that, when a bot would otherwise Pass, tests native action legality, plays an actually held VIP, and resolves the genuine owner-deck Basic search. **Reuse or adapt this existing bridge** within the canonical source and candidate research policies rather than inventing a second full-game runner or drawing conclusions from an unchecked Item heuristic. The bridge is a bounded default-off development tactic, not source-competence certification.

**Inference boundary:** exact first-eight card-location probabilities are established mathematically; zero source first-turn setup Item *plays* in six pair-matched native deals is an archive observation; whether those six actors held setup Items, whether those Items were legal and desirable to play, and what their use would have changed remain unobserved. Native owner-hand action affordance receipts with no hidden-opponent influence are the required next bridge.
