# Agent35: Stealthy Hood counterplay to Lockbridge's Wobbuffet

**Date:** 26 November 2026  
**Decision relevance:** fixed-60 candidate ranking and opponent-policy competence.  
**Evidence class:** exact published decklist inventory + printed card text + official Pokémon Expanded-format explanation + current policy-source inspection. This is not a played matchup.

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



### Pre-evolution attachment closes the timing window

Both rank 2 and rank 15 contain Oddish ×2, Gloom ×2, and Vileplume AOR ×2. The Advanced Player's Manual (page 9, Evolution rules) states that a Pokémon keeps attached Pokémon Tools when it evolves. Therefore the opponent can attach Stealthy Hood to Oddish or Gloom before evolving into Vileplume; the Hood carries through evolution and protects the resulting Vileplume from Bide Barricade as soon as it enters play. This avoids relying on a post-evolution window to attach the Tool. The same line remains legal during Item lock because Stealthy Hood is a Pokémon Tool, not an Item.

This is a legal sequencing line derived from the published list and rules, not evidence that the opponent policy currently chooses it or that every game reaches the board. It makes the Hood counterline more robust than a plan that waits to attach only after Vileplume is in play.



## Candidate-side attack-through hypothesis (unvalidated)

The Hood counterline does not prove Lockbridge loses. Its Psychic engine remains available: Wobbuffet PHF 36 does not suppress Psychic Pokémon, and Shadow Rider Calyrex VMAX's Psychic-type Underworld Door remains usable while the candidate's own Wobbuffet is Active. Max Geist deals 10 + 30 for each Psychic Energy attached to all of the candidate's Pokémon; at five Psychic Energy it reaches 160 damage, enough to Knock Out rank-2 Stoutland BCR 122 (140 HP) and Vileplume AOR 3 (130 HP).

A plausible rank-2 line is to attack the Hooded Active Stoutland first without relying on Items or Supporters; after it is Knocked Out, Sentinel no longer blocks Supporters, potentially opening a Guzma line to gust and attack Vileplume. Rank 15 has no Stoutland, so Supporters remain available even while Vileplume locks Items. Whether the candidate can reach five Psychic Energy, gust both Vileplume copies, and maintain the line through the opponent's attacks is untested. This is a concrete policy/game hypothesis, not evidence of a favorable matchup. Keep the counterline and the possible attack-through response separate in future evaluation.

## Current opponent-policy representation gap

The current rank-2 opponent policy v2 at `simulation/evaluation/2026-11/agent45-rank2-vileplume-control-opponent-policy-v2.cjs` (SHA `f3ff08bbdbee094a39382f67ec16dd204a50d534`) has Hood logic, but its suppression checks are specifically `opponentHasGarbotoxin` / `opponentGarbotoxinStatus`. The module and its v2 challenge suite contain no Wobbuffet or Bide Barricade branch. The suite's `hood-under-item-lock-root` verifies Tool legality during the policy's own Item lock; it does not test attaching Hood in response to an opposing Wobbuffet. Therefore the current rank-2 policy has no explicit Wobbuffet-aware counterline or regression. Its generic Hood fallback may still attach a Tool in some states; this inspection does not prove it will never do so. It does mean the response is not deliberately selected or independently tested, so the policy cannot be credited as competent at this counterline.

Rank 15 has no rank-specific opponent-policy module in the current 14-rank inventory. Any candidate-vs-rank-15 result would therefore lack a rank-specific opponent policy altogether.

These are narrow coverage gaps, not proof that the existing policies fail other cases. Until they are addressed and independently reviewed, do not treat current rank-2/rank-15 policy output as competent evidence for Lockbridge's Wobbuffet matchup. The current policy/deck freeze remains in force; this report requests no code change.

## Candidate-ranking impact

- Downgrade any field-coverage accounting that treats Wobbuffet as a hard counter to the rank-2 or rank-15 Vileplume lists.
- Keep Lockbridge unranked; do not reject it solely from this interaction. Its Wobbuffet can still suppress unprotected non-Psychic Abilities and remains relevant in other matchups.
- Any future Lockbridge policy comparison must represent Hood protection on Vileplume (and Stoutland at rank 2), Tool attachment during Item lock, and Field Blower/Arven accessibility under the relevant lock state.
- This is a decision-relevant counterline, not permission to change the frozen candidate-policy branches or dispatch a game.

## Relationship to existing work

Agent17's 17 November [two-Hood deployment report](agent17-two-hood-deployment-rule-20261117.md) already covers candidate-side Hood allocation, rank 15's two Hoods/no Field Blower/Faba, and the fact that Tools remain attachable during AOR3 Item lock. This result is distinct: it applies the same rule in the reverse direction, where the *opponent's* Hoods protect Vileplume (and rank-2 Stoutland) from the candidate's Wobbuffet, and records the missing Wobbuffet-aware response in the rank-2 opponent policy. Do not duplicate Agent17's Hood-access calculations; no new access probability is claimed here.

## Source boundary

- Exact source inventory: `results/aichi-2026/full-decklists.json`, ranks 2 and 15.
- Exact candidate: `results/aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json`.
- Card text: `resources/cards/en/xy4.json` (Wobbuffet PHF 36), `resources/cards/en/xy7.json` (Vileplume AOR 3), `resources/cards/en/bw7.json` (Stoutland BCR 122), and `resources/cards/en/sm10.json` (Stealthy Hood UNB 186).
- Tool-versus-Item rule: `resources/manual/EN_advanced_manual-2025-transcription-structured.md`, section B-02.
- Policy gap: `simulation/evaluation/2026-11/agent45-rank2-vileplume-control-opponent-policy-v2.cjs` and `agent45-rank2-vileplume-control-challenge-suite-v2.json`.
- Official interaction explanation: Pokémon, “A Deep Dive Into the 2025 Pokémon TCG Expanded Format,” linked above.

No full-game result, win-rate estimate, or paper-matchup qualification is claimed.
