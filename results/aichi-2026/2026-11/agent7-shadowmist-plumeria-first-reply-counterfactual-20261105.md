# Agent 7: original rank6 counters Shadow Mist at first response using its held Plumeria, original native same-deal pair

**5 November 2026. Frozen 48-root eight-original-arm native Store A/B. Same physical first deal, source/candidate printed sixties, RNG and selected steward v4 policy. Development-only.**

## Original-source fact motivating this test

The [exact source-owner locked-Pass audit](agent7-shadowmist-crushing-hammer-native-pass-20261105.md) used the genuine [Agent36 steward-selected native v4 original-eight benchmark](../../../simulation/evaluation/agent36-issue25-steward-selected-v4.cjs) and found that the original rank6 Iron Thorns ex player retained **one Plumeria BUS and one Guzma BUS in hand** at each of its first four post-Shadow Mist turns (3,5,7,9). On each occasion, the original native player had used no Supporter, was affected by `cannotPlaySpecialEnergyCards:true` and `cannotPlayStadiumCards:true`, but `cannotPlaySupporterCards:false`. Both physical Supporter printings returned **preliminary native `card.canPlay(...)===true`**. The reference candidate exposed one attached face-up Energy. Its original automated opponent passed on all four turns. On source turns3 and5, **no Special Energy was in the source's hand**, confirming that the apparent inability to attach Energy did not explain the original choice to pass with held Supporters.

