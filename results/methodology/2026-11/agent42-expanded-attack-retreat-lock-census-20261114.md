# Agent42 — Expanded Ability attack/retreat-lock census

**14 November 2026 · Static card-pool enumeration · No game evidence**

## Question

Which Expanded-legal Pokémon Abilities can prevent an attack or retreat, and which of those can invalidate the candidate's post-Timeless Mimikyu → Latias ex Skyliner → Shadow Rider VMAX Max Geist route?

## Method

- Input: supplied English card-pool archive, SHA-256 `c39af257e60a79a485aad09c7d7723b6afbb42eae1ba74e280b8a3f77581350a`.
- Enumerate Pokémon cards whose `legalities.expanded` is exactly `Legal`.
- Match Ability text against attack/retreat prohibitions (`can't/cannot attack`, `can't/cannot retreat`, and common equivalent phrases).
- Deduplicate by Pokémon, Ability name and exact text; retain all printings.
- Reproducer: `scripts/agent42-expanded-attack-retreat-lock-census.py`.

**Result: 21 distinct Ability texts across 32 Expanded-legal printings.** Many are self-restrictions and do not restrict the opponent; the table below separates the relevant opponent-facing effects.

## Opponent-facing retreat locks

| Pokémon / Ability | Printing | Restriction |
|---|---|---|
| Snorlax — Block | PGO 55; BW8 101 | Opponent's Active Pokémon can't retreat |
| Spiritomb — Cursed Whirlpool | SM35 47 | Opponent's Active Pokémon can't retreat while Spiritomb is Active |
| Omastar — Primordial Tentacles | SV3pt5 139 | Opponent's Active Pokémon can't retreat while Omastar is Active |
| Flygon — Labyrinth of Sand | SWSH3 91 | Opponent's Active Pokémon can't retreat while Flygon is Active |
| Cradily — Swaying Strangle | SM12 11 | Opponent's Pokémon affected by Special Conditions can't retreat |
| Dragalge — Poison Barrier | XY2 71; XY10 | Opponent's Poisoned Pokémon can't retreat |

Agent2's shared `opponentActiveBlocksRetreat` matcher recognizes the direct “opponent's Active Pokémon can't retreat” wording, covering Snorlax, Spiritomb, Omastar and Flygon. Its current matcher does not recognize the conditional Cradily / Dragalge wording. Agent8's post-Timeless helper currently rejects Asleep and Paralyzed Mimikyu, but Poisoned, Burned or Confused Mimikyu can still be affected by Cradily; Poisoned Mimikyu can be affected by Dragalge. These are potential false-positive retreat proposals in broader Expanded play.

## Opponent-facing attack locks

| Pokémon / Ability | Printing | Restriction |
|---|---|---|
| Vileplume — Disgusting Pollen | BUS 6 | While Vileplume is Active, opponent's Basic Pokémon can't attack |
| Vanilluxe — Frigid Room | SV4 45 | Opponent's Pokémon with 40 HP or less remaining can't attack |
| Wobbuffet — Shady Tail | SWSH8 93 | Prism Star Pokémon in play can't attack and have no Abilities |

For the candidate route:
- Mimikyu GRI 58 is Basic, so Vileplume BUS 6 can block its Copycat / Power Beam competitor. Shadow Rider VMAX is not Basic, so it can still use Max Geist.
- Vanilluxe can block the promoted Shadow Rider VMAX if it has 40 HP or less remaining; the helper should check the attacker's remaining HP against this condition.
- The candidate's Mimikyu and Shadow Rider VMAX are not Prism Star Pokémon, so Wobbuffet SWSH8 Shady Tail is not a blocker for this route.

The remaining census entries are mostly self-restrictions (e.g. Slowbro Airhead, Slaking Kinda Lazy, Regigigas Seal of Antiquity, Team Rocket's Mewtwo ex Power Saver) and should not be misclassified as opponent-facing restrictions merely because their text contains “can't attack”.

## Aichi source-field relevance

The 29 published source lists contain:
- Snorlax PGO 55 Block at source ranks 3 and 7 (already covered by the direct opponent-Active retreat guard).
- Vileplume BUS 6 Disgusting Pollen at source rank 15 (the field-relevant Copycat competitor lock; Agent8 was notified).
- Wobbuffet PHF 36 Bide Barricade at ranks 7, 10 and 21. This is **not** Wobbuffet SWSH8 Shady Tail. Bide Barricade exempts Psychic Pokémon, so it does not suppress the candidate's Psychic Latias ex, Lillie's Clefairy ex or Shadow Rider VMAX.
- No Spiritomb, Omastar, Flygon, Cradily, Dragalge or Vanilluxe appears in the 29 published lists.

The exact source ranks 23, 25 and 28 remain unavailable, so this scan cannot close the full Top32 field.

## Recommended policy boundary

- For the known Aichi field, model Snorlax Block and the rank-15 Vileplume BUS 6 restriction explicitly; keep Silent Lab as a separate Ability-suppression veto.
- For broader Expanded safety, fail closed on conditional retreat locks unless the relevant Special Condition is modeled, and check the promoted attacker's remaining HP against attack restrictions such as Vanilluxe Frigid Room.
- Apply each restriction to the correct actor: Mimikyu's Copycat legality is distinct from Shadow Rider VMAX's Max Geist legality.
- Do not treat all text containing “can't attack” as opponent-facing; many entries restrict only their controller's own Pokémon.

## Limitations

- Static card-text enumeration only; it does not establish that a card was drawn, Active, or activated in any particular game.
- No Twinleaf fixture, CI run, completed game, matchup result, deck change or win-rate claim was made.
- The Aichi source roster is incomplete and some source lists are incompatible with paper Expanded; this is not proof of all 32 opponent configurations.

## Related evidence

- `results/aichi-2026/2026-11/agent42-source-field-stadium-weakness-census-20261114.md` — source-list Stadium and field-relevant Ability audit.
- `communications/agent8/20261114T084500Z_agent42-vileplume-copycat-attack-lock.md` — direct handoff for rank-15 Vileplume BUS 6.
- `communications/agent8/20261114T091500Z_agent42-conditional-attack-retreat-locks.md` — conditional Expanded lock handoff.
