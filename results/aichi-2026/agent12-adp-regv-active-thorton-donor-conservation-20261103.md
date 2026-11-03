# ADP v2: Regidrago V already enters discard through the first Thorton swap

**Agent 12 | 3 November 2026 | exact original fixed-60 physical-Prize model, reproducible independent literal 60-deal Monte Carlo; native play/paper win qualification absent.**

## Correcting a redundant Battle Compressor resource assumption

Under the unchanged [Agent5 ADP/Thorton/Regidrago v2 printed 60](candidates/agent5-adp-thorton-regidrago-60-v2.json), **Regidrago V SIT135 can start the game in the Active Spot**. The player's first turn going second may then execute this precise line when all source-owned actions are available:

1. Start the original-seven **Regidrago V** Active, with no ADP in the initial seven; the first eight cards include **Double Dragon Energy, Battle Compressor and Thorton**. One **ADP CEC156** and **M Charizard-EX FLF69** must remain in the physical searchable deck after placing six Prizes.
2. Battle Compressor discards **ADP + M Charizard**, selecting only two cards under its printed **“up to 3”** permission; a beneficial third Dragon attack donor may be sent instead if one remains in the deck. **A second Regidrago V in the deck is unnecessary.**
3. Play **Thorton LOR167** to switch the discarded ADP with the **original Active Regidrago V**. The old Active Regidrago V enters the discard pile. The new Active ADP inherits its turns-in-play. Attach one DDE and use enhanced Altered Creation-GX.
4. If the original Active ADP survives to T2, recover a **second Thorton** from hand or the already-spent first through **VS Seeker**, swap the **discarded starting Regidrago V** into Active, evolve with a held Regidrago VSTAR, attach Basic Grass or Fire to the still-attached DDE, and copy the **already-discarded Dragon M Charizard Wild Blaze** using Apex Dragon. A physically payable T2 Ultra Ball retrieving VSTAR is also included when the VSTAR is unprized in the deck.

The actual printed Thorton says that attached cards, turns in play and other effects remain on the new Pokémon. The Starter Regidrago's own removal is the missing discard resource. **The previous three-target A/R/M Compressor script was valid as a deliberately narrower line**, but overstates the need to find a *second* Regidrago V in the deck in Regidrago-V-start positions. This matters for Prize collapse and choosing a strategically useful third Dragon donor.

## Exact original-seven, eighth-draw and six-Prize results

The independent [fixed-SHA exact program](../../scripts/agent12_adp_regv_starter_compressor_donor_exact.py) refines the original 60-category census by splitting its singleton Hisuian Goodra VSTAR (LOR136) from the generic other bucket. It conditions on an opening seven containing Regidrago V but no ADP; the active Regidrago itself is discarded by Thorton. It retains a physically spent first Thorton, Supporter recovery through second held Thorton or VS Seeker, T2 Basic Energy and VSTAR held or physically payable Ultra Ball, with no other search/draw/opponent events.

All results are fractions of **Basic-valid opening sevens**, including the chance of *having the specified original starter and eight-card resources*, so they are much smaller than the conditional chance after one has already started Regidrago.

| Compressor source targets | First-turn T1 GX prerequisite including real Prizes | T1 GX followed by T2 Apex resource opportunity |
| --- | ---: | ---: |
| **ADP + Regidrago V + M Charizard**, forced redundant R target (older route) | **1.820952329778%** | **0.098880894898%** |
| **ADP + M Charizard**, two targets (free third slot) | **1.865488256543%** | **0.099383590479%** |
| **ADP + M Charizard + Hisuian Goodra VSTAR**, deliberately loaded additional attack | **1.508580257937%** | **0.084916848930%** |

For the **two-target** sequence, the T1 gain over a needless Regidrago-V target is **+0.044535926765 percentage points** and the *full strict two-turn physical-resource* gain is just **+0.000502695581 percentage points**. This is an important difference: the access boost from omitting the extra R is real but negligible in this extraordinarily narrow T2 access model. It would be unjustified to modify the fixed list on that scalar alone.

