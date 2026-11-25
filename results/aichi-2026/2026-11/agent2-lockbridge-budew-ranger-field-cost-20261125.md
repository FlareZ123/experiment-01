# Agent2: Lockbridge's lost Pokémon Ranger response against the Budew field

**Date:** 25 November 2026  
**Decision relevance:** fixed-60 candidate comparison, especially Lockbridge vs Hood Shield.  
**Evidence class:** exact source-list census and card-text analysis. No game was run and no matchup rate is estimated.

## Finding

Lockbridge Shadow Rider v1 replaces the Hood Shield candidate's singleton **Pokémon Ranger** with Wobbuffet PHF 36, and replaces one Lillie's Clefairy ex with Temple of Sinnoh. That package adds a broad Ability lock and Special Energy disruption, but it does **not** replace Ranger's answer to Budew's attack-based Item lock.

The exact 29-list Aichi source manifest contains **Budew in 14/29 lists (48.28%), with 19 copies**. Every one of the nine published Regidrago lists contains Budew; so do 3/4 Absol Garbodor lists and both Vileplume lists. Ranks 23, 25 and 28 remain unavailable and are not imputed.

Budew ASC 16's Itchy Pollen has **zero Energy cost** and says: “During your opponent's next turn, they can't play any Item cards from their hand.” The attack effect can be repeated on successive turns if Budew remains Active. Wobbuffet's Bide Barricade suppresses Abilities, not attack effects; Temple of Sinnoh changes Special Energy effects, not attack effects. Neither clears Itchy Pollen.

By contrast, Pokémon Ranger is a **Supporter** whose text removes all effects of attacks on each player and their Pokémon. It remains playable during Budew's Item lock and directly removes the restriction, although using it consumes the Supporter for the turn. Hood Shield v1 retains one Ranger; Lockbridge has zero.

This is a material, previously unrecorded Lockbridge cost. It does not establish that Lockbridge is weaker: its Wobbuffet/Temple package may be worth the trade in some matchups. It does mean that ability-lock coverage cannot be treated as general lock coverage, and the new 60 needs an explicit Budew response test before candidate ranking.

## Reproducible source census

Input: `results/aichi-2026/full-decklists.json`, blob `ae773f6201d7aa69d31914dbfee66f3fba692200` (29 published exact name/count lists; 32 total placements, with 23/25/28 missing).

| Rank | Archetype | Budew copies |
|---:|---|---:|
| 2 | Vileplume Control | 1 |
| 8 | Absol Garbodor | 1 |
| 10 | Regidrago | 2 |
| 12 | Regidrago | 1 |
| 13 | Regidrago | 1 |
| 14 | Regidrago | 1 |
| 15 | Lopunny Vileplume | 2 |
| 16 | Absol Garbodor | 2 |
| 18 | Regidrago | 1 |
| 20 | Regidrago | 2 |
| 21 | Regidrago | 1 |
| 22 | Absol Garbodor | 1 |
| 27 | Regidrago | 1 |
| 32 | Regidrago | 2 |
| **Total** | **14 of 29 lists** | **19** |

Archetype breakdown among authenticated lists:

- Regidrago: **9/9** published lists contain Budew (the two missing Regidrago ranks, 23 and 28, remain unknown).
- Absol Garbodor: **3/4** lists contain Budew.
- Vileplume: **2/2** lists contain Budew.
- Other published archetypes: no Budew in the remaining 15 lists.

The source manifest is a 29-list subset, not the complete Top32. The exact Top32 minimum is therefore 14 known Budew placements; do not fill or infer any of the three missing lists.

## Card-text basis

The repository card pool resolves set code ASC to Ascended Heroes (`me2pt5`, released 30 January 2026), before the 10 May 2026 Aichi event.

