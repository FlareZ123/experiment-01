# New Moon Discard / Connector Policy v1

**Agent 1 · 27 November 2026**

New Moon has several effects whose printed search/draw strength can be dominated by the resources they consume. This policy makes discard payment line-aware rather than name-based.

## 1. Select the continuation before selecting discards

Every discard-paying action must start from a named continuation, for example:

- native Horror House;
- Perfection Horror House;
- Night Watch;
- Clefairy Rondo Stoutland/Dragon KO;
- Solrock+Lunatone asymmetric Path;
- Articuno+FSS lock-resilient search;
- Dusclops Cursed Blast -> Ace Trainer;
- Snorlax board-release;
- Raichu Prize-parity manipulation.

If the policy cannot name what the search/draw action is advancing, do not pay a large discard cost merely for generic hand velocity.

## 2. Continuation-critical set

For a chosen continuation `L`, build a set `C(L)` containing every actor-visible card whose loss makes that line illegal or materially worse before the next realistic replacement window.

Examples:

- Perfection Horror House: accessible Gengar donor + Mewtwo attacker + required Psychic funding + any required lockbreak;
- asymmetric Path: Solrock + Lunatone + Path + attacker that benefits from restored Ability;
- FSS -> TPE -> Clefairy under rank2 lock: Articuno V + FSS + unused VSTAR + TPE/attachment + Clefairy availability;
- Dusclops -> Ace: Duskull/Dusclops chain + a Cursed Blast target that preserves Ace legality + Ace Trainer itself;
- Powerglass continuation: intended Active/Tool target + Powerglass + at least one Basic Psychic that can reach discard.

At K1, remove Prized/impossible prerequisites and rebuild the set.

## 3. Dynamic discard classes

Assign each card one of these state-dependent classes for the selected horizon:

### Class A — destructive discard

Discarding the card breaks the selected continuation and there is no actor-visible replacement in time.

Never pay with Class A unless abandoning the continuation for a demonstrably better line.

### Class B — protected redundancy

The card has a replacement, but discarding it collapses redundancy or exposes Prize/lock risk.

Use only for high-value actions after comparing the reduced continuation resilience.

### Class C — neutral discard

The card has no required near-term role and no meaningful discard-zone value.

Preferred payment.

### Class D — productive discard

Discarding the card directly advances a live continuation.

Examples can include:

- Gengar/Trevenant donor Pokémon placed where Perfection can use them;
- Basic Psychic moved to discard for Powerglass;
- post-turn-one Battle VIP Pass with no remaining role;
- extra copy/redundant resource after K1 proves the needed copy is already accessible.

Productive discard is not automatically correct: a donor may still be needed as a native attacker, and Basic Psychic may still be needed for the current attachment.

## 4. Secret Box

Secret Box discards three cards, then searches one Item, one Tool, one Supporter and one Stadium.

Treat the fetched four-card bundle as a **continuation bundle**, not four independent +1s.

### Hard gate

Reject Secret Box if fewer than three legal payment cards are outside Class A for the selected continuation.

### Connector domination

Before Box, compare what the same hand/resources can do without it. Box is dominated when:

- it must discard the only donor needed by the fetched lockbreak line;
- it burns the only Energy required to attack after fetching setup;
- it fetches a Supporter that cannot legally be played because the turn's Supporter is already spent or Stoutland lock is active;
- it fetches an Item that AOR Vileplume makes unplayable;
- it fetches FSS when Articuno V is Prized or already Tool-occupied;
- it fetches a Stadium whose self-suppression destroys the intended attack.

### Strong Box state

Box is attractive when three payments are genuinely dead/productive and the bundle jointly supplies multiple independent axes, e.g. lockbreak + Tool + Supporter + Stadium for the exact selected line.

Do not count inaccessible categories as value merely because Secret Box can search them.

## 5. Mysterious Treasure

Mysterious Treasure pays one discard to search an eligible Dragon/Psychic Pokémon.

Because the cost is only one card, it is often much more realistic than Secret Box—but it can still destroy the line.

Rules:

- do not discard the only Energy that pays the searched attack unless another funding route is explicit;
- do not discard the only Solrock/Lunatone pair component while searching a different Psychic if asymmetric Path is the selected continuation;
- a Basic Psychic can be a **productive** cost when Powerglass needs that discard and the current attack is already funded;
- an attack-donor Pokémon can be productive in discard if Perfection is the plan, but do not discard the only native attacker when Perfection is currently suppressed and the native attack is the recovery route.

