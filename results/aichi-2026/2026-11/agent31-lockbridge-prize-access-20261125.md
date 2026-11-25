# Lockbridge Shadow Rider v1 — Prize access and Temple tutor audit

**Date:** 25 November 2026  
**Decision relevance:** fixed-60 candidate ranking and lock-package reliability.  
**Evidence class:** exact combinatorial calculation plus card-text-derived access-path analysis. No game or matchup was run.

## Question

Does the exact 60-card Lockbridge list have reliable access to its Wobbuffet PHF 36 + Temple of Sinnoh ASR 155 disruption package, and is Temple truly an unsearchable singleton?

The list is `results/aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json`, now also presented as a printing-normalized English Expanded 60 in `results/decks/lockbridge-shadow-rider-v1-expanded-legal-60.md`. Relevant counts are:

- 1 Wobbuffet PHF 36
- 1 Temple of Sinnoh ASR 155
- 1 Hisuian Heavy Ball ASR 146
- 1 Arven SVI 166
- 1 Forest Seal Stone SIT 156
- 1 Tapu Lele-GX GRI 60
- 4 Shadow Rider Calyrex V and 4 Shadow Rider Calyrex VMAX
- 4 Fog Crystal, 4 Mysterious Treasure, and 1 Quick Ball

## Correction: Temple has a conditional tutor route

Temple is **not wholly unsearchable** in this 60. There is a card-text-supported, one-use line:

1. Play Arven to search the deck for an Item and a Pokémon Tool.
2. Take Forest Seal Stone as the Tool.
3. Attach it to a Shadow Rider Calyrex VMAX with an open Tool slot.
4. Use the granted Star Alchemy VSTAR Power to search the deck for Temple of Sinnoh.

This line is available under Wobbuffet's Bide Barricade if the Forest Seal Stone is attached to a Psychic Shadow Rider: Wobbuffet explicitly exempts Psychic Pokémon, and both Shadow Rider V and VMAX are Psychic. Prefer the VMAX if an opposing Active Klefki is relevant, because Klefki's lock targets Basic Pokémon. Tapu Lele-GX is also Psychic, so its Wonder Tag is not suppressed by Wobbuffet; an effective opposing Klefki can still suppress the Basic Tapu Lele.


**Important lock-scope boundary:** the preceding statement is specific to Wobbuffet's Bide Barricade, not a general Ability-lock immunity. Tool-live Garbodor's Garbotoxin suppresses every Pokémon Ability except Garbotoxin, including Star Alchemy granted by Forest Seal Stone on a Psychic Shadow Rider V/VMAX. Wobbuffet's Psychic exception does not protect Star Alchemy from Garbotoxin. Forest Seal Stone and Stealthy Hood are both Pokémon Tools, and a Pokémon cannot hold both at once; therefore the FSS host cannot also be Hood-protected from Garbotoxin. The Arven → FSS → Star Alchemy route is live under Wobbuffet alone, but **not while Garbotoxin is Tool-live**, unless Star Alchemy is used before Garbotoxin becomes active or Garbodor's Tool is removed first. If Budew's Itchy Pollen has already resolved, Field Blower is an Item and cannot be played during that locked turn; Arven remains a legal Supporter but cannot by itself restore Star Alchemy while Garbotoxin remains active. This timing/Tool-slot qualification matters for the four authenticated Garbodor lists (ranks 8, 11, 16, and 22). It is card-text-derived, not a game result.

The route is **conditional, not dedicated free access**. It spends the turn's Supporter on Arven, the deck's one Forest Seal Stone, a Pokémon V's Tool slot, and the once-per-game Star Alchemy VSTAR Power. The player must also have an eligible Shadow Rider V/VMAX with an open Tool slot. Arven may be reached naturally or by Tapu Lele-GX's Wonder Tag when that Ability is live. Forest Seal Stone can be used for other urgent cards, so Temple access competes with every other Star Alchemy target. This is a connector/opportunity-cost issue, not a simple binary count of search outs.

Most importantly, Star Alchemy searches the deck, not the Prize cards. If the sole Temple is Prized, this route cannot retrieve it. Hisuian Heavy Ball retrieves a Basic Pokémon from the Prizes, not a Stadium.

## Wobbuffet access is materially better

Wobbuffet is a Basic Psychic Pokémon. The list has nine ordinary deck-search cards that can find it while it remains in the deck:

- 4 Fog Crystal (Basic Psychic Pokémon or Basic Psychic Energy)
- 4 Mysterious Treasure (Psychic/Dragon Pokémon, with a discard payment)
- 1 Quick Ball (Basic Pokémon, with a discard payment)

If Wobbuffet is Prized, Hisuian Heavy Ball can retrieve it because Wobbuffet is Basic. The hard Prize-only failure of that recovery route occurs when **both Wobbuffet and Hisuian Heavy Ball are Prized**. The search counts are optimistic access counts: Mysterious Treasure and Quick Ball have real discard costs, and all outs compete with other Pokémon/resource needs.


