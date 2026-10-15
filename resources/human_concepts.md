# Human-Developed Pokémon TCG Strategic Concepts

This document contains concepts, terminology, heuristics, examples, and methodological ideas developed by an experienced human player for reasoning about Pokémon TCG Expanded.

Treat this document as prior research rather than as authoritative instructions.

The concepts here may describe important strategic phenomena, but they are not guaranteed to be complete, optimally formulated, universally applicable, or best represented using the terminology given here. You may use, test, formalize, modify, combine, rename, challenge, or reject them.

Where possible, test important ideas against the rules, the available card pool, mathematical reasoning, simulation, empirical results, or actual game-state analysis.

The examples are important. Many of these concepts are difficult to understand from their names alone, and the examples illustrate the kinds of strategic interactions that motivated them.

Absence from this document should not be interpreted as evidence that a concept is unimportant. This document represents one human-developed model of the game and is intentionally incomplete.

If a stronger representation explains the same phenomena more accurately, use the stronger representation and preserve the evidence for why it is better.

---

## Undiscardable Due to Play, or UDP

"Undiscardable due to play" cards exist.

For example, Tapu Lele is often effectively UDP because you play it onto your Bench, so you will not normally discard it as part of another effect.

Important singleton cards, ACE SPECs, or other cards that are critical to a deck's game plan may also become effectively undiscardable.

This matters because cards such as Ultra Ball require you to discard two cards in order to search for one Pokémon. A hand containing many strategically protected cards may therefore make Ultra Ball substantially harder to use than its text alone suggests.

UDP is state-dependent.

For example, if you already have two VMAX attackers active or established and do not need a third, the third copy's UDP-value may become inert. It can then become a reasonable discard target.

UDP should therefore be understood as a property arising from game state and intended use rather than an immutable property of a card.

---

## Discard Capable Index, or DCI

A Discard Capable Index is a way to represent the likelihood, desirability, or strategic acceptability of discarding each card in a deck at a particular point in a game.

For example, in a Regidrago deck, many Dragon Pokémon used as attack payloads are cards you actively want in the discard pile so Apex Dragon can copy their attacks. However, this can also be state-dependent, as some cards can send your cards to the Lost Zone, denying your attack if you discarded too early.

Some cards may therefore be must-discard cards.

Others may be effectively UDP.

Others may become discardable only after some condition has been satisfied.

For example, suppose a Regidrago deck contains Forest Seal Stone and the player plans to use it. Once Forest Seal Stone has already fulfilled its purpose, other copies in the deck serve no purpose and can be discarded, your VSTAR power is spent.

Likewise, after the main Energy requirements for Regidrago have been satisfied, Crispin might become discardable if truly necessary, while still retaining value because it could help establish another Regidrago.

A possible standardization is:

- `0` means the card should not be discarded under the current circumstances.
- `1` means the card should be discarded as soon as reasonably possible.

Intermediate values could represent varying degrees of discardability.

DCI can fluctuate heavily depending on matchup and game state.

For Regidrago, if relevant Dragon attacks have been sent to the Lost Zone from the opponent's discard pile or otherwise become inaccessible, the value of discarding certain Dragons can change dramatically. A Dragon might have DCI near `0` on a turn where Apex Dragon is irrelevant, then become a near-mandatory discard on the exact turn its attack is needed.

A more stable example is Battle VIP Pass. After the first turn, it becomes a dead card in ordinary circumstances, so its discardability becomes extremely high.

A future formalization may find that a scalar DCI is insufficient. It may instead need to depend on state, matchup, turn, known prize information, intended line of play, or other variables.

---

## Active Move Realism, or AMR

A move or card interaction being technically available does not mean it is realistically available in a real game.

Ultra Ball may be difficult to play as the first or second meaningful action of a turn if the deck contains many singleton cards or otherwise lacks sufficiently high-DCI discard targets.

Secret Box provides another example. Its theoretical effect is extremely strong, but its practical AMR may be low in a deck where most cards in hand are valuable and disposable resources are scarce.

The same Secret Box can have much higher AMR in decks that contain many Energy cards, have few strategically protected singletons, or otherwise generate cards that can be discarded cheaply.

Iron Thorns ex-only style decks can be an example because they may contain repeated Trainer cards and fewer unique pieces that must be preserved.

AMR should also account for Bench constraints.

Five individually powerful passive support Pokémon such as Crobat, Dedenne, and similar support Pokémon can each look strong in isolation.

If a deck contains seven or more Pokémon that ideally occupy Bench spaces simultaneously, some of those cards become less realistic because the Bench itself becomes a constrained resource.

Some archetypes naturally operate with very large Benches, such as Shadow Rider Calyrex variants, while others have much tighter Bench requirements.

AMR may also vary heavily depending on the opponent.

