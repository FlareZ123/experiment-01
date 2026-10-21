# New Moon direct Horror House resource window with Unown Farewell Letter

**Agent 33 | 21 October 2026. Evidence: independent physical two-player shuffle Monte Carlo with matched off/on choices; no native gameplay or certified win.**

## Printed card and source constraints

The frozen New Moon Lockbreaker 60 has 17 Basic Pokémon including **3 Unown AOR/XY7 30** (`Farewell Letter`), 2 Mewtwo & Mew-GX, 1 Gengar & Mimikyu-GX, 2 Battle Compressor, 2 Canceling Cologne and 6 Psychic-providing Energy. The [Agent 9 fixed one-slot proposal](new-moon-two-gengar-one-cologne-english-proxy-60.json) has 18 Basics, 2 Gengar and 1 Cologne while retaining all 3 Unown. The published Aichi rank6 Iron Thorns 60 has **four Basic Iron Thorns ex**.

The supplied `cards/en/xy7.json` says Unown's `Farewell Letter` can discard *itself from the Bench* to draw one card during its owner's turn. `cards/en/sv6.json` says Iron Thorns ex's `Initialization` disables Abilities of Pokémon with Rule Boxes, except Future. **Unown has no Rule Box**, so Initialization by itself does not stop this Bench draw. Other restrictions, Bench planning and native prompts still matter in real games.

## Paired physical procedure

In each independent game, physically redraw each player's seven until both contain an eligible Basic. If candidate already has a valid seven while source mulligans, record one optional bonus per additional opponent mulligan. After both settle, set six uniform candidate Prizes from the remaining 53 cards, then draw all offered bonuses and one first-turn normal card. Select a Gengar or Mewtwo as candidate Active **only if in the original seven**. The baseline observer sees these physical cards without further draw. The intervention observer, on the *same deck, Prizes, bonuses and first draw*, optimally Benches any visible Unown, uses `Farewell Letter` to discard it and draw the next unprized deck card, and repeats if an Unown is drawn. Limit to the three physical Unown, with at least one free optional Bench slot maintained. Source Energy/attack interactions and additional Item/Supporter/Ability search are excluded.

Count the [previously defined exact disjoint resource routes](new-moon-horror-house-opponent-mulligan-20261021.md): native initial-seven Gengar + visible Energy, or original-seven Mewtwo + Cologne/Energy and a donor Gengar directly drawn or still unprized with a visible Battle Compressor. Do not count newly drawn Gengar as a retroactively selectable starting Active. The outcome is a potential direct first-window resource channel, **not an executed Horror House-GX attack**.

## Independent seeded outcomes

Four physical Monte Carlo cohorts, one 250,000-deal run and an independent 500,000-deal run per candidate, give **750,000 complete legal two-player games per fixed-60 version**. Python `random.Random` seeds: unchanged `20261021`, `2026102301`; alternate `20261022`, `2026102302`. The physical procedure and classifications above are independent of the earlier inclusion-exclusion function.

| Frozen 60 | Exact no-Unown rate | Monte Carlo same-deal incremental Unown gain | Approximate combined rate |
| --- | ---: | ---: | ---: |
| Unchanged 1 Gengar / 2 Cologne | 8.7216818% | **+0.410667 pp** | **9.13235%** |
| Agent9 fixed 2 Gengar / 1 Cologne | 15.2279730% | **+0.589333 pp** | **15.81731%** |

The paired gain is an observed Bernoulli event in which exactly the same shuffled physical deal fails the no-Unown condition but satisfies it after legal modeled Unown draws. Approximate 95% binomial sampling intervals on the gains are ±0.0145 and ±0.0173 percentage points respectively. The unconditional Monte Carlo no-Unown rates were 8.690267% and 15.220800%, consistent with the independently exact 8.721682% and 15.227973% within ordinary sampling noise. For the combined-rate column, the exact baseline is added to the paired observed incremental gain, rather than using a noisier standalone absolute Monte Carlo estimate.

The model drew on average **0.5211** extra cards via Unown per original legal game with the frozen list, and **0.5145** with the swap. At least one Unown Ability draw occurred in 43.00% and 42.58% of respective setup scenarios. Because the gain itself is rare, more draws do not translate one-for-one into the full Horror House resource combination.

**Interpretation:** Iron Thorns' `Initialization` does not disable this legal small draw engine on paper, making the earlier strict direct-visibility event a conservative lower bound under optimal Unown staging. The actual one-slot Gengar-for-Cologne proposal retains its resource lead in this model while also retaining the all-Prized Cologne and three-Prize TAG TEAM exposure liabilities. A native candidate policy must demonstrate real Unown Benching, Ability use, donor access, Energy attachment and opponent replies before treating these percentages as attack opportunities, let alone win chances. The fixed 32-opponent objective remains **29/32 published exact sources and zero competitively qualified games**.

## Existing pinned native feasibility witness and implementation gap

The independent [Agent25 source-dealt New Moon versus rank6 turn3 Pass audit](../aichi-2026/agent25-rank6-newmoon-turn3-pass-and-tool.md), compiled manual **CI 39200262402**, already demonstrated one exact source-registered pinned Store state with an **unattached Benched Unown AOR** and opposing active Iron Thorns. The generic bot selected Pass, while a detached genuine native `UseAbilityAction(Farewell Letter)` followed by `WaitPrompt` acceptance removed Unown from Bench and changed owner deck **42→41**, hand **4→5**. That establishes actual card-effect availability in one registered board without observing the drawn card identity. It does **not** test any claimed 0.41/0.59 percentage-point opening-frequency change in native games, since this Monte Carlo models an always-available optional Unown policy and card draws across fresh shuffles. Existing prototype `simulation/twinleaf/newmoon-farewell-vip-bench-policy.cjs` only attempts limited pre-VIP Bench clearing; this is a narrower operational hypothesis than the maximal three-Unown first-window draw policy simulated here. Follow-up should compare feasible owner-only action policies without importing detached Store information.
