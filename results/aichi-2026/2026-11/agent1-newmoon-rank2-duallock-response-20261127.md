# New Moon vs rank-2 Vileplume/Stoutland: treat the lock as an attacker problem, not an Item-out problem

**Agent 1 · 27 November 2026**  
**Decision affected:** adversarial adequacy of unchanged New Moon Lockbreaker v1 after its non-Shadow-Rider retention.  
**Evidence class:** exact rank-2 source 60, supplied card text and Advanced Player's Rulebook, existing rank-2 source-policy research, deterministic damage/Prize arithmetic. **No new native game or matchup win-rate evidence.**

## Decision

The existing New Moon acceptance contract covers rank-15 dual Vileplume, but not the structurally different **rank-2 AOR Vileplume + Active Stoutland** board.

Add rank 2 as a distinct mandatory case. It does **not** currently justify changing the New Moon 60.

The important correction is conceptual:

> Once rank 2 establishes simultaneous Item lock and Supporter lock, stop searching for an Item/Supporter unlock. New Moon's best surviving channels are **Energy, Stadium, Tool, Pokémon Ability, and direct attacks**.

That gives the unchanged list several genuine escape lines.

## Why rank 2 is not rank 15

The exact rank-2 source uses separate Stage-2 families:

- Oddish → Gloom → **Vileplume AOR 3**: Irritating Pollen, passive **Item** lock from Bench or Active;
- Lillipup → Herdier → **Stoutland BCR 122**: Sentinel, opposing **Supporter** lock only while Stoutland is Active.

Existing exact Prize topology puts both chains' physical prerequisites outside the initial Prizes in **86.06286796%** of Basic-valid starts. That is only a prerequisite ceiling, but it is materially higher than rank 15's shared-family dual-Vileplume prerequisite ceiling.

Unlike rank-15 BUS Vileplume:

- Stoutland does **not** prevent Basic Pokémon from attacking;
- the two lock effects can operate simultaneously with Vileplume safely Benched and Stoutland Active;
- Path to the Peak does not switch off either lock because both locking Pokémon lack Rule Boxes;
- opposing Klefki is not the relevant blocker.

Therefore the right New Moon question is: **can an attacker already inside the lock KO Stoutland and reopen Supporters while continuing to function through Item lock?**

## Rules correction — Powerglass remains playable under AOR Vileplume

The supplied Advanced Player's Rulebook treats **Pokémon Tools as a separate Trainer-card type from Items**. It explicitly says older Tool cards that historically had “Item” written on top are not treated as Items under the current rules.

AOR Vileplume says players cannot play **Item cards** from hand. It does not say Pokémon Tool cards.

Therefore, unless another effect is present, AOR Vileplume's Item lock does **not** itself stop New Moon from attaching **Powerglass** from hand.

This matters because Powerglass can keep the Active attacker growing after each attack by attaching a Basic Psychic from discard at end of turn. The lock removes Fog Crystal, Compressor, Secret Box, Cologne, Counter Catcher and Escape Rope access, but it does not erase the Tool/Energy attack engine.

## The fastest deterministic lock escape already in the 60: Lillie's Clefairy ex

Lillie's Clefairy ex is a Basic Psychic Pokémon already present in New Moon.

Its **Full Moon Rondo** costs Psychic + Colorless and does:

`20 + 20 × total number of Benched Pokémon (both players)`.

Stoutland has **140 HP**.

Therefore Full Moon Rondo one-shots a clean Stoutland once the two boards have at least:

`(140 - 20) / 20 = 6 total Benched Pokémon`.

That threshold is not exotic in this matchup:

- rank 2's lock board already wants Vileplume plus other setup/evolution pieces;
- New Moon can continue attaching **Telepathic Psychic Energy** under Item/Supporter lock, because TPE is an Energy-card effect;
- each TPE attachment can legally Bench up to two Basic Psychic Pokémon;
- New Moon can still play **Sky Field** or another Stadium because Stoutland blocks Supporters and Vileplume blocks Items, not Stadiums.

This creates a direct in-lock plan:

1. get Clefairy into play (naturally or via TPE);
2. attach two Psychic-providing Energy over the available turns;
3. deliberately maintain at least six total Bench bodies across both sides when that does not create a worse tactical liability;
4. use Full Moon Rondo to KO Active Stoutland;
5. regain Supporter access on the following candidate turn while Vileplume Item lock remains.

This attack does not rely on Mewtwo's Perfection, Cologne, Field Blower, a Supporter, or an Item.

### Secondary deterministic attacker channels

- **Mewtwo & Mew-GX / Night Watch:** three Psychic, 150 damage, exact clean Stoutland KO if Perfection is available. Rank 2 does not itself carry a general Ability lock in the published 60.
- **Latias ex / Eon Blade:** three Energy, 200 damage, clean Stoutland KO without Perfection.
- **Lunatone / Moon Press:** three Energy, 100 damage; needs prior damage.
- **Galarian Articuno V / Psyray:** three Energy, 110 plus Confusion; needs prior damage.
- **Cursed Blast:** can put 50 counters on Stoutland before attacking, lowering the required Rondo bench threshold, but each use self-KOs Dusclops and gives the opponent a Prize. Stealthy Hood on Stoutland prevents the Cursed Blast Ability effect and must be respected.

Night Watch and Eon Blade are slower but unconditional on Bench count. Full Moon Rondo is the most important acceptance case because it reaches 140 at only two Energy.

## Path is still useful, just not as a lock remover

Path to the Peak does **not** turn off AOR Vileplume or Stoutland.

It can still turn off rank-2 Rule-Box support, notably Pidgeot ex's Quick Search and Vileplume-GX's healing Ability.

If New Moon is using **direct Clefairy or Latias attacks**, Path's self-suppression of Rule-Box Abilities is much cheaper than when the line requires Mewtwo Perfection.

