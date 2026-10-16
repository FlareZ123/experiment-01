# Meloetta's singleton Energy and Redeemable Ticket: exact Prize-redeal opportunity

**Agent 34, 16 October 2026.** Evidence: source inventory, exact finite-population arithmetic, and exhaustive miniature-deck tests. This is a **setup-resource** calculation, not a measured attack or win rate.

## Source and rules

The [published rank-26 Meloetta Donk list](full-decklists.json) includes **one Double Colorless Energy (SUM 136)**, **one Redeemable Ticket (JTG 156)**, **two Lightning Energy**, **one Tapu Koko Prism Star (TEU 51)**, **one Meloetta ex (BLK 44)** and **two TM: Crisis Punch (PAF 90)**. Crisis Punch requires three Colorless Energy. The documented fast line normally attaches Double Colorless from hand and one Lightning via Tapu Koko's Dance of the Ancients, conditional on the rest of the combo.

A static Prize analysis might wrongly conclude that a Prized singleton Double Colorless remains inaccessible during the entire first turn. **Redeemable Ticket changes its player's Prize cards.** The printed Item shuffles the original Prizes, places them **on the bottom of the deck**, then sets an equal number of replacement Prizes **from the deck's top**. If Double Colorless was initially Prized, and six or more cards remain above the returned Prize block, Ticket relocates that Energy to the deck without immediately re-Prizing it. It remains at the bottom until another shuffle or sufficiently many draws. Ticket does not directly put the Energy into hand.

## Exact conditional starting-eight event

Model a uniformly randomized 60-card rank-26 deck, with 12 ordinary Basics, one distinguished non-Basic Double Colorless, and one non-Basic Ticket. Accept an initial seven only if it contains a Basic. Set six random Prizes, then draw one mandatory first-turn card. Exclude bonus draws from opponent mulligans, search, Trainer actions, and turn interaction.

| Event | Probability |
| --- | ---: |
| Initial seven valid (unconditional) | 80.935331% |
| Double Colorless initially Prized, given valid seven | **10.077777%** |
| Energy Prized and Ticket in initial seven | 1.126670% |
| Energy Prized and Ticket drawn on first turn | 0.172137% |
| **Energy Prized and Ticket directly in first eight** | **1.298807%** |
| Energy Prized with no directly held Ticket in first eight | **8.778971%** |
| Direct Ticket among originally Energy-Prized deals | **12.887830%** |

The disjoint Ticket-in-seven and Ticket-on-turn-draw events sum to **1.298807%**. The **8.778971%** complement means only that this *direct* Ticket route was not in the first eight; a later search or draw can still find Ticket. Even directly holding Ticket only offers an opportunity to relocate the Energy into the deck. This is not the probability of actually financing Crisis Punch.

## Exact formula and test

Let N be deck size, B be Basic count, h be opening hand size, q be Prize count and V = C(N,h) - C(N-B,h). The two distinguished cards D (required Energy) and T (Ticket) are non-Basic singletons.

- P(D Prized | valid) = [C(N-1,h)-C(N-B-1,h)]/V × q/(N-h).
- P(D Prized, T opening | valid) = [C(N-2,h-1)-C(N-B-2,h-1)]/V × q/(N-h).
- P(D Prized, T first draw | valid) = [C(N-2,h)-C(N-B-2,h)]/V × q/[(N-h)(N-h-1)].

The executable [source-guarded model](../../scripts/aichi-meloetta-prize-ticket.cjs) verifies the rank-26 60-card inventory and computes these probabilities. [Three local Node regressions](../../tests/aichi-meloetta-prize-ticket.test.cjs) passed, including two independent exhaustive physical-card ordered-deal enumerations of 40,320 permutations each. Gameplay assumptions were not tested.

## Next high-value fixture

Force rank-26's singleton Double Colorless Energy into the six original Prizes, keep Ticket in hand, and replay Ticket in a pinned Twinleaf state with six or more other deck cards above the returned Prize block. Assert that the Energy leaves the Prize zone and enters the bottom returned block. Then execute an actual legal search or shuffle, and determine whether the policy can access the Energy before its turn-one Crisis Punch. Explicitly test any Item lock, deck exhaustion, opponent Prize count, self-KO sequence, and Energy attachment required for the attack. The present mathematics neither proves a first-turn donk nor certifies a competitively credible opponent policy.

The collective target remains one fixed legal 60-card list against the Aichi Top 32. This result guards against the mistaken premise that starting Prizes are always immutable.


## Compiled-engine verification and direct shuffle extension

A [pinned Twinleaf Store fixture](../../simulation/twinleaf/redeemable-ticket-prize-board.cjs) now dispatches the JTG Redeemable Ticket effect on a conditioned six-Prize board with the SUM Double Colorless Energy among the original Prizes. All six original cards move to the bottom of the deck, the prior top six become the new Prizes, and the singleton Energy is no longer Prized. [Compiled manual CI 38845337935](https://github.com/FlareZ123/experiment-01/actions/runs/38845337935) passed, with the three combinatorial regressions. The fixture uses a neutral supported Active Pokémon, so it establishes the Ticket effect without testing Meloetta's Ability or first-turn attack.

The exact source list also has **four Battle Compressor**. Those Items search the deck for up to three cards to discard and then shuffle the deck. A restricted, cost-excluding follow-up asks whether an initial Energy-Prized deal directly holds **both Ticket and at least one Compressor by its first ordinary turn draw**, creating an opportunity to redeal Prizes and then shuffle the returned Energy. Exact conditional chances among legal seven-card openings:

| Timing of the directly held pair | Chance |
| --- | ---: |
| Both Ticket and Compressor already in the initial seven | 0.381266% |
| Ticket in seven; Compressor is the first-turn draw | 0.057339% |
| Compressor in seven; Ticket is the first-turn draw | 0.067578% |
| **Any of those three direct routes** | **0.506183%** |

This is **5.022768%** of the initially DCE-Prized deals. The independent [five-category combinatorial model](../../scripts/aichi-meloetta-ticket-compressor.cjs) and [physical-deal exhaustive test](../../tests/aichi-meloetta-ticket-compressor.test.cjs) passed [compiled manual CI 38845601070](https://github.com/FlareZ123/experiment-01/actions/runs/38845601070). The calculation does not include any other shuffle/search effect, optional mulligan draws, card playability under locks, or whether a subsequent draw finds the Energy. Thus it is neither a complete rescue probability nor a win-rate estimate.

