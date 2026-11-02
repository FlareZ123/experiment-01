# Original rank6 can construct a two-attachment turn3 Guzma + Volt Cyclone threat

**Agent 40 | 2 November 2026 | exact original-rank6 printing/count arithmetic; no natural games or competitive outcomes.**

## Opponent counterline versus rank2-derived Exeggutor v2

The authenticated original rank6 Iron Thorns ex 60 has exactly **four Iron Thorns ex TWM**, **four Speed Lightning Energy RCL**, **one Double Colorless Energy SUM**, and **three Guzma BUS**. These four categories are disjoint. Its remaining 48 printed copies are other cards. The source opponent is unchanged.

The experimental rank2-derived Exeggutor/Vileplume v2 challenger includes **Exeggutor PLF (100 HP)**, whose Blockade attack could next-turn deny Supporters. Its Bunnelby PRC double TM Evolution setup leaves a vulnerable Exeggutor on Bench during the intervening opponent turn.

The rank6 source player can reach a paper-feasible attacking sequence when going first:

1. **Global turn 1:** By its first ordinary turn draw, rank6 has two Thorns and a Speed Lightning Energy. One Thorns is Active, one is Benched, and Speed Lightning attaches to the Benched attacker. This attachment normally **draws two additional cards**.
2. **Global turn 2:** The challenger, going second, establishes Exeggutor PLF and Vileplume AOR on Bench through the Bunnelby Omega Barrage double TM Evolution attack. Exeggutor Blockade has not been used.
3. **Global turn 3:** Rank6 attaches the one Double Colorless Energy to its previously powered Benched Thorns, plays Guzma to gust Exeggutor into opposing Active and promote the fully paid Benched Thorns into its own Active, then uses **Volt Cyclone**. With a Lightning plus two Colorless cost paid by Speed and DCE, Volt Cyclone does printed **140 damage**, enough to Knock Out the 100 HP Exeggutor under the stipulated unmodified conditions.

This target-and-attack continuation, if accepted by the native Store, would invalidate the earlier generic inference that gusting Exeggutor necessarily helps it attach Jet and Blockade. The earlier rank1 native response showed that an **unpowered** attacker promoted by Guzma can still attach Jet on its next own turn. A fully powered opponent threatening Knock Out is materially different.

## Exact original-rank6 card-location event

Condition on the rank6 original opening seven containing a Basic Thorns. Reserve six uniformly random unknown Prize cards, then marginalize them. By the first turn draw (first eight seen cards), require **at least two Thorns and one Speed Lightning**. By the second turn draw (first nine seen cards), additionally require **the singleton DCE and at least one Guzma**. This makes every specified resource physically reachable at its latest necessary ordinary-draw deadline without any additional search.

The independent finite hypergeometric enumerator loops over all possible category compositions of seven original cards, then over both ordered draws. For every legal first seven, its weight is the product of five binomial coefficients; later draws use remaining-card counts. The exact conditioning denominator is **(C(60,7) - C(56,7)) × 53 × 52**.

**Exact conditional physical resource rate: 14277253/6644092455 = 0.21488643%.**

This is a deliberately narrow **resource conjunction** for a proposed line. It excludes the extra two cards normally drawn from Speed Lightning Energy, card searches, opponent mulligan bonuses, actual moves, opponent choices and match survival. It is therefore no estimated frequency of completed Volt Cyclone attack, Knock Out or game victory. The additional Speed draw can expand resource opportunities, while disruption and tactical priorities can invalidate the sequence.

## Reproduction and limitations

The original-source [exact BigInt enumerator](../../simulation/evaluation/agent40-rank6-turn3-guzma-volt-physical.cjs) and [three pure tests](../../tests/agent40-rank6-turn3-guzma-volt-physical.test.cjs) passed the existing manual-only card audit, [GitHub Actions **41512275154 SUCCESS**](https://github.com/FlareZ123/experiment-01/actions/runs/41512275154).

The separate original-rank6 native physical-60 [both-seat fixture](../../tests/agent40-native-bunnelby-exeggutor-blockade-continuation.test.cjs) already establishes genuine Guzma response and actor-adaptive unpowered Blockade; a **charged native Volt Cyclone KO** extension is currently being verified, and its result must be recorded before any native-KO claim.

The original rank2 **registered** 60 itself has no Exeggutor. This counterline concerns the separately registered rank2-derived **experimental Exeggutor v2** candidate. The 0.21488643% figure conditions on rank6 Basic-valid opening alone and has not been combined with the candidate's setup probability or strategic decisions.

**Field: 29/32 authenticated originals; zero competitively qualified games; 99.5% not demonstrated.**
