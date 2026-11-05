# Original rank26 first-player turn-one Prize obstruction against Iron Thorns-only Aichi originals

**Agent47, 5 November 2026 | exact finite-population card-location proof, zero competitive games**

This memo corrects an initially tempting but erroneous conditional-Prize calculation and establishes a narrow impossibility event for **the unchanged Aichi rank26 Meloetta Donk 60**, when it **goes first** against original rank6, rank24, or rank29 Iron Thorns ex-only. The result is a rigorous upper bound on *rank26 winning on its first turn*, conditional on the stated source and opposing 60s. It is **not** a bound on rank26's eventual game win rate or on the desired optimized fixed deck.

## Printed source and rules

The original complete name/count inventory is [rank26 in full-decklists.json](full-decklists.json). The printed source has **12 Basic Pokémon**, **exactly one Double Colorless Energy (SUM 136)**, **exactly one Canceling Cologne (ASR 136)**, **exactly one Redeemable Ticket (JTG 156)**, and **only two Basic Lightning Energy**. The opponent originals ranks **6, 24 and 29** contain only four Iron Thorns ex (TWM 77) as their Pokémon. [Agent1's independently verified original-29 Basic census](../statistics/agent1-original29-bilateral-mulligan-bonus-20261104.md) supplies the source stage-count cross-check.

Printed Iron Thorns ex **Initialization**, while Active, removes Abilities of non-Future Rule Box Pokémon on both sides. This turns off rank26's Meloetta ex **Debut Performance** first-player first-turn attack exception and Tapu Koko Prism Star **Dance of the Ancients**. In an all-Iron-Thorns opposing 60, merely gusting or switching to another opposing Pokémon will leave another Iron Thorns in the Active Spot if one exists. The source has only one **Canceling Cologne** to suppress that Active Ability for its turn; no alternative source card is established to turn it off in the named first-turn line. If Cologne is inaccessible, the first-player attack exception is unavailable against the opposing live Active Thorns.

The first-turn characteristic attack **Crisis Punch**, granted by TM: Crisis Punch (PAF 90), costs **three Colorless**. A single Koko use can supply **one Lightning to Meloetta**, and the source's one manual attachment can supply another single Lightning. Without its singleton **Double Colorless Energy**, the exact rank26 60 has no established way to put three units onto Meloetta on that first turn. Printed **Redeemable Ticket** can reset its face-down Prize cards, potentially exposing an otherwise Prized Item or Energy to deck search; when Ticket itself is Prized, that rescue channel is absent. **Hisuian Heavy Ball** can access Prized *Basic Pokémon*, so it cannot directly retrieve either of these Trainer/Energy singletons. Dowsing Machine only recovers a Trainer from the discard pile and cannot recover a Prized Ticket. These arguments pertain to the original printed source list and the named turn-one target, not every possible future game state.

## Exact obstruction event

Let the three distinct source singleton cards be `T` = Redeemable Ticket, `C` = Canceling Cologne and `D` = Double Colorless Energy. Define

`E = {T among six Prizes AND (C among Prizes OR D among Prizes)}`.

Every state in E denies the first-player turn-one attack path against a live Iron Thorns ex: the inaccessible Cologne preserves Initialization when C is also Prized; the inaccessible DCE denies the three-unit Crisis cost when D is also Prized. Other draw/search actions do not change the fact that the relevant non-Basic singleton and its Prize-reset path are inaccessible before rank26's first attack. This is a **sufficient failure condition for any claimed first-player turn-one rank26 win** against these original Iron Thorns-only opponents, given the absence of other first-turn attack exceptions and resource sources in the printed 60. It is a *necessary limit* on a win-on-first-turn claim, rather than an assertion that every opening outside E succeeds.

For an unconditional uniformly random six-card Prize subset:

`P(T and D Prized) = C(58,4)/C(60,6) = 1/118 = 0.847457627%`.

`P(T and C and D Prized) = C(57,3)/C(60,6) = 1/1711 = 0.058445354%`.

By inclusion-exclusion,

`P(E) = 2/118 - 1/1711 = 28/1711 = 1.636469901%`.

**A critical correction for legal-opening conditioning:** rank26 must draw a valid seven-card opening before setting six Prizes, so this unconditional percentage cannot simply be applied as if validity and singleton Prize locations were independent. Its 12 printed Basics are disjoint from T/C/D. Write `V=C(60,7)-C(48,7)`. For two designated non-Basic singleton cards both Prized, the number of valid opening seven-card hands excluding those two is `C(58,7)-C(46,7)`; then the six Prizes must include both, with `C(51,4)` choices among `C(53,6)` possible subsets. Therefore:

`P(T and D Prized | valid source seven) = [C(58,7)-C(46,7)] C(51,4) / [V C(53,6)] = 0.860683385%`.

For all three designated non-Basic cards:

`P(T and C and D Prized | valid seven) = [C(57,7)-C(45,7)] C(50,3) / [V C(53,6)] = 0.059817754%`.

Consequently,

**`P(E | valid source seven) = 2(0.860683385%) - 0.059817754% = 1.661549016%`.**

The result is exact (rational value **76809390/4622757997** before rounding). Conditional on rank26's first valid seven-card hand, its idealized **first-player, first-turn win probability against any of the three unchanged Iron Thorns-only originals is no greater than 98.338450984%**. This upper bound still assumes unrealistically perfect access to all other resources, winning damage, opposing Bench conditions and attack timing, so actual first-turn win likelihood can be far lower. No actual win rate is estimated.

The tempting alternative `1-C(54-12,7)/C(54,7)` for a valid opening conditional on T/D Prized is **incorrect**: conditioned on two named non-Basic cards being in the six Prizes, the other four Prizes are still random and can contain Basics. Equivalently, before those random four Prize cards are chosen, the seven-card hand is sampled from the **other 58** cards. This matters whenever an opening-condition screen and joint Prize collision are combined.

## Reproduction and admission

All combinatorial values follow from exact integer binomial coefficients. The two-card conditional event may independently be checked by first choosing a valid seven free of T and D, then placing those two among the six Prizes of the remaining 53. The three-card calculation follows the same procedure; no simulator is necessary. The source's existing [prepared continuing pinned-Twinleaf five-self-KO and Crisis native proof](agent47-rank26-unownless-single-lightning-full-chain-native-20261103.md) confirms **conditional mechanical reachability** of the finisher after synthetic resource setup, while the [24-paired natural owner-source experiment](agent47-rank26-natural-owner-24-paired-source-20261103.md) recorded **zero** natural first-turn Crisis attacks or completed matches. Neither archive changes the exact setup obstruction event or upgrades it to a qualified win estimate.

This structural veto should be used as an **adversarial Prize test case** when claims are made about rank26's immediate win against the four-Iron-Thorns opponents. A proposed engine/policy path that wins going first on E must show a concrete, printed, paper-valid way to obtain the trapped card or bypass its necessity; otherwise its assumptions are wrong. Do not extrapolate this bound to later-turn wins, other opponents, or the single best fixed 60 against the entire field. The repo's honest benchmark remains **29/32 authenticated original sixties, zero competitively qualified games, no chosen optimized fixed 60, and no evidenced 99.5% win rate**.
