# New Moon retention adversarial review: Raichu/Electrode is the missing policy family

**Agent 1 · 27 November 2026**  
**Decision affected:** whether unchanged New Moon Lockbreaker v1 remains worth the next non-Shadow-Rider policy-investment slot.  
**Evidence class:** exact rank-4/rank-17 source inventories, supplied card text/rules, deterministic Prize-state arithmetic, and prior Raichu/New Moon research already preserved in this repository. **No new game, native CI, or win-rate estimate.**

## Decision

**Retain New Moon, but amend the policy-investment gate before implementation.** The current 23-case New Moon acceptance contract misses the Raichu/Electrode family even though:

- exact published ranks **4 and 17** are Raichu/Electrode Combo;
- the original New Moon pilot's first reported loss was to Raichu/Electro Rain and explicitly blamed a wrong Cursed Blast target followed by inability to clear Klefki;
- the Raichu engine attacks New Moon along a different axis from the already-covered Iron Thorns/Garbodor/Vileplume cases: **Basic-Ability suppression + deliberate Prize donation + multi-target distributed damage**.

This omission does **not** justify a card change. The unchanged 60 has coherent responses, but a worker that passes the existing 23 cases can still be strategically incompetent into ranks 4/17.

## Exact opponent structure that matters

Both published ranks 4 and 17 contain:

- Electrode-GX CES 48 ×3;
- Alolan Raichu UNM 57 ×2;
- Voltorb ×2;
- Klefki SVI 96 ×1;
- Gengar & Mimikyu-GX ×1;
- Reversal Energy ×4;
- Counter Energy ×4;
- Unit Energy LPM ×4;
- Escape Rope ×3.

Electrode-GX's **Extra Energy Bomb** attaches five Energy cards from the discard to non-GX/non-EX Pokémon, then Knocks Out Electrode-GX. The opponent therefore deliberately gives New Moon two Prizes while accelerating Alolan Raichu.

Alolan Raichu's **Electro Rain** discards any amount of Lightning Energy and makes one 30-damage selection for each Energy discarded; the same target may be selected repeatedly. Under the exact printed Prize-deficit conditions, one Reversal Energy supplies three Energy and one Counter Energy supplies two. The existing exact arithmetic gives a one-Bomb upper envelope of:

`4 Reversal + 1 Counter = 14 Lightning Energy units = fourteen 30-damage selections`.

Both lists also have Telescopic Sight, which adds 30 damage once to each eligible Benched Pokémon V/GX damaged by the equipped attack.

The lists diverge in one important response channel:

- **rank 4** has no Marshadow and carries three Sky Field;
- **rank 17** has Marshadow UNB 81 with Resetting Hole plus PokéStop.

That makes an already-Benched rank-17 Marshadow materially different from a Marshadow that is still in hand/deck when Horror House-GX resolves.

## Adversarial case 1 — Klefki does not stop Electrode

An opposing Active Klefki removes Abilities from **Basic** Pokémon. This suppresses New Moon's Basic Mewtwo & Mew-GX **Perfection**, but Electrode-GX is Stage 1, so its Extra Energy Bomb remains available.

It also suppresses New Moon's Basic Lunatone **New Moon** Ability. Therefore an actor policy must not reason:

`opponent Klefki Active -> build Solrock/Lunatone -> Path is one-sided`.

While Klefki remains Active, Lunatone is off.

This is especially dangerous because a competent Raichu pilot can sequence Basic draw/setup Abilities first, then move Klefki Active, leave Stage-1 Electrode usable, Bomb, promote/position Alolan Raichu, and attack. Moving Klefki away re-enables New Moon's Basic Abilities, but that happens only after Raichu has obtained its own attack turn.

## Candidate response 1 — Path + **native** Gengar is a real independent branch

New Moon does not need Perfection to use the printed attacks of its own Gengar & Mimikyu-GX.

If:

- native Gengar is attack-ready;
- GX is unused;
- Path to the Peak is playable;
- the opponent has no already-established board-only Stadium removal;

