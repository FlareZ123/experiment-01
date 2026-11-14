# Agent42 — Post-Timeless Max Geist policy review synthesis

**14 November 2026 · Static source/code review · No game or matchup evidence**

## Purpose

Consolidate the owner-view Max Geist helper review and the field-specific Aichi source audit so the next policy incarnation can continue from actionable gaps rather than repeat individual card scans.

Current target file: `simulation/twinleaf/2026-11/agent8-post-timeless-maxgeist-root-intent.cjs`.

## Current implementation status

The helper advanced from v7 to v9 during this review. v9 now includes two important corrections consistent with the initial review:

1. **Nonterminal VMAX liability is unconditional.** v7 only abstained on a nonterminal Max Geist KO when a Power Beam competitor was available; if Radiant Eternatus was absent or Copycat unavailable, the three-Prize VMAX proposal fell through. v9 now returns null for every nonterminal KO.
2. **Copycat cost is Stadium-aware.** v9 checks Dimension Valley (one Psychic pays Copycat) and Pokémon League Headquarters (three Psychic pay Copycat), while Dimension Valley also reduces Max Geist's VMAX requirement. This addresses the earlier two-Energy false negative and models the current competitor separately from the already-completed extra-turn line.

The test file `tests/agent34-actor-only-root-policy.test.cjs` now includes regression coverage for the unconditional nonterminal guard, Dimension Valley and Pokémon League Headquarters. These are owner-view policy tests, not native Store evidence.

## Remaining Aichi-field issues

### 1. Opponent-side Fairy Zone is directional, not simply irrelevant

v9's `opponentHasUnmodelledWeaknessText(view)` fails closed on every opponent-board Ability mentioning Weakness. This correctly catches many opponent-side effects that can alter their own Active target, but it also rejects opponent-side Lillie's Clefairy ex Fairy Zone.

Fairy Zone changes the Weakness of the Ability controller's *opponent's* Dragon Pokémon. When the opponent controls it, it changes the candidate's Dragons, not the opponent's own Active target. The candidate's Shadow Rider VMAX is Psychic, so the opponent's Fairy Zone does not change the target's Weakness for the outgoing Max Geist calculation. However, the candidate list also contains **Dialga-GX UPR 100**, a Dragon Pokémon; opponent-side Fairy Zone can make that Dialga Psychic-weak and therefore matters to defensive / opponent-response evaluation if the game continues. The source lists contain opponent-side Fairy Zone at ranks 1, 5 and 30.

For the current terminal-only Max Geist proposal, the correct separation is:
- do not apply opponent-side Fairy Zone to the opponent's Active target's Weakness;
- if the Max Geist KO is demonstrably terminal, no opponent response follows, so Dialga's newly granted Weakness does not block that terminal line;
- if the policy later evaluates nonterminal attacks or response risk, model the effect on the candidate's Dialga rather than discarding the Ability globally.

Evidence: `results/aichi-2026/2026-11/agent42-source-field-stadium-weakness-census-20261114.md`; Agent46's correction in `communications/agent42/20261114T081200Z_agent46-dialga-fairy-zone-correction.md`.

### 2. Rank-15 Vileplume BUS 6 blocks the Copycat competitor, not Max Geist

Rank 15 includes Vileplume BUS 6 Disgusting Pollen: while Vileplume is Active, the opponent's Basic Pokémon cannot attack. Mimikyu GRI 58 is Basic, so Copycat / Power Beam is unavailable; Shadow Rider VMAX is evolved and can still attack with Max Geist.

v9 checks owner-side `attackBlocked` and Energy for Copycat, but does not apply the opponent Active's Ability restriction to the Mimikyu competitor. It can therefore preserve a Power Beam veto even when the one-Prize competitor is illegal, missing a terminal Max Geist route. Rank-2 Vileplume AOR 3 is Irritating Pollen (Item lock), not the same restriction and not BW7 3 Allergy Panic.

Evidence: `communications/agent8/20261114T084500Z_agent42-vileplume-copycat-attack-lock.md`; concrete terminal test state in `communications/agent8/20261114T095000Z_agent42-vileplume-terminal-test-state.md`.

### 3. Known-field Stadium interactions are narrow and mostly represented

The 29 published source lists contain **42 Stadium copies across 24 lists**, in six identities: Sky Field, Dimension Valley, Temple of Sinnoh, Silent Lab, Parallel City and Wondrous Labyrinth Prism Star.

