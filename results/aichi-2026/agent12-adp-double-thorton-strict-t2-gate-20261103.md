# ADP v2: exact double-Thorton first-GX-to-second-turn Apex hand bottleneck

**Agent 12 | 3 November 2026 | exact physical combinatorics + independent sampled check.** This is a new narrower follow-through screen of [Agent12's T1 Active-replacement route](agent12-adp-t1-thorton-active-gx-exact-opening-20261103.md), for the **same unchanged** [Agent5 ADP/Thorton/Regidrago v2 60](candidates/agent5-adp-thorton-regidrago-60-v2.json), canonical printing inventory SHA-256 `bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b`. Neither an engine game nor a competitively qualified win was produced.

## Exact strictly defined opportunity

The candidate goes **second**. A valid opening seven has a non-ADP Basic Pokémon but no ADP, and a non-ADP Basic is selected Active. It receives exactly one ordinary first-turn draw, without opponent mulligan bonuses. The first eight physical cards together contain at least one each of:

- Double Dragon Energy (4 in the deck);
- Battle Compressor (4);
- Thorton (4).

All six Prizes are sampled jointly from the other 52 cards. After Prizes, **one ADP, one Regidrago V and the singleton M Charizard-EX Wild Blaze** must remain in the draw deck. T1 plays Battle Compressor to put those **three specific** cards in discard; plays held Thorton to replace the Active Basic with ADP from discard, preserving its Active status and turns in play; manually attaches held Double Dragon to the Dragon-type ADP; then declares **enhanced Altered Creation-GX**. The Supporter for T1 is Thorton, so the Guzma & Hala T1 line is excluded. The GX attack uses two types supplied by the single Double Dragon. Rules/card-text feasibility is contingent on no blocking opponent effect.

Now require the T2 **second** Thorton, Regidrago VSTAR and **one Basic Grass or Fire Energy** to be present in the first nine cards, using precisely **one** additional natural draw. The T2 Thorton can replace the surviving Active ADP with the previously discarded Regidrago V, preserving turns in play and DDE, allowing Regidrago VSTAR evolution. The manual Basic Energy permits Apex Dragon's colored cost from the 2-unit DDE plus Basic. The earlier Compressor supplied M Charizard-EX for Wild Blaze. This T2 branch assumes surviving Active position, free Supporter, no Energy denial, no damage-caused Thorton HP-collapse and no effects blocking the attack.

The event **excludes** Quick Ball, Ultra Ball, VS Seeker, Pokégear, additional Compressor, Tag Call, effects drawing additional cards, any alternative Pokémon/payload discard path, opportunistic switch/retreat, mulligan bonuses, other resources from opponent actions and all opponent gameplay. It is an intentionally narrow direct-hand baseline, **not an upper bound** on skilled T1 or T2 play.

## Exact result

| Physical route | Probability conditional on a Basic-valid opening seven |
| --- | ---: |
| T1 non-ADP starter, first-eight DDE + Compressor + Thorton, all three Compressor targets remain in deck after six Prizes | **2.848909491993%** |
| Same T1 event plus a second Thorton, VSTAR and Basic Grass/Fire by T2 through at most one natural draw | **0.050067729202%** |
| Strict T2 completion conditional on the first row's T1 event | **1.757434883153%** |

The first row independently reproduces the previously reported **2.84890949%** triple-target T1 screen. It is counted over `7,133,590,891,308,288 / 250,397,245,379,590,400` category-weighted seven/eighth/Prize outcomes.

The joint T1+T2 result is the exact integer ratio:

```text
  5,390,833,234,048,416
--------------------------- = 0.0005006772920175687
10,767,081,551,322,387,200
```

All fractions condition on the candidate's initial seven containing at least one of its seven Basic Pokémon. The invalid-seven probability/mulligan compensation is outside the experiment.

## Counting mechanics

The executable [source-manifest-locked Python enumerator](../../scripts/agent12_adp_double_thorton_strict_chain.py) reads and canonical-SHA-checks the selected JSON, partitions the unchanged sixty into disjoint counts `[ADP2, RegV3, otherBasic2, DDE4, Compressor4, Thorton4, VSTAR3, BasicEnergy7, MCharizard1, other30]`, and enumerates all valid initial-seven category compositions and one weighted first draw. It uses inclusion-exclusion over the **joint six Prizes** to keep at least one ADP, RegV, and M Charizard physically in the deck.

After first eight and six Prizes, 46 cards remain in deck. Compressor discards one each of the three designated source targets, leaving **43 possible T2 natural-draw cards**. When all T2 target categories are already held, every one of 43 T2 draws qualifies. When exactly one T2 category is missing, a target card is reserved unprized from that remaining category and the six Prizes are enumerated from the remaining 51 unknown cards using the same three-target inclusion-exclusion. If two T2 categories are missing, one natural draw cannot complete the strict route. All numerator/denominator integers are asserted by the script. The T2 denominator is `[C(60,7)-C(53,7)] × 53 × C(52,6) × 43`.

A **separate, physically shuffled Monte Carlo** used 1,000,000 uniformly sampled original 60-card seven-card hands, then an ordinary eighth draw, six random Prizes, exactly the three named Compressor target cards, and a random T2 draw from the 43 remaining cards. RNG seed `7121203`, 599,922 Basic-valid seven-card hands, 17,107 T1 valid setups, and **299 strict T1+T2 successes**. Conditional empirical success `0.0498398125%`, with approximately `0.04450%–0.05582%` Wilson 95% binomial interval; this is consistent with the exact `0.0500677292%` answer. The Monte Carlo check was local, no GitHub Actions compute was consumed.

## Consequence and limits

The alternate T1 Thorton bridge can broaden access beyond starting ADP, but **a second Supporter of exactly the same name, a VSTAR and a colored Basic Energy are severe direct-hand T2 demands** when T1 already consumed Compressor and a Thorton. The common policy's connector usage matters enormously. This is a strategic bottleneck diagnosis supporting **searching for a paid, real T2 conversion policy**, or rejecting the candidate if it cannot convert its actual T1 GX opportunities into attacks against original sources. It does **not** prove the deck can win only 0.05% of games, or that the broad candidate concept cannot work: additional search, a drawn Regidrago and other DCI/AMR-aware choices are omitted.

Next decisive experiment: on identical original-source physical deals, trace the selected owner T1 Thorton/GX root, T2 returned Supporter access, VSTAR search/evolution, Basic attachment, copy payload in discard, complete opponent response, and veto causes. Include actual rank6 Energy removal and rank8 Temple cases, and compare with the already registered direct ADP/Tag Call-Switch paths. Preserve failure/root denominators and frozen profile identity before assessing candidate strength.

**Field status:** 29/32 original sixties authenticated, ranks 23/25/28 missing, zero competitively qualified games, no selected strongest fixed 60 and no demonstrated 99.5% win rate.


## Exact registered-deck extension: the one VS Seeker recovers the T1 Thorton

The v2 fixed 60 contains **VS Seeker XY4 109 ×1**. After T1 Thorton resolves and is discarded, a T2 VS Seeker can return it to hand, provided Items remain playable. This is a legitimate second route to the *same* T2 Supporter and does not require two naturally held Thorton copies. The identical opening, triple-target Compressor, DDE, natural-draw, six-Prize and VSTAR/Basic Energy assumptions remain. On T2 the Supporter access predicate changes to **at least two total Thorton seen OR at least one Thorton and the singleton VS Seeker seen** among the first nine cards, while at least one Thorton is required by T1.

The manifest-locked Python enumerator now distinguishes VS Seeker (one copy) from the other 29 cards. Its new disjoint physical-card bucket sequence is `[ADP2, RegV3, otherBasics2, DDE4, Compressor4, Thorton4, VSSeeker1, VSTAR3, BasicEnergy7, MCharizard1, other29]`. When T2 Supporter access is the **only** missing category, the single T2 draw may be a Thorton *or* VS Seeker, and we count both physical target groups without double counting. All cases retain the 43-card post-Compressor T2 draw deck.

| Identical strict physical T1 setup and T2 target | Probability conditional on Basic-valid seven |
| --- | ---: |
| T2 second physical Thorton only (previous result) | **0.050067729202%** |
| T2 second Thorton **or VS Seeker** recovering the spent T1 Thorton | **0.075817606841%** |
| Absolute contribution from the existing singleton VS Seeker | **+0.025749877639 percentage points** |

With VS Seeker permitted, the exact numerator is `8,163,343,558,830,768` on the same denominator `10,767,081,551,322,387,200`; relative to the strict second-Thorton route this is **1.514300889×**. Conditional on the T1 triple-target setup, the more inclusive direct-hand T2 completion fraction is **2.661285205939%**. A separately seeded physical 1,000,000-shuffle check (seed `7115005`) obtained 601,407 Basic-valid openings, 17,090 strict T1 opportunities, 289 second-Thorton completions and **453 completions with VS Seeker**, i.e. an empirical **0.07532337%** among valid starts against exact **0.07581761%**.

This demonstrates a material native *retrieval channel* within the unchanged deck, while preserving the very low no-extra-search T2 conversion rate. It does not account for Item lock on VS Seeker, Tool/Energy denial, T2 VSTAR tutors or active-spot survival. No deck alteration is recommended from these isolated probabilities.


## Existing Ultra Ball: third exact direct-hand T2 channel

The fixed v2 list also contains **Ultra Ball SWSH9 150 ×4**, which can search Regidrago VSTAR when none is held, provided a VSTAR survives in the deck and the two-card discard can be paid. With only the defined first-turn Compressor, Thorton and DDE attachment played and one original Active Basic removed from the opening hand, T2 begins with exactly five physical hand cards after its natural draw. If the required T2 Supporter or VS Seeker, Basic Grass/Fire and Ultra Ball are among those five, **two other physical cards are available to discard**. Their strategic discardability is unproven. Item lock or opponent interference remains excluded.

The SHA-locked Python enumerator now separates Ultra Ball ×4 and searches the actual post-Prize deck for VSTAR. It requires all three original Compressor targets to survive in the deck and, when Ultra Ball must search, an additional searchable VSTAR. Its T2 draw counting subtracts the specific Compressor target removed from each of the three target categories; a previously discarded card cannot also be a natural draw.

| T2 route after same strict T1 GX | Basic-valid opening probability |
| --- | ---: |
| Second Thorton and held VSTAR/Basic Energy | **0.050067729202%** |
| Second Thorton **or VS Seeker** and held VSTAR/Basic Energy | **0.075817606841%** |
| Above Supporter recovery, held VSTAR **or physically payable Ultra Ball search**, held Basic Energy | **0.159943409900%** |

The all-channel numerator is `17,221,237,379,951,920` with unchanged denominator `10,767,081,551,322,387,200`. The Ultra Ball extension adds **0.084125803059 percentage points** above the VS Seeker route. The complete three-channel strict T2 event occurs in **5.61419766%** of the strict T1 opening subset, with all draw/search exclusions unchanged.

Independent 1,200,000-game physical permutation simulation (random seed `12122023`) observed 721,076 Basic-valid opening hands, 20,437 qualifying T1 starts and 1,132 complete T2 hands using the three channels: empirical **0.15698761%**, consistent with the exact 0.15994341%. This was local computation without Actions spend. All results are physical opportunity predicates; paper usability, discard desirability, actual owner choices, full opponent continuation and qualified games remain unproven.