- Budew ASC 16: `resources/cards/en/me2pt5.json`, card `me2pt5-16`, blob `cc04bc2c7819fb642e8473ab6953f82e16366471`. Itchy Pollen has an empty Energy-cost array and the one-turn Item restriction above.
- Pokémon Ranger STS 104: `resources/cards/en/xy11.json`, card `xy11-104`, blob `22ea97ca00b595fe6b121494fd45dd65692deee6`. It is a Supporter; its first rule removes all effects of attacks on each player and their Pokémon.
- Wobbuffet PHF 36: `resources/cards/en/xy4.json`, card `xy4-36`, blob `85ab15304b4741c1f5601ee786fc8f3a764326f9`. Bide Barricade applies only while Wobbuffet is Active and removes Abilities from non-Psychic Pokémon in play, both players' hands and both discard piles. It does not remove attack effects.
- Temple of Sinnoh ASR 155: `resources/cards/en/swsh10.json`, card `swsh10-155`. Its effect changes attached Special Energy to Colorless with no other effect; it is not an attack-effect reset.

## Exact candidate-slot comparison

Inputs:

- Hood Shield v1: `results/aichi-2026/candidate-hood-shadow-rider.json`, blob `24ace2d6feb9ce5d9056bcf271827cfe31b7357b`.
- Lockbridge v1: `results/aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json`, blob `907014e330aae8889fe5869a32dfcdf0d876291a`.

| Card | Hood Shield v1 | Lockbridge v1 |
|---|---:|---:|
| Pokémon Ranger | 1 | 0 |
| Lillie's Clefairy ex | 2 | 1 |
| Wobbuffet | 0 | 1 |
| Temple of Sinnoh | 0 | 1 |
| Total cards | 60 | 60 |

The lost Ranger is not replaced by Wobbuffet: Bide Barricade can suppress Ability-based locks such as Garbotoxin/Vileplume while Active, but Itchy Pollen is an attack. Temple only modifies Special Energy. During an active Itchy Pollen restriction, Lockbridge can still use Supporters and attacks, but its Items—including Fog Crystal, Mysterious Treasure, Quick Ball, Hisuian Heavy Ball, Field Blower and Night Stretcher—remain unavailable from hand for that turn.

Hood's singleton Ranger is not a guaranteed answer either. It competes with Arven/draw Supporters, and the source may be Prized or otherwise inaccessible. Its relevant advantage is that it provides a direct, Supporter-speed way to clear the attack effect; Lockbridge has no such card in its current 60.

## Decision-relevant follow-up

When the policy/fixture gates permit a controlled candidate comparison, add an explicit Budew panel before ranking Lockbridge:

1. Use unchanged authenticated source lists, especially ranks 10/12/13/14/18/20/21/27/32, plus ranks 2/8/15/16/22.
2. Include source-first and source-second cases where Budew can use zero-cost Itchy Pollen before the candidate's first meaningful Item turn, and cases where the opponent can repeat the attack.
3. For Hood, test whether the policy recognizes Ranger as an attack-effect reset, chooses it over competing Supporters when the Item lock blocks the required setup, and then converts the unlocked turn into meaningful development.
4. For Lockbridge, test whether its policy can remove/KO/gust Budew or function without Items during the lock. Do not count Wobbuffet or Temple as clearing the attack effect.
5. Record Supporter contention, missed Item actions, time to first attacker, Budew survival/replacement, and complete game outcomes. Keep source-specific results separate; do not pool them into a 99.5% claim without the full field and competent policies.

This is a proposed evaluation gate, not authorization to dispatch a fixture or game. Stage-A remains frozen except for Agent6's separately authorized instrumentation-only work.

## Limitations

- List presence is not proof that an opponent will choose Itchy Pollen in a particular game.
- A zero-cost attack can be repeated only while the opponent can keep Budew in a position to attack; the candidate may remove or gust it, or use other non-Item actions.
- Ranger consumes the Supporter for the turn, so clearing the restriction has a real opportunity cost.
- The report is an exact 29-list census plus printed-text analysis. It is not a native game, policy-competence result, matchup result, or deck-strength estimate.

**Disposition:** preserve Lockbridge as an unranked challenger. Add Budew/Itchy Pollen response coverage as a required comparison question; do not promote or reject the 60 from this count alone.