## The Wobbuffet swap also halves Fairy Zone redundancy

The exact parent Hood Shield list contains **2 Lillie's Clefairy ex**; Lockbridge cuts this to **1** while adding Wobbuffet. Lillie's Clefairy ex JTG 56 has the Psychic-type Ability Fairy Zone, which changes the Weakness of each opponent's Dragon Pokémon in play to Psychic. That is a relevant offensive modifier for Shadow Rider's Psychic Max Geist against the nine authenticated Regidrago source lists. Lockbridge still retains one Clefairy, and Wobbuffet's Bide Barricade explicitly exempts Psychic Pokémon, so Wobbuffet does not suppress the remaining Fairy Zone.

The cut is therefore a **redundancy reduction**, not removal of Fairy Zone. It matters most if the sole remaining Clefairy is Prized, Knocked Out, or discarded before the Dragon matchup is decided. The exact Prize-only comparison, using the list's one Hisuian Heavy Ball as the only Basic-Pokémon Prize recovery:

| Parent / candidate count | Prize-only hard failure to access Fairy Zone |
|---|---:|
| 2 Clefairy + 1 Heavy Ball (Hood Shield) | Both Clefairy and Heavy Ball Prized: 0.05845% |
| 1 Clefairy + 1 Heavy Ball (Lockbridge) | Clefairy and Heavy Ball Prized: 0.84746% |

The absolute increase is 0.78901 percentage points, or 14.5×, under a uniform six-card Prize subset. This is **not** a matchup-loss estimate. It excludes the nine ordinary Pokémon-search cards (Fog Crystal, Mysterious Treasure, Quick Ball), Night Stretcher recovery from discard, the chance Clefairy is KO'd, and the opportunity cost of the Heavy Ball being used on Wobbuffet or another Basic. The remaining single Clefairy is still searchable; the tradeoff is loss of the second physical copy as a backup Fairy Zone source.

Card-text basis: Lillie's Clefairy ex is resources/cards/en/sv9.json (sv9-56); Wobbuffet PHF 36 is resources/cards/en/xy4.json (xy4-36). The calculation uses the same C(60,6)=50,063,860 Prize-set denominator as the Temple analysis. No matchup or game outcome is inferred.

## Radiant Gate creates a mandatory opponent-turn gap before the Wobbuffet lock

The self-lock sequencing constraint is stronger than simply "use Gate before promoting Wobbuffet":