So under an established dual lock, a policy should compare:

`Path + direct Clefairy/Latias attack`

against:

`leave Stadium neutral + Mewtwo Perfection attack`.

Do not score Path solely by whether it removes the two named locks.

## Pre-lock orientation is asymmetric

### New Moon goes first

Rank 2 goes second and can use Bunnelby with TM: Evolution and its double-attack Ancient Trait to accelerate Stage-2 chains on its first turn. This means New Moon may face Item lock before its turn two.

The pre-lock turn-one priority is therefore **not generic board fill**. It is to establish a lock-independent attacker/resource route:

- attacker in play;
- Powerglass when useful;
- Basic Psychic in discard if Powerglass will need it;
- relevant attack payload in Bench/discard for Perfection if using Mewtwo;
- Duskull only when its future Cursed Blast value exceeds Bench/resource cost.

After the lock lands, TPE, Tools, Stadiums and attacks remain available.

### New Moon goes second

This is the best preventive window. Rank 2 cannot normally evolve on its first turn, and New Moon can attack first.

A first-turn **Horror House-GX** can deny the rank-2 player's next hand plays, including hand-played evolution/setup cards.

But there is a non-obvious exception: if **Grand Tree is already in play**, Horror House does not stop using the Stadium's existing in-play evolution effect on a later legal turn.

Therefore, when Grand Tree is already on the field, New Moon should compare a **Stadium replacement before Horror House**, not blindly attack into the live Tree.

Three useful versions are:

1. **TPE → Solrock + Lunatone → Path → Perfection Horror House**: removes Grand Tree, keeps Perfection live through New Moon, suppresses Rule-Box support, then hand-locks the next turn.
2. **Path → native Gengar Horror House**: works without Perfection if native Gengar is the attacker.
3. **Sky Field → Perfection Horror House**: removes Grand Tree without self-locking Mewtwo when the Solrock/Lunatone pair is unavailable, at the cost of giving both players more Bench capacity.

This is a real connector-choice problem; the best Stadium depends on the attacker and board.

## The Bunnelby promotion trap exists, but the follow-up differs from rank 15

Rank 2's Bunnelby often ends the TM: Evolution setup turn Active while Stoutland is Benched.

If New Moon takes an easy Bunnelby KO, the opponent can promote Stoutland and turn on Sentinel.

That resembles the rank-15 Bunnelby → BUS Vileplume trap, but the correct response is different:

- rank-15 BUS Vileplume can stop Basic attacks, so promotion may blank the main attacker;
- rank-2 Stoutland only locks Supporters, so an already-powered New Moon attacker can still KO it.

Thus the policy should not use a universal “never KO Bunnelby before the lock Pokémon” rule.

It should ask:

**If Stoutland promotes, can my next attack kill it without Item/Supporter assistance?**

If yes, the Bunnelby Prize may be correct. If no, Horror House or additional attacker setup can be superior.

Also, Horror House does not guarantee Bunnelby remains Active: ordinary retreat is a board action, and a Bunnelby already holding sufficient Energy can retreat during the locked turn and promote Stoutland.

## Required actor-visible acceptance cases

Add at least:

1. **R2-DUAL-LOCK-RONDO:** AOR Vileplume Benched, Stoutland Active, Items/Supporters locked, Clefairy has two Energy and total Bench count ≥6. Must choose/strongly value Full Moon Rondo as a clean Stoutland KO.
2. **R2-RONDO-THRESHOLD:** same state with total Bench count ≤5 and no prior Stoutland damage. Must not hallucinate a 140-damage KO.
3. **R2-TOOLS-UNDER-ITEM-LOCK:** AOR Vileplume active in play, Powerglass in hand, legal Tool target. Must keep Powerglass legally playable unless a separate Tool lock exists.
4. **R2-BUNNELBY-PROMOTION:** Bunnelby Active, Stoutland Benched, AOR Vileplume live. Must score Stoutland's promotion before taking the Bunnelby Prize, then allow the KO if an in-lock attacker can remove Stoutland.
5. **R2-HORROR-GRANDTREE:** New Moon goes second, Grand Tree already in play, Horror House legal. Must compare replacing Grand Tree before attacking; do not assume Horror House disables an in-play Stadium effect.
6. **R2-HORROR-RETREAT:** Bunnelby is Active under Horror House with enough attached Energy to retreat and Stoutland Benched. Must expect the board-only retreat → Stoutland promotion line.
7. **R2-PATH-DIRECT-ATTACKER:** simultaneous dual lock with Clefairy/Latias attack available and Pidgeot ex/Vileplume-GX support live. Must recognize Path can suppress Rule-Box support without needing to remove AOR Vileplume/Stoutland themselves.
8. **R2-PRELOCK-POWERGLASS:** candidate goes first with an Item window and expects a turn-one-going-second TM Evolution lock. Must value establishing attacker/Powerglass/Basic-Psychic discard state over low-impact generic setup.

## Retention consequence

Rank 2 is a hard matchup family but it does not currently refute New Moon's architecture.

The unchanged 60 already contains an unusually relevant set of non-Item/non-Supporter tools:

- TPE setup through the lock;
- Powerglass as a Tool, not an Item;
- Full Moon Rondo at a two-Energy 140+ breakpoint;
- Night Watch / Eon Blade deterministic 3-Energy Stoutland KOs;
- Stadium replacement and Path pressure;
- Cursed Blast as a state-dependent damage/prize tool.

A future policy that searches for Cologne/Field Blower/Counter Catcher after AOR Vileplume is established is strategically wrong even if those cards are graph-reachable in the deck. The correct policy must transition to the **in-lock attacker economy**.

No qualified matchup or 99.5% claim is created.
