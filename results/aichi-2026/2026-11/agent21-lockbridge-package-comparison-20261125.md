# Lockbridge Shadow Rider v1 — concise whole-deck comparison

**Disposition:** unranked structural challenger to Hood Shield Shadow Rider v1. This synthesis consolidates existing source-list, card-text, Prize/access, and policy findings. It reports no new game or matchup result.

## Exact fixed-60 delta

Lockbridge is a four-slot change from the unchanged Hood Shield 60:

| Card | Hood Shield v1 | Lockbridge v1 |
|---|---:|---:|
| Lillie's Clefairy ex | 2 | 1 |
| Pokémon Ranger | 1 | 0 |
| Wobbuffet PHF 36 | 0 | 1 |
| Temple of Sinnoh ASR 155 | 0 | 1 |

Both exports are fixed 60-card lists. The English-printing-normalized Lockbridge list has 35 distinct rows marked Expanded Legal and passes construction checks; physical-copy verification is absent. See the [exact Lockbridge source JSON](agent31-lockbridge-shadow-rider-v1.json), [Lockbridge paper 60](../../decks/lockbridge-shadow-rider-v1-expanded-legal-60.md), and [Hood Shield paper 60](../../decks/hood-shield-shadow-rider-v1-expanded-legal-60.md).

## Strongest supported gains

- **Wobbuffet adds broad but Active-only Ability suppression.** Bide Barricade covers non-Psychic Pokémon in play, both hands, and both discard piles; it is not limited to Basic Pokémon. Potential non-Psychic Ability targets appear in 29/29 authenticated lists, but presence is not impact. The clearest cluster is the nine Regidrago lists: Wobbuffet can suppress Regidrago VSTAR's Legacy Star and Dedenne-GX's Dedechange. Against the three Iron Thorns lists, Wobbuffet survives Initialization and can suppress Iron Thorns, reopening Shadow Rider VMAX's Underworld Door while Wobbuffet stays Active.
- **Temple attacks attached Special Energy.** Double Dragon Energy appears in 10/29 lists (38 copies): nine Regidrago lists and rank 19 Raging Bolt/ADP. Rank 19 is the strongest specific Temple hypothesis: it has four DDE and no Basic Water or Metal, so Temple blocks the Energy costs of ADP-GX's Altered Creation-GX and Ultimate Ray while it remains in play. Against Regidrago, Temple taxes the DDE line but does not make Apex Dragon impossible; the published lists retain Basic Grass/Fire alternatives.
- **The effects have different windows.** Wobbuffet's lock ends when it leaves Active; Temple continues to affect attached Special Energy until the Stadium is replaced. The modeled first-nine-card Trainer displacement access against Wobbuffet is 31.42% across the 29-list mean, or 35.36% when Counter Catcher's Prize condition is assumed live. This is an access prior, not an actual displacement or lock-uptime rate.

## Material costs and failure modes

