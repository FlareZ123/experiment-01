# Agent 11: naturally solo Iron Thorns and empty-Bench attack policy

**1 November 2026. Exact source inventory calculation, pure local Node tests. No competitive game wins certified.**

## Why this matters

[Agent7's newly completed original-source native eight-seed panel](../aichi-2026/agent7-thorns-empty-bench-preregistered-eight-seed-native-20261101.md) confirmed four original rank-6 Iron Thorns ex attacks that a generic bot had replaced with Pass because Volt Cyclone had no own Bench recipient. All four attacks genuinely settled 140 damage; three selected untimed engine winners reversed. These are policy-development game outcomes, never a tournament win rate.

This note quantifies the natural-card prevalence of the empty-Bench risk, rather than proving the attack again.

## Source-locked facts and method

All three authenticated original Iron Thorns source lists, ranks **6, 24 and 29**, contain exactly four Basic Pokémon: **4 Iron Thorns ex TWM 77**, with 56 other cards. The source-locking executable rejects changed rank/printing/count or non-60 input.

Let a legal original-source opening seven be conditioned on containing at least one Basic. The exact probability that it contains **only one** Iron Thorns is

`4 * C(56,6) / [C(60,7)-C(56,7)] = 0.8417535034135825`.

Such a start is necessarily **solo Active with an empty Bench at setup**, since no other Basic is initially present.

The reusable model jointly accounts for both players' simultaneous Basic-free redraws and the maximum optional bonus cards the original Iron Thorns player receives from the opposing candidate's mulligans. It marginalizes six Prize cards. No Trainer/Ability search, additional Pokémon placement or opponent action is modeled. We compare the original rank-1 Shadow Rider reference (14 Basics) against the frozen New Moon candidate (17 Basics).

## Result: one physically available source Basic

| Total additional ordinary draws after setup | Vs 14-Basic reference | Vs 17-Basic New Moon |
| ---: | ---: | ---: |
| 0, with all optional mulligan bonus draws | **83.84336%** | **83.99357%** |
| 1 | 79.09153% | 79.23593% |
| 2 | 74.52270% | 74.66141% |
| 3 | 70.13328% | 70.26641% |
| 4 | 65.91967% | 66.04735% |

The first row describes the exact source *setup-only forced solo* inventory under maximum compensation. The later rows describe **natural-draw-only hypothetical exposures**, since actual Trainers, searches and evolution/Bench actions may radically change the state. If a player declines bonus draws, forced-solo exposure can increase. The negligible overlong-mulligan tail is separately bounded in the code.

**Decision consequence:** A generic bot that treats a missing recipient for Volt Cyclone's after-damage Energy movement as a reason to Pass will encounter that question frequently in plausible original Iron Thorns play. The true native settle-140 route in Agent7's source-dealt study provides the causal policy evidence; this exact combinatorial study supplies the missing opening prevalence context. No number in this table estimates wins or proves a particular later turn actually has an empty Bench.

## Reproduction and limits

Source: [all 29 authenticated original 60s](../aichi-2026/full-decklists.json). Pure calculation [scripts/agent11-thorns-solo-basic-envelope.cjs](../../scripts/agent11-thorns-solo-basic-envelope.cjs), with [four local passing Node tests](../../tests/agent11-thorns-solo-basic-envelope.test.cjs), imports the already published exact joint-mulligan core. No new CI run, workflow, native game or modified baseline policy.

**Benchmark unchanged:** 29/32 authenticated original opponent 60s, zero competitively qualified games, no demonstrated 99.5% fixed deck.