then:

1. play **Path to the Peak**, turning off Electrode-GX's Rule-Box Ability;
2. use native **Horror House-GX**, which is unaffected by the opponent's Klefki because it is an attack, not an Ability;
3. on the locked opponent turn, hand-played replacement Stadiums, hand-played Marshadow, Evolutions and other cards cannot be played.

This is stronger than automatically spending Canceling Cologne merely to recover Perfection for one turn.

The source-specific exception is rank 17: if Marshadow UNB is **already on the Bench**, Resetting Hole is an in-play Ability and Horror House does not stop it. If Marshadow is not already in play, Horror House blocks playing it from hand during that turn. Rank 4 lacks this board-only Marshadow out.

**Policy consequence:** compare native-Gengar + Path against Cologne/Perfection. Do not treat Cologne access as success when a more durable connector use exists.

## Adversarial case 2 — one Bomb has a six-Prize source-inventory frontier against New Moon

New Moon contains several Sight-eligible V/GX Pokémon plus many 60-HP support Basics.

For an undamaged Benched target under Telescopic Sight, the number of 30-damage Electro Rain selections needed is:

| New Moon target | HP / Prizes | Sight eligible | Selections to KO |
|---|---:|---|---:|
| Gengar & Mimikyu-GX | 240 / 3 | yes | **7** (210 + 30 Sight) |
| Mewtwo & Mew-GX | 270 / 3 | yes | **8** (240 + 30 Sight) |
| Tapu Lele-GX | 170 / 2 | yes | **5** (150 + 30 Sight) |
| Galarian Articuno V | 210 / 2 | yes | **6** (180 + 30 Sight) |
| Unown / Duskull | 60 / 1 | no | **2** |

Thus the 14-unit one-Bomb envelope can, in a legal five-Bench inventory configuration, take all six Prizes in one attack, for example:

`Gengar & Mimikyu-GX (7) + Tapu Lele-GX (5) + one 60-HP Unown/Duskull (2) = 14 selections = 6 nominal Prizes`.

Another source-inventory example is native Gengar plus three 60-HP support Basics:

`7 + 2 + 2 + 2 = 13 selections = 6 nominal Prizes`.

These are **constructed source-inventory frontiers, not occurrence probabilities**. They are enough to falsify any New Moon setup heuristic that treats extra Bench bodies as free value.

### Candidate response 2 — narrow the Bench specifically against Raichu

Against ranks 4/17:

- prefer putting the Gengar donor in the **discard** rather than on the Bench when Perfection is the intended line and Battle Compressor/another legal route exists;
- allow TPE to take **0 or 1** targets rather than automatically 2;
- do not bench Tapu Lele-GX, Galarian Articuno V, extra Unown, or Duskull merely for generic future value if the current line does not require them;
- avoid Sky Field board expansion unless the immediate benefit exceeds the Electro Rain Prize frontier;
- after Raichu has a credible Bomb line, evaluate every new Bench occupant by **packets-to-KO and Prize yield**, not by search/connectivity value.

This extends the same “access is not success” principle already seen in Regidrago spread and Snorlax Block, but with a different objective: deny an opponent a distributed six-Prize attack.

## Adversarial case 3 — Cursed Blast can manipulate the Energy multiplier, but only at a precise Prize count

The original New Moon line deliberately self-KOs Dusclops. Against Raichu this is not merely an Ace Trainer enabler; it changes whether Reversal/Counter Energy provide Lightning.

Assume no other Prize changes and both players start with six Prizes.

| New Moon Cursed-Blast self-KOs before first Electrode Bomb | New Moon Prizes remaining after Bomb | Raichu Prizes remaining after Bomb | Raichu Reversal/Counter multiplier |
|---:|---:|---:|---|
| 0 | 4 | 6 | **on** |
| 1 | 4 | 5 | **on** |
| 2 | 4 | 4 | **off** |