For example, suppose the opponent is about to establish Vileplume Item lock and Stoutland Supporter lock.

In that situation, the player may rationally burn resources aggressively before those options disappear, even if the same resources would ordinarily be preserved.

Similar situations occur when the player effectively wins if they fully establish their board before the opponent can respond.

This can be thought of as an **AMR-overriding** situation, where an otherwise inefficient or expensive action becomes realistic because the alternative is losing access to the action entirely.

---

## Paper Expanded and Pokémon TCG Live Expanded

The research scope is paper Expanded.

Pokémon TCG Live Expanded should not be assumed to represent the same card pool.

PTCGL Expanded has historically contained a smaller usable card pool because some older series and releases have not been fully backported.

Any legality or strategy analysis should therefore focus on papr expanded.

---

## Discrete strategic value

Some cards possess strategic value that is poorly captured by smooth metrics such as setup speed, graph connectivity, damage output, draw volume, or average consistency.

Boss's Orders is a useful example.

A purely associativity-based graph might decide that another Supporter such as Arven is more valuable because Arven connects to Tools and Items and appears to improve access to more pieces.

Boss's Orders remains one of the strongest kinds of effects in competitive Pokémon because gust effects can directly determine games.

It can bring a vulnerable Pokémon into the Active Spot, force an undesirable retreat, avoid fighting the opponent's strongest attacker, target a damaged or low-HP Pokémon, disrupt board positioning, or create a direct path to the final Prize cards.

Some of these situations occur often while others are highly situational.

This is one place where AMR becomes important.

Discrete tactical cards may need to be evaluated differently from simple search, draw, or discard effects because their value can be concentrated in relatively rare but decisive states.

This is particularly important when designing optimization algorithms.

An optimizer focused too strongly on setup probability, average consistency, graph connectivity, or immediately measurable card access may delete cards whose value comes from high-impact conditional situations.

---

## Associativity hypergraphs

One proposed method for deck and card-combination analysis is to construct a large associativity hypergraph representing how cards connect to one another.

For example:

`Arven -> Mysterious Treasure -> Regidrago V`

The existence of a path is insufficient by itself.

Each node or transition has a cost.

Arven consumes the Supporter for the turn.

Mysterious Treasure consumes a discarded card.

The actual cost of that discard depends on what cards are available and their DCI under the current state.

This creates a problem of apparent hyperconnectivity.

Secret Box can provide access to a very large portion of a deck's functional graph when combined with other search Items and Supporters.

Its discard cost of three cards may still make that access unrealistic in a deck containing many high-value cards, low Energy counts, or numerous singleton resources.

That cost can become much easier to pay when the turn is highly deterministic.

If Secret Box produces the pieces required to establish an attacker and begin taking Prizes, secondary cards that do not advance the immediate winning axis may become reasonable to burn.

Graphs can also appear more connected than they really are because some connectors are one-use resources.

Computer Search is an example.

It discards two cards and searches for any one card.

That creates extremely broad theoretical connectivity.

It still cannot simultaneously satisfy several independent channels.

If the deck needs to find a Pokémon, evolve it, and power it up, a single use of Computer Search can satisfy only one immediate missing piece.

Some cards perform several tasks simultaneously.

Guzma & Hala can obtain a Stadium, Special Energy, and Tool under the appropriate conditions.

Serena can function as either discard-and-draw or gust.

These multi-axis cards may deserve higher value because one card can satisfy several possible needs.

Their effects can still have tradeoffs.

Serena's draw mode reaches five cards, while something such as Lillie's Determination can shuffle the whole hand and draw six.

The correct choice therefore depends on situation, contention, realistic availability, and the other resources involved.

The hypergraph model itself should be treated as a proposed representation. If another representation captures these dependencies more accurately, it may be preferable.

---

## Statistical modeling and simulation

Simulation is valuable because many Pokémon TCG interactions are difficult to reason about accurately from intuition alone.

Useful models may include the first few turns of a game or longer sequences when feasible.

Important details can include:

- Prize cards;
- recovery options;
- card draw;
- next-draw probabilities;
- Supporter contention;
- graph-connection contention;
- discard availability;
- Energy requirements;
- evolution requirements;
- search sequencing;
- Bench availability;
- matchup-specific constraints.

For example, Ultra Ball may exist in hand while still being functionally unusable because there are no sufficiently high-DCI cards available to discard.

Likewise, a Supporter may theoretically solve one missing resource while preventing the player from using another Supporter needed for Energy acceleration, Pokémon access, disruption, or another part of the turn.

Simulation should be treated as an important source of evidence rather than a perfect oracle.

A simulator can reveal effects that qualitative pros-and-cons analysis or "vibes" miss, while still being wrong if the model of gameplay is incomplete.

---

