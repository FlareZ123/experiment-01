# Agent46: Budew lock-source stratification within the authenticated Aichi field

**Date:** 2026-11-25  
**Evidence class:** exact 29-list source census plus printed card-text analysis. No game was run; no matchup rate is estimated.

## Finding

The 14 authenticated Aichi lists containing Budew are not one homogeneous Item-lock problem. They split into three materially different lock environments:

| Subgroup | Ranks | Lists | Budew copies | Co-occurring Ability lock |
|---|---|---:|---:|---|
| Regidrago | 10, 12, 13, 14, 18, 20, 21, 27, 32 | 9 | 12 | No Garbodor or Vileplume in these lists |
| Vileplume | 2, 15 | 2 | 3 | Vileplume; no Garbodor |
| Absol Garbodor | 8, 16, 22 | 3 | 4 | Garbodor with Garbotoxin in all three lists |

This matters for Lockbridge Shadow Rider v1's proposed non-Ranger response:

- Against the nine Regidrago lists, Wobbuffet can suppress non-Psychic Abilities while Active, while Shadow Rider Calyrex VMAX remains Psychic and can still use Underworld Door. The attack-based Budew restriction itself remains; Wobbuffet does not clear it.
- Against the two Vileplume lists, there is no Garbodor in the authenticated lists. Wobbuffet can suppress Vileplume's non-Psychic Ability while Active; Shadow Rider's Psychic Underworld Door remains available.
- Against the three Absol Garbodor lists, Garbodor's Garbotoxin can suppress **both** Wobbuffet's Bide Barricade and Shadow Rider's Underworld Door when Garbodor has a Pokémon Tool attached. Wobbuffet cannot suppress Garbotoxin in return: Wobbuffet's Bide Barricade exempts Psychic Pokémon, and both Garbodor printings in these lists are Psychic. The same Garbotoxin effect also suppresses Forest Seal Stone's Star Alchemy. The non-Item line therefore loses its Ability suppression and Energy acceleration in the exact subgroup where Budew and Garbodor co-occur.

The Lockbridge non-Item line must be evaluated separately across these three subgroups. Pooling all 14 Budew lists into one generic test would hide a materially different resource state in the three Garbodor lists.

## Reproducible list census

Input: `results/aichi-2026/full-decklists.json`, blob `ae773f6201d7aa69d31914dbfee66f3fba692200` (29 published exact lists; ranks 23, 25, and 28 remain missing).

Exact Budew-bearing lists:

| Rank | Archetype | Budew | Garbodor | Vileplume |
|---:|---|---:|---|---|
| 2 | Vileplume Control | 1 | — | 2 AOR 3; 1 CEC 4 |
| 8 | Absol Garbodor | 1 | 2 LTR 68 | — |
| 10 | Regidrago | 2 | — | — |
| 12 | Regidrago | 1 | — | — |
| 13 | Regidrago | 1 | — | — |
| 14 | Regidrago | 1 | — | — |
| 15 | Lopunny Vileplume | 2 | — | 2 AOR 3; 1 BUS 6 |
| 16 | Absol Garbodor | 2 | 2 LTR 68; 1 BKP 57 | — |
| 18 | Regidrago | 1 | — | — |
| 20 | Regidrago | 2 | — | — |
| 21 | Regidrago | 1 | — | — |
| 22 | Absol Garbodor | 1 | 2 BKP 57 | — |
| 27 | Regidrago | 1 | — | — |
| 32 | Regidrago | 2 | — | — |
| **Total** | **14/29 lists** | **19** | **3 lists** | **2 lists** |

The three Absol Garbodor lists all contain Garbodor printings with Garbotoxin:
- LTR 68 (`resources/cards/en/bw11.json`, card `bw11-68`, blob `e4e09d569e76c71943e2399221c9f904b4420096`): ranks 8 and 16.
- BKP 57 (`resources/cards/en/xy9.json`, card `xy9-57`, blob `dcfa9ec1b6b0ff6a0b446114c9d567c598cf71ce`): ranks 16 and 22.

Wobbuffet PHF 36 (`resources/cards/en/xy4.json`, card `xy4-36`, blob `85ab15304b4741c1f5601ee786fc8f3a764326f9`) is Psychic. Bide Barricade applies only while Wobbuffet is Active and removes Abilities from non-Psychic Pokémon, explicitly preserving Psychic Pokémon. Both Garbodor printings above are Psychic, so Wobbuffet never suppresses Garbotoxin. Conversely, when Garbotoxin is active, its text suppresses Wobbuffet and Shadow Rider VMAX as well as Forest Seal Stone's Ability, except Garbotoxin itself.

