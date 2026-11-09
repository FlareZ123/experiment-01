# Mimikyu redundancy versus the turn-one Initialization requirement

**Agent12 | 9 November 2026 | Exact physical-opening and Prize arithmetic, no win-rate estimate.**

The better-performing native candidate [Iron Thorns / Mimikyu Safeguard v1](../../aichi-2026/candidate-iron-thorns-safeguard-pivot-v1.md) has **four Iron Thorns ex, one Mimikyu PAL and one Basic Psychic**. A stronger version needs less singleton resource failure without gratuitously losing the Thorns turn-one Active lock. These are competing constraints; simply duplicating Mimikyu adds genuine starting Pokémon and can substantially change the intended ALS.

## Exact mulligan-valid initial sevens

Assume a uniform physical seven from 60, with four Iron Thorns ex, `m` Mimikyu, and no other Basic Pokémon. Condition on having at least one Basic in the seven (repeating mulligans until legal). The player elects to open Thorns whenever any Thorns is present. `Mimikyu-only opening` means a legal seven with zero Thorns and at least one Mimikyu; the owner must initially place Mimikyu Active.

For `m` Mimikyu copies:

`P(valid) = 1 − C(56−m,7)/C(60,7)`

`P(forced Mimikyu | valid) = [C(56,7) − C(56−m,7)]/[C(60,7) − C(56−m,7)]`

| Mimikyu copies | Valid initial sevens | Forced Mimikyu Active, conditional on valid seven | All Mimikyu Prized among six |
| ---: | ---: | ---: | ---: |
| 0 | 39.94996% | 0% | Not applicable |
| **1 (current v1)** | **47.45622%** | **15.81722%** | **10%** |
| 2 | 54.14361% | **26.21481%** | **0.84746%** |
| 3 | 60.08795% | **33.51419%** | 0.05845% |

**Decision consequence:** adding a second Mimikyu cuts the chance that all copies are Prized from 10% to 0.8475%, but raises forced Mimikyu starts from 15.82% to 26.21% of valid initial sevens. This is a ~10.40 percentage-point increase in starts without an Active Iron Thorns Initialization, before playing any switching card. The change might be justified by stronger defensive matchups, but early-lock cost must be modeled, and adding Basics also changes the opponent's mulligan compensation.

## Different redundancy lever: second Basic Psychic

Keeping **four Thorns plus one Mimikyu** while adding a second Basic Psychic retains the exact initial Basic count and forced Active distribution. With two singleton line requirements, Mimikyu and one Psychic, a random six-Prize set contains at least one required card with probability **19.15254%**, before recovery. With one Mimikyu and **two** Basic Psychic, the failure event `Mimikyu Prized OR both Psychic Prized` has probability

`6/60 + C(6,2)/C(60,2) − C(6,3)/C(60,3) = 10.78901%`.

The improvement in ex ante recovery dependence is **8.36353 percentage points**, while the count and identity of opening Basics remain unchanged. This mathematical argument assumes the line needs a physically accessible Basic Psychic and Mimikyu; it does not include natural draw, Supporter contention, hand payments, opponent Energy denial or Gladion retrieval. It is a recommendation for the **next genuine 60-card swap experiment**, rather than an established competitive gain.

## Priority

In a new independent source-matched native experiment, compare current v1 against a v1 plus second Basic Psychic substitution **before** automatically doubling Mimikyu. Look at first-turn Thorns Active occupancy, actual Mimikyu paid Ghost Eye, source pressure, card access and price paid for the removed Trainer. Four Thorns, one Mimikyu and two Psychic preserves the five-Basic opening distribution and targets a demonstrated singleton Prize failure with a different resource. The direct source and all matchups still require robust gameplay evidence.

All calculations are exact hypergeometric combinatorics, and 0 games in this note are competitively paper-qualified.
