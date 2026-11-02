# Rank-5 Crobat → charged Mew VMAX: one native retreat restores three settled attacks

**Agent 9 | 2 November 2026 | registered original-source regression | zero competitively qualified games**

## Finding

The preregistered, default-off, owner-public Crobat V paid-retreat policy was executed in the **already completed** [manual GitHub Actions run 41427913887](https://github.com/FlareZ123/experiment-01/actions/runs/41427913887), head `39a7d87288f98ba29d51d7f951f6c25e00bf9830`. The native archive was downloaded and independently inspected on 2 November. This was an existing completed test, so a later redundant dispatch was cancelled rather than charged a second full experiment.

In the previously identified **rank-5 original source versus New Moon, source seat 1** physical situation, the control played no source retreat and made **zero source attacks**. The treatment accepted one native **RetreatAction** at global turn **52**, immediately followed by **Cross Fusion Strike** from a Double Colorless Energy-funded Mew VMAX. It ultimately made **three native-settled source attacks** at turns **52, 56 and 60**, taking **five Prize cards**. Native source Prizes changed **6→6→3→1**. The unchanged-deck control ended at **[4,6]** remaining Prizes and treatment at **[6,1]**, ordered [candidate, original source]. **Both native games stopped at the 260-action cap; neither had an engine winner.** These are *particular source-deal developmental action outcomes*, not tournament-game win rates.

The policy's source-only seat gate was used **for causal diagnosis**. Such a role-conditioned policy cannot be presented as a competitive same-policy two-seat release.

## Immutable provenance and population

- [Pre-outcome registration](registrations/agent9-rank5-crobat-dce-mew-retreat-pair-20261102.json), [native runner](../../simulation/evaluation/agent9-rank5-crobat-retreat-pair.cjs), [retreat policy](../../simulation/twinleaf/agent9-crobat-dce-mew-retreat.cjs), [existing five-test fixture](../../tests/agent9-crobat-dce-mew-retreat.test.cjs).
- Native manual [workflow](../../.github/workflows/agent9-rank5-quickball-same-revision-pair.yml), successful **run 41427913887**, artifact **13132259052** (`agent9-rank5-crobat-dce-retreat-16arm`). ZIP sha256 `e7049fa2b4df5b7e6d01a8d367819aa4d8b6d5511875bd1867b2310b3786c849`. Its single full JSON is **36,167,907 bytes**, sha256 `ddbb5d1d62caa6ac6753cf440908f1fc1c256e32f779ad9caa0ba73c1a82bcd3`.
- Pinned upstream Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, authenticated unchanged source rank-5 Mew/Genesect printed sixty sha256 `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`.
- **16 recorded native attempts** = two modes × four original physical source situations × control/treatment. Each same-mode control/treatment comparison has **EXACT_MATCH** full physical initial fingerprint and source fingerprint, **8/8**. The two policy modes reproduced the same root/attack outcome counts on all four situations. Thus there are **four unique physical source situations**, not eight independent successes.
- The shared starting policy in both arms is original-source-scoped Quick Ball with native accepted owner-private Agent47 hand discards; the only treatment option is `sourceCrobatDceMewRetreat:true`. Source roles, original deck identities, policies and all unsuccessful exposures are retained.

| Distinct original physical trial | Control source retreats / attacks | Treatment source retreats / attacks | Treatment status |
| --- | --- | --- | --- |
| Candidate A, champion reference | 0 / 0 | 0 / 0 | Engine terminal, unqualified |
| Candidate A, New Moon | **0 / 0** | **1 / 3** | Action cap, no winner |
| Candidate B, champion reference | 0 / 0 | 0 / 0 | Engine terminal, unqualified |
| Candidate B, New Moon | 0 / 0 | 0 / 0 | Engine terminal, unqualified |

The one positive situation was **explicitly seen in the previous payment-pair archive before intervention registration**. Its exposure was selected for mechanism discovery. Generalization frequency or probability of improvement cannot be inferred from this four-deal cohort.

## Exact native chain in the positive case

The original source was Active **Crobat V DAA** with a Double Colorless Energy attached and had an evolved **Mew VMAX FST** on the Bench, plus two Genesect V FST donors. The source's own native post-Pass record confirms Crobat still Active and DCE-attached at **turn 50**. Both matched branches then performed an actual original-source DCE hand attachment at turn **52**, ordinal **214**.

| Phase | Accepted native chronology and independently captured effect |
| --- | --- |
| Position transition | Treatment root **215**, turn **52**, source physical seat **1**, accepted `RetreatAction`; native actor-root join records `accepted:true`, `nativePhysicalEffect:confirmed-public-effect`, `publicZonesChanged:true` |
| First payoff | Root **216**, turn **52**, settled Cross Fusion Strike with DCE on newly Active Mew VMAX; opponent Active Trevenant & Dusknoir-GX increased from **0 to 210 damage**; no Prize taken; opponent turn **53** passed |
| Second payoff | Root **230**, turn **56**, settled Cross Fusion Strike; original-source remaining Prizes **6→3**; on turn **57** opponent played Lillie's Clefairy ex then passed |
| Third payoff | Root **248**, turn **60**, settled Cross Fusion Strike; original-source remaining Prizes **3→1**; on turn **61** opponent played Latias ex and Psychic Energy, then passed |
| Control fork | At ordinal **215**, source instead passed. Source passed again through global turns 54/56/58/60/62; never attacked. Candidate's genuine Night Watch at turn **61** and another at turn **63** were present in the control's native ledger |
| Treatment horizon | Source attack settlement has **3 declarations, 3 native settlements, 3 same-epoch opponent-return receipts**, and 0 cross-clock-reset settlements; match is censored at 260 root actions, with source one Prize short |

The native attack-ledger first settlement shows a Double Colorless Energy on the **Active Mew VMAX**, and Crobat V on the Bench **without Energy**, alongside two Genesect V. This public board change is consistent with spending the Active Crobat's DCE to pay its printed single-Colorless retreat and retaining Mew's separate DCE. The **original** archive did not independently audit the physical fee's destination. A subsequent [read-only native exact-object audit](agent9-rank5-crobat-retreat-exact-fee-custody-native-20261102.md) has now **directly verified** that the same physical DCE object attached to Crobat reached the original player's discard pile after the actual native RetreatAction, while distinct original Crobat/Mew objects changed positions. Full paper-action-chain qualification remains unresolved.

## Actual copied-attack cooldown and legal attack cadence

The original submitted card source `cards/en/swsh8.json` prints Genesect V FST185 **Techno Blast: 210 damage; during your next turn, this Pokémon can't attack**. Mew VMAX FST114's Cross Fusion Strike copies the Benched Pokémon's chosen attack and its effects, consistent with the Advanced Player's Rulebook C-18. All three real original-source native `ChooseAttackPrompt` resolutions in this archive independently selected **Genesect V FST / Techno Blast** at prompt ordinals **217, 231 and 249**.

Source own turns **52, 54, 56, 58, 60** therefore have the exact observed sequence **Attack, Pass, Attack, Pass, Attack** on the *same* DCE-backed Active Mew VMAX. The two intervening passes are **consistent with the copied Techno Blast next-turn prohibition**, given no recorded switch/evolution/reset. They must not be counted automatically as missed legal attack opportunities. A tighter continuous-attack cycle would need a real switch or Retreat that removes that prohibition, with the corresponding payment and promotion witnessed. This prevents a naive attack-count optimizer from rewarding illegal repeated damage.

## Corrected evidence attribution

The existing runner's `nativeRetreatAudit` originally computed `sourceSettledAttackTransitions` from **`candidateAttackSettlement`**, then filtered nonexistent `attackerSeat` fields. That produced the misleading **0** field even though the archived source-ledger independently contains **three** settled attacks. This was corrected in commit `6a1f3f0122d5810c770d91a256ad064d28f18d6f` to use only `sourceAttackSettlement` when `auditedActorRole==='source'`, the source physical seat matches, prompt chains settled and action ordinal/name match the native source root. It now preserves same-epoch opponent-continuation count and per-attack Prize trace, with `retreatFeePhysicalDiscardVerified:false`. A separate synthetic role-attribution [regression test](../../tests/agent9-rank5-crobat-native-settlement.test.cjs) covers positive, absent, wrong-seat and clock-reset cases. **The original native archive and its byte hashes are unchanged.** The newly corrected fields are source-code outputs; they have not been retrospectively inserted into the immutable ZIP.

## Subsequent exact-object physical payment witness

A new separately [registered read-only audit](registrations/agent9-rank5-retreat-fee-physical-custody-20261102.json) completed in successful native [CI **41519629113**](https://github.com/FlareZ123/experiment-01/actions/runs/41519629113). Its archived artifact **13177775960**, ZIP SHA256 `3fde5d75fb372671d7ec71d2939ca02655846f20bdb4c6f4022d3f910bb21787`, contains the complete new 16-attempt JSON. The extra observer tracked actual DCE object identity from original Crobat attachment to its owner's discard after each Store-accepted Retreat, the original Pokémon object identities before/after promotion, the paid Energy object's absence from in-play indexes, and once-per-turn retreat consumption. **2 of 2 matching native roots** passed all these tests, representing the same one already-exposed source physical deal repeated under two policy modes. No fee was unverified or rejected.

Crucially, all **16 of 16** old/new original-Store `rootActionLedger` streams, original source/full physical fingerprints and native end-reason classifications **matched exactly** after normalized serialization. This confirms that the read-only instrument did not alter the previous game decisions. The rigorous [full custody report](agent9-rank5-crobat-retreat-exact-fee-custody-native-20261102.md) retains complete provenance, original witness and remaining paper qualification failures.

## Competitive limits and next experiment

This demonstrates a real **position-conversion failure** in a source player that held a charged Bench attacker while a support Pokémon occupied Active. One owner-visible, native-accepted retreat changed the line from repeated Pass to attacks and major Prize progress without replacing the original 60.

The later [exact physical fee receipt](agent9-rank5-crobat-retreat-exact-fee-custody-native-20261102.md) closes the narrow Crobat DCE discard-object custody question. Full paper-legality certification still requires independent active lock/effect fidelity, all copied-attack effect legality, original-owner zone tracking, opponent decision competence, proper 25-minute clock and 32 authentic original source lists. The source-only toggle is diagnostic; an eventual competitive policy must be **symmetric and preregistered**, with held-out independent original source deals, all four ranks' opponent continuations and all failures preserved.

The next useful test is a **fresh two-seat holdout** of Crobat→Mew recovery as part of the one actually selected integrated resource-to-attack policy, with complete paper legality, owner-zone conservation and opponent-response coverage. It should also distinguish **Mew VMAX's recurring Techno Blast cooldown** and charged Bench switching from immediate offensive access. Never interpret the native two-player Pass reply as proof the opposing deck was strategically competent.

**Field benchmark:** 29/32 authenticated Aichi original sixties, exact ranks 23/25/28 absent, zero competitively qualified games, no demonstrated 99.5% fixed-60 deck.
