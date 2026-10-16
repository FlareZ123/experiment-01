# Aichi rank-2 Vileplume: prize-aware double-TM opening resource audit

**Agent 22, 16 October 2026.** This is exact combinatorial analysis of a **restricted resource opportunity**, not an observed attacking turn, established Vileplume lock, or measured win percentage.

## Question and source

The published rank-2 Aichi Vileplume Control 60 has two **Bunnelby (PRC 121)**, two **Technical Machine: Evolution (PAR 178)**, four **Guzma & Hala (CEC 193)**, four **Tag Call (CEC 206)**, two **Jet Energy (PAL 190)**, two Capture Energy, one Memory Energy, and one basic Grass Energy. It also contains two each of Pidgey, Oddish, and Lillipup, alongside corresponding evolution lines. The exact-printing counts come from [the 29-list manifest](full-decklists.json), rank 2.

The bundled card pool confirms that Bunnelby's Ω Barrage permits two attacks in one turn; TM: Evolution gives its holder a Colorless-cost attack that evolves up to two Benched Pokémon from the deck; Jet Energy provides Colorless and promotes its attached Benched Pokémon; Tag Call can fetch Guzma & Hala; and Guzma & Hala can fetch a Special Energy and Pokémon Tool after discarding two cards, alongside Stadium search. The supplied advanced rules (A-05, C-12) allow attack-effect evolution notwithstanding normal first-turn/newly-played evolution restrictions. This makes the proposed **Bunnelby -> TM: Evolution twice** first-turn-going-second sequence mechanically worth analyzing.

## Exact opportunity model

Uniformly sample an initial seven from the fixed 60, condition on at least one Basic (14 in the list), put six of the remaining cards in unknown Prizes, then take one ordinary turn draw. Prize and next-draw order commute for this uniform combinatorial calculation; the implementation enumerates the initial-seven multivariate hypergeometric compositions and each possible next-draw group. It integrates search-target Prize risk by inclusion-exclusion over the remaining 52 cards.

For the restricted **core resource route**, require all of:

1. At least one Bunnelby among the initial seven plus turn draw. If one was in the initial seven, it may be chosen Active. Otherwise, another Basic must begin Active, and the Bunnelby drawn on turn one is put on the Bench and promoted with Jet Energy.
2. TM: Evolution in the first eight cards, or searchable from the deck by Guzma & Hala.
3. An attack-payable Energy in the first eight, or a suitable Special Energy searchable by Guzma & Hala. A Bunnelby that started Active can use the basic Grass, Capture, Memory, or Jet Energy. A Bunnelby promoted from the Bench requires Jet Energy for this restricted route.
4. If a search is required, have Guzma & Hala directly, or have Tag Call and an unprized Guzma & Hala remaining in the deck. The searched Tool and Special Energy must individually survive the six Prize cards.

The stricter **Bench-target** event additionally requires a Pidgey, Oddish, or Lillipup to occupy a Bench slot. If Bunnelby was absent from the starting seven, another Basic necessarily began Active. Jet Energy then promotes the newly Benched Bunnelby to Active and moves that original Active onto the Bench. Therefore, even a sole evolving Basic initially forced into the Active Spot can be an eligible Bench target after the pivot.

The search model assumes Guzma & Hala's optional two-card discard can be paid without strategically harmful sacrifices, and that Tag Call is usable. It does not actually execute cards or evaluate alternate Supporter turns.

## Results

**16 October correction:** The initial version underestimated Jet Energy pivot target availability by mistakenly excluding an evolving Basic that starts Active. Such a Basic moves to the Bench when Jet Energy promotes Bunnelby, making it eligible for Evolution. The source model, its independent exhaustive oracle, and the Monte Carlo cross-check have been corrected. The original core resource-access rate is unchanged.


All percentages in the last five rows are **conditional on an accepted seven-card opening**, with six uniformly unknown Prize cards.

| Restricted event | Exact probability |
| --- | ---: |
| Initial seven contains any Basic (unconditional) | 86.140932% |
| Bunnelby among initial seven | 25.710069% |
| Bunnelby first appears as the turn draw | 2.803394% |
| TM + payable Energy already drawn, with Bunnelby positioned as above | **3.042510%** |
| Same core resources, including Guzma & Hala / Tag Call search paths | **20.007014%** |
| Core resources **and** an evolving Bench Basic available | **10.660926%** |

The search-enabled core opportunity has two disjoint contributions: **18.171380%** from hands with Bunnelby initially present and **1.835634%** from hands drawing Bunnelby on turn one. Requiring an evolving Bench Basic leaves **9.452464%** and **1.208462%**, respectively.

**Interpretation:** The search path materially expands the theoretical opening resource opportunity relative to direct card draws. Even with those connectors, roughly half of the modeled core opportunities do not simultaneously satisfy the minimal evolving-Bench-target condition. These numbers do not quantify actual double evolution, board lock, or matchup wins. In particular, the strict event can miss real lines enabled by Fan Rotom, Artazon, other card effects, mulligan bonus draws, or different sequencing.

## Reproduction and independent checks

- [Exact named-card-source enumerator](../../scripts/aichi-vileplume-tm-opening.cjs). Its 10 disjoint categories are Bunnelby 2, evolving Basics 6, other Basics 6, Guzma & Hala 4, Tag Call 4, TM: Evolution 2, Jet Energy 2, other Special Energy 3, Grass Energy 1, and other cards 30. Its source assertion prevents accidental silent reclassification of rank 2.
- [Independent exhaustive regression](../../tests/aichi-vileplume-tm-opening.test.cjs). It compares the inclusion-exclusion calculation to all **40,320 ordered permutations** of an eight-card miniature deck, resolving actual Prize identities and the actual next draw. Absolute error is below 1e-12 on the four modeled events. It also checks the published 60-card source-count invariant and output.
- An independent Python Monte Carlo sample of 500,000 uniform 15-card partial deals (seed 20261016) produced **430,385 accepted starts**. Conditional resource opportunity was **20.0941%** (approximate 95% binomial interval ±0.1197 percentage points), while Bench-target opportunity was **10.6930%** (±0.0923 points). Both agree statistically with exact values. This is a computational cross-check only.

## Limitations and next research gate

A Bench target is not enough to ensure a productive TM attack: the required Stage 1 and Stage 2 cards must remain searchable; actual Bench slots, discard decisions, evolution sequencing, matchup lock interactions, and opponent responses all matter. The analysis ignores other Item/Ability search or acceleration, Supporter contention, K0/K1 knowledge, opponent mulligan draws, and first-player disruption. **The 10.661% result is not a rigorous lower or upper bound on real first-turn double-TM establishment**, because excluded access routes may increase it and omitted legality/action constraints may decrease it.

The highest-value next test is a true-starting-turn, replayable Twinleaf rank-2 fixture with policy-directed **Bunnelby Barrage -> TM: Evolution -> TM: Evolution**, validating the order of both evolution attacks, Prize and Bench availability, and the resulting Vileplume/Pidgeot/Stoutland state under adversarial responses. Only after credible policy coverage should this be connected to the rank-1 challenger comparison or 32-placement benchmark.
