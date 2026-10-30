# Source-printed Mimikyu Safeguard versus Tinkaton ex: 8 genuine Store attack arms

**Agent 7 | 30 October 2026 | original pinned Twinleaf, mechanically valid staged attacks only, no real games.**

The 29 published original Aichi 2026 Top32 60s use mechanically different Mimikyu printings: **PAL97 Safeguard** at ranks **3 and 7** (Snorlax variants); **GRI58 Copycat** at ranks 1 and 30. The [frozen Tinkaton/Lillie v1 hypothesis](../als/agent7-tinkaton-lillie-reset-v1.json) includes Tinkaton ex SVP31, whose 140-damage **Pulverizing Press** ignores effects on the opponent's Active Pokémon. Its 30-times-hand **Big Hammer** has no corresponding printed bypass.

The original native Store test [agent7-tinkaton-safeguard-native.cjs](../../simulation/twinleaf/agent7-tinkaton-safeguard-native.cjs) runs each attacking-player **physical seat 0 and 1**, each opposing **original printed Mimikyu**, and both selected attack modes. Each artificial turn-three State has a real Tinkaton ex SVP, three physical Psychic Energy, an **eight-card attacking hand**, six Prizes per side, a surviving opposing Tapu Lele-GX Bench and decks. Each arm calls genuine `AttackAction`, then resolves any actual Wait, Prize-choice and Bench-promotion prompts in the original pinned Store. The assertion is the physical **Prize transition**, not an inferred damage-label or isolated printed-rule observer.

| Source Mimikyu printing | Tinkaton ex attack | Paper expected source knockouts | Real native Prizes in both owner seats |
| --- | --- | --- | --- |
| PAL97 Safeguard | Big Hammer with 8 hand | **No** (damage prevented) | **0** |
| PAL97 Safeguard | Pulverizing Press | **Yes** (damage bypass) | **1** |
| GRI58 Copycat | Big Hammer with 8 hand | **Yes** | **1** |
| GRI58 Copycat | Pulverizing Press | **Yes** | **1** |

All eight original native Store arms passed with the paper-expected Prize count, including genuine prompt completion, at [manual Twinleaf CI 41012745064](https://github.com/FlareZ123/experiment-01/actions/runs/41012745064), commit `fceefcd2b5dba9b780fcc316644374fe7494189a`. The Step7 containing the [DTE regression](agent7-tinkaton-dte-reversible-hook-native-20261030.md) plus this eight-arm test completed **SUCCESS at 2026-10-30T06:14:55Z**. The full workflow later failed in its separate existing `Canceling Cologne` regression at Step21; do not report all smoke jobs as green.

**Interpretation:** a precise original-paper countermeasure exists for a specific two-rank Mimikyu wall, and the pinned Store implements that contrast in the staged states. It is **not** a completed turn-two Tinkaton setup, a source-first Snorlax/Garbodor/Item lock game, a payoff for including a slow Stage 2, or evidence of ranking versus the entire field. Realistic two-Energy/one-Psychic payments, Bench movement, Supporter contention and opponent response must be incorporated before this can change any fixed-deck nomination.

The test uses no vendor edits, no new workflow and no changed Aichi source identities. **29/32 authenticated original source 60s, zero competitively qualified games, 99.5% target unproven.**
