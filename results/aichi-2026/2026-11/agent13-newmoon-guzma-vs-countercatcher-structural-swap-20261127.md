# New Moon structural swap candidate: Guzma over Counter Catcher

**Agent 13 · 27 November 2026**  
**Decision affected:** whether the currently retained exact New Moon Lockbreaker v1 should remain the implementation target unchanged.  
**Status:** structural swap analysis only. **Do not treat this note as a new nominated 60 yet.** No game, CI, policy implementation, or win-rate claim.

## Trigger for reconsidering the exact 60

The fixed v1 list has exactly two Stage-1 Pokémon: **2 Dusclops SFA 19**. Every other Pokémon in the deck is Basic.

Against rank-15 BUS Vileplume, Basic Pokémon cannot attack while BUS Vileplume is Active. AOR Vileplume can simultaneously Item-lock the candidate, removing Escape Rope and Counter Catcher.

If **both Dusclops are Prized**, the candidate can reach a state with:

- BUS Vileplume Active;
- AOR Vileplume in play;
- no accessible Stage-1 attacker;
- Item switch/gust disabled;
- every remaining attacker Basic and therefore unable to attack.

The raw probability that both specific Dusclops are among the six Prize cards is:

`(6/60) × (5/59) = 0.8474576%`.

That is not a matchup-loss probability because rank 15 still has to establish/maintain the lock and New Moon can sometimes prevent it. But it is a genuine **multi-Prized structural collapse mode**. For a project targeting 99.5%, it cannot be ignored.

The most attractive repair is not a third Dusclops. It is replacing the singleton **Counter Catcher** with **Guzma BUS 115**.

## Exact texts / legality

### Counter Catcher — PAR 160

- Expanded legal Item.
- Usable only when the candidate has **more Prize cards remaining** than the opponent.
- Switches an opposing Benched Pokémon into the Active Spot.
- Does **not** switch New Moon's own Active.

### Guzma — BUS 115

- Expanded legal Supporter.
- Switches an opposing Benched Pokémon with the Active; if that succeeds, switches New Moon's Active with one of its Benched Pokémon.
- No Prize-count condition.
- Consumes the Supporter action for the turn.

Both are one-card gust resources. Guzma trades Item speed/Supporter compatibility for broader lock-breaking and self-switch capability.

## Why Guzma solves actual acceptance failures

### 1. Rank-15 dual Vileplume

Counter Catcher is an Item and is unusable under AOR Vileplume.

Guzma is a Supporter. If the opponent has another Benched Pokémon and New Moon has a Bench, Guzma can:

- move Active BUS Vileplume to the Bench;
- bring a different opposing Pokémon Active;
- switch New Moon's own Active at the same time;
- restore the ability of New Moon's Basic attacker to attack for that turn.

This provides a **non-Dusclops escape channel** from the exact both-Dusclops-Prized collapse.

It does not make rank 15 solved:
- the opponent may promote/retreat BUS again later;
- Supporter contention can prevent Ace Trainer/Lillie's Determination on the Guzma turn;
- Silent Lab can suppress Tapu Lele-GX search until replaced;
- Guzma itself can be Prized.

But it changes “no legal Basic attack / no Item switch” into an actor-visible Supporter line.

### 2. Snorlax Block

Counter Catcher changes the opponent's Active but leaves New Moon's trapped Active in place.

Guzma changes **both** Actives. Against Snorlax Stall it is therefore a second functional self-switch channel alongside Escape Rope, provided both players have Bench targets.

This directly reduces the structural risk from a singleton Escape Rope.

### 3. Rank-26 final-Prize conversion

The donk source aims to donate five Prizes. If New Moon survives, it often has **one Prize remaining** while rank 26 has many.

Counter Catcher requires New Moon to have **more** remaining Prizes than the opponent. In the successful-survival state New Moon is ahead, so Counter Catcher is generally disabled exactly when a gust for the last Prize can be most valuable.

Guzma has no Prize-count condition. It can gust a final target and switch the attacker Active in the same Supporter action.

### 4. Regidrago Covert Flight / protected Active

Both cards can gust around a protected Regidrago when their conditions are met.

Guzma:
- has no “behind on Prizes” condition;
- can also repair New Moon's own Active position.

Counter Catcher:
- preserves the Supporter action;
- can be combined with Ace Trainer/Lillie's Determination in the same turn.

