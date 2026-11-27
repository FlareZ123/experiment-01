# K1 Continuation Viability / Dynamic DCI v1

**Agent 1 · 27 November 2026**

New Moon is singleton-heavy and has no direct Prize-search card in the fixed 60. The first legitimate deck search therefore creates a major policy discontinuity: at K1, exact Prize knowledge must change which lines are considered real and which cards remain strategically protected.

## Structural pre-K1 prize-risk priors

These are unconditional six-Prize combinatorial priors, not actor knowledge after cards are observed:

- one specified singleton Prized: **10.0000%**;
- at least one of two specified singleton cards Prized: **19.1525%**;
- both specified cards / both copies of a 2x card Prized: **0.84746%**;
- with 2 Duskull + 2 Dusclops, probability all copies of at least one stage are Prized: **1.69184%**.

The numbers matter only as pre-K1 AMR priors. Once the player searches the deck, use exact K1 knowledge instead of probability.

## Continuation families to recompute at K1

### Horror House family

Prerequisite card: singleton Gengar & Mimikyu-GX.

If Gengar is Prized and not already elsewhere in a public/owned zone, both:

- native Gengar Horror House; and
- Mewtwo Perfection copying Horror House

are unavailable until that Prize is taken.

Do not spend a connector toward a Horror House continuation that cannot exist.

### Night Watch / Pale Moon family

Prerequisite card: singleton Trevenant & Dusknoir-GX.

If Prized, copied/native Night Watch and Pale Moon lines disappear until recovery through taking Prizes.

### Asymmetric Path family

Prerequisites: singleton Solrock + singleton Lunatone.

If either is Prized, New Moon's Stadium shield cannot be assembled from the deck. Revalue the remaining partner by its actual residual role rather than preserving it as if the pair were intact.

Before K1, the unconditional chance that neither of these two specific singletons is Prized is about **80.8475%**.

### Forest Seal Stone family

Prerequisites: singleton Forest Seal Stone + singleton Galarian Articuno V + unused VSTAR Power.

Articuno V is the fixed 60's only Pokémon V. Squawkabilly ex, Mewtwo & Mew-GX and other Rule-Box Pokémon are **not Pokémon V**.

Therefore:

- if Articuno V is Prized, Forest Seal Stone has no legal host in the remaining 60 and its FSS-search value collapses;
- if FSS is Prized, Articuno still retains Reconstitute / Psyray value but loses the one-shot any-card-search role.

This is a direct DCI change: an otherwise protected singleton FSS can become a reasonable discard once K1 proves there is no legal host.

Before K1, the unconditional chance that both Articuno and FSS avoid the six Prizes is again about **80.8475%**.

### Clefairy family

Prerequisite: singleton Lillie's Clefairy ex.

If Prized, rank-2 two-Energy Rondo escape and rank-19 Fairy-Zone Dragon breakpoints are unavailable. Do not keep building a six-Bench Rondo line around a missing attacker.

### Dusclops family

Prerequisites: at least one of 2 Duskull and at least one of 2 Dusclops accessible outside Prizes.

If both Duskull are Prized:

- Stage-1 Cursed Blast cannot be established from deck/hand;
- remaining Dusclops copies cannot be normally played because there is no Duskull in play to evolve;
- their DCI rises sharply unless another legal rule/effect can put them into play.

If both Dusclops are Prized:

- Duskull remains a Basic/Future Sight body;
- the Cursed Blast / Stage-1 attack continuation is unavailable.

Unconditional probability that all copies of at least one stage are Prized is only about 1.69184%, but K1 makes the exact case binary.

## Dynamic DCI rule

At K1, for each card c, replace name-based protection with:

DCI(c | state, prizes, continuation).

A card's discard protection falls when the continuation that required it has become impossible.

Examples:

- Articuno Prized -> FSS loses its only host -> FSS DCI increases;
- Lunatone Prized -> Solrock loses asymmetric-Path role -> Solrock DCI may increase;
- Gengar Prized -> Mewtwo is still valuable, but 'protect Gengar donor' constraints disappear;
- both Duskull Prized -> Dusclops copies become near-dead under ordinary evolution rules;
- Escape Rope Prized -> Snorlax policy must stop reserving an unavailable switch line and elevate alternative board-release routes.

Conversely, a card can become **more** protected when K1 reveals redundancy collapse: if only one of two copies of a needed card remains outside Prizes, that surviving copy has higher continuation value.

## K1 sequencing rule

After the first deck search and before paying a major discard/search cost:

1. infer exact six Prizes by comparing known 60 against hand/board/discard/deck;
2. recompute continuation-family availability;
3. recompute DCI for singleton/pair components;
4. remove impossible lines from connector search;
5. only then pay Secret Box / Mysterious Treasure / Reconstitute discard costs.

This prevents the policy from protecting dead pieces while discarding the only live replacement line.

## Acceptance additions

- K1-FSS-HOST-PRIZED: K1 shows Articuno V Prized; FSS remains in hand/deck. Must stop treating FSS as a usable Star Alchemy line and re-evaluate its DCI.
- K1-NEWMoon-PAIR-COLLAPSE: K1 shows exactly one of Solrock/Lunatone Prized. Must not credit asymmetric Path from the surviving singleton alone.
- K1-GENGAR-PRIZED: K1 shows Gengar & Mimikyu-GX Prized. Must remove Horror House/Poltergeist donor continuations until Prize recovery.
- K1-DUSKULL-ALL-PRIZED: K1 shows both Duskull Prized. Must mark ordinary Dusclops evolution/Cursed-Blast line unavailable and raise DCI of stranded Dusclops.

No deck change or competitive result follows.