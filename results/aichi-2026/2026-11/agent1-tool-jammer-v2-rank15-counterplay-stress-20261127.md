# Tool Jammer v2 rank-15 counterplay stress test

**Agent 1 · 27 November 2026**

**Conclusion:** Tool Jammer v2 still improves the parent action graph, but the Hooded-BUS line is a **forcing unlock sequence**, not a guaranteed permanent KO. Exact rank-15 mobility can move BUS Vileplume off Active before the final Cursed Blast.

## Exact source mobility

Authenticated rank 15 includes:

- 2 Guzma;
- 2 Jet Energy;
- multiple ordinary Energy / retreat resources;
- BUS Vileplume as the Basic-attack lock.

After New Moon reaches:

`Active Dusclops + Tool Jammer; BUS Vileplume Active + Hood; second Dusclops available`

and executes:

`Bench Cursed Blast 50 -> Active Will-O-Wisp 50`,

BUS is at 100 total damage, 40 HP remaining.

If the source simply stays Active, next-turn Active Cursed Blast is a deterministic 50-counter finish even through Asleep/Confused, because the Ability remains usable and Tool Jammer still disables Hood.

## Source counter: move BUS off Active

Before that final Cursed Blast, rank 15 can attempt to move BUS to the Bench by:

- Guzma (which also changes candidate Active);
- Jet Energy on a Benched source Pokémon;
- ordinary retreat if payable.

Once BUS leaves Active:

- Disgusting Pollen stops applying immediately;
- candidate Basic Pokémon may attack again;
- Tool Jammer no longer suppresses the now-Benched BUS's Hood;
- Cursed Blast cannot simply snipe the Hooded BUS on Bench.

Therefore the v2 policy must treat the result as a **temporary unlocked window**, not as 'BUS solved forever'.

## Source can re-lock

If BUS remains alive on the Bench, the source may later return it Active.

New Moon's exact 60 has no Supporter gust. While AOR Vileplume remains live, Counter Catcher / Escape Rope / Field Blower / Cologne are Items and cannot be played.

So the candidate may not be able to re-target the Hooded BUS directly during the unlocked turn.

A source line such as:

`Guzma BUS to Bench -> candidate gets one unlocked turn -> source later re-promotes BUS`

is strategically real.

## Why the forced unlock still matters

Moving BUS off Active is not free:

- Guzma consumes the source Supporter for the turn and hand resource;
- Jet Energy consumes the normal Energy attachment and a card from hand;
- ordinary retreat consumes attached Energy and requires a legal Benched replacement;
- the source relinquishes Basic-attack lock for the candidate's next turn.

That unlocked turn permits New Moon to:

- use Mewtwo Perfection / native Basic attackers again;
- play Tapu Lele-GX Wonder Tag if hand-play/Ability conditions permit;
- use Latias Skyliner to improve mobility;
- take a Prize / remove the new Active;
- use Horror House if GX remains and a hand lock meaningfully disrupts the re-lock;
- rebuild board/Energy while AOR Item lock still remains.

The policy must search for an **immediate decisive conversion** of that unlocked turn rather than automatically attacking the sacrificial Active.

## Important promotion nuance

If New Moon uses the unlocked turn to Knock Out the source's temporary Active, rank 15 chooses a replacement immediately after the KO.

It may simply promote BUS Vileplume again, restoring Basic-attack lock before the candidate receives another turn.

Therefore:

- a one-Prize KO of the temporary Active is not automatically a successful conversion;
- final-Prize wins remain decisive;
- lines that permanently remove AOR/BUS resources or establish a stronger lock can be superior to a low-value KO.

## Tool Jammer host manipulation

Guzma can also choose which candidate Benched Pokémon becomes Active while moving BUS away.

If it promotes a weak Basic:

- Basic attacks are now legal because BUS left Active;
- Latias Skyliner may provide free retreat if live;
- normal retreat may recover the intended attacker;
- AOR Item lock still removes Escape Rope.

Thus the v2 policy must score source **position manipulation** together with the temporary unlock.

## Updated v2 value proposition

Tool Jammer does not guarantee the rank-15 matchup.

It still creates a material new branch unavailable in v1:

1. BUS stays Active -> it is forced into the 150-damage two-Dusclops finish;
2. BUS leaves Active -> source must relinquish Basic-attack lock for at least the candidate's next turn and often spend Supporter/Energy/mobility to do it.

That is a forcing fork, not a silver bullet.

## Acceptance corrections

- V15-JAMMER-SOURCE-RETREAT must score an unlocked **window** plus the source's strongest re-lock route; it must not call BUS permanently solved.
- V15-JAMMER-TEMP-ACTIVE-KO: if candidate can KO the temporary source Active but BUS can be promoted immediately afterward, compare that re-lock before taking a low-value Prize.
- V15-JAMMER-GUZMA-POSITION: source Guzma moves Tool-Jammer Dusclops away and BUS to Bench. Recompute candidate Active, free-retreat options and the unlocked Basic attack set.

v2 remains the preferred paper challenger over v1 because the parent lacks this forcing fork entirely, but the rank-15 family remains **unqualified**.

No win-rate or 99.5% claim follows.