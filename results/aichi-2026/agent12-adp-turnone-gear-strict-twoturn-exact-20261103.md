# Fixed ADP v2: turn-one Pokégear bridge and exact physically payable turn-two conversion

**Agent 12 | 3 November 2026 | exact fixed-60 joint-Prize/top-seven combinatorics plus independently seeded physical-deal simulation. No native opponent games or qualified wins.**

## Decision-changing result

The existing unchanged [ADP/Thorton/Regidrago v2 printed 60](candidates/agent5-adp-thorton-regidrago-60-v2.json) already contains **two Pokégear 3.0 (SVI 186)**. Earlier [strict two-turn analysis](agent12-adp-pokegear-t2-topseven-exact-20261103.md) allowed Pokégear on T2 to recover a second Thorton after a **T1 directly held Thorton**. It omitted a different actual line: **no Thorton in the first eight**, but T1 Pokégear searches the top seven remaining cards to obtain the first Thorton.

The new [SHA-locked exact enumerator](../../scripts/agent12_adp_t1_gear_t2_exact.py) quantifies both the **first-turn physical opportunity** and its stricter **second-turn conversion** with no deck changes:

| Event, conditional on Basic-valid opening seven | Earlier model | T1 Pokégear-inclusive | Absolute gain |
| --- | ---: | ---: | ---: |
| First-own-turn enhanced Altered Creation-GX | **2.848909491993%** | **3.373782255343%** | **+0.524872763350 percentage points** |
| Above followed by T2 legal physical access to Regidrago VSTAR Apex Dragon | **0.198681171853%** | **0.220877762827%** | **+0.022196590975 percentage points** |

The *newly admitted T1 Gear* portion converts to the modeled T2 line only **4.228947%** of the time, versus **6.973938%** for the previous T1 direct-Thorton population. This distinction makes a strong first-turn connector gain an appreciably smaller full two-turn gain. Relative to their respective previous models, the new gains are **18.42% on T1** and **11.17% on T1+T2**. These are narrow physical **opportunities**, not strategy-policy realizations or game win rates.

The final combined two-turn event is the reduced exact rational

```text
167606471030139440831239
------------------------
75882003187988021112816000
```

The additional Gear-T1/T2 branch alone has fraction `4210804467732017031781 / 18970500796997005278204000` (probability **0.022196590975%** of Basic-valid opening hands). The T1 Gear-inclusive event is `8772200857193557761100531966272 / 260010877800491112021262865638400`.

## Scope and physically legal action sequence

The candidate canonical cards digest is **`bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b`**. Its relevant exact buckets remain 2 ADP, 3 Regidrago V, 2 alternative starting Basics, 4 Double Dragon Energy, 4 Battle Compressor, 4 Thorton, 1 VS Seeker, 3 Regidrago VSTAR, 7 Basic Grass/Fire Energy, 4 Ultra Ball, 1 Dragon M Charizard-EX, 2 Pokégear and 23 other cards. No card was swapped.

The modeled sequence goes second, starts a Basic other than ADP from the seven-card opening, receives one normal T1 draw, and requires a held DDE and Battle Compressor. All six Prize cards must leave at least one ADP, Regidrago V and Dragon M Charizard donor in deck. Battle Compressor sends precisely those three to discard, leaving a 43-card deck after the initial eight and Prizes. When first-eight Thorton is absent, the first held Gear looks at seven cards; after a failed attempt it shuffles before an optional second Gear looks again. A successful Gear fetches one actual surviving Thorton, which uses the turn's Supporter action to replace the starting Active with ADP, preserving attached/turn history; DDE powers enhanced Altered Creation-GX.

One retrieved Thorton comes out of the deck, so the T2 natural draw is from **42 cards**, leaving **41** for a possible T2 Gear top-seven search. T2 support must be physically available via a newly drawn Thorton, VS Seeker for the used Thorton, or one surviving Gear search. A Basic Grass/Fire Energy, a held VSTAR or **payable** Ultra Ball fetching a deck VSTAR, and valid evolution/attack Energy are also required. After a **successful first T1 Gear**, the searched Thorton replaces the spent Gear and **five physical hand cards are present at the beginning of T2**, sufficient to keep a Supporter, Basic Energy and Ultra Ball while paying Ultra Ball's two-card discard. If **first Gear fails and second T1 Gear succeeds**, only **four** cards remain on T2, so any T2 Ultra Ball route is **excluded**; a VSTAR already in hand is required. The exact program handles both cases separately. T2 can use at most one still-available Gear in the Gear-T1 cohort.