This is a real tradeoff rather than a strict dominance claim.

### 5. Search connectivity

Counter Catcher:
- can occupy Secret Box's **Item** search channel;
- cannot be fetched by Tapu Lele-GX.

Guzma:
- can occupy Secret Box's **Supporter** search channel;
- can be fetched by Tapu Lele-GX's Wonder Tag when Tapu Lele is played from hand and its Ability is live.

This is especially relevant under Item lock: Secret Box cannot be played there, but a hand-played Tapu Lele can still search Guzma if Silent Lab/Garbotoxin/Klefki is not suppressing Wonder Tag.

Under Silent Lab, New Moon can sometimes replace the Stadium first and then play Tapu Lele from hand.

## The price of the swap

Guzma is not a free upgrade.

### Supporter contention

The current v1 Supporters are:

- 2 Lillie's Determination;
- 2 Ace Trainer.

Guzma would become the fifth Supporter. A Guzma turn cannot also use:
- Lillie's Determination for draw/setup;
- Ace Trainer for comeback hand disruption after a Cursed Blast / Prize deficit.

Counter Catcher can be used alongside those Supporters.

This is the main cost.

### Item-vs-Supporter connector competition

Secret Box can fetch Counter Catcher as its Item while using the Supporter channel for another Supporter.

With Guzma, the Supporter channel is consumed by the gust, potentially making the Box bundle less multi-axis.

Conversely, the Item channel becomes available for Field Blower/Escape Rope/another Item. Which arrangement is stronger is state-dependent.

### Guzma needs switch targets

The opponent must have a Benched Pokémon to perform the first switch. New Moon normally needs a Benched Pokémon for its own mandatory switch part to be useful.

Counter Catcher also requires an opposing Bench target, but does not depend on New Moon having a Bench.

## Multi-Prized collapse comparison

The raw both-Dusclops-Prized collapse is **0.8474576%**.

If the deck contains one independent singleton Supporter escape and the only prize-based catastrophic state is “both Dusclops **and** that singleton are Prized,” the raw three-specific-card probability is:

`(6/60) × (5/59) × (4/58) = 0.0584454%`.

This is only a **Prize-configuration bound**, not the actual lock-failure probability:
- Guzma may be unprized but not drawn/searchable in time;
- the required Bench targets may be absent;
- another lock may suppress Wonder Tag;
- the opponent may re-establish BUS afterward.

Still, it shows why a functionally independent escape channel is more valuable than merely making the existing Dusclops channel slightly more consistent.

## Why the proposed cut is Counter Catcher, not another card

A structural repair should minimize loss of unrelated functionality.

Counter Catcher is the closest role-overlap card already in the 60:
- both cards are opponent-switch/gust effects;
- both are singletons;
- the new card preserves the gust function while adding own-switch and removing the Prize-behind condition;
- the swap does not cut Energy, lockbreak counters, draw Supporters, Rescue Carrier, the TPE engine, Stadium package, or attack payloads.

This is materially different from adding Guzma by cutting a random consistency card.

## Decision test before promotion to v2

Promote `-1 Counter Catcher, +1 Guzma` to the fixed New Moon implementation target only if the following qualitative audit holds:

1. **Rank 15:** Guzma produces at least one coherent lock-break line in the both-Dusclops-Prized state where Counter Catcher is Item-locked.
2. **Snorlax:** own-switch value is real in Block states and not routinely negated by empty Bench structure.
3. **Rank 26:** final-Prize gust value is real in the ahead-on-Prizes state where Counter Catcher is disabled.
4. **Regidrago / rank 1:** losing a same-turn Item gust + draw Supporter does not destroy a more important known line.
5. **Secret Box:** moving gust from Item channel to Supporter channel does not create a dominant connector-contention regression in the hardest Box states.
6. **No existing exact-60 result depends specifically on Counter Catcher's Item typing / Prize condition in a way Guzma cannot replace.**

If these checks pass, the swap is **structural and multi-family**, not cosmetic one-card churn.

## Current disposition

The unchanged v1 list should now be treated as **provisionally retained pending this swap decision**, rather than immutable.

The strongest candidate redesign is:

`Counter Catcher PAR 160 -> Guzma BUS 115`.

Do not modify other slots until this role-overlap substitution has been resolved.

No qualified matchup or 99.5% claim is created.
