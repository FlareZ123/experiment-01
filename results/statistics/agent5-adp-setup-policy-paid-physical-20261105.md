# Agent 5: physical starting-Basic setup and paid ADP first-eight policy contrast (5 November 2026)

**Status:** exact arithmetic, source-specific research, **six local Node22 tests PASS**, all attempts hypothetical physical opening-line screens. Fixed [ADP–Thorton–Regidrago v2 60](../aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json), paper Expanded going second, no native game, competitive result, selected best 60, or deck promotion.

## Two precisely specified setup policies, same fixed deck

The earlier [paid Lele source screen](agent5-adp-paid-wondertag-bridge-20261105.md) deliberately chose **ADP Active whenever the initial hand contains ADP**, chose another Basic ahead of Lele otherwise, and left all optional other Basics in hand. This retained held Lele for turn-time Wonder Tag and minimized initial Bench consumption.

The new model evaluates **a second actual feasible behavior**: first eligible Basic encountered in a uniformly shuffled physical seven becomes Active, and subsequent eligible Basics go to the Bench, up to five occupied Bench spots. Every one of the possible category orders of initial Basics is weighted exactly. If a seventh Basic exists, it remains in hand. Initially Benched Lele cannot trigger Wonder Tag that turn. Initially Benched ADP can be promoted by Switch, whereas a drawn/searched ADP requires an empty Bench spot first. Discard payments under the greedy setup count *only the actual remaining hand*: pregame played Basics are no longer valid discard fodder. The paper rules on starting setup, Bench, and hand-to-Bench Wonder Tag require these distinctions.

The comparison uses an identical fixed 60, 7 initial cards, 6 Prize cards, first draw, same exact source physical distribution, and all mandatory Quick/Ultra/G&H payments. One Supporter and one Energy attachment per turn remain constrained. Both policy variants are evaluated with or without a legal turn-time Lele Wonder Tag. Opponent hand, turns, locks, additional drawn cards, tactical play, and finish conditions remain outside this screen.

## Exact results, conditional on Basic-valid opening and going second

The weighted denominator is **105166843059427968000**, the earlier **250397245379590400** times **420**. The 420 factor exactly represents every possible initial Basic-category order, with up to seven initial Basics. Every initial hand category state is weighted by the multivariate hypergeometric number of physical copies; every Prize configuration and first draw are enumerated. Source counts remain exactly ADP2, other Basics4, Lele1, Switch2, Tag4, Quick3, Ultra4, G&H3, DDE4, Dragons6, basic Energy7, Compressor4, other16.

| Hypothetical DCI discard model | Deliberate, with Lele | Greedy, with Lele | Loss of paid opening opportunity |
|---|---:|---:|---:|
| Any nonessential hand card mechanically eligible | **43.747196%** | **36.651988%** | **7.095207 pp** |
| Only Dragon attack payloads | **20.278994%** | **17.290576%** | **2.988418 pp** |
| Dragons and basic Grass/Fire Energy | **27.915483%** | **23.678226%** | **4.237257 pp** |
| Those plus Battle Compressor | **32.287038%** | **27.319041%** | **4.967997 pp** |

**Without Wonder Tag**: deliberate 37.981531% vs greedy 32.862317% under mechanical payment; Dragon-only 20.025570% vs 17.213354%; Dragon+Energy 26.612382% vs 23.022251%; Dragon+Energy+Compressor 30.110197% vs 26.076317%.

**Wonder Tag incremental effect conditional on the setup policy:** for mechanically permissible payments, deliberate setup has **+5.765665 pp** while greedy prebenching has **+3.789672 pp**. Under the strict Dragon-only payment group, those increments are **+0.253424 pp** versus **+0.077222 pp**. These are exact counts for the defined line family, strongly affected by setup selection, hand payments and Bench space.

The modest difference between the historical Agent5 first-Basic gross **32.961644%** optimistic source-access figure and this newly paid/Bench-constrained greedy/no-Lele **32.862317%** is explained by the added actual hand/Bench restrictions in the latter, not by a different 60-card deck.

## Source and adversarial verification

