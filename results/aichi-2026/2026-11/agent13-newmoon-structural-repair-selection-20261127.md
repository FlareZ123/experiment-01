# New Moon structural repair selection: keep Counter Catcher, cut the second Sky Field for Guzma

**Agent 13 · 27 November 2026**  
**Decision affected:** exact fixed New Moon list for the next cross-architecture policy implementation.  
**Historical result (superseded by cross-review):** this note originally preferred Guzma/Sky v2. **Current decision is to retain v1**; see `agent13-newmoon-v2-reversal-after-crossreview-20261127.md`.  
**Evidence class:** source-list/card-text analysis, exact Prize combinatorics, exact opening combinatorics, existing New Moon ALS documentation, and cross-family acceptance states. **No game, native CI, or win-rate claim.**

## Exact decision

Use the fixed 60 in results/aichi-2026/2026-11/agent13-newmoon-lockbreaker-guzma-sky-v2.json.

Canonical English-proxy identity/count hash: sha256:f3bfed3a82cbddd4acb89ad0f0ff488673fd38c7be16efac0d54ab228d5ca82f.

It differs from New Moon Lockbreaker v1 by exactly:

- **−1 Sky Field ROS 89** (2 → 1)
- **+1 Guzma BUS 115** (0 → 1)

Everything else is unchanged, including all 17 Basic Pokémon, 2 Dusclops / 2 Duskull, 2 Ace Trainer, 1 Counter Catcher, 2 Path to the Peak, 2 Field Blower, 2 Canceling Cologne, and the 3 TPE / 3 Basic Psychic Energy split.

This is a structural repair, not cosmetic one-card churn.

## Why v1 now has a material structural failure

The fixed v1 has exactly two non-Basic Pokémon: **2 Dusclops SFA 19**.

Against rank 15, a source-consistent hard state can contain BUS Vileplume Active, AOR Vileplume in play, and both candidate Dusclops in the six Prize cards. BUS prevents Basic Pokémon from attacking; AOR removes Item access, so Escape Rope and Counter Catcher are unavailable. If both Dusclops are Prized, every other candidate Pokémon is Basic.

The unconditional probability that both specific Dusclops are among six Prizes is (6/60) × (5/59) = **0.8474576%**. This is not the probability of losing to rank 15; the source still has to reach and maintain the lock. It is nevertheless a real multi-Prized structural collapse mode and cannot be ignored under a 99.5% aspiration.

## Why the first Guzma proposal was rejected

The first frozen experiment was −1 Counter Catcher, +1 Guzma. That JSON remains preserved as a rejected experiment at agent13-newmoon-lockbreaker-guzma-v2.json.

It fails because Counter Catcher and Ace Trainer deliberately share the same Prize-deficit window while occupying different card types. The deck's advertised ALS includes Cursed Blast self-KO → Ace Trainer → continuation. Cursed Blast can put New Moon behind on Prizes; in that state Ace Trainer is a legal Supporter and Counter Catcher is a legal Item, so both can be used in the same turn for hand disruption + gust + attack.

Replacing Counter Catcher with Guzma makes gust consume the Supporter action and destroys this multi-axis comeback turn. **Counter Catcher therefore stays.**

## Repair alternatives compared

| Repair | Rank-15 both-Dusclops-Prized lock | Snorlax Block | Rank-26 final-Prize gust | Preserves Ace Trainer + Counter Catcher | Main cost |
|---|---|---|---|---|---|
| + third Dusclops | Reduces all-Dusclops-Prized risk but still needs evolution/Energy/positioning | No independent switch | No | Yes | Adds another Stage 1; does not solve positioning |
| + Gladion | Can recover a Prized Dusclops | No independent switch | No | Yes | Supporter action; still must evolve/power/position Dusclops |
| Counter Catcher → Guzma | Yes if Guzma available | Yes | Yes | **No** | Destroys Ace Trainer + Item-gust comeback ALS |
| **Sky Field → Guzma** | **Yes** | **Yes** | **Yes** | **Yes** | Lose one Stadium copy / wide-Bench redundancy |

The broadest independent escape channel is Guzma **without** deleting Counter Catcher.

## Why cut the second Sky Field

Several plausible cuts were rejected by the cross-family priority rule.

- **An Unown:** Basics fall from 17 to 16. Exact valid-opening rate falls from **91.6563% to 90.0777%**. Against rank 26, lone-Active exposure after taking all usable source mulligan bonuses rises from **27.4628% to 30.5977%** (+3.1349 pp), directly worsening an immediate-loss layer.
- **Battle VIP Pass / Fog Crystal / Basic search:** worsens the same rank-26 pre-attack survival problem and first-turn setup.
- **Ace Trainer:** core Cursed-Blast comeback/disruption line and redundancy.
- **Counter Catcher:** rejected above.
- **Escape Rope:** would leave only a Supporter own-switch and lose Secret Box's Item-channel switch line.
- **Field Blower / Cologne:** still required by current Garbodor/Thorns acceptance states.
- **Heavy Ball:** New Moon already has exact singleton/Prize-recovery fragility.
- **Rescue Carrier:** v1 already cut the source count; low-HP and Cursed-Blast recovery remain live roles.
- **Powerglass / Energy:** the six-Energy engine already has exact funding gates.
- **Path to the Peak:** now central against Shadow Rider, Raichu/Electrode and other Rule-Box Ability engines.

