# Gladion/Jet recovery correction for Sentinel Whismur v2

**Date:** 2026-11-20  
**Evidence class:** printed-card-text derivation + exact combinatorial resource-access calculation  
**Status:** no full game, matchup result, or win-rate evidence

## Finding

The exact [Sentinel Lopunny Vileplume v2 (Whismur double-lock) 60](../candidate-sentinel-lopunny-vileplume-v2-whismur-doublelock.psv) contains **Gladion CIN 95 ×1** and **Jet Energy PAL 190 ×3**. Those two cards create a recovery line omitted from the earlier Bawl-access and Prize-sensitivity summaries:

1. If Whismur CES 116 is among the six face-down Prize cards, play Gladion from hand and take Whismur into hand.
2. Bench Whismur, then attach Jet Energy from hand to it. Jet Energy provides Colorless Energy and switches the attached Benched Pokémon with the Active Pokémon.
3. Whismur is now Active with the Colorless cost paid; use Bawl on the first turn going second.

Bawl's printed condition and effect are exact: it can be used only when going second and only on that player's first turn, and it prevents the opponent from playing Trainer cards from hand during their next turn. Gladion must be played from hand. The line requires a valid opening with another Basic Pokémon, Gladion and Jet Energy both in the opening seven plus first draw, an open Bench slot, and no live Supporter lock. It uses no Item or Pokémon Ability and does not rely on Guzma & Hala's two-discard assumption.

## Corrected first-turn Bawl-access envelope

The existing Agent27 exact model gives 12.0433% without Guzma & Hala and 22.8575% with its optimistic two-discard assumption, conditional on a valid opening and going second. The mutually exclusive Gladion/Jet route adds **0.385377 percentage points**.

| Access scenario | Existing model | Gladion/Jet addition | Corrected |
|---|---:|---:|---:|
| No Guzma & Hala route | 12.0433% | +0.3854 pp | **12.4287%** |
| Optimistic Guzma & Hala route | 22.8575% | +0.3854 pp | **23.2429%** |

All values are conditional on a valid 13-Basic opening and going second, before opponent interaction. Under a 50/50 seat assignment, this corresponds to 6.2144%–11.6214% of valid-opening games. The initial-seven no-Basic/mulligan event remains 16.2844%; the deck composition is unchanged.

The rescue route survives Ability and Item suppression because it uses a Supporter, a Pokémon, and an Energy attachment. It is unavailable under a live Supporter lock. The added route is small and does not change Whismur v2's unpromoted status.

## Corrected six-piece Prize sensitivity

The exact turn-4 double-lock schedule names six physical cards: Whismur ×1, Grand Tree ×1, Rare Candy ×2, and Stoutland ×2. The earlier 48.41% raw Prize-exposure figure is not a failure rate: one Gladion can recover one missing piece, and a Prized Whismur can be recovered early enough for Bawl if Jet Energy is also available.

The calculation below conditions on a valid opening containing at least one of the list's 13 Basics. It enumerates the opening seven first, then six Prizes from the remaining 53 cards. For a missing non-Whismur piece, Gladion is available by game turn 4 if it is in the opening or one of the two natural draws (turn 2 and turn 4). For a Prized Whismur, the stricter turn-2 Gladion-plus-Jet route is counted using the first-turn access enumeration above.

| Prize event / recovery | Probability |
|---|---:|
| None of the six named pieces is Prized | 51.5279% |
| Exactly one of the other five pieces is Prized, with Whismur and Gladion not Prized | 28.8340% |
| That non-Whismur piece is recovered by Gladion by turn 4 using natural draws only | 4.6195 pp |
| Whismur is the only named piece Prized, with Gladion not Prized | 5.5583% |
| Whismur is recovered for turn-2 Bawl by Gladion + Jet Energy | 0.3854 pp |
| **Named-piece Prize-zone viability with the modeled natural-draw recovery** | **56.5327%** |
| **Ideal one-Gladion recovery ceiling** (Gladion always available by deadline; Jet always available for a Prized Whismur) | **85.9202%** |

The ideal ceiling assumes no more than one of the six named pieces is Prized, Gladion itself is not Prized in those recovery cases, and Jet is accessible when Whismur is Prized. It is a ceiling for this one-card recovery mechanism, not for the deck.

The 56.5327% natural-draw result is also **not** a lock-assembly probability. It does not establish access to the necessary Lillipup/Oddish board, Tools, Energy, evolution timing, or the rest of the hand. It ignores extra draw/search effects when locating Gladion, while also ignoring the other access and board constraints. Treat it only as a Prize-zone sensitivity.

## Reproducibility

- Exact list: [Sentinel Whismur double-lock v2](../candidate-sentinel-lopunny-vileplume-v2-whismur-doublelock.psv)
- Existing baseline: [Agent27's exact Whismur opening-access report](agent27-sentinel-whismur-opening-access-20261112.md) and [enumerator](../../../simulation/evaluation/agent27-sentinel-whismur-access.cjs)
- New standard-library enumerator: [agent35-whismur-gladion-recovery.py](../../../simulation/evaluation/2026-11/agent35-whismur-gladion-recovery.py)

Run from the repository root:

```bash
python simulation/evaluation/2026-11/agent35-whismur-gladion-recovery.py
```

The script validates the exact relevant card identities/counts and the 13-Basic composition before enumerating. The first-turn calculation conditions on a valid opening, then chooses six Prizes plus one first-turn draw from the remaining 53 cards. The turn-4 Prize calculation conditions on the same valid opening and models the two natural draws from the 47-card post-Prize deck.

**Decision:** retain Whismur v2 as a distinct, unqualified 60-card challenger. Correct its access and Prize summaries, but do not promote it: the Bawl bridge remains rare, the double-lock line remains untested as a complete game plan, and there is no matchup or win-rate evidence. No decklist, policy, simulator, fixture, or workflow was changed.