This last case is critical under Klefki/Silent Lab/Thorns states: donor-in-discard value and native-attacker value can reverse depending on Ability scope.

## 6. Galarian Articuno V Reconstitute

Reconstitute discards two cards, then draws one.

That is a net hand-size loss before considering card quality. Use it as a **discard engine with draw smoothing**, not as ordinary draw power.

High-value uses:

- put a donor Pokémon into discard for Perfection;
- seed Basic Psychic for Powerglass;
- convert dead post-turn-one VIP Pass / redundant cards into a fresh draw;
- clear hand composition before a stronger shuffle-draw line when the two discards are genuinely expendable.

Low-AMR uses:

- hand contains exactly the two Energy/continuation pieces needed for the current attack;
- Articuno itself is the only FSS host and Reconstitute would require discarding the FSS/TPE chain;
- a lock is imminent and the discarded cards are the only non-Item resources that remain usable through it.

## 7. Battle Compressor

Battle Compressor has no hand discard cost and can proactively shape discard-zone continuations.

Priority targets are state-dependent:

- Perfection donors that are not needed as native attackers;
- Basic Psychic for future Powerglass;
- cards whose discard-zone location creates immediate value.

Do not blindly compress all premium donors. Against Ability suppression, native Gengar/Trevenant board access can be more valuable than donor location.

## 8. Basic Psychic custody

New Moon has three Basic Psychic and three TPE. They are not interchangeable for discard purposes.

Basic Psychic can:

- pay Psychic attack costs;
- be recovered by Powerglass.

TPE can:

- pay Psychic while not suppressed by a Stadium effect;
- trigger deck-to-Bench setup when attached from hand;
- **cannot** be recovered by Powerglass.

Therefore:

- do not discard the last Basic Psychic if Powerglass is the selected lock-resilient energy engine unless the current attack/other recovery justifies it;
- do not substitute discarded TPE for a Basic-Psychic Powerglass target;
- under Temple of Sinnoh, separate TPE's attachment-time search from its post-attachment Energy type.

## 9. K1 redundancy collapse

K1 can move a card directly from protected to discardable or vice versa.

Examples:

- Articuno V Prized -> FSS has no host -> FSS moves toward Class C;
- one of Solrock/Lunatone Prized -> surviving partner loses asymmetric-Path role;
- one of two Dusclops Prized -> the surviving copy becomes more protected;
- both Duskull Prized -> accessible Dusclops become stranded and more discardable under ordinary evolution rules;
- Gengar Prized -> stop protecting other resources solely for a Horror House donor line.

## 10. Payment selection algorithm

For a discard cost of `n`:

1. choose selected continuation `L`;
2. compute K0/K1 continuation viability;
3. classify every hand card A/B/C/D for `L`;
4. generate legal `n`-card payment sets;
5. reject any set containing Class A unless the action explicitly changes continuation;
6. rank remaining sets by productive discard value, retained redundancy, Energy custody and next-turn resilience;
7. evaluate the fetched/drawn result against the **same** continuation;
8. compare the whole action against not using the connector.

## 11. Trace contract

For every discard-paying action expose:

- selected continuation;
- every discarded physical card;
- its DCI class and reason;
- which continuation prerequisite remains after payment;
- fetched/drawn bundle and which axis each card serves;
- best competing use of the connector / no-connector line.

## Acceptance additions

- DISCARD-NATIVE-GENGAR: Perfection suppressed and native Gengar is the intended lock line. Do not discard Gengar merely because it is normally a good donor.
- DISCARD-BASIC-PSYCHIC-POWERGLASS: attack already funded, Powerglass plan needs Basic Psychic in discard. Allow a Basic Psychic as productive payment.
- DISCARD-LAST-BASIC-PSYCHIC: Powerglass continuation requires Basic Psychic and no other Basic Psychic is accessible. Protect the last one unless changing plans.
- BOX-LOCKED-CATEGORY: Secret Box can search an Item/Supporter category that current Vileplume/Stoutland lock makes unplayable. Do not count that category as immediate bundle value.
- RECONSTITUTE-NET-LOSS: two protected cards are the only payment. Reject Reconstitute's discard-2/draw-1 smoothing unless abandoning the selected continuation.

No deck change or competitive result follows.