Both card-pool entries have the same Ability text: if that Garbodor has a Pokémon Tool attached, each Pokémon in play, in each player's hand, and in each player's discard pile has no Abilities except Garbotoxin. Garbotoxin is conditional on the Tool attachment; list presence alone does not prove that it is active in a particular game.

The 9 Regidrago lists and 2 Vileplume lists contain no Garbodor. The two Vileplume lists contain Vileplume, which is non-Psychic and can be suppressed by an Active Wobbuffet if no broader Ability lock is active.

## Implications for the Lockbridge non-Item line

Lockbridge v1 (`results/aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json`, blob `907014e330aae8889fe5869a32dfcdf0d876291a`) contains one Wobbuffet, one Float Stone, one Forest Seal Stone, one Dimension Valley, three Shadow Rider Calyrex VMAX, one Arven, and 11 Psychic Energy.

During Budew's Itchy Pollen turn, the restriction applies to Item cards from hand. Supporters, Pokémon Tools, Stadiums, manual Energy attachments, attacks, and any unsuppressed Abilities remain available. Thus Arven, Float Stone, and Dimension Valley can still be used during the restriction; the Item found by Arven cannot be played until the restriction ends.

The ability state changes the line:

1. **Budew + Regidrago:** with Wobbuffet Active, non-Psychic opponent Abilities are suppressed, but Shadow Rider's Psychic Underworld Door remains available. Underworld Door can attach a Psychic Energy from hand to a Benched Psychic Pokémon and draw two.
2. **Budew + Vileplume:** the same Wobbuffet/Underworld Door interaction can suppress Vileplume while preserving Shadow Rider's Ability, because these two published lists contain no Garbodor.
3. **Budew + Garbodor:** if Garbotoxin is active, it suppresses Wobbuffet, Underworld Door, and Forest Seal Stone's Star Alchemy. The candidate must rely on pre-attached Energy, manual attachments, Supporters, Tools, Stadiums, and attacks until the Ability lock is removed or Garbotoxin is no longer active.

Max Geist's damage must be counted across **all** of the candidate's Pokémon. Shadow Rider Calyrex VMAX (`resources/cards/en/swsh6.json`, card `swsh6-75`, blob `0371b6d2d209187306ff6e1a1ef9a09a2a1d8121`) says 10+30 for each Psychic Energy attached to all your Pokémon. Dimension Valley reduces the attack's Colorless cost by one:

- Exactly two Psychic Energy total plus Dimension Valley: two Energy pay the reduced cost and Max Geist does 70 damage.
- If Underworld Door first attaches a third Psychic Energy to any Benched Psychic Pokémon, that Energy also counts for Max Geist; the attack still costs two with Dimension Valley but does **100** damage, not 70.
- Three Psychic Energy total can pay the unreduced three-Colorless cost without Dimension Valley and also do 100 damage. This can preserve Temple of Sinnoh if it is already in play.

This corrects the damage arithmetic in the minimal sequence described in Agent2's Budew report: if that sequence includes an Underworld Door attachment, the expected Max Geist damage is 100. It still Knocks Out 30-HP Budew either way.

The Garbodor subgroup is the critical test of whether Lockbridge can function without Underworld Door: with Garbotoxin active, the two-Energy/Dimension Valley attack can still Knock Out Budew if the Energy is already attached, but the deck cannot assume it can accelerate or use Star Alchemy that turn. The current-turn Item lock remains after Budew is Knocked Out until the turn ends; a second Budew can reapply it on a later turn.

## Evaluation consequences

When a future authorized controlled comparison is possible, keep separate cases for:
- Budew-only Regidrago, with Underworld Door live under Wobbuffet;
- Budew + Vileplume, with Wobbuffet suppressing Vileplume;
- Budew + Garbodor, with Garbotoxin active and Underworld Door/Wobbuffet/Star Alchemy suppressed.

For the Garbodor cases, vary whether Garbodor has a Tool attached, whether the candidate already has two Psychic Energy on a VMAX, whether Dimension Valley is accessible, and whether the opponent can repeat Itchy Pollen with a second Budew. Record the time to the first Budew Knock Out, Energy attachments, Supporter use, Ability suppression, and whether Items become available on the following turn.

This is a source-list and rules-derived stratification, not a game result. It does not rank Hood Shield or Lockbridge, change either fixed 60, authorize a fixture/game, or establish any matchup win rate. The 29/32 source limitation remains; missing ranks 23, 25, and 28 are not imputed.
