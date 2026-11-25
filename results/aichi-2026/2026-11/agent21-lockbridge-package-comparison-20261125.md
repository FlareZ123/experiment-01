# Agent21: Lockbridge vs Hood Shield — package-level evidence synthesis

**Date:** 25 November 2026  
**Decision:** whether the exact Lockbridge Shadow Rider v1 60 should be promoted over the Hood Shield Shadow Rider v1 60.  
**Status:** Lockbridge remains an unranked structural challenger. This synthesis integrates existing source, card-text, Prize, access, and policy findings; it does not report a new matchup result.

## Exact comparison

The exact Lockbridge 60 is a four-slot change from Hood Shield:

| Card role | Hood Shield v1 | Lockbridge v1 | Change |
|---|---:|---:|---:|
| Lillie's Clefairy ex | 2 | 1 | −1 |
| Pokémon Ranger | 1 | 0 | −1 |
| Wobbuffet PHF 36 | 0 | 1 | +1 |
| Temple of Sinnoh ASR 155 | 0 | 1 | +1 |

The Lockbridge export is a fixed 60 with 35 distinct rows recorded as Expanded-legal and construction checks passed. Physical-copy verification is absent. No native game has been qualified on this exact 60. See the [Lockbridge development list](agent31-lockbridge-shadow-rider-v1.json), [English Expanded export](../../decks/lockbridge-shadow-rider-v1-expanded-legal-60.md), and [Hood Shield English 60](../../decks/hood-shield-shadow-rider-v1-expanded-legal-60.md).

## What Lockbridge gains

### 1. Broad, Active-only Ability suppression

Wobbuffet's Bide Barricade suppresses Abilities of **all non-Psychic Pokémon** in play, both players' hands, and both discard piles while Wobbuffet is Active. It is not Basic-only. The published field-role census identifies potential non-Psychic Ability targets in 29/29 lists; Dedenne-GX appears in all nine authenticated Regidrago lists. Wobbuffet also suppresses Iron Thorns ex in the three published Iron Thorns lists, while Iron Thorns' Rule Box Ability lock does not suppress non-Rule-Box Wobbuffet.

This is genuine broad coverage, but not 29 automatic wins or 29 equally valuable targets.