- [Exact 13-category physical starting-order and setup-occupancy model](../../simulation/evaluation/agent5-adp-setup-paid-policy.cjs), tested byte-identical Git blob SHA-1 **8764950249803e38878c7ff4e73f9b22e86a9e0f**.
- [Six regression tests](../../tests/agent5-adp-setup-paid-policy.test.cjs), tested byte-identical Git blob SHA-1 **8abfb7c22afc1d03f588a004af8a60f97a685b15**. Real local Node22 **6/6 PASS** including all categories of a physically seven-Basic initial hand, exact rational greedy Active category weights, preserved versus prebenched Lele, Switch to prebenched ADP, full Bench negative controls, exact independent reproduction of all previous deliberate-policy numerators, and **an independent labeled physical-card toy enumeration of every ordered initial hand, physical Prize pair, normal draw and setup placement**.
- Exact source count returns 29,358 valid *category configurations* and 56,192 setup category-order configurations, each multiplied by its correct physical weight. Source uses the frozen v2 card identity IDs and printed rules; no randomized Monte Carlo approximations.
- Three Agent5 local test suites now registered in the **existing manually dispatched** aichi-benchmark-stats.yml; **no new workflow, remote CI success claim or native Twinleaf match**. Tests are source-level computation and paper-fidelity regression only.

## Next shared-policy test

For a genuine native both-seat candidate-independent source policy, register the **same original physical seven and genuine setup order** before the setup intervention. Compare owner-selected Active, every originally Benched physical card, cards still in hand, open Bench positions, existing ADP Bench targets, and Lele's eligibility for a turn-time Wonder Tag. For any actual paid G&H/Ultra/Quick route, verify native physical discard custody, source deck-to-hand search, attempted ADP promotion, DDE attachment, source attack, and meaningful opponent response. A changed post-setup first-stable SHA is an **outcome of a setup-changing policy**, so reject conditioning a primary natural-game comparison on identical post-treatment board digests (Agent48's 5 Nov warning).

No valid comparison of full game win probabilities arises from these percentages alone; candidate v2 remains unqualified and the field remains 29/32 original inventories.


## Follow-up mediation screen: separate starting Active choice from automatic Benching

A third *counterfactual setup policy* isolates the starting-Active component: it selects the **first eligible Basic in the physical hand's shuffled order**, exactly as the greedy policy does, but **retains every other Basic in hand** rather than automatically Benching them during initial setup. The source enumerates physical Basic-category order using integer 420-scaled weights; the independent labeled physical toy test additionally checks these third-policy statistics for all four DCI profiles.

| Payment assumption | Deliberate ADP Active and no optional Bench | First-eligible Active, no optional Bench | First-eligible Active, automatically Bench more Basics |
|---|---:|---:|---:|
| Mechanical and turn-played Lele | **43.747196%** | **37.381955%** | **36.651988%** |
| Dragon-only DCI | **20.278994%** | **17.368593%** | **17.290576%** |
| Dragon+Energy | **27.915483%** | **23.939411%** | **23.678226%** |
| Dragon+Energy+Compressor | **32.287038%** | **27.672625%** | **27.319041%** |

For the **mechanical-payment model with legal Lele**, the total deliberate-to-greedy gap **7.095207 pp** decomposes along this specific sequential policy intervention into **6.365240 pp from choosing the first eligible Active rather than prioritizing ADP** and **0.729967 pp more from pregame Benching**. With only six Dragons eligible for discard, the corresponding gap **2.988418 pp** splits **2.910401 pp versus 0.078017 pp**. Other DCI profiles give **3.976071 and 0.261185 pp**, and **4.614412 and 0.353585 pp**, respectively. This is a *path-specific decomposition*; changing the order of interventions could yield a different attribution.

As a strong independent cross-check, when Wonder Tag is disabled the first-eligible-Active/no-extra-Bench model returns exactly **32.96164378282613%** with unrestricted mechanical payments. This reproduces the already published Agent5 **32.961644%** first-Basic optimistic switch/search result from a separate earlier model. Prebenching then reduces the new mechanical/no-Lele screen to **32.86231651958380%** by removing hand discard cards and sometimes filling Bench spaces. With restrictive Dragon-only discards and no Lele, prebenching has **exactly zero effect on the enumerated paid first-eight event**, since it removes no eligible discard group and there is no simultaneously achievable new-ADP/full-Bench rescue in this limited line family.

These are strictly within-source policy screens, do not imply a 6.36pp win-rate change, and do not justify hardcoding an ADP preference in the candidate-independent selected bilateral policy. To compare policies in an actual registered experiment, randomization must occur before setup and post-setup first-stable board hashes must be treated as policy outcomes.


## Follow-up: isolate preserving the singleton Lele during setup

The selected developmental Issue25 v4 stack was source-traced through the v6/v5/v4/v1 chain to Agent36's selected v0, whose actual owner-start chooser is **agent50AllEligibleInitialBasics**. It first chooses the first eligible hand-order Basic, then fills further setup slots with other Basic cards. The distinct protected turn-entry chooser in agent50-owner-preserve-turn-entry-setup.cjs remains a separate opt-in proposal. These source facts establish the relevance of testing pregame Lele placement; the registered v4 eight-arm candidates are *different 60s* from this v2 ADP source, so our percentages do not describe its actual rank6/11 trial outcomes.

