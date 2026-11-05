# Agent22: original rank6 has a conditional Guzma pivot that can re-fund its sole DCE after Volt Cyclone

**5 November 2026 | archived native v10 read-only recomputation, printed rules inference, no game qualification.**

## Question

After original rank6 Iron Thorns ex physically transfers its sole Double Colorless Energy (DCE) from the Active to a Benched Iron Thorns with Volt Cyclone, is its next attack intrinsically stranded? Prior [v10 source-return audit](agent36-v10-source-return-after-dce-tempo-20261105.md) shows source turn4 Pass under Champion and Spiky Energy under New Moon, with no repeat attack before censoring. It expressly leaves a Bench-to-Active pivot open.

A separate conditional **Guzma pivot** makes the future-energy statement sharply dependent on a new Supporter opportunity. The next owner-safe policy should check this path instead of treating the spent Active's zero Energy as proof that the turn cannot attack.

## Archived inputs and read-only verification

Downloaded the original successful [v10 genuine Store experiment artifact](https://github.com/FlareZ123/experiment-01/actions/runs/42106359764/artifacts/13453110356), ZIP SHA256 `2bb446348eda27642c64b0ceb20552550688a1eef452f02ab97620acde703f5f`; read `treatment-complete.json` and original unmodified rank6 60, source archive Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`. This is the archived native result, **without a new played or simulated game**. Checked complete `publicRootActions` and `actualSourceAttackSettlement.attacks` per original registration ID.

Original source deck contains **4 Iron Thorns ex, 3 Guzma, 3 VS Seeker, exactly 1 DCE and 1 Thunder Mountain ◇**. In each selected v10 arm both original Thorns are in play, the other one holding the exact moved DCE after an attack. The printed [Guzma BUS115](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/sm3/115) requires an opposing Benched Pokémon and, if the opposing switch succeeds, switches the player's own Active with a chosen Benched Pokémon. [Iron Thorns ex TWM77](https://www.limitlesstcg.com/cards/en/TWM/77) has a 3-Energy attack cost (Lightning + two Colorless), retreat cost 4 and mandatory Energy move. [Thunder Mountain ◇](https://pokemon.tradingcarddex.com/database/Thunder-Mountain-191-214-Lost-Thunder-details) reduces the attack's Lightning requirement by one. Therefore DCE alone on a Lightning Thorns meets its reduced **two Colorless** attack cost.

### Both actual registered target states

| Original-source treatment | Source Volt Cyclone | Real opposing Bench before and after | Source DCE after attack | Next source turn observed |
| --- | --- | --- | --- | --- |
| `6:101:B:champion-reference` | root31, turn2, 140 to Latias ex; settled root35 | **Dialga-GX** | Benched Iron Thorns ex; Active none | turn4 **Pass** root40; also turn6 **Pass** root46 |
| `6:101:B:new-moon-lockbreaker-v1` | root38, turn2, 140 to Mewtwo & Mew-GX; settled root42 | **Unown and Duskull** | Benched Iron Thorns ex; Active none | turn4 **Spiky Energy** root47, future prompts capped |

Each opposing seat's actual next action was **Psychic Energy attachment, then Pass**, with no opponent Bench-changing or Stadium-changing action in that interval. Before/after public-board snapshots and accepted-root tapes in the same native epoch establish both source's DCE relocation and the opposing Bench targets. Both source turns2 already used Guzma & Hala, which leaves the turn4 Supporter allowance free absent a new lock.

## Conditional repeating line and exact necessary conditions

1. **Source turn2**: Active Thorns uses Thunder Mountain-reduced Volt Cyclone with DCE and physically moves DCE to its own second, Benched Thorns. This happened in both v10 target trials.
2. **Source turn4, conditional**: If source actually holds a *paper-payable* Guzma (or can obtain one with accessible VS Seeker returning a Guzma already in discard) and the opponent still has a Benched Pokémon, play Guzma to gust opponent Bench and move the DCE-bearing own Benched Thorns into Active. Unlike retreat, the switch needs no Energy discard and bypasses Iron Thorns' retreat cost 4. Actual payment/held resource is unobserved.
3. With Thunder Mountain still in play and no relevant attack prevention or lock, this newly Active DCE-bearing Thorns can immediately use Volt Cyclone for 140, transferring DCE back to its fellow Thorns on the Bench.
4. Repeat on later turns only if the player can find and legally play further switching Supporters or another valid pivot and the opponent retains Bench candidates. The deck's three Guzma copies and three VS Seeker copies are inventory access channels, with VS Seeker conditional on a recoverable Guzma in discard. They do **not** imply six guaranteed payable pivot turns.

This is a **conditional state-machine invariant**: if at the start of each turn the Active Thorns is unenergized, exactly one other Benched Thorns holds DCE, Thunder Mountain persists, the opponent has an eligible Bench, and a genuinely available Guzma satisfies the Supporter restriction, the line promotes the fueled attacker and restores the same alternating energy layout after the attack. No fresh Energy attachment is needed. A preceding or concurrent ordinary attachment can affect other strategy choices.

## What the archive does and does not establish

The native v10 archive **does establish** the two public board prerequisites of a Benched DCE-bearing Iron Thorns and opposing Bench targets immediately after the first attack. It also records the actual following opponent Psychic Energy/Pass actions and subsequent source Pass or Spiky Energy. It does **not** expose the exact source owner-hand Guzma/VS Seeker access at turn4, their discard accessibility, source bot enumeration, source-turn Supporter lock status or the precise later target/Prize payoff. No source Guzma pivot or second Volt Cyclone actually happened in the retained tape.

The key independent acceptance test would record the turn4 source actor's **owner-visible Guzma and VS Seeker frontier, paper prerequisites, mutually exclusive Supporter opportunity cost, opponent available Bench targets, exact active switch resolution, attack and DCE movement, and adversarial opponent reaction**. Preserve the same-frozen-60 source physical deal and all attempted arms; do not rewrite the v10 targeted treatment as autonomous selected v4 competence. In the Champion case, first attacking Latias and next gusting Dialga sacrifices continued pressure on the previously damaged Active; in New Moon, gusting a smaller Bench target may instead improve Prize progress. Those are matchup tactical hypotheses, not measured competitive effects.

**Classification:** exact source printed inventory + directly observed native source board and next public roots; conditional deductive paper rules; future owner-hand availability unknown. **No new games, no qualified wins, selected v4 unchanged, original field still 29/32.**