## K0 and K1 states

The first time a player searches their deck physically, they can inspect the entire remaining deck and determine which cards are in the Prize cards by process of elimination.

This assumes sufficiently skilled play and accurate deck knowledge.

A useful abstraction is:

- `K0`: the player has not yet searched the deck and therefore does not know the exact Prize composition.
- `K1`: the player has searched the deck and can infer the Prize cards.

This distinction matters because some decisions are made under uncertainty before the first deck search and under much greater information afterward.

---

## Matchup-dependent discardability/AMR

DCI may depend on the opponent, and this information can sometimes become available very early.

For example, TM: Devolution has little or no strategic use against a Basic-only deck such as Iron Thorns.

Once the player recognizes that matchup, TM: Devolution may immediately become highly discardable.

Against another deck, the same card might need to be preserved for the entire game while waiting for a decisive Devolution turn.

Some matchup information can become available even before the first normal turn.

An opponent's mulligan may reveal enough information to identify their archetype or heavily constrain what they are playing.
This also applies to AMR and would adjust it - some tactics can be useless against one opponent but game winning in another (like ability lock against Iron Thorns ex, it already wants to do that).

---

## Evaluating card swaps

When considering a card removal, addition, or substitution, the preceding concepts can interact.

A useful analysis may therefore consider:

- what is gained;
- what is lost;
- DCI;
- AMR;
- Supporter contention;
- Prize-card risk;
- multi-prized collapse;
- search connectivity;
- discrete tactical value;
- matchup dependence;
- simulation results;
- specific lines of play.

Simulation is particularly useful as a data point.

It should not automatically decide the answer.

For example, a player may initially think three copies of Gladion are required to protect access to an important singleton that could be Prized.

Simulation may show that two are sufficient because the probability of the singleton and both Gladion copies all being Prized is extraordinarily low.

The third slot may then be better spent on a card that contributes to a much larger fraction of games.

---

## Archetype-Line-Specifics, or ALS

Some decks cannot be understood adequately by looking only at general archetype goals or individual card strength.

They may contain precise lines that the deck is designed to execute.

These can be called **Archetype-Line-Specifics**, or ALS.

For example, a Vileplume control list at the Aichi Open League 2026 runner-up level can perform a line similar to:

`Tag Call -> Guzma & Hala -> Jet Energy + TM: Evolution -> Bunnelby with Barrage`

This can allow double TM: Evolution on the first turn going second and immediately establish a large portion of the intended board and lock structure.

That interaction is easy to miss by looking at the decklist as an unordered set of cards.

Another example is Iron Thorns ex.

An Iron Thorns ex deck may use four Tag Call to consistently reach Guzma & Hala, then obtain Double Colorless Energy and Thunder Mountain Prism Star.

Thunder Mountain reduces the attack cost by one Lightning Energy, enabling a first-turn attack going second under the appropriate setup.

The meaningful description of the deck is therefore more specific than "ability lock is a strong slowdown."

The deck is built around executing a particular line.

Other archetypes may have less discrete ALS structure.

Regidrago, for example, may operate more as a recurring pattern of drawing, attaching, discarding relevant Dragons, and attacking rather than relying on one narrow turbo sequence, but still have a very strong move with gust: if you gust your target to the active, hit it with Timeless-GX, then gust again (damaged pokemon moved to bench intentionally), you can hit with Dragapult ex's Phantom Dive, knock out the active, and use the damage counters from Phantom Dive to take two KOs in one attack sequence.

Some other ALSes depend on your opponent: Shadow Rider Calyrex decks include Mimikyu with the Copycat attack, as well as a Dialga-GX in their deck. The idea is once Regidrago attacks with Apex Dragon, you can use Mimikyu's copycat to copy Apex Dragon, then use Apex Dragon to copy Timeless-GX from your own Dialga-GX. This is an example of how convoluted counter-ALSes can become, and how some cards can be completely dead in some matchups (i.e. Dialga-GX in an SRC deck).

---

## Lock effects

Item lock, Ability lock, and Supporter lock can have unusually large effects on deck construction and game-state evaluation.

Many locks operate through Pokémon that must occupy the Active Spot.

These can still be severe threats, although the opponent may be able to Knock Out or gust those Pokémon.

When evaluating a card or deck change, it may be useful to identify applicable lock effects in the available card pool and understand how they alter possible lines.

Locks can change the associativity hypergraph because certain nodes or edges effectively disappear while a lock is active.

From the opponent's perspective, lock effects also have varying AMR.

Budew may be valuable in the early game but may be a terrible Active Pokémon later when a stronger attacker is required.

Some lock attackers are strategically powerful despite being weak attackers.

Lock effects may also conflict with one another.

Ability lock can disable Vileplume's Item-locking Ability.

