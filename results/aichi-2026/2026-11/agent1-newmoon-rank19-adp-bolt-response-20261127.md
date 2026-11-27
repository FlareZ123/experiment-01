# New Moon vs rank-19 Raging Bolt / ADP: prevent Altered Creation when possible, then pivot to Fairy-Zone direct attackers

**Agent 1 · 27 November 2026**  
**Status:** exact-source/card-text tactical analysis for unchanged New Moon Lockbreaker v1; no native game or matchup qualification.

## Core problem

Authenticated rank 19 contains:

- 1 Arceus & Dialga & Palkia-GX CEC 156 (ADP);
- 2 Raging Bolt ex TEF 123;
- 4 Double Dragon Energy;
- 3 each Basic Lightning/Fighting/Darkness;
- 3 Sky Field;
- Marshadow UNB 81;
- Sudowoodo GRI 66;
- Flutter Mane TEF 78;
- two Guzma and a large Basic-energy acceleration package.

One Double Dragon Energy on Dragon-type ADP can satisfy the Metal cost plus the extra Water requirement of **Altered Creation-GX**. Once that GX resolves, rank 19's attacks do +30 to the Active for the rest of the game and take **one additional Prize** when the opponent's Active is Knocked Out by attack damage.

Unlike the Shadow Rider candidates studied elsewhere, **New Moon Lockbreaker v1 contains no Pokémon Ranger**. Therefore its current 60 has no generic post-resolution reset for Altered Creation.

This makes rank 19 a prevention/prize-map matchup, not a Ranger matchup.

## Prize-map consequence

After boosted Altered Creation resolves, an Active New Moon target Knocked Out by attack damage yields:

- TAG TEAM GX: **4 Prizes** instead of 3;
- Pokémon-GX / V / ex: **3 Prizes** instead of 2;
- ordinary one-Prize Pokémon: **2 Prizes** instead of 1.

Raging Bolt's Bellowing Thunder does 70 damage for each Basic Energy discarded from the source player's Pokémon. With the Altered Creation +30 modifier:

- 3 discarded Basic Energy -> 240 damage: cleanly KOs native Gengar & Mimikyu-GX (240) and most New Moon two-Prize Basics;
- 4 discarded Basic Energy -> 310 damage: cleanly KOs 270-HP Mewtwo & Mew-GX / Trevenant & Dusknoir-GX.

A boosted Mewtwo TAG TEAM KO therefore threatens **four Prizes in one attack**.

**Policy consequence:** after Altered Creation resolves, do not use a three-Prize TAG Active as a generic safe pivot. Every Active choice needs an immediate survival/KO/Prize-map calculation.

## The built-in counter-axis: Fairy Zone

New Moon already contains **Lillie's Clefairy ex JTG 56**.

Its Fairy Zone Ability makes the Weakness of opposing Dragon Pokémon Psychic. Both ADP and Raging Bolt ex are Dragon.

Clefairy's own Full Moon Rondo is Psychic and costs Psychic + Colorless:

`damage = 20 + 20 × total Benched Pokémon (both players)`.

With Fairy Zone live:

### Raging Bolt ex — 240 HP

Need 120 pre-Weakness damage:

`20 + 20B >= 120 -> B >= 5`.

So **five total Benched Pokémon** across both sides gives:

`120 × 2 = 240` -> clean Bolt KO for two Prizes.

### ADP — 280 HP

Need 140 pre-Weakness damage:

`20 + 20B >= 140 -> B >= 6`.

So **six total Benched Pokémon** gives:

`140 × 2 = 280` -> clean ADP KO for three Prizes.

These thresholds remain useful even when rank 19 establishes Sudowoodo Roadblock. Roadblock caps **New Moon's** Bench at four; it does not erase rank 19's own Benched Pokémon from Full Moon Rondo's count. The source's setup naturally consumes Bench positions for Sudowoodo, support Basics and powered attackers.

## Why direct Clefairy matters against Flutter Mane

Rank 19's Flutter Mane says that while it is Active, the opponent's **Active Pokémon has no Abilities**.

If Mewtwo & Mew-GX is Active, Flutter Mane turns off Perfection and prevents copied attacks.

A direct Lillie's Clefairy ex attacker does **not** need an Ability to use Full Moon Rondo. Its Fairy Zone Ability is on Clefairy itself; if Clefairy is the Active under opposing Flutter Mane, however, Flutter Mane also removes Fairy Zone from that Active Clefairy, eliminating Dragon Weakness for that turn.

Therefore the policy distinction is:

- **Clefairy Active vs normal ADP/Bolt Active:** Fairy Zone live, Rondo weakness thresholds above apply.
- **Clefairy Active vs opposing Flutter Mane Active:** Fairy Zone is suppressed; do not double Rondo damage.
- **Clefairy Benched while another New Moon Active faces Flutter Mane:** Fairy Zone remains live because Flutter Mane suppresses only the opponent's Active Pokémon's Abilities, but a Mewtwo Active still loses Perfection.