A fourth narrow source-only scenario now treats **Lele alone as protected**: choose the earliest *non-Lele* eligible Basic as Active if there is one, put the remaining non-Lele Basics on the Bench, and **keep Lele in hand** to trigger Wonder Tag during the turn. If Lele is the only opening Basic it must start Active, so its trigger cannot fire. This is **not** the full installed generic owner-protected adapter: the present 13-class source groups Crobat V with other Basic Pokémon and does not protect Crobat V's Dark Asset Ability. Other real native prompt and opponent-payoff constraints remain unmodeled.

| DCI payment scenario, with available Wonder Tag | Selected-like greedy prebench all | Protect Lele only (partial proposal) | Increment |
|---|---:|---:|---:|
| Mechanically discard any nonessential card | **36.651988%** | **38.632424%** | **+1.980436 pp** |
| Six Dragon payloads only | **17.290576%** | **17.940132%** | **+0.649557 pp** |
| Dragons + basic Energy | **23.678226%** | **24.805796%** | **+1.127570 pp** |
| Dragons + Energy + Compressor | **27.319041%** | **28.693821%** | **+1.374780 pp** |

Exact 420-scaled weighted numerators for Lele-protected scenario: mechanical 40628501009276471620; Dragon-only 18867070734171825480; Energy 26087472843582570280; Compressor 30176385922559506560. All are divided by the same denominator **105166843059427968000**. An independent exhaustive labeled-card toy enumeration checks the physical hand order, actual Bench placements, Prize pair and first draw for this fourth policy, alongside the other three. **Six local Node22 tests PASS** after this extension, with exact source and test bytes verified against remote Git SHA-1.

The source-only +1.98pp mechanical gain is an *opening opportunity*, no claim of actual native selected-v4 improvement or game win. More complete policy research must also protect in-turn Crobat V entries and investigate tactical consequences of leaving a small Bench, both sides' owner-information access, native prompt settlement, and post-setup treatment effects.


### Controlled Wonder Tag-off contrast for the Lele-only protected policy

Because the same source engine also executes each setup policy with Wonder Tag *disabled*, the observed Lele-only-protection gain can be separated into a base setup effect and an incremental ability-enabled interaction for this exact first-eight event. Under mechanical payments:

- Greedy auto-Bench with Wonder Tag disabled: **32.862316520%**.
- Lele-only protected setup with Wonder Tag disabled: **33.793077763%**, an increment of **0.930761243 percentage points** despite the Ability being unavailable.
- Enabling legal Wonder Tag raises greedy to **36.651988469%** and Lele-protected to **38.632424277%**. The full increment of **1.980435808 pp** is therefore composed of the **0.930761243 pp baseline setup effect** and a **1.049674565 pp increase in the modeled ability-enabled increment** under this sequence of policy toggles.

With the strict Dragon-only payment profile, the Wonder Tag-disabled baseline difference is **+0.504681657 pp**, versus **+0.649556596 pp** with Wonder Tag enabled. This is a conditional *factorial arithmetic decomposition*, not proof of direct cause in native games. It underscores why a protected-Ability opening policy can still change paid lines in matchups where the Ability itself is locked, through starting-Active selection and card custody; actual matchup effects need full opponent-specific validation.


## Direct final source-text cross-check

A final direct check of the provided offline card-list ZIP inspected the exact relevant printing IDs:

- sm12-193 Guzma & Hala is TAG TEAM Supporter and allows discarding **two other cards** to retrieve a Special Energy and Tool in addition to the Stadium search.
- sm12-206 Tag Call is an Item that retrieves **up to two TAG TEAM cards**, including ADP and Guzma & Hala together.
- xy6-97 Double Dragon Energy provides **two Energy of every type** only while attached to a Dragon Pokémon, the relevant ADP attachment in this screen.
- sm2-60 Tapu Lele-GX Wonder Tag explicitly requires playing Lele **from hand onto Bench during the turn**.
- swsh3-104 Crobat V Dark Asset has a similarly worded hand-to-Bench trigger and should be protected by a fully generic printed-Ability preserving policy.
- sv5-152 Hero's Cape is an ACE SPEC; the fixed candidate contains exactly one. The candidate has 60 total cards and no single printing above four copies. These checks alone do not certify the complete paper Expanded legality or absence of bans.

The exact category counts, hand-to-Bench eligibility, and core payment assumptions therefore agree with the *supplied database text*; other card effects and the latest official banlist require independent checking before any final competitive-deck certification.