Earlier Agents 6, 4, 38 and 41 had proven Plumeria's real mandatory hand payment and physical opposing Energy-discard behavior in other rank6 original seeds (see [Agent6's paid counterfactual](../agent6-matched-t3-attack-vs-plumeria-native-20261030.md) and [Agent41's native Plumeria receipt](../agent41-original-rank6-common-plumeria-selected-native-20261101.md)). The unique question here is its **precise same authentic first Shadow Mist locked response** in original trial `6:100:A:champion-reference`, source physical seat1, seed100, original source starting-deal SHA256 `700f0f6e1fa884906c79cf2275741f036d212428fae01c8f2c132dc9ada086b2`.

## Intervention and reproducible CI

[Plumeria same-deal comparison runner](../../../simulation/evaluation/agent7-shadowmist-original48-plumeria-aba.cjs) uses [the established owner-only Plumeria-after-Pass adapter](../../../simulation/twinleaf/agent4-plumeria-after-pass.cjs) through the existing public `actorPlumeriaAfterPass` opt-in. Both control and treatment turn the independent Hammer-after-Pass feature off. The **only difference** between the two matching historic attempts is activation of this owner-visible Plumeria-after-Pass policy on both player seats; the registered owner and challenger sixty-card lists, original starting deals, actual first-player seat, source seat, seed, native Store, selected other wrappers and 48-root limit remain identical. All eight originally registered IDs, full physical-deal SHA256 and original source-deal SHA256 passed the exact match assertion.

**[Manual compiled CI 42075875645](https://github.com/FlareZ123/experiment-01/actions/runs/42075875645)**: native abort-custody job `127415804466` passed all tests with the full structured stdout marker `AGENT7_SHADOWMIST_PLUMERIA_ORIGINAL_AB`, GitHub workflow commit `42d58cd9c213953ceacabf5237d99696623aa7e1`, pinned vendor engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Test files: [pure](../../../tests/agent7-shadowmist-original48-plumeria-aba.test.cjs), [native](../../../tests/agent7-shadowmist-original48-plumeria-aba.native.test.cjs). Every original registered 48-root outcome remained admitted to the pair denominator, including the two unchanged rank11 engine errors (25 and14 original roots). **Six capped, two engine errors per condition, zero native game terminals, zero paper-qualified wins.**

## Original native root evidence

The first **22** accepted Store roots of the original rank6 champion-reference game were identical control/treatment. At source global turn3, the first substantive decision after the reference's first Shadow Mist, source physical seat1, the exact first different native root is:

| Property | Frozen control | Plumeria-after-Pass treatment |
| --- | --- | --- |
| Global turn3, native ordinal22 | **PassTurnAction** | **PlayCardAction Plumeria BUS** |
| Earlier genuine native roots | 22 identical | 22 identical |
| Source/player and printed sixty | Original rank6 Iron Thorns seat1 | Identical |
| Complete physical initial game deal | Original | Exact SHA256 match |
| Public effect response continuation | Original T4 candidate Shadow Mist | Treatment T4 candidate **PassTurnAction**, root29 |
| Native finish status | 48-root cap, unqualified | 48-root cap, unqualified |

The **treatment native Store** additionally accepted the actual mandatory Plumeria **three-prompt sequence**, all by the acting source owner:

| Native ordinal | Global turn | Original action |
| ---: | ---: | --- |
| **22** | 3 | `PlayCardAction` **Plumeria** |
| **23** | 3 | `ResolvePromptAction`, **ChooseCardsPrompt** (hand discard selection) |
| **24** | 3 | `ResolvePromptAction`, **ChoosePokemonPrompt** (opposing Pokémon selection) |
| **25** | 3 | `ResolvePromptAction`, **ChooseCardsPrompt** (attached Energy selection) |
| 26 | 3 | Source Pass after playing its Supporter |
| 27–28 | 3–4 | Native Wait prompts |
| **29** | 4 | Original candidate **PassTurnAction** |

This is a real paid-line **action and mandatory prompt completion** observation, stronger than the previous `canPlay` availability witness. The separately verified physical-effect receipt appears below. The first opposite-seat voluntary response after the divergence is authenticated and falls inside the same physical Store. The original historical control continued to Shadow Mist on its turn4 (as seen in the v4 prefix). The treatment's champion-reference player instead **passed** on turn4. This is a causally sequenced public *decision divergence* after source Plumeria and three mandatory prompts. The follow-up physical-effect audit below additionally establishes that an actual attached opponent Energy moved to discard. The candidate's Pass still cannot be certified as *forced* by that loss without a complete native action-availability analysis.

All **other seven original trial pairs** have identical full public root ledgers at their originally capped/errored counts. Their source physical initial deals and actual first-player seats match. No 25-minute clock, full-game paper-rule qualification, independent robust opponent choice or terminal outcome is established.

## Independently corroborated native physical payment and Energy effect

The follow-up **[compiled CI 42076859388](https://github.com/FlareZ123/experiment-01/actions/runs/42076859388)** at code HEAD `a82bb125d3ae5b507c2df591c77e08f9ba56670b`, abort-custody job `127419270540`, **passed** a strengthened native assertion on the *same exact eight original physical deals* and same Plumeria T3 root. It extracted the existing, independently implemented actor-only native Plumeria audit, returning this exact source-seat1 trial receipt:

| Native printed Plumeria payment / effect predicate | Actual count |
| --- | ---: |
| Accepted genuine Plumeria PlayCardAction | **1** |
| Accepted native mandatory prompt resolutions | **3** |
| **Physically settled opposing Energy removals** | **1** |
| Rejected Plumeria roots | **0** |
| Unresolved native prompt chains | **0** |
| Actual Plumeria by source seat1 | **1 accepted, 1 settled** |

The physical-settlement counter is strictly implemented in the independently existing [Agent4 source-owner Plumeria adapter](../../../simulation/twinleaf/agent4-plumeria-after-pass.cjs). Its final stage confirms **all of the following on the original physical Store after the native action**: the selected opposing attached Energy card is now in the opponent's discard pile and absent from the chosen Pokémon; the opponent has fewer attached Energy cards; the source's two actual owner-selected hand cards from its mandatory first prompt have both moved into the **source discard pile**. Only then is `settledEnergyDiscards` incremented. Thus the re-run **establishes complete native physical Plumeria payment and actual Energy removal** in the original source seat1 T3 branch, in addition to the already observed candidate T4 Pass versus continued Shadow Mist in the unchanged control.

The separate optional detailed payment-printing archive is disabled by default, so the receipt's `sourceOwnerPaymentsPhysicallyAccepted:0` means **zero detailed payment logs collected**, not zero physically settled payments. The code's native physical-settlement predicate still confirms two paid cards; it does not reveal their exact printings. This residual identity and strategic opportunity-cost question should be investigated with a separately labelled read-only owner receipt, before ranking Plumeria above cheaper or better-timed denial.

## Interpretation and next gate

The original rank6 source's very first Shadow Mist response was a strategically real-looking **resource-denial alternative**. The weak opponent policy passed despite available Supporters. The existing owner-only Plumeria option actually passed all three mandatory native prompts and altered the reference candidate's next voluntary action from an attack to Pass in this authentic fixed initial-deal comparison.

This also illustrates why theoretical lock success can be radically overstated when the *opponent's response policy* is too passive. The source paid two physical hand cards and consumed its sole Supporter turn; the identity and opportunity cost of those two discarded cards must be evaluated before asserting Plumeria was a superior move. An unbiased, paper-compatible adversarial opponent could choose Guzma, another Supporter, other Items, or deliberate conservation, and these remain counterfactuals.

Next proof: record the **exact printings** of the two physically confirmed source payments and their discard-capability / future option costs; verify whether the candidate had another Basic Psychic Energy attachment or alternative attack legally available on its next turn. Compare a bounded paid-counterplay line and one subsequent paid opponent action at exact original source seat and first-player settings. Carry all caps/errors and original qualifying-denominator failures. **No 99.5% win rate or fixed-60 superiority is demonstrated.**

## Subsequent exact printed-payment verification (18:05 UTC)

The earlier section's unresolved *printing identity* has now been resolved by
a separate read-only opt-in to the existing Agent4 native payment receipt.
The experimental source player at **global turn 3, seat 1**, paid exactly:

| Original physically paid card | Native hand index before payment |
| --- | ---: |
| **Trainers' Mail ROS** | **1** |
| **Trainers' Mail ROS** | **4** |

The independent native receipt marks both physical card selections
`acceptedByOriginalStore:true`. The same matched target still records one
settled opposing attached Energy discarded, the same first **22** root actions
before the control/treatment divergence and a T4 opposing **Pass**. The
opponent's Pass remains a **decision**, with no proof that it was legally forced.

**Evidence:** [manual compiled workflow 42080414733](https://github.com/FlareZ123/experiment-01/actions/runs/42080414733),
`abort-custody` job `127431660361`, `AGENT7_SHADOWMIST_PLUMERIA_ORIGINAL_AB`
structured native test marker, test
[`tests/agent7-shadowmist-original48-plumeria-aba.native.test.cjs`](../../../tests/agent7-shadowmist-original48-plumeria-aba.native.test.cjs).
The original two-seat runner now conditionally copies the already existing
`AGENT4_NATIVE_PAYMENT_RECEIPT_DEV` actor-owned receipt for inspection;
the flag adds no gameplay choice or prompt handling. The native test verifies
a single source seat-1 turn-3 receipt, exactly two **different physical hand
indices**, exact nonempty printed names, accepted original Store dispatch,
and zero unresolved native Plumeria prompt chains.

**Opportunity cost is real and still unresolved.** The original rank-6 printed
60 includes **three Trainers' Mail ROS**, and the card's printed effect looks
at the top four cards of the deck and can take a Trainer other than Trainers'
Mail. Paying two copies removes two potential Trainer-search Items from this
hand. Shadow Mist's observed lock flags blocked Special Energy and Stadium
plays, while allowing Items; hence the observed payment cannot be called
free or obviously optimal. The test did not establish whether those two
specific Mail copies were natively playable at T3, the contents of the
next-four-card windows, the full alternative owner-hand discard menu,
or whether some other discard pair had lower future opportunity cost.
Native selection currently follows the deterministic
[`chooseActorHandDiscard`](../../../simulation/twinleaf/agent47-actor-hand-discard.cjs)
copy-retention heuristic; it is not a strategic DCI oracle.

**The historical denominator has not changed:** eight paired original
source trials in each condition, six 48-root caps and two engine errors,
zero native terminals and zero competitively qualified games.
Do not treat this as win-rate evidence. The next material counterfactual
is a true owner-visible T3 source decision frontier, including both held
Trainers' Mail opportunities and Plumeria payment alternatives, and a
T4 candidate legal-attack/attachment assessment after the paid Energy removal.
