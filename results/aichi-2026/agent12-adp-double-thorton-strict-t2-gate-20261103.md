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