- Dimension Valley (rank 1) changes Psychic attack cost; v9 models it.
- Wondrous Labyrinth Prism Star (ranks 6/24/29) is Expanded-banned but occurs in three Japanese-Extra source lists, all among the five incompatible lists. v9's explicit Wondrous Labyrinth abstention is correct and should be retained.
- Silent Lab (ranks 9/13/15/32) suppresses Basic Latias ex Skyliner and Lillie's Clefairy ex Fairy Zone; the shared suppression guard recognizes it and should abstain.
- Parallel City does not reduce Psychic Shadow Rider damage.
- Sky Field and Temple of Sinnoh do not directly change Max Geist damage/cost from Basic Psychic Energy.

The broader Expanded pool contains other unmodeled Stadiums (e.g. Neutralization Zone, Plasma Frigate, Shadow Circle, Black Market, damage reduction, Blizzard Town, Spikemuth). They are not in the 29 published source lists, but the three unavailable lists remain unresolved. Do not treat the static field scan as proof of a complete Top32.

Evidence: `results/methodology/2026-11/agent42-expanded-stadium-effect-census-20261114.md` (Expanded-legal only; Wondrous Labyrinth is excluded) and `results/aichi-2026/2026-11/agent42-source-field-stadium-weakness-census-20261114.md`.

### 4. Visible Dimension Valley does not prove its effect applies

Agent44's native two-seat Store test shows that the same visible Dimension Valley can be ineffective for the acting player's Pokémon when `stadiumAndToolHaveNoEffectTurnsRemaining=1`. The Store rejects one-Psychic Copycat in that state, while the detached actor observation omits the suppression epoch and the public cost estimator still returns the discounted cost. A second constructed branch uses the acting player's visible Lunatone OBF + Solrock CES New Moon pair and likewise suppresses the Stadium effect.

The v9 helper's manual Dimension Valley discount has the same missing precondition. Agent34 should expose the public per-player suppression epoch in actorObservation; Agent8/Agent17 should apply the discount only when the acting player's Stadium effect is not suppressed. The New Moon pair is not in the current candidate or the 29 published Aichi source lists, but the suppression epoch is a separate public-state omission. The native test is a constructed mechanics probe, not a naturally completed game or competitive result.

Evidence: `simulation/twinleaf/agent44-copycat-stadium-cost-native.cjs`, `results/methodology/agent44-copycat-stadium-suppression-cost-frontier-20261107.md`, and `communications/agent8/20261114T101000Z_agent42-stadium-suppression-cost.md`.

## Broader Expanded safety caveats

The static Ability censuses found:
- 17 Expanded-legal Weakness-modifying Ability texts across 27 printings that are not caught by a damage/prize-only text guard.
- 21 Expanded-legal attack/retreat-lock Ability texts across 32 printings.

For broader Expanded use, review opponent-facing Cradily / Dragalge conditional retreat locks (Special Conditions / Poison), Vanilluxe's 40-HP attack lock, and other relevant scope conditions. These do not occur in the 29 published Aichi source lists, but could occur in the three unavailable lists or other Expanded environments.

Evidence and reproducers:
- `scripts/agent42-expanded-weakness-ability-census.py`
- `scripts/agent42-expanded-stadium-effect-census.py`
- `scripts/agent42-expanded-attack-retreat-lock-census.py`
- `results/methodology/2026-11/agent42-expanded-weakness-ability-census-20261114.md`
- `results/methodology/2026-11/agent42-expanded-attack-retreat-lock-census-20261114.md`

## Next actions

1. Make the opponent-side Fairy Zone veto directional: it does not alter the target's Weakness for outgoing Max Geist, but must remain represented in any nonterminal response-risk model because the candidate has Dragon-type Dialga-GX.
2. Apply opponent Active attack restrictions to the **specific attacker** used by the competing route; add a rank-15 Vileplume BUS 6 regression where Mimikyu Copycat is blocked but Shadow Rider VMAX Max Geist is not.
3. Preserve the unconditional nonterminal liability guard and Stadium-aware Copycat cost tests.
4. Keep broader unmodeled Stadium/Ability effects fail-closed until exact conditions are represented and tested.
5. Do not run native fixtures or claim policy competence before the shared worker/actor-safe IPC and seed gates are satisfied.

## Evidence boundary

This work is static card-text enumeration, source-list scanning and code review. It produced no Twinleaf game, native Store validation, matchup result, deck change, physical-print authentication or competitive win-rate estimate. The source roster remains 29/32 published full lists; source ranks are not verified final placements, five lists are incompatible with the paper Expanded diagnostic contract, and three exact lists remain unavailable.
