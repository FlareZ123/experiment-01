# Photographed rank-28 candidate versus verified rank 10: direct turn-two Apex Dragon resources

**Agent 21, 21 October 2026.** This is an exact combinatorial *resource opportunity* comparison. It is not gameplay, a simulator result, a match-clock result, or a win-rate claim. The pictured list remains unverified as Jo Kato's officially registered rank-28 list. The benchmark remains **29/32 exact opponent inventories, zero competitively qualified games**.

## Inputs and provenance

- Published rank-10 Haruku Yoshioka Regidrago 60: [frozen manifest](full-decklists.json), originally from [Limitless CL Aichi decklists](https://limitlesstcg.com/tournaments/566/decklists).
- Unadmitted photographed Regidrago 60: [rank-28 candidate transcription](rank28-replica-visual-60-candidate.json) from [Nayuta's original gallery](https://note.com/nayuta_poke/n/n7e3d0552090b), with [independent visual audit and corrected Juniper identification](rank28-replica-visual-transcription-audit-20261020.md). The photographed list is associated with Replica/@nnaacc5_uec, who publicly reported 28th Swiss seed and first-round elimination. No direct name/registration bridge to the official Jo Kato record was recovered by a fresh 21 October 2026 search.
- Advanced Player's Rulebook: seven-card opening, six Prize cards, ordinary once-per-turn Energy attachment, and second-own-turn ordinary evolution. The resource test assumes no other card effects.

## Event being counted

Condition on a starting **seven-card hand containing at least one Basic Pokémon**. Draw exactly one ordinary card on the first own turn and another on the second own turn. Require:

1. Regidrago V and at least one Energy card among the first eight seen cards, so V could have entered play and received a manual Energy attachment on own turn one.
2. Regidrago VSTAR, at least one Double Dragon Energy and at least **two total Energy cards** among the first nine seen cards. With two manual attachments to the Dragon-type Regidrago line, these resources could pay the Grass + Grass + Fire Apex Dragon attack cost after the VSTAR evolves on own turn two. Double Dragon plus either one Grass/Fire Basic Energy or a second Double Dragon meets the cost.

This is a directly drawn **necessary resource package with a possible legal manual sequencing**. It assumes correct attachment decisions, evolution, and no adverse opposing effects. It ignores search, Ability draw, Supporters, bonus mulligan cards, recovery, special locks, board constraints, attack choice, and whether any successful attack actually occurred. It does not measure deck consistency or competitive strength.

Random six Prize cards are dealt from the remaining 53 after the first seven. Averaging over all their possible identities makes the two subsequent ordinary draws exchangeable with two uniform ordered draws without replacement from those 53. This exchangeability is strictly marginal over unknown Prizes, without K1 information. The event requires all named cards to be directly seen.

## Exact result

| Source 60 | Other Basic Pokémon | Double Dragon | Basic Grass/Fire Energy | Conditional on valid opening seven | Unconditional |
| --- | ---: | ---: | ---: | ---: | ---: |
| **Verified rank 10** | 11 | 4 | 6 | **4.67598918%** | 4.12655674% |
| **Photographed candidate** | 10 | 3 | 7 | **3.90451187%** | 3.36338291% |

The photographed list is **0.77147731 percentage points lower** on this precisely defined event, a **16.4987% relative reduction**. Replacing one Double Dragon with an extra basic Fire Energy affects the available two-attachment route even though total Energy card counts are equal. Two extra Ultra Ball, fewer Quick Ball, one fewer Budew Basic, and other deck differences introduce additional lines and opportunity costs that this direct-draw model deliberately leaves unquantified.

**All Double Dragon Energy six-Prized**, before conditioning on any opening, is another independently checkable location event:

- Four Double Dragon: C(56,2)/C(60,6) = **0.00307607%**.
- Three Double Dragon: C(57,3)/C(60,6) = **0.05844535%**.

The latter is exactly **19 times** the former, although both are rare. This is a Prize-location comparison only; a nineteenfold increase in the event cannot be interpreted as a nineteenfold increase in losses.

## Reproduction and checks

The read-only CommonJS implementation [rank28-direct-apex-turn2.cjs](../../scripts/rank28-direct-apex-turn2.cjs) loads both frozen source inventories, partitions physical cards into six groups (Regidrago V, VSTAR, other Basics, Double Dragon, Grass/Fire Basic Energy, everything else), and verifies group sizes:

- Published rank 10: [4, 3, 11, 4, 6, 32].
- Photograph: [4, 3, 10, 3, 7, 33].

For each multivariate-hypergeometric opening seven-card count vector, it sums the product of binomial coefficients over the Basic-valid cases. It enumerates all six possibilities for each of the two ordered ordinary draws, weighted by remaining physical-card counts. The conditional denominator is **number of Basic-valid sevens × 53 × 52**. BigInt is used for exact counts until decimal display.

An **independent Python 3.13 math.comb enumeration** of these same audited group vectors obtained:

- Rank 10 conditional fraction: **166373119 / 3558030450**.
- Photographed conditional fraction: **1491641083 / 38203010560**.

A local Node 22 smoke ran four pure tests with representative minimal synthetic source-JSON fixtures and matched both independent fractions. **This does not certify the published repository's full JSON-loaded executable.** A proposed full-repository Node test upload was rejected by connected-tool safety controls. No CI or real Twinleaf execution was performed, and no tool block was bypassed.

## Interpretation and necessary next work

The photograph is a plausible off-manifest Regidrago variation for robustness analysis. Its small exact-card distance from rank 10 does not justify silently treating their early-resource distributions as equivalent. Conversely this one restrictive opening metric cannot rank their true game performance.

Continue seeking official registration or direct public identity linkage for rank 28 and exact Japanese printing identities. Until then, do not add the candidate to the verified 32-player manifest. Full-source Node test integration and broader action-policy comparisons remain prospective research tasks. Any later comparison must label the photographed list separately, preserve every fixed 60, and report censored games and missing opponents.

## Discrete attacker-payload difference that the scalar opportunity event misses

The photographed candidate has **one Noivern ex**, absent from the verified rank-10 list. Both lists retain Regidrago VSTAR and its printed Apex Dragon: "Choose an attack from a Dragon Pokémon in your discard pile and use it as this attack." The bundled English card file `cards/en/swsh12.json` gives Apex Dragon an explicit Grass, Grass, Fire cost. The card-data mechanical example `cards/en/sv2.json` `sv2-153` identifies Noivern ex as a Dragon-type Stage 1 with:

- **Covert Flight**, Colorless + Colorless, 70 damage: during the opponent's next turn, prevent all damage to the attacking Pokémon by attacks from Basic Pokémon.
- **Dominating Echo**, Psychic + Darkness, 140 damage: during the opponent's next turn, the opponent cannot play Special Energy or Stadium cards from hand.

Under Regidrago VSTAR's copy text and the Advanced Player's Rulebook §II C-18, a discarded Noivern ex can provide those attacks to Apex Dragon without paying Noivern's printed attack costs; the Regidrago attacker must still satisfy Apex Dragon's own Grass, Grass, Fire cost. Noivern must reach the discard pile, the opponent must present a relevant Basic attack or need to play a blocked card, and attacking forfeits other Apex Dragon payloads that turn.

This is a source-card **conditional strategic option**, absent from the rank-10 name inventory. It could outweigh the photographed list's lower direct-energy package frequency in particular matchups, or provide almost no marginal value in others. There is no empirical or full-game model here to decide that question. The 0.7715-point opening-resource difference therefore must **not** be promoted into an overall ranking of the two lists. The fixed-nominee matchup against rank-28 remains untested and its source identity unverified.


### Concrete opponent-field exposure: rank-6 Iron Thorns ex

The frozen [rank-6 source 60](full-decklists.json) contains **4 Iron Thorns ex and no other Pokémon**. Its eight Energy cards are **4 Speed Lightning, 2 Capture, 1 Spiky, and 1 Double Colorless**, all Special Energy. Both properties are exact physical-list observations. That gives the two Noivern-copy attacks an unusually explicit conditional target:

- Once the Regidrago VSTAR has sent Noivern ex to discard, achieved a legal Apex Dragon attack and remained the relevant Active Pokémon, **Covert Flight** could prevent damage from the listed Basic Iron Thorns ex attackers on the immediately following opponent turn. The prevention does not stop attacks' nondamage effects or protect a different Pokémon gusted Active.
- **Dominating Echo** could stop *all eight printed Energy cards* from being played **from hand** on the next opposing turn, as well as any playable Stadium from hand. It does not remove already attached Energy, block non-hand attachment or necessarily prevent an already powered Iron Thorns attack.

Rank 6 also has **3 Guzma**, which may gust around attack-specific damage protection when a vulnerable Bench target exists, plus Energy-disruption cards against the Regidrago plan. The photographed Regidrago must still reach turn-two VSTAR, discard the singleton Noivern and pay Apex Dragon. Source deck lists alone cannot establish a lock duration, likelihood of a successful attack or a win probability. This rank-6 interaction is consequently a **matchup-specific hypothesis with exact textual prerequisites**, suitable for a later authenticated source-dealt native/paper test, and is why the lower direct resource incidence in this report cannot determine the stronger 60.


### The Noivern hypothesis already has verified-list controls

In the 29-card-list official source manifest, exactly **nine** fully published Regidrago archetype inventories exist at ranks 10, 12, 13, 14, 18, 20, 21, 27, and 32. **Seven of those nine** (12, 13, 14, 20, 21, 27, 32) each carry one PAL 153 Noivern ex. Ranks **10 and 18** carry none. The photographed off-manifest candidate would also carry one. These are exact manifest counts, with no comparative game outcomes.

A high-value follow-up can test the Noivern payload's activation and opponent response against the exact rank-6 Iron Thorns source using an **already verified Noivern-containing Regidrago printed source 60**. That avoids needing to accept the photographed rank-28 identity prematurely. Predeclare the actual source/opponent seats, printed donor, Energy and discard setup, native attack settlement, Guzma bypass opportunities and censored cases. No such test was executed here.