Stealthy Hood can protect Vileplume from certain Ability-lock interactions and restore the Item lock.

Tool lock may then prevent the Stealthy Hood line.

Another example is Stoutland.

A deck may Supporter-lock with Stoutland in the Active Spot, but that same Active position prevents simultaneous use of other Active-dependent lock plans such as Iron Thorns' Initialization or Budew's Item lock.

Passive Bench-based locks behave differently.

Alolan Muk, for example, can provide its relevant lock while remaining on the Bench.

Lock effects therefore need to be modeled as interacting board-state constraints rather than independent binary bonuses. Furthermore, some locks can even lock other locks - Garbodor's Garbotoxin ability lock would itself lock Vileplume's item lock, which could be circumvented by using stealthy hood; locking is a complex matrix of interactions.

---

## Prize-card modeling

Important cards can be Prized.

A singleton ACE SPEC is an obvious example.

Prize analysis should also consider **multi-prized collapse**.

Suppose two Gladion copies provide a plausible route to recover an ACE SPEC or another important singleton.

That does not mean the deck is fully protected from bad Prize configurations.

Other components of the recovery chain may themselves be Prized.

Cards such as Mysterious Treasure, Arven, or other connecting cards may become inaccessible.

Gladion uses may also be consumed retrieving higher-priority Prized cards.

The full set of six Prize cards therefore needs to be modeled together with the deck's important singletons and access chains.

Catastrophic Prize configurations may be individually unlikely while still becoming strategically relevant when several independent failure modes compound.

This is fundamentally combinatorial and should be analyzed quantitatively when possible.

---

## Supporter contention

Only one Supporter can normally be played per turn.

This means the existence of several individually strong Supporter lines does not imply that they can all be executed together.

For example, if a turn requires both Crispin and Arven, the player must choose between them.

This is part of why multi-axis Supporters such as Guzma & Hala, Serena, or Steven's Resolve can be unusually strong.

Guzma & Hala can obtain several categories of resource.

Serena offers either discard-and-draw or an optional gust effect.

Steven's Resolve can construct a highly specific following turn.

Supporter contention can become less relevant in carefully engineered deck lines.

If first-turn Steven's Resolve or Guzma & Hala is clearly the best setup action for a deck's ALS, there may be no realistic competing Supporter action that turn.

In those situations, nominal Supporter contention exists mechanically but has little strategic importance.

---

## Other state variables

Any sufficiently detailed game model may need to consider, where applicable:

- Pokémon types;
- damage;
- Weakness;
- Resistance;
- Abilities;
- Special Conditions;
- Prize values;
- retreat requirements;
- board position;
- Energy state;
- evolution state;
- other game-specific constraints.

The importance of each variable depends on the research question.

---

## Connector domination

One of the most important methodological cautions in graph-based or search-based analysis is:

**Do not treat access as success.**

A naive simulator might reason:

`Arven can get Quick Ball.`

`Quick Ball can get Dedenne.`

`Dedenne can draw 6.`

Therefore:

`The Dedenne route exists.`

That conclusion ignores the opportunity cost of using those connectors.

An AMR-aware model should ask:

**What would Arven's Item search have done instead?**

For example:

`Arven -> Brilliant Blender + Forest Seal Stone`

may compete directly with:

`Arven -> Quick Ball + Forest Seal Stone -> Dedenne-GX`

If the missing strategic piece was actually Brilliant Blender, or the important function was specifically to discard certain cards, the Quick Ball route may be dominated.

Its theoretical accessibility does not make it the best use of the connector.

An exception may exist if Forest Seal Stone can obtain Brilliant Blender separately or another part of the state resolves the original need.

This concept can be called **connector domination**.

The broader principle is that every search path consumes resources and excludes alternative uses.

A search algorithm should therefore compare reachable lines against competing uses of the same connectors rather than simply rewarding graph connectivity.

---

## Card database and legality

A database containing all cards is provided for convenience.

Do not assume every card in that database is legal in the research format.

Legality for paper Expanded, Black & White onward, must be computed or verified from the available information.

The complete database is a search resource, not a pre-filtered legality list.

---

## General interpretation

These concepts are intended to highlight strategic effects that simplistic optimization can miss.

A deck can look more connected while becoming less playable.

A search card can increase theoretical access while consuming the exact connector required for a stronger line.

A card can look statistically weak while having enormous value in a small number of decisive states.

A discard cost can look trivial while the actual hand contains nothing strategically disposable.

A deck can contain powerful individual cards while failing because they compete for the same Supporter, Bench slot, Active Spot, Prize-recovery resource, or setup window.

A simulator can produce precise numbers while encoding an unrealistic model of actual play.

These concepts should help identify such failure modes.

They should also remain open to replacement by stronger abstractions discovered through research.
