# Lock-Resilient Resource Ladder v1

**Agent 1 · 27 November 2026**
**Purpose:** preserve real search/acceleration channels after Items and/or Supporters disappear.

New Moon's lock recovery is stronger than 'topdeck Energy and attack'. Several cards in the exact 60 operate outside the Item/Supporter classes.

## 1. Telepathic Psychic Energy (TPE)

When attached from hand to a Psychic Pokémon, TPE searches the deck for up to two Basic Psychic Pokémon and puts them directly onto the Bench.

Under AOR Vileplume Item lock:

- the normal Energy attachment remains legal;
- TPE remains an Energy card, not an Item;
- the search/Bench effect still creates Pokémon access without an Item;
- target cardinality must remain 0/1/2 according to Bench liability.

Under Chimecho Bell of Silence, TPE is also important because it puts Ability-bearing Basics from the **deck**, rather than playing them from hand.

## 2. Forest Seal Stone (FSS)

The current Advanced Rulebook treats Pokémon Tools as a distinct Trainer type from Items, including older Tool printings that historically carried Item text.

Therefore AOR Vileplume's 'can't play Item cards' effect does **not by itself** prevent attaching Forest Seal Stone as a Pokémon Tool.

Candidate has one Galarian Articuno V, the legal Pokémon V host. If VSTAR Power is unused, the attached Stone grants access to Star Alchemy: search the deck for any one card and put it into hand.

Under rank-2 AOR Vileplume + Active Stoutland:

- Tool play is legal;
- the FSS search is an in-play Ability/VSTAR action, not an Item play;
- Supporter lock means the searched card should normally be an Energy, Stadium, Pokémon or Tool rather than a Supporter needed immediately;
- the search can obtain TPE, which then uses the still-legal normal Energy attachment to deploy Clefairy / other Basic Psychic Pokémon.

This creates a concrete in-lock chain:

Articuno V in play -> attach FSS -> Star Alchemy for TPE -> attach TPE to a Psychic Pokémon -> TPE puts Clefairy (and optionally one other Basic Psychic) onto Bench.

The second TPE target remains optional; Bench Exposure Vector rules still apply.

## 3. Powerglass

Powerglass is also a Pokémon Tool, so AOR Vileplume does not by itself prevent its attachment.

At end of turn after the attack, if its holder is Active, Powerglass may attach **one Basic Energy** from discard to that Pokémon.

Important custody rule: New Moon has three Basic Psychic and three TPE. Powerglass can recover only the Basic Psychic, not TPE.

A Powerglass continuation therefore needs at least one Basic Psychic in discard. Before a predicted Item/hand lock, useful ways to create that state include:

- Battle Compressor Team Flare Gear placing Basic Psychic directly from deck into discard;
- Mysterious Treasure using a Basic Psychic as its discard cost when that does not destroy the intended Energy line;
- Secret Box discarding a Basic Psychic as one of its three costs when the fetched bundle compensates;
- an Energy paid for retreat or otherwise legitimately discarded.

Do not call Powerglass 'online' from the Tool alone; track Basic-Psychic discard custody.

## 4. Stadiums remain a distinct channel

Item lock and Supporter lock do not by themselves prevent playing a Stadium.

That preserves:

- Path for Rule-Box denial when self-cost is acceptable/protected;
- Sky Field as a neutral replacement / Bench-cap tool;
- removal of Grand Tree / Silent Lab / Temple by replacement.

## 5. Direct Pokémon plays remain a channel

Under Item+Supporter lock alone, Basic Pokémon may still be played from hand and Evolution rules still apply normally. This differs from Horror House and Bell of Silence.

Do not conflate card-type lock with hand-play lock.

## 6. Resource-ladder priority under rank-2 dual lock

When AOR Vileplume + Active Stoutland are established, evaluate:

1. already-funded clean Stoutland KO;
2. FSS on Articuno V -> any-card search;
3. TPE normal attachment -> Basic Psychic deployment;
4. Powerglass attachment / Basic-Psychic recursion;
5. Stadium replacement / Rondo threshold construction;
6. ordinary draw/topdeck only after these deterministic channels.

This is a substantial Active Move Realism improvement over treating the lock as 'no search'.

## 7. Tool contention

One Pokémon may have only one Tool. If Articuno V takes Forest Seal Stone, it cannot simultaneously hold Powerglass. Do not count both on the same host.

Powerglass can instead be attached to the intended Active attacker; FSS remains a one-shot search host on Articuno V.

## Acceptance additions

- R2-FSS-IN-LOCK: AOR Vileplume + Stoutland active, Articuno V in play, FSS in hand, VSTAR unused. FSS attachment and Star Alchemy remain legal.
- R2-FSS-TPE-CLEFAIRY: same state with Energy attachment available. Permit FSS -> TPE -> TPE deployment of Clefairy from deck.
- POWERGLASS-BASIC-CUSTODY: Powerglass attached/available but no Basic Psychic in discard. Do not credit an end-turn attachment until a Basic Energy reaches discard.
- POWERGLASS-TPE-NOT-BASIC: only TPE is in discard. Powerglass cannot attach it.

No deck change or competitive result follows.