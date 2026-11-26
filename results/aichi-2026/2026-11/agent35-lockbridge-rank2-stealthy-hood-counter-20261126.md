# Agent35: Rank-2 Stealthy Hood counter to Lockbridge's Wobbuffet

**Date:** 26 November 2026  
**Decision relevance:** fixed-60 candidate ranking.  
**Evidence class:** exact published decklist inventory + printed card text + official Pokémon Expanded-format explanation. This is not a played matchup.

## Finding

Do not count Lockbridge's Wobbuffet as a reliable hard answer to the Aichi rank-2 Vileplume Control list. That list has enough Stealthy Hood copies to protect both of its central lock pieces, and Pokémon explicitly documents Stealthy Hood as the counter that lets Vileplume maintain its Item lock against Wobbuffet.

## Exact list evidence

The authenticated rank-2 entry in `results/aichi-2026/full-decklists.json` (Takahiro Ando) contains:

- 2 Vileplume AOR 3 (Irritating Pollen; Grass);
- 1 Stoutland BCR 122 (Sentinel; Colorless);
- 3 Stealthy Hood UNB 186;
- 1 Vileplume-GX CEC 4;
- 1 Budew ASC 16.

The exact Lockbridge 60 in `results/aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json` contains:

- 1 Wobbuffet PHF 36;
- 1 Field Blower GRI 125;
- 1 Arven SVI 166;
- 2 Stealthy Hood UNB 186.

## Interaction and sequencing consequence

1. Wobbuffet PHF 36's Bide Barricade applies while Wobbuffet is Active and removes Abilities from each non-Psychic Pokémon in play, in both players' hands, and in both discards.
2. Vileplume AOR 3 is Grass and Stoutland BCR 122 is Colorless, so Bide Barricade would normally suppress Irritating Pollen and Sentinel.
3. Stealthy Hood UNB 186 prevents all effects of an opponent's Abilities done to the attached Pokémon and removes such existing effects. Pokémon's own Expanded-format article states the exact interaction: Wobbuffet can shut off Vileplume, but Stealthy Hood can protect Vileplume from Wobbuffet and maintain the lock: https://www.pokemon.com/uk/features/a-deep-dive-into-the-2025-pokemon-tcg-expanded-format
4. The Advanced Player's Manual, section B-02, treats Pokémon Tools as a separate Trainer subtype from Items and explicitly says older Tools with “Item” printed on them are not treated as Items. Therefore Vileplume's Item lock does not prevent the opponent from attaching Stealthy Hood during the lock.
5. A Hooded Vileplume can preserve the Item lock while a Hooded Active Stoutland preserves the Supporter lock. The rank-2 list has three Hoods, enough in principle to protect both lock pieces (and leave a third copy for another Pokémon).
6. If both lock pieces are protected, Lockbridge's obvious removal route is constrained: Field Blower is an Item and Arven is a Supporter, so the candidate cannot rely on either while both locks remain active. The single Field Blower in the Lockbridge 60 is not a repeatable answer by itself.

This does **not** prove the rank-2 deck always establishes both protected locks, or that Lockbridge cannot win by attacking, timing, or other lines. It establishes that Wobbuffet alone is not a guaranteed escape from this exact source list. The timing of Hood attachment and the candidate's responses require a complete game to resolve.

## Candidate-ranking impact

- Downgrade any field-coverage accounting that treats Wobbuffet as a hard counter to rank-2 Vileplume Control.
- Keep Lockbridge unranked; do not reject it solely from this interaction. Its Wobbuffet can still suppress unprotected non-Psychic Abilities and remains relevant in other matchups.
- Any future Lockbridge policy comparison must represent Hood protection on both Vileplume and Stoutland, Tool attachment during Item lock, and the Field Blower/Arven access constraint under dual lock.
- This is a decision-relevant counterline, not permission to change the frozen candidate-policy branches or dispatch a game.

## Source boundary

- Card text: `resources/cards/en/xy4.json` (Wobbuffet PHF 36), `resources/cards/en/xy7.json` (Vileplume AOR 3), `resources/cards/en/bw7.json` (Stoutland BCR 122), and `resources/cards/en/sm10.json` (Stealthy Hood UNB 186).
- Tool-versus-Item rule: `resources/manual/EN_advanced_manual-2025-transcription-structured.md`, section B-02.
- Exact source inventory: `results/aichi-2026/full-decklists.json`, rank 2.
- Exact candidate: `results/aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json`.
- Official interaction explanation: Pokémon, “A Deep Dive Into the 2025 Pokémon TCG Expanded Format,” linked above.

No full-game result, win-rate estimate, or paper-matchup qualification is claimed.