The *additional attack-selection option* is strategically separate. The Goodra donor can be deliberately placed in discard along with ADP and M Charizard in **1.508580257937%** of all Basic-valid opening configurations while satisfying this T1 route, versus 1.865488256543% when only the first two mandatory cards need to be in deck. Thus, on **80.86785069%** of this two-target T1 physical-opportunity population, Goodra can be loaded as the third card **without additional Item or Supporter usage**. A player can simply use two targets when the Goodra donor is unavailable or not desirable. The extra Rolling Iron defensive attack can be tactically important against some original source matchups, but its expected matchup value, the risk of sending it to discard, and the later sequence are unmeasured.

### Exact arithmetic

The shared Basic-valid opening denominator for T1 is `250397245379590400`, counting the opening category composition, eighth drawn object and six jointly allocated Prizes. Exact corresponding T1 favorable numerators are **4559614473439872** (forced R), **4671131207262912** (two targets) and **3777443410213440** (extra Goodra). For T2, the respective favorable masses are **10646586592294128**, **10949566008382848**, and **9143066375072784**, with denominators T1 denominator multiplied by **43, 44 and 43** actual remaining deck draw positions. The program asserts all these integer invariants and the unchanged roster SHA `bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b`, and additionally requires the one exact Goodra LOR136 printing.

The two-target variant leaves **44 cards** after T1 search and Prizes; the three-target variants leave **43**, changing the probability of the T2 natural draw. The program therefore compares **different physical strategies** over the same starting distribution, never pretends the identical random seed produces the same ninth draw under both actions.

### Independent complete-shuffle check

The [independent physical simulator](../../scripts/agent12_adp_regv_starter_donor_physical.py) shuffles all 60 actual categorical objects, deals the opening seven, six face-down Prizes and one ordinary T1 draw, then *physically removes* exactly the chosen Compressor targets if present, reshuffles the deck, and draws one T2 card. It consumes the initial Active Regidrago, DDE, Compressor and T1 Thorton, and checks the retained second Supporter/VS, Basic Energy and VSTAR or physically payable Ultra Ball.

At seed **91212025** over **3,000,000 full-deck physical deals**, it observed **1,800,732 Basic-valid openings**, and strict T2 successes **1,723 / 1,851 / 1,514** across forced-R / two-target / Goodra-target modes. Corresponding observed rates **0.09568% / 0.10279% / 0.08408%** are compatible with the exact **0.09888% / 0.09938% / 0.08492%** rates under finite sampling. An additional independently generated 2,000,000-deal seed **12052025** gave 1,202,396 valid sevens and strict T2 counts **1,151 / 1,177 / 947**. The source script preserves the three-million reproducible second seed.

**CI:** The scripts are included in the already-existing manual, opt-in `agent12_adp_strict_screen` job of [Aichi English card coverage audit](../../.github/workflows/aichi-card-audit.yml). [GitHub Actions 41585165584](https://github.com/FlareZ123/experiment-01/actions/runs/41585165584) completed SUCCESS on head `cfe84660a282f2f33c5c3ab00c251ebc3534c979` with the exact integer assertions and independent shuffled-deal simulation. This job does **not** compile Twinleaf or complete native opponent games.

## Next release gate and explicit limits

The missing native proof is the genuinely **selected and paid** T1 Compressor -> Thorton Active R-to-ADP swap -> DDE -> enhanced GX -> next-own-turn Thorton ADP-to-R swap -> legal evolution -> attack against the same full original opposing 60, including a consequential opponent reply. A staged native swap alone is only a mechanical witness. Separately preserve First/Second player restrictions, opponent Item or Supporter lock, Temple of Sinnoh, Energy denial, ability lock, Prized singleton payload and real match time. The [Goodra Rolling Iron joint threshold report](agent12-adp-rollingiron-defensive-ko-breakpoint-five-originals-20261103.md) shows why access to a second defensive copied attack could matter but **does not qualify the extra third-donor route as a winning play**.

Project-wide decision remains **29/32 authenticated original lists** (missing 23, 25 and 28), **zero competitively qualified games**, **no selected final fixed 60**, and **no demonstrated 99.5% field win rate**.
