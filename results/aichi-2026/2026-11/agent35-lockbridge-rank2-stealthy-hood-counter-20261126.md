# Agent35: Stealthy Hood counterplay to Lockbridge's Wobbuffet

**Date:** 26 November 2026  
**Decision relevance:** fixed-60 candidate ranking.  
**Evidence class:** exact published decklist inventory + printed card text + official Pokémon Expanded-format explanation. This is not a played matchup.

## Finding

Do not count Lockbridge's Wobbuffet as a reliable hard answer to the Aichi Vileplume Control matchups. Two authenticated Top 32 lists (ranks 2 and 15) contain Vileplume AOR 3 and enough Stealthy Hood copies to protect the Item-lock Pokémon. Pokémon explicitly documents Stealthy Hood as the counter that lets Vileplume maintain its Item lock against Wobbuffet.

## Exact list evidence

The authenticated rank-2 entry in `results/aichi-2026/full-decklists.json` (Takahiro Ando, Vileplume Control) contains:

- 2 Vileplume AOR 3 (Irritating Pollen; Grass);
- 1 Stoutland BCR 122 (Sentinel; Colorless);
- 3 Stealthy Hood UNB 186;
- 1 Vileplume-GX CEC 4;
- 1 Budew ASC 16.

The authenticated rank-15 entry (Ryotaro Nozawa, Lopunny Vileplume) contains:

- 2 Vileplume AOR 3;
- 1 Vileplume BUS 6;
- 2 Stealthy Hood UNB 186;
- 2 Budew ASC 16.

The exact Lockbridge 60 in `results/aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json` contains:

- 1 Wobbuffet PHF 36;
- 1 Field Blower GRI 125;
- 1 Arven SVI 166;
- 2 Stealthy Hood UNB 186.

The broader source-list scan also finds one Stealthy Hood at rank 3 (Snorlax Stall) and one at rank 32 (Regidrago). Those are secondary Ability-protection cases; the strongest direct Vileplume counterexamples are ranks 2 and 15.

## Interaction and sequencing consequence

1. Wobbuffet PHF 36's Bide Barricade applies while Wobbuffet is Active and removes Abilities from each non-Psychic Pokémon in play, in both players' hands, and in both discards.
2. Vileplume AOR 3 is Grass, so Bide Barricade would normally suppress Irritating Pollen.
3. Stealthy Hood UNB 186 prevents all effects of an opponent's Abilities done to the attached Pokémon and removes such existing effects. Pokémon's own Expanded-format article states the exact interaction: Wobbuffet can shut off Vileplume, but Stealthy Hood can protect Vileplume from Wobbuffet and maintain the Item lock: https://www.pokemon.com/uk/features/a-deep-dive-into-the-2025-pokemon-tcg-expanded-format
4. The Advanced Player's Manual, section B-02, treats Pokémon Tools as a separate Trainer subtype from Items and explicitly says older Tools with “Item” printed on them are not treated as Items. Therefore Vileplume's Item lock does not prevent the opponent from attaching Stealthy Hood during the lock.
5. At rank 2, a Hooded Vileplume can preserve Item lock while a Hooded Active Stoutland preserves Supporter lock. Three Hoods are enough in principle to protect both lock pieces and another Pokémon. At rank 15, two Hoods can protect both AOR Vileplume copies in principle. These are available source-list lines, not claims that either player always establishes them.
6. If both rank-2 lock pieces are protected, Lockbridge's obvious removal route is constrained: Field Blower is an Item and Arven is a Supporter, so the candidate cannot rely on either while both locks remain active. The single Field Blower in the Lockbridge 60 is not a repeatable answer by itself. Rank 15's Vileplume/Tool line creates the same Item-access problem, though it does not include Stoutland's separate Supporter lock.

This does **not** prove either opponent always establishes the protected lock, or that Lockbridge cannot win by attacking, timing, or other lines. It establishes that Wobbuffet alone is not a guaranteed escape from these exact source lists. The timing of Hood attachment and the candidate's responses require a complete game.

## Candidate-ranking impact

- Downgrade any field-coverage accounting that treats Wobbuffet as a hard counter to the rank-2 or rank-15 Vileplume lists.
- Keep Lockbridge unranked; do not reject it solely from this interaction. Its Wobbuffet can still suppress unprotected non-Psychic Abilities and remains relevant in other matchups.
- Any future Lockbridge policy comparison must represent Hood protection on Vileplume (and Stoutland at rank 2), Tool attachment during Item lock, and Field Blower/Arven accessibility under the relevant lock state.
- This is a decision-relevant counterline, not permission to change the frozen candidate-policy branches or dispatch a game.

## Source boundary

- Exact source inventory: `results/aichi-2026/full-decklists.json`, ranks 2 and 15.
- Exact candidate: `results/aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json`.
- Card text: `resources/cards/en/xy4.json` (Wobbuffet PHF 36), `resources/cards/en/xy7.json` (Vileplume AOR 3), `resources/cards/en/bw7.json` (Stoutland BCR 122), and `resources/cards/en/sm10.json` (Stealthy Hood UNB 186).
- Tool-versus-Item rule: `resources/manual/EN_advanced_manual-2025-transcription-structured.md`, section B-02.
- Official interaction explanation: Pokémon, “A Deep Dive Into the 2025 Pokémon TCG Expanded Format,” linked above.

No full-game result, win-rate estimate, or paper-matchup qualification is claimed.