This calculation includes the exact physical six-Prize combinations, all first-eight category and T2 draw possibilities, and fresh seven-card Gear success probabilities based on the actual surviving Thorton count. The prior [T2 Gear-only correction](agent12-adp-pokegear-t2-topseven-exact-20261103.md) still excludes a failed-first/second-success T2 Gear followed by an unaffordable Ultra Ball. The added T1 branch is disjoint from the earlier directly held first-Thorton branch, preventing double-counting.

## Independent physical-sampling cross-check

A [second algorithm](../../scripts/agent12_adp_t1_gear_t2_montecarlo.py) literally shuffles the full 60-category deck, allocates opening seven, six face-down Prizes and T1 draw, removes the three actual Compressor targets from the deck, performs shuffled Gear top-seven draws, retrieves a physical Thorton, pays the T1 actions, draws one T2 card and tests supporter/VSTAR/Basic Energy/Ultra Ball feasibility. It does not use the exact inclusion-exclusion formula.

- **Seed 12131203, 2,000,000 physical shuffled 60s:** 1,202,434 Basic-valid seven-card openings, 2,432 earlier-direct T1/T2 successful opportunities, 287 extra Gear-T1/T2 successful opportunities; observed aggregate **0.226125%**.
- **Seed 92771205, 3,000,000 physical shuffled 60s:** 1,802,627 Basic-valid openings, 3,496 earlier-direct T1/T2, 394 Gear-T1/T2, aggregate **0.215796%**; of the Gear successes, 390 use first Gear and four require the second.
- **Combined independent samples:** 3,005,061 Basic-valid openings, 5,928 direct plus 681 Gear-added physical opportunities, aggregate **0.219929%**, close to the exact **0.220878%**. Sampling error prevents treating the small difference as a contradiction.

The stored Monte Carlo script implements the second seed/three-million run in full. Sample one used the same physical-deal algorithm in the local runtime with its stated seed. The [exact source](../../scripts/agent12_adp_t1_gear_t2_exact.py) asserts all four historical and new integer invariants. The original fixed deck SHA, denominator, top-seven denominators (43-card T1 and 41-card T2) and payment gates are checked.

**CI:** The new exact script passed on pinned main revision `25ca914aefda7de26a624f66b31df23cc17f2958` in the existing manual opt-in [GitHub Actions 41583361895](https://github.com/FlareZ123/experiment-01/actions/runs/41583361895), with all original ADP and Goodra threshold tests. The preceding [CI 41583285470](https://github.com/FlareZ123/experiment-01/actions/runs/41583285470) failed a **test code denominator typo** (using the earlier T2 42-card top-seven denominator for a new T1 43-card Gear search); it performed no native games and was corrected in the green run. The separate independent Monte Carlo script is also wired to the same **default-off** manual job; see subsequent CI receipt for its actual 3-million execution.

## Strategic implications and hard limitations

This establishes a real existing-card connector channel into the early ADP-GX line without modifying the candidate. It is particularly informative that T1 access improves much more than *T1 plus funded T2 Apex* access. A future list optimizer should score complete resource-to-payoff chains, not first-turn Gear hits alone. Any card swap must be compared against the displaced resource and the matchup-specific value of the slot.

This restricted physical model **excludes** every opponent action, Item or Supporter lock, manual decision errors, secondary draw, Tag Call/Guzma & Hala acceleration, Bench congestion, alternative attack lines, mulligan bonus draws, T1 failure to attack, Prize taking and a real match clock. It is neither a global setup upper bound nor proof that this exact sequence executes under any original opponent. No native end-to-end original-source line was attempted. The objective status remains **29/32 authenticated original 60s** (missing 23,25,28), **zero competitively qualified games**, **no selected best fixed 60** and **no evidenced 99.5% field win rate**.
