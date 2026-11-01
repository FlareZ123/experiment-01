# Agent 20: rank-6/rank-7 turn-ending choice conflict and original Steven paper minimum

**1 November 2026.** Original Aichi Open League 2026 source lists and pinned Twinleaf native Store, SHA `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Scope is the actual Japanese paper Expanded card pool. This investigation is bounded to card text, exact opening distributions, staged Store actions, and independently source-stamped prompt corrections. **Competitive-qualified games: 0. No estimated or demonstrated 99.5% field win rate.**

## Structural finding: the turn-end action is a shared resource

The following source registrations include multiple Trainer effects whose text ends the current player's turn. Their conflict survives a difference in Trainer category: a player may possess both and have each individually playable, but any selected action that ends the turn prevents the other from resolving that same turn.

| Original rank | Registered archetype | Physical Basic cards | End-turn option A | End-turn option B | Exact probability both options are in the first seven, conditional on at least one Basic |
| --- | --- | ---: | --- | --- | ---: |
| 6 | Iron Thorns | 4 | 2 Camping Gear BST 122, Item, search one | 1 Palace Book SMP NAN25, Item, draw three | **1.77395522%** |
| 7 | Snorlax Stall | 12 | 4 Steven's Resolve CES 145, Supporter, search up to three | 3 Palace Book SMP NAN25, Item, draw three | **10.12097953%** |

All counts come from `results/aichi-2026/full-decklists.json`. Original rank 7 carries 12 Basic Pokémon and original rank 6 four Basic Iron Thorns ex. `Steven's Resolve` and `Camping Gear` search the own deck and then end the turn, while `Palace Book` draws up to three available cards and ends the turn. The native original Palace Book printing is a Japanese promo and is relevant to the Japanese paper Expanded benchmark. No international-only legality gate is appropriate for this Aichi source.

### Exact combinatorial calculation

Let $b$ denote the number of eligible starting Basic Pokémon in 60 cards, with $a$ and $c$ copies of two disjoint turn-ending cards. Sample seven physical cards uniformly without replacement. The denominator for a legal Basic opening is $\binom{60}{7}-\binom{60-b}{7}$. Inclusion-exclusion over three required card groups gives the numerator $\sum_{S\subseteq\{B,A,C\}}(-1)^{|S|}\binom{60-\sum_{g\in S}n_g}{7}$. Divide the latter by the former. The code evaluates these counts directly, rather than estimating them by simulation.

For rank 7, the probability that seven cards include a Basic is **0.8093533072892635**. Conditional on such a hand, Steven appears with probability **0.38064442749634647**, Palace Book with **0.29935464908568954**, and both with **0.10120979526354663**. At least one of those turn-ending effects is present with probability **0.5787892813184894**. For rank 6, the probability of a Basic is **0.3994996257446656**, and both Item options conditional on a Basic appear with probability **0.017739552239192914**.

The same partition exposes which option remains when a different lock or Trainer allowance is present. Rank 7's conditional first-seven shares are **27.94346% Steven-only**, **19.81449% Palace-only**, **10.12098% both** and **42.12107% neither**. Rank 6 instead has **18.13407% Camping-only**, **8.64010% Palace-only**, **1.77396% both** and **71.45188% neither**. These partitions sum to one in each source deck. An Item lock removes both rank-6 channels, while rank-7's Supporter and Item channels face different lock restrictions, subject to all other gameplay requirements.

Reproducibility: `simulation/evaluation/agent20-turn-ending-contention.cjs`; exact tests `tests/agent20-turn-ending-contention.test.cjs`. The opening is conditioned on a legal first seven, before optional cards drawn from the opponent's mulligans, player decisions, or turn-by-turn card movement. Holding both options in an opening does **not** establish simultaneous playability. In particular, Supporters generally cannot be played by the first player on the opening turn. These are hand-overlap probabilities, never action-selection rates or strength measurements.

## Paper-card contract: unrestricted Steven search cannot select zero

