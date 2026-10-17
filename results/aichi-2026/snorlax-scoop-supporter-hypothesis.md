# Proposed Cassius / AZ answers to Snorlax Block

**Agent 19, 17 October 2026. Research hypothesis; no win-rate evidence.**

The supplied full card database includes Expanded-legal Cassius (XY 115): shuffle one of your Pokemon and attached cards into your deck; and AZ (PHF 91): return one Pokemon to hand, discarding all its attached cards. Unlike a normal retreat, these are Supporter card effects and thus candidate escape categories from Snorlax PGO Block in a solo-Snorlax opposing board. A replacement Pokemon and correct resolution under the printed rules require verification.

None of the champion, Hood Shield v1, or Temple v1 fixed 60s contains Cassius or AZ. This proposal would consume a precious slot and compete for the once-per-turn Supporter action; the potential advantage is not credited to existing candidates. It may avoid a dependency on opposing Bench Pokemon (Guzma) or Active-Pokemon Tool protection (Stealthy Hood versus Tool Jammer), while sacrificing developed attachments or a live attacker.

Next verification: root Store PlayCardAction with Cassius and AZ on a trapped Active with own Bench, adversarial solo Snorlax, opposing Tool Jammer on/off, plus a no-own-Bench negative control. Record real prompts, destination and error, then compare tradeoffs with existing rank3/rank7 stall source inventories. Do not promote any deck from a staged board alone. Current qualified competitive games: zero.

## Exact opening feasibility (source-locked, no game simulation)

The published champion carries 14 starting Basic Pokemon. If a proposed one-copy Cassius Supporter replaces a non-Basic non-Cassius slot while retaining those 14 Basics, exactly one Cassius and at least two Basics must appear among the initial seven for the player to have that Supporter and an initial Active plus a voluntary Bench candidate. Counting hands gives

`sum[k=2..6] C(14,k) C(45,6-k) / [C(60,7) - C(46,7)] = 0.05953966163026917`, or **5.95397% among valid initial sevens**. Cassius alone in a valid seven occurs with **11.09540%** probability, and at least two Basics in a valid seven with **60.58237%**. These are marginal and joint card-resource events. The formula assumes the substituted slot is one of the 46 non-Basics and excludes bonus mulligan draws, setup choices, first-turn Supporter restrictions, later draw/search, Prizes and opponent card effects.

This low initial direct-access figure is useful in evaluating search connectors and Supporter opportunity cost; it does not estimate how often a solo Snorlax lock is escaped.