The second Sky Field is different: it is redundancy for wide-Bench operation. Cross-family analysis repeatedly shows that wide Bench is not always positive. Regidrago Phantom Dive converts 60-HP support bodies into Prizes; Snorlax Stall turns them into gust/Block prisoners; Raichu/Electrode can convert a wide Bench into a multi-Prize Electro Rain frontier; Parallel City and Sudowoodo make Bench capacity contested.

v2 keeps **one Sky Field** for states where extra Bench capacity is genuinely required, plus two Path to the Peak as alternative own Stadiums.

The cut has a measurable cost. With 17 Basics and conditioning on a valid opening seven, direct access to at least one own Stadium changes:

| Own Stadium copies | Valid opening seven | By first mandatory draw |
|---:|---:|---:|
| v1: 4 (2 Sky + 2 Path) | **38.8285%** | **43.4453%** |
| v2: 3 (1 Sky + 2 Path) | **30.5779%** | **34.5075%** |
| Difference | **−8.2506 pp** | **−8.9378 pp** |

These are direct-card visibility rates only. They omit Secret Box, Forest Seal Stone routes, later draws, opponent mulligan bonuses and strategic timing. The loss matters against Silent Lab, Temple and other Stadium states; the cut is not free.

The justification is that one redundant Stadium copy is exchanged for an independent Supporter switch/gust channel that attacks several otherwise structural board locks while preserving every Basic and every existing comeback card.

## What Guzma repairs

### Rank 15 BUS + AOR Vileplume

If BUS is Active and AOR remains Benched, Guzma is a Supporter, so AOR Item lock does not stop it. Guzma can move BUS off Active by choosing AOR or another legal Benched target, making Basic attacks legal again; it can also switch New Moon's Active if a candidate Bench exists. This creates an independent escape even when both Dusclops are Prized.

If Silent Lab is also active, Tapu Lele-GX Wonder Tag is suppressed until the Stadium is replaced, so Guzma access is not automatic. v2 still has three own Stadiums plus other draw/search routes when legal.

### Snorlax Block

Guzma changes the opponent's Active and then New Moon's Active. It is therefore a second functional own-switch channel beside Escape Rope when legal Bench targets exist. Counter Catcher cannot do this.

### Rank 26 after failed donk

After rank 26 donates five Prizes, New Moon may have one Prize remaining and be ahead. Counter Catcher's more-Prizes-remaining condition can therefore be false exactly when one gusted Prize wins. Guzma has no Prize-deficit condition.

### Regidrago / protected Active

Guzma can route around a protected Regidrago without requiring New Moon to be behind on Prizes and can repair candidate Active position in the same Supporter action.

## What Guzma does not replace

- It does not replace Counter Catcher in the Cursed Blast → Ace Trainer catch-up turn.
- It does not replace Escape Rope's Item timing / Secret Box Item channel.
- It does not replace Field Blower against Benched Garbotoxin.
- It does not replace Cologne when a current-turn Active Ability must be suppressed.
- It does not repair a Stadium if Silent Lab is already active.
- It consumes the Supporter action and can be dominated by Ace Trainer or Lillie's Determination in some states.

## Prize-collapse impact

With v2, the precise Prize configuration in which both Dusclops **and** the independent singleton Guzma are all Prized has raw probability (6/60) × (5/59) × (4/58) = **0.0584454%**.

This is only a Prize-configuration bound. Guzma can be unprized but inaccessible, Silent Lab can suppress Wonder Tag, switch targets can differ, and the opponent can re-establish BUS. The meaningful improvement is independence of failure mode: Dusclops depends on Stage-1 access/evolution/Energy; Guzma depends on Supporter access and switch targets; Item switch/gust remains a third channel when AOR is absent.

## Required v2 acceptance additions

1. **V2-R15-DUSCLOPS-PRIZED:** both Dusclops known Prized at K1, BUS Active, AOR Benched/Item lock live, Guzma legal/available. Find the Supporter switch rather than declare no attack.
2. **V2-ACE-COUNTER-PRESERVED:** Cursed Blast has put New Moon behind; Ace Trainer + Counter Catcher are both legal. Preserve the option to use both; do not select Guzma merely because it is a gust.
3. **V2-R26-AHEAD-GUST:** New Moon survived five donated Prizes and is ahead, so Counter Catcher is disabled; Guzma can gust a final-Prize target.
4. **V2-SNORLAX-BLOCK:** support Pokémon trapped Active; Guzma and Escape Rope are alternatives. Price Supporter contention versus singleton Item.
5. **V2-SILENT-LAB-ACCESS:** Silent Lab suppresses Tapu Lele Wonder Tag; do not hallucinate Tapu-Lele-to-Guzma until Lab is legally replaced or removed.
6. **V2-STADIUM-SCARCITY:** only one Sky Field exists. Policy and fixtures must use the actual v2 count and never inherit a second Sky from v1.

## Decision boundary

This note no longer changes the preferred fixed 60. Cross-review restored v1; the exact Guzma/Sky v2 remains a frozen challenger.

It does not nominate New Moon as the final best deck over Hood Shield, Lockbridge or other active candidates; create a qualified matchup; authorize native games/workflows; or claim 99.5%.

The reason to move the New Moon implementation target is narrower: v2 repairs a source-consistent structural hard-lock failure with one multi-family independent channel while preserving the documented catch-up ALS and all 17 Basics.

If adversarial review finds a source-consistent state where the lost second Sky is more structurally important than the new Guzma across the fixed-60 objective, revert before implementation. After cross-review, v1 is the preferred exact New Moon target until competent v1 policy evidence establishes that this challenger pays for Sky #2's opportunity cost.
