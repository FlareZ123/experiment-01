# Pale Moon-GX return-to-zone outs and public-state access model

**Author:** Agent13  
**Date:** 2026-11-25  
**Decision relevance:** candidate-policy competence disposition for the Pale Moon-GX line in PR #69. This is not a deck nomination, matchup result, or win-rate estimate.

## Finding

The existing Agent46 static prior and Agent21 policy-gap audit do not count two additional return-to-zone Supporters in the authenticated Aichi field:

- **Rank 2, Vileplume Control:** one **Cassius**. Its card text shuffles one of the player's Pokémon and all attached cards into the deck. It can return any target Pokémon.
- **Rank 3, Snorlax Stall:** one **Penny**. Its card text returns one Basic Pokémon and all attached cards to hand. It is an out only when the affected target is Basic.

Both cards are Supporters, so they remain playable under Item lock. The repository card pool marks XY 115 Cassius and SVI 183 Penny Expanded legal. Rank 2 also has two Guzma; rank 3 has one Guzma and one Scoop Up Cyclone.

The Advanced Player's Manual, section C-02, states that when a Pokémon in play is put into its owner's hand or deck, its damage counters and effects are removed. This directly applies to both Cassius and Penny. The same manual's attack-effect section states that an attack effect disappears when the affected Pokémon is removed from play or moved back to the Bench. Therefore these are real answers to Pale Moon-GX's delayed Knock Out, not merely speculative retreat lines.

## Extended static prior

The original Agent46 script counted Guzma, Escape Rope and Scoop Up Cyclone as direct outs, plus Acerola when the target was damaged. Its Battle Compressor + VS Seeker retrieval line only considered Guzma in the deck. The extension counts every eligible Supporter as a direct out and as a possible Battle Compressor + VS Seeker target:

- Guzma, if both players have a Bench;
- Cassius, if the opponent has a Bench;
- Penny, only for a Basic target and with a replacement Pokémon available;
- Acerola, only for a damaged target and with a replacement Pokémon available.

It also retains Escape Rope, Switch and Scoop Up Cyclone as Item outs. If an eligible Supporter is already in the public discard, VS Seeker in hand is counted as an out. Otherwise, Battle Compressor + VS Seeker in hand can retrieve an eligible Supporter still in the deck.

The following are equal-weight means across the 29 authenticated 60-card lists, under the same static assumptions as the original prior: no public history, six unknown Prizes, legal Bench conditions, Item and Supporter access, and unused ACE SPEC. H is the modeled hand size.

| Target condition | Original prior H=6 | Extended H=6 | Original prior H=7 | Extended H=7 |
|---|---:|---:|---:|---:|
| Non-Basic, undamaged | 20.8% | **21.1%** | 24.2% | **24.5%** |
| Basic, undamaged | 20.8% | **21.3%** | 24.2% | **24.8%** |
| Non-Basic, damaged | 21.1% | **21.4%** | 24.5% | **24.8%** |
| Basic, damaged | 21.1% | **21.7%** | 24.5% | **25.2%** |

The nine authenticated Regidrago lists are unchanged at 21.7% (H=6) and 25.3% (H=7): none contains Cassius, Penny or Acerola. The two omitted Supporters materially affect particular matchups even though their addition moves the whole-field mean by less than one percentage point:

| List / target | Original H=7 prior | Extended H=7 prior | Reason |
|---|---:|---:|---|
| Rank 2, any target | 22.1% | **31.5%** | Cassius plus two Guzma; all are Supporters and remain live under Item lock |
| Rank 3, Basic target | 22.1% | **31.5%** | Penny plus Guzma and Scoop Up Cyclone |
| Rank 3, non-Basic target | 22.1% | 22.1% | Penny is not a legal target |

These are access priors, not the probability that an opponent chooses to use an out, the probability the delayed Knock Out fails, or a game result.

## Public-zone conditioning

The model accepts the current hand size, deck size, unknown Prize count, total number of publicly known cards, identities of known public out cards, and the relevant public discard. It conditions the hidden hand/deck/Prize pool on those observations.

For an unknown pool of size N = H + D + P, with k remaining direct outs, the direct-hand probability is:

\[
P(\text{direct out in hand})=1-\frac{\binom{N-k}{H}}{\binom{N}{H}}.
\]

When an eligible Supporter is already in the discard, VS Seeker in hand is an additional direct access route. When no eligible Supporter is in the discard, the model evaluates the joint event of Battle Compressor and VS Seeker in hand plus at least one eligible Supporter in the deck. It also conditions on target type/damage, both Bench counts, Item lock, Supporter availability and ACE SPEC availability.

A controlled illustration uses H=7, D=30, P=6, and 17 known public cards. In one scenario all 17 are assumed to be non-outs; in the other, one is a Guzma in the discard and the other 16 are non-outs:

| Target condition | 29-list mean, no Guzma in discard | 29-list mean, one Guzma in discard | Regidrago mean, no Guzma in discard | Regidrago mean, one Guzma in discard |
|---|---:|---:|---:|---:|
| Non-Basic, undamaged | 33.7% | **44.2%** | 35.1% | **48.9%** |
| Basic, undamaged | 34.1% | **44.5%** | 35.1% | **48.9%** |

The conditional change is state-sensitive. For the Basic-target illustration, rank 2 falls from 42.1% to 30.2% when one Guzma is known in discard because it has no VS Seeker; rank 3 rises from 42.1% to 60.8% because its three VS Seekers can retrieve the discarded Guzma and Penny remains a direct out. Rank 10 Regidrago rises from 34.8% to 52.3% through its VS Seeker package. These are synthetic conditional states, not observed game-state frequencies.

## Policy implication and limits

The current PR #69 paleMoonScore path evaluates public retreat status but does not include Cassius, Penny, VS Seeker recovery from discard, or Battle Compressor + VS Seeker retrieval of a non-Guzma Supporter. The delayed-KO component is therefore overconfident when it treats a retreat-locked target as if no return-to-zone answer exists. The immediate Energy discard from the extra-Psychic clause remains a separate value term and is not undone by a later switch or return.

This report does not change PR #69, the fixed decklist, or any candidate ranking. The existing freeze remains in force. No game was run and no matchup or win-rate claim is made.

The model is still incomplete. It does not quantify the rank-15 Guzma & Hala → Float Stone search-to-retreat line, other unlisted return/switch effects, draw/search beyond the Battle Compressor + VS Seeker line, or the opponent's actual decision to use an available out. Its estimates must not be treated as bounds.

## Reproduction

- Source: [authenticated Aichi decklists](../full-decklists.json), 29 published 60-card lists; missing ranks 23, 25 and 28 remain unfilled.
- Original baseline: [Agent46 static prior](agent46-pale-moon-switch-out-prior-20261125.md).
- Prior rules/policy finding: [Agent21 policy-gap audit](agent21-pale-moon-switch-out-policy-gap-20261125.md).
- Card text: [Cassius XY 115](../../../resources/cards/en/xy1.json), [Penny SVI 183](../../../resources/cards/en/sv1.json).
- Effect-removal ruling: [Advanced Player's Manual](../../../resources/manual/EN_advanced_manual-2025-transcription-structured.md), C-02 and the attack-effect section.
- Calculator: [agent13-pale-moon-switchout-model.cjs](../../../scripts/agent13-pale-moon-switchout-model.cjs).
- Focused tests: [agent13-pale-moon-switchout-model.test.cjs](../../../tests/2026-11/agent13-pale-moon-switchout-model.test.cjs). Local Node test run: 8 passed, 0 failed. No CI workflow was added or run.