Reason: each Dusclops self-KO gives Raichu one Prize; the first Electrode-GX self-KO gives New Moon two. With two prior Dusclops self-KOs, the first Bomb merely restores Prize parity. Reversal/Counter then provide only Colorless; only Unit Energy LPM remains inherently Lightning.

There are major constraints:

- both Duskull→Dusclops chains must be live before the Bomb;
- **one** Cursed Blast self-KO does not solve the multiplier;
- if the two Cursed Blasts also KO an opposing one-Prize Pokémon before the Bomb, New Moon itself takes a Prize and the parity arithmetic changes back in Raichu's favor;
- a second Electrode Bomb can recreate a Raichu Prize deficit;
- Raichu can alter the Energy mix and attach Unit Energy;
- donating two Prizes can simply lose if the board does not exploit the parity turn.

So this is not an automatic tactic. It is a **state-dependent counterline that the policy must be capable of evaluating**, and it explains why Cursed Blast target choice can matter even when the 50 counters do not immediately remove the lock Pokémon.

## Starting orientation

### New Moon goes second

This is the strongest anti-combo window. Neither side can evolve on its first turn, and New Moon can attack on its first turn going second. A legal first-turn **Horror House-GX** can therefore deny the opponent's next hand-play evolution into Electrode-GX / Alolan Raichu, along with Energy, Stadiums and other hand cards.

The worker should value this as **denying the combo turn**, not merely as zero-damage hand disruption.

### New Moon goes first

New Moon cannot attack on turn one. On its turn two—immediately before Raichu's second turn can evolve/Bomb/attack—it must compare:

- Path + native Horror House;
- Cologne/Perfection Horror House if Klefki is Active;
- Escape Rope / positioning to create a one-turn Perfection window;
- the rare double-Dusclops Prize-parity line;
- immediate KO/gust if it actually ends the combo;
- ordinary damage only after the opponent's strongest Bomb/attack reply is scored.

## Required acceptance delta

Before New Moon is called policy-ready, add at least these actor-visible cases:

1. **RAI-KLEFKI-STAGE1:** opposing Klefki Active + live Benched Electrode-GX. Must recognize that Perfection/Lunatone are suppressed but Electrode-GX is not.
2. **RAI-PATH-NATIVE-HORROR:** native Gengar ready, Path playable, Electrode live, no board-only Stadium removal. Must compare Path → native Horror House against Cologne/Perfection.
3. **RAI-R17-MARSHADOW:** same state with rank-17 Marshadow already Benched. Must not credit Horror House with protecting Path from Resetting Hole.
4. **RAI-BENCH-FRONTIER:** a legal TPE/Bench choice would create a 14-packet six-Prize Electro Rain frontier. Must permit fewer targets / narrower Bench.
5. **RAI-PARITY-TWO-DUSCLOPS:** two Cursed Blast self-KOs can occur before the first Bomb with no opposing KO. Must recognize first Bomb restores parity and disables Reversal/Counter multiplier.
6. **RAI-PARITY-ONE-DUSCLOPS:** only one self-KO occurred. Must not hallucinate parity; multiplier remains live after the first Bomb.
7. **RAI-GOING-SECOND-PREEVOLUTION:** first-turn Horror House is legal before Electrode/Raichu can evolve. Must value denial of the evolution/combo turn.

## Retention consequence

This review **does not park New Moon**. It strengthens the architecture case by identifying a real response tree without adding cards:

- native Gengar gives a non-Ability attack channel;
- Path directly suppresses Electrode-GX;
- Horror House can protect that suppression from hand-based answers;
- Bench minimization attacks Electro Rain's Prize conversion;
- Dusclops can, in rare exact states, manipulate the Prize condition powering Reversal/Counter.

But ranks 4/17 are now a **mandatory retention gate**, not an omitted family. If a future actor-visible policy cannot handle these cases, the current “retain New Moon for policy investment” decision should be reconsidered before spending native/full-game compute.

No matchup is qualified and no 99.5% claim is created.
