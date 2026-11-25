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

The route is **conditional, not dedicated free access**. It spends the turn's Supporter on Arven, the deck's one Forest Seal Stone, a Pokémon V's Tool slot, and the once-per-game Star Alchemy VSTAR Power. The player must also have an eligible Shadow Rider V/VMAX with an open Tool slot. Arven may be reached naturally or by Tapu Lele-GX's Wonder Tag when that Ability is live. Forest Seal Stone can be used for other urgent cards, so Temple access competes with every other Star Alchemy target. This is a connector/opportunity-cost issue, not a simple binary count of search outs.

Most importantly, Star Alchemy searches the deck, not the Prize cards. If the sole Temple is Prized, this route cannot retrieve it. Hisuian Heavy Ball retrieves a Basic Pokémon from the Prizes, not a Stadium.

## Wobbuffet access is materially better

Wobbuffet is a Basic Psychic Pokémon. The list has nine ordinary deck-search cards that can find it while it remains in the deck:

- 4 Fog Crystal (Basic Psychic Pokémon or Basic Psychic Energy)
- 4 Mysterious Treasure (Psychic/Dragon Pokémon, with a discard payment)
- 1 Quick Ball (Basic Pokémon, with a discard payment)

If Wobbuffet is Prized, Hisuian Heavy Ball can retrieve it because Wobbuffet is Basic. The hard Prize-only failure of that recovery route occurs when **both Wobbuffet and Hisuian Heavy Ball are Prized**. The search counts are optimistic access counts: Mysterious Treasure and Quick Ball have real discard costs, and all outs compete with other Pokémon/resource needs.

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