**The nine known Regidrago lists are a particularly coherent Wobbuffet + Temple target.** Wobbuffet suppresses Regidrago VSTAR's Dragon-type **Legacy Star** Ability (discard the top seven cards and recover up to two) and the Lightning-type **Dedenne-GX Dedechange** Ability (discard the hand and draw six); Dedenne-GX is present in all nine lists. Temple turns Double Dragon Energy into one Colorless Energy, so DDE plus Fire no longer pays Regidrago VSTAR's Grass/Grass/Fire Apex Dragon cost. However, Apex Dragon is an attack and is not suppressed by Wobbuffet, and every one of the nine lists retains at least two Basic Grass and two Basic Fire Energy, so the attack remains payable through a slower Basic-Energy line. Psychic Tapu Lele-GX's Wonder Tag, where present, is also exempt from Wobbuffet. The combined package is therefore a setup/energy tax rather than a hard lock. Timing matters: Gate-first gives the opponent a turn to use Legacy Star and Dedechange before Wobbuffet becomes Active; lock-first can deny those Abilities but delays Radiant Eternatus's Gate. See [Agent39's exact DDE/Basic-Energy source matrix](../agent39-temple-double-dragon-field-counter-resource-20261107.md).

**The three Iron Thorns lists are another especially favorable Wobbuffet interaction.** Iron Thorns ex's Lightning-type Initialization suppresses Rule Box Abilities, but Wobbuffet is not a Rule Box Pokémon, so Bide Barricade remains active. Bide Barricade then suppresses the non-Psychic Iron Thorns ex Ability, restoring the candidate's Shadow Rider VMAX Underworld Door and Latias ex Skyliner. All three published Iron Thorns lists contain Tool Jammer: it can disable Tools on Lockbridge's Active Pokémon (including Float Stone/Hood), but it does not disable Bide Barricade and does not reach a Benched Latias. Thus Latias provides a non-Tool pivot if its Ability is live. This is a card-text interaction, not a matchup result.

Two counter-lock classes matter:
- **Tool-live Garbotoxin:** four Absol Garbodor lists contain Psychic Garbodor. Bide Barricade does not suppress the Psychic Garbodor, while Garbotoxin already suppresses every other Pokémon Ability. Its target set therefore subsumes Bide Barricade's while Tool-live; Hood on Wobbuffet adds no extra suppression in that state. The useful Hood allocation is generally Shadow Rider VMAX + Latias ex when the pivot is needed.
- **Active Klefki:** ranks 4 and 17 contain Klefki. Klefki is Psychic, so Wobbuffet's Psychic exception does not suppress it; Klefki's Basic-Pokémon lock includes Wobbuffet. This is a different counter-lock and can justify Hood on Wobbuffet plus Latias.

Wobbuffet's lock is Active-only. Retreating or switching it out releases Bide Barricade. The [scope/policy audit](agent21-lockbridge-scope-and-policy-admission-20261125.md), [Hood allocation analysis](agent11-lockbridge-hooded-wobbuffet-garbotoxin-line-20261125.md), and [Garbotoxin subsumption proof](agent21-garbotoxin-wobbuffet-subsumption-20261125.md) contain the detailed card-text reasoning.

### 2. A quantified, but not persistent, displacement risk

The field contains 48 Guzma copies in 25 lists, 11 Escape Rope in 7, 10 Counter Catcher in 7, and 3 Prime Catcher in 3. List presence alone exaggerates immediate access. The exact [Trainer displacement-access model](agent21-lockbridge-field-role-exposure-census-20261125.md#first-response-displacement-access), reproducible with [the DP script](../../../scripts/agent21-lockbridge-displacement-access.cjs), gives the equal-rank 29-list average:

| Cards observed | Any modeled displacement, Counter Catcher excluded | Counter Catcher condition assumed live |
|---:|---:|---:|
| 7 | 24.72% | 28.02% |
| 8 | 28.11% | 31.74% |
| 9 | 31.42% | 35.36% |
| 10 | 34.67% | 38.88% |

The model includes Guzma, Prime Catcher, Escape Rope, optional Counter Catcher, and VS Seeker + Battle Compressor when a Guzma remains in the deck. It assumes legal Bench targets and does not model actual play, Supporter contention, prior discard-based VS Seeker lines, attacks/Abilities, or Wobbuffet re-establishment. These are access priors, not lock-uptime or matchup estimates. The nine known Regidrago lists have 35.85–40.66% modeled access by nine cards observed, depending on Counter Catcher.

This corrects the inference from the raw 25/29 Guzma count: it does not mean 25/29 opponents can immediately displace Wobbuffet. It also does not prove the lock persists. Tool Jammer appears in five lists (ranks 3, 6, 7, 24, 29), including all three Iron Thorns lists; it can disable the sole Float Stone on Active Wobbuffet, but does not itself turn off Bide Barricade. Latias ex can provide a non-Tool retreat route for Basic Pokémon when its Ability is not counter-locked.

### 3. Special-Energy disruption from Temple of Sinnoh

Temple's effect is relevant to attached Special Energy in 24/29 lists, covering 118 copies. Ten published lists contain Double Dragon Energy (38 copies): nine Regidrago lists and rank 19 Raging Bolt/ADP. The Temple can turn DDE into one Colorless Energy and force alternate payment lines. It does not categorically disable Apex Dragon: each of the nine known Regidrago lists also has at least two Basic Grass and two Basic Fire Energy, so Grass/Grass/Fire can still pay the attack.

Temple is a **one-shot disruption**, not a persistent lock:
- Each of the ten DDE lists has two to four direct Stadium replacement/removal cards; six contain Megaton Blower.
- The Lockbridge list contains only one Temple. Its hard Prize-only risk is 10%, and no listed card retrieves a Prized Stadium.
- The candidate also contains one Sky Field and one Dimension Valley. Playing Temple over its own Sky Field loses the eight-Bench expansion; playing it over its own Dimension Valley loses the Psychic attack discount. Replaying either candidate Stadium ends Temple's Special-Energy suppression.
- Temple and Wobbuffet have different windows: Temple can remain after Wobbuffet retreats, until replaced.

See [Agent39's source-field Temple/DDE resource audit](../agent39-temple-double-dragon-field-counter-resource-20261107.md) and the [Lockbridge scope/policy audit](agent21-lockbridge-scope-and-policy-admission-20261125.md).

## What Lockbridge gives up

### 1. A second Clefairy ex

The 29-list census identifies Dragon-type Clefairy targets in 12/29 lists, including all nine authenticated Regidrago lists. Lockbridge retains one Lillie's Clefairy ex, so Fairy Zone is not removed; the second physical copy is removed as redundancy.

The Prize-only event in which the sole Clefairy and the one Hisuian Heavy Ball are both Prized rises from **0.05845%** in Hood (two Clefairy copies plus Heavy Ball) to **0.84746%** in Lockbridge (one Clefairy plus Heavy Ball), a 14.5× relative increase. This is not a matchup-loss estimate: the remaining Clefairy is still searchable, and the calculation omits draw/search, Night Stretcher, Knock Outs, and opportunity cost. Agent21's equal-role Prize sensitivity gives Lockbridge +0.8886 expected accessible role units under equal role values and a Wobbuffet break-even value of 0.05493; that is a Prize-only model, not a ranking of the full 60.

See [Agent31's Prize/tutor audit](agent31-lockbridge-prize-access-20261125.md) and [Agent21's value-weighted Prize sensitivity](agent21-lockbridge-value-weighted-prize-sensitivity-20261125.md).

### 2. The only Pokémon Ranger

The 29-list field has Budew in **14/29 lists (19 copies)**: all nine known Regidrago lists, three of four Absol Garbodor lists, and both Vileplume lists. Budew's zero-cost Itchy Pollen is an attack effect that prevents Items from hand during the opponent's next turn and can be repeated while Budew remains able to attack.

Pokémon Ranger is a Supporter that removes attack effects. It remains playable during Item lock, but Lockbridge has zero Ranger-specific access because the card is absent. Hood's one Ranger has a modeled **30.26936%** access opportunity by two ordinary draws through direct draw, Wonder Tag, or Forest Seal Stone → Star Alchemy, conditional on a valid opening Basic. This is an access opportunity, not guaranteed removal or a game win.

Wobbuffet suppresses Abilities, and Temple modifies Special Energy; neither clears Itchy Pollen. The detailed [Agent2 Budew/Ranger audit](agent2-lockbridge-budew-ranger-field-cost-20261125.md) specifies a conditional non-Item sequence: use Underworld Door on a Benched Shadow Rider VMAX (Psychic, so not suppressed by Wobbuffet) to attach Psychic Energy and draw; use Dimension Valley to reduce Max Geist's cost or assemble three Energy while preserving Temple; then retreat Wobbuffet with Float Stone (or a live Latias ex Skyliner) and attack Budew. Max Geist can deal 70 damage with two Psychic Energy attached across the field, enough to Knock Out 30-HP Budew. Knocking out Budew does not clear the current-turn Item lock, but prevents that copy from repeating Itchy Pollen next turn. The supplied [advanced rulebook, Trainer section B-02](../../../resources/advanced-players-rulebook.md) explicitly treats Pokémon Tools as a separate Trainer type; even older Tools with “Item” printed on them are not treated as Items. Therefore Float Stone, Stealthy Hood, and Forest Seal Stone can be played during Itchy Pollen, while actual Item cards cannot. This is a rules-derived minimal scenario, not evidence that the required board/energy is assembled consistently or that the line succeeds in a full game. The loss of Ranger remains a real fixed-slot cost, not proof that Lockbridge is weaker.

See [Agent2's Budew/Ranger field-cost audit](agent2-lockbridge-budew-ranger-field-cost-20261125.md) and [Agent11's Hood allocation analysis](agent11-lockbridge-hooded-wobbuffet-garbotoxin-line-20261125.md).

## Timing and policy are decisive

- **Gate-first:** Radiant Eternatus must use Climactic Gate before Wobbuffet becomes Active, because Bide Barricade suppresses non-Psychic Radiant Eternatus. Gate-first necessarily gives the opponent one full turn before Bide Barricade is Active. Temple can be played before Gate to disrupt Special Energy during that interval, but the opponent may replace it.
- **Lock-first:** promoting Wobbuffet before the opponent's turn can deny the Ability window, but gives up or delays the immediate Gate line.
- **Temple play:** the policy must decide whether DDE disruption is worth replacing the candidate's own Sky Field or Dimension Valley.
- **Budew response:** the policy must recognize that Ranger is absent and that Items are unavailable during Itchy Pollen, while Tools, Stadiums, Supporters, Abilities, and attacks remain available.
- **Counter-lock allocation:** the policy must distinguish Tool-live Garbotoxin from Active Klefki and allocate Hoods accordingly.

The current candidate policy cannot rank Lockbridge: it has no Wobbuffet root-play score, no Temple root-play score, and no complete Bide Barricade hand/discard scope. It also cannot realize Hood Shield's Ranger answer: the current PR #69 head is the reverted contract-only branch, with no Item-lock guard, no Ranger root-play, and no VS Seeker root-play. The current policy therefore under-realizes both arms and cannot fairly measure either the Ranger loss or the Wobbuffet/Temple gain. A valid same-policy comparison must first admit a competent policy that respects the actor-visible Item-lock state and can legally play the relevant Ranger/recovery and Wobbuffet/Temple lines. Staged Temple/Store tests and synthetic summary tests are not full games on this exact 60. Stage-A game dispatch remains frozen; no new policy surface, fixture, workflow, or game is authorized by this synthesis. See [Agent2's detailed Budew/Ranger and PR #69 policy audit](agent2-lockbridge-budew-ranger-field-cost-20261125.md) for the exact current-head contract.

## Fixed-60 disposition

**Keep Lockbridge as an unranked challenger; do not promote or reject it from the current evidence.** The four-slot package trades broad but timing-sensitive Ability/Special-Energy disruption for reduced Clefairy redundancy and loss of the only direct attack-effect reset. The access and Prize models clarify individual risks but do not value the full package or establish matchup outcomes.

The ranking decision requires an authorized, same-policy comparison of the exact Hood Shield and Lockbridge 60s under identical pinned engine revision, seeds, seat allocation, and conditions. The comparison must report every available Aichi rank separately and record:
1. Wobbuffet establishment turn, Active duration, displacement events, and re-establishment;
2. Temple timing, DDE/other Special-Energy effects, and Stadium replacement;
3. Budew/Itchy Pollen outcomes with and without Ranger;
4. Clefairy damage breakpoints and Prize/recovery outcomes;
5. policy errors and missed legal actions;
6. per-rank game outcomes, sample counts, and uncertainty.

The field is still only 29/32 authenticated lists; ranks 23, 25, and 28 remain unknown. No aggregate result from this partial field can establish the 99.5% target. Until the policy/game gate and complete opponent field are addressed, the fixed 60 should remain unchanged and Lockbridge should remain a challenger, not the nominated best deck.
