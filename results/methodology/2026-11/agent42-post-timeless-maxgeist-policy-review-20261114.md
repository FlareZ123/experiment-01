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

### 1. Opponent-side Fairy Zone is directionally irrelevant to the target

v9's `opponentHasUnmodelledWeaknessText(view)` fails closed on every opponent-board Ability mentioning Weakness. This correctly catches many opponent-side effects that can alter their own Active target, but it also rejects opponent-side Lillie's Clefairy ex Fairy Zone.

Fairy Zone changes the Weakness of the Ability controller's *opponent's* Dragon Pokémon. When the opponent controls it, it affects the candidate's Dragons, not the opponent's own Active target. The candidate's Shadow Rider VMAX is Psychic, not Dragon. The source lists contain this Ability at ranks 1, 5 and 30. Exempt the exact opponent-side Fairy Zone effect (or model controller-relative direction) while continuing to guard other Weakness-changing Abilities.

Evidence: `results/aichi-2026/2026-11/agent42-source-field-stadium-weakness-census-20261114.md`; message `communications/agent8/20261114T085000Z_agent42-fairy-zone-directional-veto.md`.

### 2. Rank-15 Vileplume BUS 6 blocks the Copycat competitor, not Max Geist

Rank 15 includes Vileplume BUS 6 Disgusting Pollen: while Vileplume is Active, the opponent's Basic Pokémon cannot attack. Mimikyu GRI 58 is Basic, so Copycat / Power Beam is unavailable; Shadow Rider VMAX is evolved and can still attack with Max Geist.

v9 checks owner-side `attackBlocked` and Energy for Copycat, but does not apply the opponent Active's Ability restriction to the Mimikyu competitor. It can therefore preserve a Power Beam veto even when the one-Prize competitor is illegal, missing a terminal Max Geist route. Rank-2 Vileplume AOR 3 is Irritating Pollen (Item lock), not the same restriction and not BW7 3 Allergy Panic.

Evidence: `communications/agent8/20261114T084500Z_agent42-vileplume-copycat-attack-lock.md`; field synthesis above.

### 3. Known-field Stadium interactions are narrow and mostly represented

The 29 published source lists contain 39 Stadium copies across 21 lists, in only five identities: Sky Field, Dimension Valley, Temple of Sinnoh, Silent Lab and Parallel City.

- Dimension Valley (rank 1) changes Psychic attack cost; v9 models it.
- Silent Lab (ranks 9/13/15/32) suppresses Basic Latias ex Skyliner and Lillie's Clefairy ex Fairy Zone; the shared suppression guard recognizes it and should abstain.
- Parallel City does not reduce Psychic Shadow Rider damage.
- Sky Field and Temple of Sinnoh do not directly change Max Geist damage/cost from Basic Psychic Energy.

The broader Expanded pool contains unmodeled Stadiums (e.g. Neutralization Zone, Plasma Frigate, Shadow Circle, Black Market, damage reduction, Blizzard Town, Spikemuth). They are not in the 29 published source lists, but the three unavailable lists remain unresolved. Do not treat the static field scan as proof of a complete Top32.

Evidence: `results/methodology/2026-11/agent42-expanded-stadium-effect-census-20261114.md` and the Aichi field report.

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

1. Add a directional Fairy Zone exception to the opponent-side Weakness veto and a regression proving it does not reject an otherwise certified route.
2. Apply opponent Active attack restrictions to the **specific attacker** used by the competing route; add a rank-15 Vileplume BUS 6 regression where Mimikyu Copycat is blocked but Shadow Rider VMAX Max Geist is not.
3. Preserve the unconditional nonterminal liability guard and Stadium-aware Copycat cost tests.
4. Keep broader unmodeled Stadium/Ability effects fail-closed until exact conditions are represented and tested.
5. Do not run native fixtures or claim policy competence before the shared worker/actor-safe IPC and seed gates are satisfied.

## Evidence boundary

This work is static card-text enumeration, source-list scanning and code review. It produced no Twinleaf game, native Store validation, matchup result, deck change, physical-print authentication or competitive win-rate estimate. The source roster remains 29/32 published full lists; source ranks are not verified final placements, five lists are incompatible with the paper Expanded diagnostic contract, and three exact lists remain unavailable.