Native Gengar and direct Latias/Clefairy attacks are therefore important non-Perfection branches.

## Other Fairy-Zone breakpoints

With live Fairy Zone:

- Mewtwo & Mew-GX copying **Night Watch**: 150 × 2 = **300**, enough to KO either full-HP ADP or Raging Bolt.
- Native Gengar & Mimikyu-GX **Poltergeist**: each revealed Trainer contributes 50 × 2 = **100** damage to the Dragon target; three Trainers in hand would KO either ADP or Bolt. This is hand-dependent and must not use hidden information before attack declaration.
- One Cursed Blast placing 50 counters reduces the Rondo bench breakpoint by one:
  - Bolt: from 5 total Bench to 4;
  - ADP: from 6 to 5.
  That costs a Dusclops self-KO and gives rank 19 a Prize, so it is a tactical conversion, not free damage.

## Path-to-the-Peak caution

Path suppresses Rule-Box Abilities, including New Moon's own **Lillie's Clefairy ex Fairy Zone**.

Therefore a policy that relies on Dragon Weakness must not blindly play Path unless:

- Solrock + Lunatone are already protecting the candidate from Stadium effects; or
- the chosen attack line does not need Fairy Zone.

Rank 19 has Marshadow UNB and three Sky Field, so even an asymmetric Path is contestable.

This is another connector-domination case: Path may suppress Sandy Shocks ex / Moltres V / support Rule-Box Abilities, but if it removes Fairy Zone at the exact Dragon-KO turn its opportunity cost can be larger than its denial value.

## Horror House prevention window

Horror House-GX prevents the opponent from playing cards from hand during the next turn.

### If ADP is not yet funded

The lock denies the next hand attachment of Double Dragon Energy and Supporter/Stadium setup. This can delay Altered Creation and is high-value.

### If ADP already has a payable DDE attached

Horror House does **not** prevent ADP from declaring Altered Creation-GX. The attack uses the already-attached Energy and is a board action.

So:

> Horror House is prevention only if it actually removes the missing hand-play channel. It is not a blanket answer to a funded ADP.

The policy must inspect the visible attached Energy before crediting the lock.

## Starting orientation

### New Moon goes second

A first-turn Horror House is valuable if ADP lacks a payable attached DDE. It can deny the turn-two hand attachment/setup that would enable the GX.

If ADP is already funded from the source first turn, New Moon needs to compare immediate Dragon KO setup against a lock that does not stop the GX.

### New Moon goes first

Rank 19 gets a going-second attack turn before New Moon can attack. If the source can fund ADP and use Altered Creation on that turn, New Moon's turn-two policy must immediately switch to the boosted Prize map and prioritize a Fairy-Zone Dragon KO / safe Active rather than continuing the generic Horror-House hand-compression script.

## Required acceptance cases

1. **R19-ADP-FUNDED-HORROR:** ADP already has a payable DDE and Horror House is legal. Must not claim Horror House prevents Altered Creation.
2. **R19-ADP-UNFUNDED-HORROR:** ADP lacks payable attached Energy and the missing line depends on cards from hand. Must value Horror House's denial of attachment/setup.
3. **R19-BOOSTED-PRIZE-MAP:** Altered Creation bonus is live. Must score TAG KO as four Prizes, two-Prize Rule Box as three, one-Prize Active as two.
4. **R19-RONDO-BOLT:** Fairy Zone live, Clefairy has two Energy, total Bench >=5, Raging Bolt Active. Must recognize clean 240 KO.
5. **R19-RONDO-ADP:** Fairy Zone live, total Bench >=6, ADP Active. Must recognize clean 280 KO.
6. **R19-FLUTTER-ACTIVE-CLEFAIRY:** Flutter Mane Active and Clefairy Active. Must suppress Fairy Zone and not apply Psychic Weakness.
7. **R19-FLUTTER-MEWTWO:** Flutter Mane Active and Mewtwo Active. Must suppress Perfection and route to a direct/non-Ability attack option if available.
8. **R19-PATH-FAIRY-ZONE-CONTENTION:** Fairy-Zone KO exists but Path would self-suppress it without New Moon protection. Must compare and may decline Path.
9. **R19-ROADBLOCK-RONDO:** Sudowoodo caps candidate Bench at four. Must still count both players' actual Benched Pokémon for Full Moon Rondo rather than treating Roadblock as a fixed Rondo damage cap.

## Retention consequence

Rank 19 is dangerous precisely because New Moon lacks Ranger, but the fixed 60 has a coherent answer package: prevent an unfunded ADP GX with Horror House when possible, then exploit Fairy Zone and direct Psychic attacks to remove Dragon attackers quickly while respecting the boosted Prize map.

This family should be added to the New Moon acceptance contract before policy implementation. It does not yet justify a card change or establish a qualified matchup.