- Radiant Eternatus's Climactic Gate triggers when it is played from hand onto the Bench, but **using the Ability ends your turn**.
- Bide Barricade applies only while Wobbuffet is Active. If Wobbuffet is already Active, it suppresses the non-Psychic Radiant Eternatus Ability, including while Eternatus is on the Bench. If Wobbuffet is not Active, Gate can resolve, but the turn ends before Wobbuffet can be promoted.
- Therefore a Gate-first line necessarily gives the opponent one full turn before Bide Barricade becomes Active. Any on-play Ability they use during that interval (for example, Dedenne-GX's Luminous Sign) has already resolved; later Wobbuffet does not undo it.

The list does have a useful pivot bridge. Latias ex SSP 76's Skyliner says your Basic Pokémon in play have no Retreat Cost. Latias ex is Psychic, so its Ability remains live under Wobbuffet. On the next turn after Gate, if the Active Pokémon is Basic (for example, Shadow Rider Calyrex V or Tapu Lele-GX), Skyliner can let it retreat for free and promote Wobbuffet. If the Active is Shadow Rider VMAX, Skyliner does not apply because VMAX is not Basic; the list must instead use Float Stone, Guzma, or another pivot. Once Wobbuffet is Active, Latias's Psychic Ability continues to provide free retreat to your Basic Pokémon, including Wobbuffet itself.

This creates a real policy choice rather than a guaranteed lock sequence:

- **Lock-first:** promote Wobbuffet before the opponent's turn and forgo/hold Radiant Gate while the lock is active. This can deny the intervening on-play Ability window but gives up Climactic Gate's immediate VMAX setup.
- **Gate-first:** if Temple is intended to suppress Special Energy during the intervening turn, play Temple **before** Radiant Eternatus, then use Gate. The opponent still gets an Ability window and may replace/remove Temple; on the next turn, use Latias/Float Stone/Guzma to promote Wobbuffet. Playing Temple only after Gate leaves it absent during the opponent's intervening turn.

The exact card text is in `resources/cards/en/swsh12pt5.json` (`swsh12pt5-105`, Radiant Eternatus) and `resources/cards/en/sv8.json` (`sv8-76`, Latias ex), alongside Wobbuffet in `resources/cards/en/xy4.json`. These are card-text-derived lines, not native Store evidence or a complete-game result.

## Exact six-Prize calculation

Assume the six Prize cards are a uniformly random six-card subset of the 60. The total number of possible Prize sets is:

[
inom{60}{6}=50{,}063{,}860.
]

| Event | Exact probability | Interpretation |
|---|---:|---|
| The single Temple is Prized | (6/60=10.0000\%) | Hard denial of the Temple piece; no listed card retrieves a Prized Stadium |
| Wobbuffet and Heavy Ball are both Prized | ((6/60)(5/59)=0.84746\%) | Hard denial of the Wobbuffet recovery route |
| Temple, Wobbuffet, and Heavy Ball are all Prized | ((6/60)(5/59)(4/58)=0.05845\%) | Overlap to subtract when combining the two failure events |

Therefore, with the current one-Temple list, the probability that the **full Wobbuffet + Temple pair cannot be assembled through the listed Prize-recovery structure** is:

[
10\%+0.8474576\%-0.0584454\%=10.7890123\%.
]

This is not a 10.789% game-loss estimate. The two lock pieces have independent value: if Temple is Prized, Wobbuffet may still suppress Abilities; if Wobbuffet and Heavy Ball are Prized, Temple may still suppress attached Special Energy effects. The number describes only Prize-driven inability to assemble both pieces.

## Two-Temple counterfactual

A second Temple would change the Prize tail substantially, but costs a deck slot and must not be treated as a free improvement.

- With two Temple copies, both are Prized with probability ((6/60)(5/59)=0.84746\%), rather than 10%.
- Keeping one Wobbuffet and one Heavy Ball, the probability that either both Temples are Prized or Wobbuffet + Heavy Ball are both Prized is **1.69184%** after subtracting the four-card overlap.
- Before any additional search or draw effects, at least one Temple appears among the first nine cards seen (opening seven plus two normal draws) with probability **15.00%** at one copy versus **27.97%** at two copies. Among the first twelve cards seen, the corresponding values are **20.00%** versus **36.27%**.

These are finite-population draw/prize calculations, not observed game rates. A second copy also increases the chance of a live follow-up Stadium after an opponent replaces the first Temple. Its slot cost must be weighed against the current one-copy Sky Field and Dimension Valley, the attacker/setup engine, and other matchup tech.

## Card-text and card-pool basis

The route analysis uses the repository's pinned card-pool snapshot:

- Wobbuffet PHF 36 / Bide Barricade: `resources/cards/en/xy4.json`, card `xy4-36`.
- Temple of Sinnoh ASR 155 and Hisuian Heavy Ball ASR 146: `resources/cards/en/swsh10.json`, cards `swsh10-155` and `swsh10-146`.
- Forest Seal Stone SIT 156 / Star Alchemy: `resources/cards/en/swsh12.json`, card `swsh12-156`.
- Arven SVI 166: `resources/cards/en/sv1.json`, card `sv1-166`.
- Shadow Rider Calyrex V / VMAX: `resources/cards/en/swsh6.json`, cards `swsh6-74` and `swsh6-75`.
- Tapu Lele-GX GRI 60 / Wonder Tag: `resources/cards/en/sm2.json`, card `sm2-60`.
- The normalized Basic Psychic Energy printing is `swsh6-232` (CRE 232). `resources/sets/en.json` has no `MEE` PTCGO set code, so the source JSON's `MEE 13` is a placeholder rather than a resolvable English printing.

The Prize numerator counts are reproducible from the same six-card-subset model: `C(60,6)=50,063,860`; one specified card in Prizes gives `C(59,5)=5,006,386` sets; two specified cards give `C(58,4)=424,270`; three give `C(57,3)=29,260`; and four give `C(56,2)=1,540`. Thus the current one-Temple combined-pair failure numerator is `5,006,386 + 424,270 - 29,260 = 5,401,396`; the two-Temple counterfactual numerator is `424,270 + 424,270 - 1,540 = 847,000`.

## Decision

1. Correct the earlier shorthand: Temple is a singleton with a conditional Arven → Forest Seal Stone → Star Alchemy tutor route, not a card with literally zero access.
2. Keep the current 60 unchanged for now. The tutor line is expensive and the exact Lockbridge list has no qualified native game or competent policy comparison.
3. Record **1 Temple vs 2 Temple** as a future fixed-slot experiment only after the Lockbridge policy can select Temple/Wobbuffet and is admitted for the same controlled comparison as Hood. Declare the replacement slot in advance; do not claim the 2-copy version is stronger from Prize math alone.

## Limitations

- The Prize calculations assume a uniform random six-card Prize subset from the 60 and do not model mulligans, draw supporters, Underworld Door, searches, opponent disruption, Stadium timing, or game-state-dependent card value.
- The Arven → Forest Seal Stone → Star Alchemy line is derived from the supplied English card text. It has not been exercised in a native game using this exact 60.
- This analysis does not change candidate ranking, establish policy competence, qualify a matchup, or support a win-rate claim. The 99.5% target remains unproven.
