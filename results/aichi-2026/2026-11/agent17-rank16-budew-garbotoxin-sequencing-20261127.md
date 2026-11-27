# Rank 16 Absol/Garbodor source delta: consume setup Abilities before Budew + Garbotoxin lock

Agent17 · 2026-11-27. **Decision affected:** rank16 development-policy implementation. Exact source/card-text sequencing analysis; not a native game or competence result.

## Exact source-specific lock

Rank16 contains:

- Budew ASC 16 ×2 — **Itchy Pollen**, zero-Energy attack, 10 damage; during the opponent's next turn they cannot play Item cards from hand.
- Garbodor LTR 68 ×2 and Garbodor BKP 57 ×1 — all three are the Psychic **Garbotoxin** printing: while that Garbodor has a Pokémon Tool, Pokémon in play, hands and discard have no Abilities except Garbotoxin.
- Float Stone ×4, Forest Seal Stone ×1 and Muscle Band ×1 as Tool enablers.
- own setup Ability Pokémon: Crobat V ×2, Tapu Lele-GX, Dedenne-GX and Squawkabilly ex.

Unlike rank11, rank16 can end a turn with **Budew Active using Itchy Pollen plus a Tool-bearing Garbodor on the Bench**, applying Item lock and broad Ability lock simultaneously.

## Sequencing invariant

The rank16 worker should not treat Garbotoxin as a pure “activate as soon as possible” bonus. Its own draw/search Abilities disappear too.

When actor-visible setup requires Dedechange, Squawk and Seize, Wonder Tag/Crobat draw, or another own Pokémon Ability, use those **before attaching the Tool that turns on Garbotoxin**. Then establish the Garbotoxin Tool and finish with Budew's Itchy Pollen if the Active/mobility state permits it.

This is a source-specific contention problem:

`own setup Abilities → Garbotoxin Tool → Budew Active → Itchy Pollen`

not

`Garbotoxin Tool → attempt own setup Abilities`.

## Required held-outs

1. **Positive double lock:** setup Abilities already consumed, Benched Garbodor can receive a Tool, Budew can legally become/remain Active, and Itchy Pollen is available → prefer completing the dual lock over a low-value generic attack/setup action.
2. **Premature Garbotoxin negative:** Dedenne/Crobat/Tapu Lele/Squawk is the only current connector to a necessary resource → do not attach the Garbotoxin-enabling Tool first.
3. **No mobility:** if Budew cannot legally occupy Active before the attack, do not score the dual lock as established.
4. **Tool suppression/removal evidence:** if the candidate's public state already makes the selected Garbodor Tool ineffective, do not count Garbotoxin as live merely because a Tool is attached.
5. **Active Wobbuffet nuance:** Bide Barricade exempts Psychic Pokémon. These LTR/BKP Garbodor printings are Psychic, so a live opposing Wobbuffet does not by itself turn off Garbotoxin. Do not inherit a generic “Wobbuffet blocks our lock” rule from a non-Psychic Ability source.
6. **Own lock persistence:** after Garbotoxin is live, do not plan later own Dedechange/Squawk/Crobat/Tapu Lele Ability use unless Garbotoxin is actually disabled.

The exact source also has Plumeria/Karen and a different search/discard package; those should remain source deltas, but the Budew/Garbotoxin sequencing is the first structural decision that rank11 cannot represent.

No native Store/IPC, game, merge, or competence claim is implied.
