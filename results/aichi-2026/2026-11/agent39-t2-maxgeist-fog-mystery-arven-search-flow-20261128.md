# Source-aware turn-two Max Geist search flow: Arven/Fog Crystal/Mysterious Treasure/FSS all matter

**Agent39 — 28 November 2026.** An executable, deterministic, resource-constrained **opening-route experiment** on the unchanged legal-printing Hood Shield Shadow Rider v1 60. It resolves competing Item/Tool/search/hand-discard access in the selected early-turn macro, **not** a native Twinleaf game, qualified Aichi opponent, or paper win rate.

## Why this is a material increment over the one-shot hypergeometric proxy

The [exact direct-route model](agent39-early-geist-stadium-seal-prize-route-20261128.md) gives only **1.79%** for starting-Active-V / 2 Psychic hand attachments / VMAX / Dimension Valley or Forest Seal Stone by own T2 (including one narrow Underworld Door continuation). But the unchanged candidate has **4 Fog Crystal**, **4 Mysterious Treasure**, **1 Arven**, **1 Forest Seal Stone**, and other cards able to bridge missing materials. Simply treating these connectors as all-accessible would ignore both Prizes and hand-discard costs; simply ignoring them greatly understates accessible lines.

[Research-only Python planner](../../../simulation/evaluation/2026-11/agent39-t2-maxgeist-search-flow.py) and [resource-cost/seed tests](../../../tests/2026-11/agent39-t2-maxgeist-search-flow.test.py) now model their actual contest: a 60-card physical shuffle, seven-card Basic-valid opening, six unknown/unusable Prize cards, own T1 and T2 natural draw; if a Shadow Rider V CRE74 starts in the original seven, choose it as Active. Going **first**, attach one Psychic on turn one, then search/evolve/attach a second Psychic/play Dimension Valley on turn two to pay VMAX CRE75 Max Geist. The first turn's deterministic resource ordering is **a held Psychic**, otherwise **Fog Crystal searching Psychic Energy**, otherwise **Forest Seal Stone Star Alchemy searching Psychic Energy**. Any first-turn search really removes the card from the deck and reshuffles before T2 draw.

On T2, a finite state-space **exhaustive branching planner** explores the following modeled actions without cloning a card or treating one connector as reusable:

- One normal Psychic attachment from hand;
- VMAX played onto the initial V to evolve it;
- Dimension Valley played from hand;
- Fog Crystal as Item to fetch Basic Psychic Energy from the actual post-Prize deck;
- Mysterious Treasure as Item to discard a *distinct* hand card and then search a Psychic VMAX from the actual deck (all hand-card categories eligible as discards but cost must be payable);
- Forest Seal Stone attached to the present Pokémon V, using **one** unspent Star Alchemy VSTAR Power to search **one** missing relevant card, including VMAX, Dimension Valley, Psychic Energy or one search Item;
- **One Arven** Supporter on turn two, searching at most **one** Item plus at most **one** Pokémon Tool from the deck; it may connect Mysterious Treasure or Fog Crystal to Forest Seal Stone, but cannot simultaneously fetch two independent Items.

The only accepted terminal is **all of** second manual Energy on Active, Active evolved VMAX, and Dimension Valley played. Action order/discard selection are explored rather than fixed, so a hand with Mysterious Treasure but no extra card cannot pretend that the VMAX is freely reachable. The tests include a counterexample where naive costless Treasure connects the card but genuine Treasure does not; Arven item/tool limits, FSS already used, and deterministic same-seed replay are tested separately.

**Critical scope limits:** this is a *search-flow reachability* model, neither upper nor lower bound on overall turn-two Max Geist probability: it does **not** model Underworld Door, Lillie's Determination or other draw Supporters, attacking/retreating alternative Basics, starting a V outside initial seven, extra Pokémon search effects, the opponent's Item/Ability locks or attacks, VSTAR Tool conflicts with Stealthy Hood/Float Stone, Stadium removal, own effects outside this search macro, or tactical opportunity costs of discarding singleton cards. The modeled T1 preference is fixed and not proven globally optimal. T2 chooses any modeled playable sequence, including strategically undesirable discards of other cards, so the experiment is not a competent complete-game policy.