- **Less Clefairy redundancy:** Dragon-type targets occur in 12/29 lists. Lockbridge retains one Clefairy, but the Prize-only event where the sole Clefairy and the one Hisuian Heavy Ball are both Prized is 0.84746%, versus 0.05845% with Hood's two Clefairy copies plus Heavy Ball. These are Prize probabilities, not matchup-loss estimates.
- **No Pokémon Ranger:** Budew appears in 14/29 lists. Hood's single Ranger has a modeled 30.26936% access opportunity by two ordinary draws through direct draw, Wonder Tag, or Forest Seal Stone → Star Alchemy, conditional on a valid opening Basic. Lockbridge has no Ranger target. Wobbuffet and Temple do not clear an already-resolved Itchy Pollen effect. A conditional non-Item response using Psychic Underworld Door, retreat, and an attack on Budew exists, but has not been validated in a complete game.
- **Wobbuffet is neither persistent nor universal.** It is Active-only and can be displaced. Tool-live Psychic Garbodor in four lists subsumes its suppression; Active Psychic Klefki in two lists can suppress Wobbuffet. A source-list access model does not establish whether an opponent will use a displacement card or whether Lockbridge can re-establish the lock.
- **Protected lock: attack through it rather than reserve Wobbuffet as an automatic answer.** Rank 2 has three Stealthy Hood, two AOR Vileplume and one BCR Stoutland; rank 15 has two Hood and two AOR Vileplume. Hood may be attached before evolution and remains attached; Tools are playable during Item lock. Hooded Vileplume keeps Irritating Pollen live against Bide Barricade; Hooded Active Stoutland also keeps Sentinel live, so Field Blower and Arven are both inaccessible. See [Agent35's exact-list counterline](agent35-lockbridge-rank2-stealthy-hood-counter-20261126.md). The policy should compare immediate legal lock-source KOs, not wait mechanically for Max Geist. Against an undamaged Active 140-HP Stoutland or 130-HP AOR Vileplume, with no damage modifiers, both fixed 60s offer the following attack routes:

  | Attack | Base KO threshold | With live Dimension Valley |
  |---|---|---|
  | Latias ex — Eon Blade (200) | 2 Psychic + 1 Colorless attached | 2 Psychic |
  | Trevenant & Dusknoir-GX — Night Watch (150, shuffle two random opposing hand cards into deck) | 3 Psychic attached | 3 Psychic (no Colorless to reduce) |
  | Lillie's Clefairy ex — Full Moon Rondo | 1 Psychic + 1 Colorless; at least 6 combined occupied Bench slots (140 damage) | 1 Psychic; same Bench threshold |
  | Shadow Rider VMAX — Max Geist | 3 Colorless attached to attacker; at least 5 total Psychic attached across own board (160 damage) | 2 Colorless on attacker; same total-Energy threshold |

  This is an attack-payment/damage screen, not a guarantee of access: each attacker must actually reach Active, have legal attack status, and have the required Energy before the attack. Underworld Door can charge only Benched Psychic Pokémon, so plan charging before the pivot; live Skyliner or Float Stone can enable a retreat, subject to the once-per-turn rule and lock status. Night Watch's hand disruption can tax the next lock-recovery attempt but does not guarantee prevention; a rank-2 KO ends the turn, and the opponent has an entire response turn (including possible recovery/evolution into Stoutland) before a candidate Guzma can be used. Eon Blade's next-turn attack restriction must be accounted for; moving Latias to the Bench can clear it. Against rank 15's distinct Active Vileplume BUS 6, an effective Disgusting Pollen prevents Basic attackers, so prefer a payable VMAX attack rather than treating the Basic rows as legal. This is a general lock-source-removal decision rule for both unchanged 60s; rank-2 policy v2 has no deliberate Wobbuffet/Hood response, and rank 15 has no rank-specific policy. No comparative result follows. Card text: CRE 75, SSP 76, SMP 217, JTG 56, BCR 122, AOR 3, BUS 6, PHF 93; supplied Advanced Manual A-01/A-03/B-02.

- **Temple is a fragile one-copy tempo tool, not a hard lock.** Marshadow UNB 81 appears in 10/29 lists, including 7/9 Regidrago and 8/10 DDE lists; its Psychic Resetting Hole can discard Temple and is not suppressed by Wobbuffet. All ten DDE lists also have two to four direct Stadium replacement/removal cards. Temple itself is Prized 10% of the time under a uniform six-card Prize model. Arven → Forest Seal Stone → Star Alchemy is a conditional tutor route, but it consumes a Supporter, a Tool slot, and the once-per-game VSTAR Power; it cannot recover a Prized Temple and is suppressed by Tool-live Garbotoxin.
- **Temple competes with the candidate's own Stadiums.** Playing it over Sky Field loses the expanded Bench; playing it over Dimension Valley removes the Psychic attack discount. Replaying either later removes Temple.
- **Gate and lock are a hard sequencing fork.** If Wobbuffet is Active, Bide Barricade suppresses Radiant Eternatus's Climactic Gate even in hand; playing Eternatus then consumes its when-played trigger without using Gate. Gate-first necessarily gives the opponent a full turn before Wobbuffet can become Active. Lock-first can deny Abilities sooner but may forgo the Gate setup burst.

A useful low-value counterexample is rank 1 Shadow Rider: its Energy are Basic Psychic, its core Abilities are Psychic and exempt, and Marshadow can remove Temple. This demonstrates why 29/29 potential target presence cannot be treated as 29/29 high-value matchups; it does not establish that Lockbridge loses the mirror. The important early exception is Agent46's [asymmetric Wobbuffet → Gate line](agent46-lockbridge-wob-asymmetric-gate-window-20261127.md): if going second with Wobbuffet Active against the exact rank-1 list, the opponent cannot use first-turn Climactic Gate; Lockbridge can then retreat Wobbuffet and use its own Gate. That study models a restricted, actor-known opening route union of 64.8843% conditional on a Wobbuffet opener, or 8.7877% across legal going-second starts; these are opening-route opportunities, not win-rate increments. Its first-turn timing and lone-Wobbuffet donk caveats matter.

## What a fair whole-game comparison must answer

The current reviewed candidate policy cannot rank these lists fairly: it lacks Wobbuffet/Temple root decisions and complete Bide Barricade hand/discard scope, while it also does not fully realize Hood's Ranger/Item-lock response. It would under-measure both packages. PR #69 and PR #71 remain frozen at their reviewed scopes; this synthesis does not authorize a policy patch, fixture, or game.

When a separately authorized comparison becomes possible, use one frozen actor-only policy release demonstrably capable of operating both exact 60s, with the same pinned engine, rank-specific competent opponents, seeds, seat/starting-player conditions, and resource limits. Predeclare and report, by rank:

1. Wobbuffet establishment, actual Ability effects prevented, Active duration, displacement, and re-establishment.
2. Temple timing, DDE/other Special-Energy consequences, Marshadow and other Stadium answers, and the cost to Sky Field/Dimension Valley.
3. Budew/Itchy Pollen outcomes with and without Ranger, including whether the non-Item line is actually assembled.
4. Clefairy damage breakpoints, Prize/search/recovery failures, and whether the second copy changes a game.
5. Policy errors, missed legal actions, complete-game outcomes, sample counts, and uncertainty.

## Decision and evidence boundary

**Keep Lockbridge unchanged and unranked; neither promote nor reject it.** The evidence supports a plausible control package with specific Regidrago, Iron Thorns, and rank-19 ADP applications, balanced against the loss of Ranger and Clefairy redundancy, Active-position fragility, Temple counterplay, and a nontrivial sequencing cost. None of these findings ranks the full 60.

The primary field remains 29/32 authenticated original Aichi lists; ranks 23, 25, and 28 are unavailable. There is no qualified matchup on this exact Lockbridge 60, no final fixed 60 selected, and no demonstrated 99.5% field win rate. Do not turn a 29-rank subset or these card-text/access calculations into a Top 32 result.

### Supporting evidence

- [Field-role and displacement-access census](agent21-lockbridge-field-role-exposure-census-20261125.md)
- [Wobbuffet scope and candidate-policy gate](agent21-lockbridge-scope-and-policy-admission-20261125.md)
- [Prize, Arven/FSS tutor, and Gate-sequencing audit](agent31-lockbridge-prize-access-20261125.md)
- [Value-weighted Prize sensitivity](agent21-lockbridge-value-weighted-prize-sensitivity-20261125.md)
- [Budew/Ranger field-cost and conditional non-Item line](agent2-lockbridge-budew-ranger-field-cost-20261125.md)
- [Temple/DDE field counter-resource audit](../agent39-temple-double-dragon-field-counter-resource-20261107.md)
- [Hood allocation under Garbotoxin/Klefki](agent11-lockbridge-hooded-wobbuffet-garbotoxin-line-20261125.md)