The printed Steven's Resolve CES 145 says: search for up to three cards, put them into hand, shuffle the deck, and end the turn. The supplied Advanced Player's Rulebook v3.4, section D-05, specifies choosing 1 to X cards for Trainer effects with the phrase 'up to'. Its Section H and the [official February 2026 Pokémon Professor clarification](https://professorprogram.pokemon.com/news/11473085) additionally require selecting **at least one** card for an unrestricted search of available cards. The original pinned Twinleaf reducer `ptcg-server/src/sets/08-sun-and-moon/set-celestial-storm/stevens-resolve.ts` instead creates `ChooseCardsPrompt` with `{ min:0,max:3,allowCancel:false }`.

The genuine pinned Store accepted `[]` on a nonempty owner deck, selected no physical card, and advanced the original card's effect. Two owner-seat orientations and one-card positive controls passed their four native original-Store cases in [manual CI run 41361560216](https://github.com/FlareZ123/experiment-01/actions/runs/41361560216) and the complete succeeding [run 41361864193](https://github.com/FlareZ123/experiment-01/actions/runs/41361864193). This is a **source-confirmed native action defect** in a printed original rank-7 card. The earlier Agent 22 study already documented the paper minimum for actor search selection; this work independently tests actual Store-dispatch acceptance and adds a separately opt-in correction.

The research-owned reversible guard `simulation/twinleaf/agent20-steven-paper-minimum-hook.cjs` targets only a pending, source-stamped `ChooseCardsPrompt` created by genuine `Steven's Resolve CES` on the actual owner deck. It rejects an empty or null reply before Store mutation. The positive one-card action remains permitted. No upstream or submodule file is changed. Source witness and correction test: `simulation/twinleaf/agent20-steven-zero-search-native.cjs`; `tests/agent20-steven-zero-search-native.test.cjs`. **Guarded branch validated:** the opt-in correction rejected empty native replies for both physical seats, while permitting nonempty selections, in the complete passing [manual CI 41362481851](https://github.com/FlareZ123/experiment-01/actions/runs/41362481851). The unguarded source-stamped empty response remained accepted in its paired control. Subsequent natural-source replay tests are a distinct, more demanding integration gate.

## Palace Book physical action timing

The original `Palace Book SMP` Item immediately draws up to three cards from the player's own deck in the pinned engine; ending the turn includes a genuine `WaitPrompt` before the next active player is installed. An initial test wrongly assumed turn handoff was synchronous and failed. The corrected fixture resolves native pending wait prompts. Both physical seats and deck sizes one, three and five passed in complete manual [run 41361864193](https://github.com/FlareZ123/experiment-01/actions/runs/41361864193). These are action receipts on staged boards, not naturally dealt 60-card matches. Code and tests: `simulation/twinleaf/agent20-palace-book-turnend-native.cjs`; `tests/agent20-palace-book-turnend-native.test.cjs`.

## Controlled source-60 comparison and next-stage methodology

A further reproducible paired native fixture stages the **entire original rank-7 registered 60** with the same physical hand, six Prizes, Active, and ordered deck on both branches: `simulation/twinleaf/agent20-rank7-turnend-original60-pair.cjs`; `tests/agent20-rank7-turnend-original60-pair.test.cjs`. It compares Palace's actual three drawn cards to Steven selecting precisely that three-printing multiset from an otherwise identical initial deck; a third Steven branch chooses the illustrative VS Seeker / Counter Catcher / Capture Energy trio. The native shuffle validator is corrected under an existing scoped and reversible Agent 22 hook, with the difference disclosed. **Paired original-60 fixture validated:** its two-seat native Store run passed in [CI 41362481851](https://github.com/FlareZ123/experiment-01/actions/runs/41362481851). It established the possible selection equality, the alternative printed source three-card bundle, legal turn handoff, and conservation of all 60 owner cards. These represent fixed, staged action roots; no best-line or competitive-match conclusion follows.

Strong deck-decision research should expose both action-root choices to a competent own-information policy, then compare whether the obtained cards enable legal high-value continuations in the actual opponent state. Explicitly price the turn-ending cost and the absence of an attack, available Supporter/Item quotas, Item lock, Supporter lock, first-turn restrictions, information available at K0 versus K1, and next-turn opponent actions. Steven's controlled any-three selection contains Palace's immediate drawn three-card multiset when both are playable on the same physical deck, but the effects differ in Trainer type, search, shuffle, and support restrictions. This is a reachability observation, not a universal domination theorem.

## Boundaries

Staged Store tests do not validate realistic opponent decisions, complete paper-rule coverage, original opposing source60 games, tournament clock, or global winner outcomes. The research field still has authenticated original 60-card printings for 29/32 Top32 slots, missing ranks 23, 25 and 28. The current `results/README.md` lists candidate decklists, but no competitively qualified fixed 60 has been demonstrated to meet the 99.5% aspiration.

### Related work

- Agent 22 original source rank-7 Steven search and later real-deal retrieval-to-play audit: `results/aichi-2026/agent22-rank7-steven-followthrough-retrospective-20261030.md`.
- Unified owner-prompt rule-contract audit: `simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs`.
- Structural cautions about supporter contention, active move realism and connector domination: `resources/human_concepts.md`.

Agent 20
