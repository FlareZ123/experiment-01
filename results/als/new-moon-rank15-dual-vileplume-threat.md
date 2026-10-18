# Rank-15 dual Vileplume and New Moon: source-print counterplay screen

**Agent 30, 18 October 2026. Evidence tier: exact printed source inventory and card text, with conditional tactical inference.** This concerns the frozen [New Moon Lockbreaker v1 English-proxy 60](new-moon-lockbreak-60-candidate.md) against the actual published **Aichi rank-15 Lopunny Vileplume** list. There is **no observed source-dealt dual-lock game, no played outcome, and no qualified win rate**.

## Why the second Vileplume changes the matchup

The published rank-15 source has 2 Oddish UNB 5, 2 Gloom UNB 7, 2 Vileplume **AOR 3**, and 1 Vileplume **BUS 6**, plus 2 Stealthy Hood UNB 186. These counts are [machine-audited from the original printing inventory](../aichi-2026/full-decklists.json) and [exact English card records](../../scripts/aichi-printing-mechanics.cjs).

- **AOR Vileplume, Irritating Pollen**: if active on the board with its Ability operating, neither player may play Item cards from hand. It can maintain this lock on the Bench.
- **BUS Vileplume, Disgusting Pollen**: while BUS Vileplume is Active and its Ability operates, the opposing Basic Pokémon cannot attack. It must occupy the Active Spot to project this restriction.
- **Stealthy Hood**: attached to a Vileplume, it prevents effects of the opposing player's Abilities on that Pokémon. Against a Cursed Blast counter line, this can make the relevant Ability placement ineffective, depending on the actual target and other lock effects.

**Conditional joint board:** AOR Vileplume on the Bench plus BUS Vileplume Active removes the usual Item-based answers to BUS's attack restriction. These two Stage 2 Pokémon compete for only two Oddish/Gloom chains, Bench/Active places, early evolution turns and search resources. Their ability to coexist in a real Aichi game remains unmeasured. A successful single AOR line or BUS line can still change the timing of counterplay before any joint board exists.

## What the proposed New Moon candidate can actually do

Its 60 has two **Field Blower**, two **Canceling Cologne**, one **Escape Rope** and one **Counter Catcher**. All six are Items, and therefore fail as responses after an active AOR Item lock is established (unless that lock is first disabled). The candidate has no named Guzma/Boss/Serena Supporter; its documented Supporters are Lillie's Determination and Ace Trainer.

The candidate primarily attacks through Basic Pokémon including Mewtwo & Mew-GX and Gengar & Mimikyu-GX. The BUS Active Ability would prevent Basic attackers from announcing attacks while applicable. **The frozen candidate does retain exactly two Stage 1 Dusclops SFA 19**, whose *Will-O-Wisp* attack deals 50 damage for two Psychic Energy. A clean 140-HP BUS Vileplume would require **three unmodified 50-damage attacks** to Knock Out, ignoring damage modifiers, special conditions, opponent plays and alternate targets. Dusclops also has Cursed Blast (five damage counters, then its own Knock Out), creating a possible counter line with a steep Prize cost and sensitivity to Stealthy Hood.

The joint board is therefore a **serious conditional lock-threat and tempo test**. This is not a proven total lock: Dusclops's printed Stage 1 attack remains an avenue. Whether it can be established, powered, promoted and sustained while rank15 attacks and controls resources is the decisive practical question.

## Tests to prioritize over further marginal access estimates

Use unmodified printed 60s, actual starting-seat evidence and real evolution chronology. Measure the rate of achieving AOR + BUS simultaneously without staged board insertion; then record the first candidate legal response with the same source seed and physical Prizes. In exposed games, check whether Item-based outs were used before AOR activated, whether two Psychic Energy can reach a Dusclops, whether BUS stays Active, and whether Hood actually blocks a chosen Cursed Blast counter effect. Preserve missing/failed/aborted trials, Prize consumption, and meaningful rank15 opponent actions. These must be separately distinguished from any generic-bot game winner.

Executable source census: [script](../../scripts/new-moon-rank15-dual-vileplume.cjs) and [two source-contract tests](../../tests/new-moon-rank15-dual-vileplume.test.cjs). Neither invokes Twinleaf nor validates a real joint-board line.

**Decision:** add rank15's split-print dual-lock threat to the adversarial acceptance tests for New Moon; do not award or assume a win/loss before actual replay. **Zero independently qualified competitive matches.**

## Staged pinned-Store attack probe, pending execution

The new [conditional live-Store action probe](../../simulation/twinleaf/new-moon-rank15-dual-lock-actions.cjs) stages BUS Vileplume Active and optionally AOR Vileplume Benched, then attempts the real pinned engine's Basic Mewtwo & Mew-GX attack, Stage 1 Dusclops Will-O-Wisp attack, or Canceling Cologne Item. The probe asserts the printed-action gates and 50 damage for Dusclops. It is registered in the existing manual New Moon workflow. **At publication time, this compiled probe is not verified by a completed action run**; the execution request was blocked. Any assertion failure should be preserved as engine-fidelity evidence rather than smoothed into a game claim.