## Reproducible 200,000 shuffled physical trials

Python 3.13.5, deterministic **per-trial `Random(390039+i)`**, 200,000 attempted physical shuffles *per profile and ablation*, exactly six Prizes excluding their cards from draw/search, and normalized to Basic-valid opening hands. Model source-category counts: `V4, VMAX4, Psychic11, DV1, FSS1, Fog4, Mysterious4, Arven1, other starting Basic10, remaining20`, summing to the unchanged fixed 60. In the baseline, **172,331** openings were Basic-valid, **79,719** had a V in the opening seven, **72,588** reached the first manual attachment under the deterministic T1 policy, and **14,404** reached all three modeled Max Geist conditions by T2.

| Scenario / ablation | Successful routes / valid 7 | Rate | Difference vs unchanged baseline |
|---|---:|---:|---:|
| **Actual Hood 60 / complete modeled connectors** | **14,404 / 172,331** | **8.3583%** | — |
| Suppress Arven's modeled T2 actions | 7,831 / 172,331 | 4.5442% | −3.8142 pp |
| Suppress FSS Star Alchemy actions | 4,598 / 172,331 | 2.6681% | −5.6902 pp |
| Suppress Mysterious Treasure actions | 8,299 / 172,331 | 4.8157% | −3.5426 pp |
| Suppress Fog Crystal actions | 8,953 / 172,331 | 5.1952% | −3.1631 pp |
| **Second Dimension Valley** replacing one unspecified remaining non-Basic | 19,257 / 172,335 | 11.1742% | +2.8158 pp |
| **Second Forest Seal Stone** replacing one unspecified remaining non-Basic | 18,237 / 172,335 | 10.5823% | +2.2240 pp |
| **12th Psychic** replacing one unspecified remaining non-Basic | 15,188 / 172,335 | 8.8131% | +0.4547 pp |

Simple marginal binomial **95% Wald intervals for these modeled route proportions**, not game strength: baseline **8.23–8.49%**, 2 DV **11.03–11.32%**, 2 FSS **10.44–10.73%**. These intervals quantify Monte Carlo sampling only, **not the considerable structural model uncertainty**. Each configuration uses the same deterministic per-trial seed recipe, not genuinely identical source configurations; differences are **sensitivity to a specified category substitution or disabled action**, not causal estimates of an in-game card swap. The suppression contributions are overlapping and **must not be added together**. One-slot profiles deliberately do **not** name the card cut: cutting the wrong singleton could be catastrophic despite an apparent setup gain.

## Decision relevance

In this source-bounded macro, **Arven is not just a loose Supporter search edge**: it combines an Item plus a Tool into physically distinct resources in the same T2 Supporter use. Its modeled removal costs nearly **3.81 percentage points**, while one FSS search cannot solve two independent missing materials. The original candidate's **4 Fog Crystal** and **4 Mysterious Treasure** provide substantial independent access, with Treasure's discard paid from the actual hand; merely replacing them with a smaller direct-turn metric would be misleading.

A second DV is **larger than a second FSS on this macro** (+2.82 versus +2.22 pp), but that is **not** evidence it produces more overall wins. Forest Seal Stone searches any important card, while Dimension Valley boosts the opponent's Psychic Pokémon as well; both compete for opportunity costs not represented in this restricted planner. In particular, choosing to consume Arven on turn two excludes other Supporter paths; the experiment models only Arven in that slot.

**Actionable follow-up:** after authorized pinned-native source printing/Underworld integration, make the frozen candidate policy prove actual roots of (a) Arven→Mysterious Treasure + Forest Seal Stone→VMAX + DV, versus (b) Arven→Fog Crystal + FSS→DV and (c) direct 2-attachment routes. Measure which physical resources each connector consumes in the real actor frontier and whether the policy chooses a dominated line. Do not take source-level search graph access as a completed attack, do not silently cut singletons, and do not dispatch CI or mutate the registered V3 pair without the present owner gate.

**Status:** one fixed Hood 60 unchanged; Top32 exact sources **29/32**, missing 23/25/28; qualified competitive outcomes **0/32**; no demonstrated 99.5% benchmark.
