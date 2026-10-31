# Agent 25: post-Aichi one-Prize Dhelmise challenger, exact T1 channel and discard-Ability lock matrix

**31 October 2026 | two immutable exploratory 60-card steps + one tool-removal repair | not a competitive win result.**

## What is newly relevant

The supplied English card archive includes the July 2026 [Dhelmise ME5 39](../../resources/cards/en/me5.json), which has **140 HP, Psychic type, and Vengeful Anchor: 30 + 140 damage for one Psychic Energy** if at least four Pokémon retaining the exact *Hide 'n' Sneak* Ability are in your discard pile. [Official Pokémon July 2026 release notice](https://www.pokemon.com/uk/news/the-pokemon-tcg-mega-evolution-pitch-black-expansion-arrives-july-17-2026) and [official August strategy feature](https://www.pokemon.com/uk/features/pokemon-tcg-building-and-playing-a-hide-n-sneak-deck) establish that this is a real competitive archetype; it is **not an invention of our investigation**. The latter discusses Banette, discard synergies and Telepathic Psychic Energy. The current question is whether a specifically optimized, **fixed** one-Prize Expanded list could be a viable alternative to the existing Shadow Rider/lock benchmark candidates against the **unchanged May 10 Aichi original Top32 field**.

[Lillie's Clefairy ex SV9 56](../../resources/cards/en/sv9.json) has the Fairy Zone Ability that gives opposing Dragon Pokémon Psychic Weakness ×2. Conditional on Fairy Zone working, the Dhelmise attack is **170×2 = 340**, enough to knock out an ordinary full-health 280-HP Regidrago VSTAR (absent damage prevention or unusual modifiers). [Telepathic Psychic Energy ME3 88](../../resources/cards/en/me3.json) supplies the one required Psychic Energy and can also Bench up to two Basic Psychic Pokémon, including Clefairy, directly from deck when attached from hand to a Psychic Pokémon. The one-Prize attacker might reduce the opponent's Prize yield relative to an exposed multi-Prizer. These are printed-card logical interactions. None establishes a match win. The earlier [May 2026 Dowsing review](https://dowsingmachine.com/en/pages/a-review-of-cl-aichi-results) and its later [Hide 'n' Sneak analysis](https://dowsingmachine.com/en/archetypes/hide-n-sneak) independently identify the same Regidrago counter idea, including vulnerabilities to Girafarig and Karen. Original May opponent decks remain unchanged and any later-released challenger must be explicitly labeled **post-event**. For current international paper Expanded, official guidance retains the Black & White-forward scope and allows new cards two weeks after release: [2026 format announcement](https://www.pokemon.com/us/pokemon-news/2026-pokemon-tcg-standard-format-rotation-announcement). An independent Japanese local-event printing/ban verification is still required before a tournament-legal assertion.

## Exact fully enumerated development lists

The following candidate files contain exact immutable source card printing IDs, card counts, one ACE SPEC at most, and complete physical total **60**:

| File | HNS donors | Important difference | Total Basics |
| --- | --- | --- | ---: |
| [v0 Stage1-only donor list](agent25-dhelmise-stage1-discard-v0.json) | 4 Banette ME5 34, 4 Sinistcha ME5 6 | All eight are Stage1 Pokémon without their Basics; useful as discards, unplayable as ordinary Evolutions | **12** |
| [v1 mixed donor list](agent25-dhelmise-mixed-lock-donors-v1.json) | 4 Banette, 2 Shuppet ME5 33, 2 Sinistcha | Adds playable Psychic HNS Basics, hedges both Wobbuffet and Silent Lab | **14** |
| [v2 mixed with Tool-removal answers](agent25-dhelmise-mixed-lock-answers-v2.json) | Same as v1 | Replaces 2 Rescue Carrier and 1 PokéStop with **2 Field Blower SM2 125 + 1 Faba SM8 173** | **14** |

The rest of the v2 sixty is four Dhelmise, two Clefairy ex, four Unown with Farewell Letter, one Fezandipiti ex, one Safeguard Mimikyu, four Arven, four Battle Compressor, one Brilliant Blender ACE SPEC, four Mysterious Treasure, three Quick Ball, two VS Seeker, two Night Stretcher, two Lillie's Determination, one Guzma, one Pokémon Ranger, one Karen, one Float Stone, one PokéStop, four Telepathic Psychic Energy and six Basic Psychic Energy. See the JSON for canonical printings and exact count. None is claimed to be optimized or natively runnable yet. Agent25 v2 is a **new development challenger**, not a new nominee qualified to replace the published rank-1 reference in `results/README.md`.

## Exact physical T1 event, independent of game effect assumptions

Use a shuffled 60 with **4 Dhelmise, 8 HNS donor Pokémon, 4 Telepathic Psychic, 4 Arven, 1 Brilliant Blender, 2 Clefairy ex, 4 Battle Compressor and 33 other cards**, and physical initial seven, one ordinary draw, and six unknown Prizes. Require:

1. Dhelmise **already in the opening seven** to occupy Active on game setup; this automatically establishes a Basic-valid starting hand for successful event worlds.
2. Telepathic Psychic Energy **in the opening seven plus one ordinary draw**.
3. Blender is held, or Arven is held and Blender remains **searchable in the deck**, or at least **two Battle Compressor** are held by the first ordinary draw; the last two can discard six cards total and have enough targets to discard four donors.
4. At least **four HNS Pokémon remain in deck** after initial seven, ordinary draw and six Prize cards, to supply Blender/Compressor. Any HNS copies in hand are excluded from this strict route, even though other hand-discard routes exist.
5. At least one Clefairy is held or remains in deck after Prizes, so it could be Benched by hand or through Telepathic.

This is a narrowly specified **card-location event**, not a validated legal action sequence. The six Prize identities are integrated exactly, avoiding the common error of assuming all necessary cards are in deck. The deck-search, Supporter, attachment, Bench, card lock, damage, turn order, first-turn opening bonuses, other draw/search and all opponent responses still require native paper-faithful tests.

The [BigInt direct-access calculator](../../scripts/agent25-dhelmise-t1-physical-opportunity.cjs) gives:

| Condition | Exact result |
| --- | ---: |
| Strict direct Dhelmise + Tele + Blender/Arven + Clefairy + 4 searchable donors | **6.640250057995843%** |
| Extra worlds enabled by **two held Battle Compressors**, with no Blender route | **0.603292769876424%** |
| **Total strict first-turn card-location opportunity, unconditional shuffled 60** | **7.243542827872268%** |
| Same event, conditional Basic-valid opening, v0 12 Basics | **8.949790854790960%** |
| Same event, conditional Basic-valid opening, v1/v2 14 Basics | **8.408944118690072%** |

The total's exact reduced fraction is **89836718226797 / 1240231753460700**. For the Blender/Arven-only subevent the fraction is **82354489728457 / 1240231753460700**. The denominator counts all labelled combinations of opening seven, first draw and six unknown Prize cards. The favourable numerator was independently checked by complete labelled-card-world enumeration for several reduced-deck cases, rather than relying on one combinatoric implementation.

The event numerator is unchanged when moving identical-count HNS donors between Basic and Stage1, but the **valid-opening denominator** changes. v0's 12 Basics produce a **19.0647% probability of an initial no-Basic mulligan**, compared with **13.8591%** for v1/v2's 14 Basics. Conditioning on a valid opening makes v0's observed strict event *look* more frequent at the cost of exposing more bonus mulligan draws to the opponent. It would be wrong to treat that higher conditional percentage as a win-rate improvement.

## Exact discard Ability lock matchups and Prize-only accessibility

The printed **Wobbuffet PHF 36 / Bide Barricade** suppresses Abilities of **non-Psychic** Pokémon in play, hands and discard while Active. It suppresses Grass Sinistcha even after Sinistcha is discarded, but leaves Psychic Banette and Shuppet. **Silent Lab PRC 140** suppresses **Basic** Pokémon's Abilities, including in discard; Stage1 Banette and Sinistcha retain their Ability. **Garbotoxin Garbodor (LTR 68, BKP 57)** suppresses all Pokémon Abilities in discard while its Pokémon Tool condition is satisfied. Its effects are also capable of disabling Clefairy's Fairy Zone. Printed semantics are checked against the [original card source pool](../../resources/cards/en/).

| Active lock condition, hypothetically established | v0 effective HNS donors | v1/v2 effective HNS donors | Chance at least 4 of effective donors avoid six Prizes (v0 → v1/v2) |
| --- | ---: | ---: | --- |
| No HNS-removing lock | 8 | 8 | 99.9941% → 99.9941% |
| Wobbuffet Active | **4** | **6** | **64.8540% → 98.9656%** |
| Silent Lab in play | **8** | **6** | **99.9941% → 98.9656%** |
| Tool-activated Garbotoxin | **0** | **0** | **0% → 0%** |

These probabilities measure **necessary Prize-only potential**, not the probability of discarding four donors, keeping locks off or attacking. A card escaping Prizes might remain in hand and need a different paid discard action, while an effect like Lost Zone removal can permanently eliminate it. Under Wobbuffet, a v0 player needs **all four Psychic Banette** to count and be in discard. If any are Prized, 170 damage cannot be reached by this donor package while the opponent's Wobbuffet is Active without Prize recovery or lock removal. The v1 mixed package has six eligible donors under that condition.

The exact source 29-field has **Wobbuffet in ranks 7, 10, 21**, **Silent Lab in 9, 13, 15, 32**, and **Garbotoxin-capable Garbodor in 8, 11, 16, 22**. Those are **published card-presence counts**, not evidence the corresponding effect was active during an actual game. The [lock/source and Prize-only calculator](../../scripts/agent25-dhelmise-hns-discard-lock.cjs) recomputes the print-sensitive matrix directly from both candidate 60s and all 29 original opposing 60s.

A particularly important correction: **Jamming Tower does not shut off Garbotoxin**. Jamming Tower states that attached Pokémon Tools *have no effect*, but Garbotoxin checks whether a Tool **is attached**; a suppressed Tool remains attached. Thus using Jamming Tower as a supposed Garbotoxin counter would be a serious error. I briefly registered that false strategy in a developmental draft of v2, then corrected the committed v2 before reporting it: v2 contains actual **Tool-removal** cards, two Field Blower and one Faba. Field Blower spends an Item and discards up to two Tools/Stadium cards; Faba consumes the once-per-turn Supporter and Lost Zones an opposing Tool/Special Energy or an in-play Stadium. Either is still constrained by game state, card availability, lock effects and realistic resource costs. If Items are locked before a Field Blower can be played, Faba may remain the only one of these routes.

Other hard boundaries include Vileplume Item lock disabling the required Blender/Compressor plays, opponent Girafarig/Get Lost permanently removing discard payloads, Karen shuffling away all donors, and native responses that remove Clefairy or attack over the 140-HP Dhelmise. Silent Lab also disables Clefairy ex's Basic-Pokémon Fairy Zone and Unown's Farewell Letter while active; switching to six live HNS donors alone is insufficient for the intended Regidrago knockout. The two-prize Clefairy Bench liability persists.

## Reproducibility and next release gate

- [Exact deck print/60 checks and labelled-deck brute-force tests](../../tests/agent25-dhelmise-t1-physical-opportunity.test.cjs) passed in existing manually dispatched [field audit CI 41164304917](https://github.com/FlareZ123/experiment-01/actions/runs/41164304917), pinned repository head `4ffb0dd075da2b2b31f8406e01da85b7e428f06c`.
- [Printed discard-lock/source-rank regression](../../tests/agent25-dhelmise-hns-discard-lock.test.cjs) passed in existing manual [field audit CI 41164458183](https://github.com/FlareZ123/experiment-01/actions/runs/41164458183) at head `b9dc75d824060c6c8d391a6cf6d15c2c9b66aa0b`. The follow-on v2 Tool-removal correction and regression will be checked in a further run.
- No Twinleaf original Store test of Dhelmise, Hide 'n' Sneak, Telepathic Psychic Energy, Blender, Faba or their opponent responses has been executed here. The native engine might lack these post-Aichi cards or implement them inaccurately. Do not convert any exact access fraction, printed knockout or Prize-only lock count into a game win fraction.

**Priority next:** assess a single frozen v2 original-source matchup with actual paper-faithful card implementation, including the native four-card discard threshold, conditional Weakness, Tool removal under Garbotoxin, source responses, both physical seats and full 60-card conservation. The historical rank-1 Shadow Rider remains the public reference pending qualification. After competence and legality gates, a newly registered balanced comparison across the full original Top32 is required. Current field status **29/32 exact source sixties**, missing final ranks **23/25/28**, **zero qualified competitive games** and no demonstrated fixed-60 99.5% win rate.
