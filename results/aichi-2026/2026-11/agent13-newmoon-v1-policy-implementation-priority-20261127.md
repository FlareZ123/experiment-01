# New Moon v1 — policy implementation priority after full-family cross-review

**Agent 13 · 27 November 2026**

Preferred fixed 60: New Moon Lockbreaker v1, hash `a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4`.

Preferred acceptance gate: Agent1's 80-case actor-visible contract.

## Purpose

Do **not** implement the 80 cases in arbitrary order. Start with states that can falsify the exact 60 or reopen a material redesign. A policy that passes easy search/damage cases while failing one structural lock state has not advanced the deck decision.

## Tranche A — fixed-60 falsification cases

These should be implemented first.

### A1. Rank 15 dual Vileplume with Prize collapse

Test at least:
- BUS Vileplume Active + AOR Item lock;
- both Dusclops known Prized at K1;
- pre-lock / promotion-trap states where Horror House can still act;
- Hood attached vs not attached;
- final-Prize exception.

Why first: this is the state that generated the Guzma challenger. If competent v1 policy repeatedly cannot prevent or escape it, there is a concrete reason to reopen material redesign. If policy prevents it reliably, the raw 0.8475% Prize configuration is not enough to change the 60.

### A2. Rank 2 AOR Vileplume + Active Stoutland

Test the real in-lock solution:
- TPE / Tool / Stadium / attack actions remain available;
- Full Moon Rondo reaches the 140-HP Stoutland threshold;
- Grand Tree / hostile Stadium order is correct before lock;
- no Supporter action is hallucinated while Sentinel is Active.

Why first: this is a true dual action-class lock and therefore tests whether the fixed 60 has an attack economy independent of Items and Supporters.

### A3. Rank 26 opening survival

Test both orientations and:
- pre-game two-Basic setup;
- sole-Klefki / non-Klefki lone Active;
- first-turn TPE / Basic search Bench construction when New Moon receives a turn;
- five-donated-Prize conversion after survival.

Why first: this is an immediate game-loss layer. No later consistency or control value matters if the policy voluntarily ends with no Bench.

### A4. Snorlax Block / own-switch scarcity

Test:
- support Basic trapped Active;
- singleton Escape Rope preservation vs spending now;
- attack-out via developed Dusclops;
- repeated opponent gust pressure.

Why first: if v1's one direct own-switch card is genuinely inadequate under competent stall policy, this is another concrete material-redesign trigger.

## Tranche B — lock-window sequencing

These determine whether existing v1 cards are being used strongly enough before changing them.

### B1. Garbodor
- all live Garbotoxin Tools must be removed before Perfection is credited;
- compare Blower → Horror House protected re-tool window vs immediate damage;
- reject one-Blower release when three Tool-enabled Garbodor are live.

### B2. Iron Thorns
- native Gengar line independent of Perfection;
- going-second fresh-Gengar survival vs going-first damaged-Gengar failure;
- Klefki one-Prize buffer with gust counterexamples;
- Wondrous Labyrinth attack-cost validation.

### B3. Rank 1 Shadow Rider
- late Klefki self-lock vs Evolution VMAX;
- Solrock/Lunatone + Path asymmetry;
- Marshadow already Benched vs not in play;
- never equate Ability-engine suppression with attack suppression.

### B4. Silent Lab / Temple
- Silent Lab removes Lunatone's Basic Ability; pair cannot self-bootstrap;
- Temple preserves TPE attachment-time search but changes attached Energy provision;
- Stadium replacement must re-evaluate continuous effects immediately.

## Tranche C — board-width / distributed-damage policy

### C1. Regidrago
- TPE may choose 0/1/2 targets under Phantom Dive;
- Duskull exception when Stage-1 continuation is needed;
- Covert Flight protected Active and non-Basic/effect alternatives.

### C2. Raichu/Electrode
- Prize-donation order;
- Electro Rain distributed Bench KOs;
- Path / native Horror House windows;
- do not widen Bench past a six-Prize frontier.

### C3. Raging Bolt / Sudowoodo
- Roadblock Bench cap;
- Klefki suppression then Roadblock reactivation on switch;
- Path suppresses Rule-Box acceleration but not an already-funded Bellowing Thunder.

### C4. Rank 30 / 31
- opponent Full Moon Rondo prices candidate Bench width;
- Bell of Silence blocks Tapu-Lele-from-hand Supporter access;
- opposing Cursed Blast prices 60-HP support bodies and changes both Prize maps.

## Tranche D — lower-leverage connector / cleanup cases

After A–C are stable:
- Secret Box line-first DCI gate;
- redundant/dead card discard cases;
- ordinary Stadium replacement where no lock is imminent;
- already-dominated generic setup choices.

These matter, but they are less likely to decide whether the exact 60 should change.

## Material redesign trigger

Do not reopen Guzma/Sky v2, third Dusclops, Gladion, Ranger, or another slot change merely because a single acceptance state is awkward.

Reopen list construction only when a Tranche-A or repeated Tranche-B failure demonstrates:
1. the opponent line is legal and source-consistent;
2. v1 has no coherent actor-visible response under competent policy;
3. the failure is frequent / strategically weighted enough to matter across the field rather than being a tiny one-opponent configuration;
4. a proposed card change fixes the failure without creating a larger cross-family regression.

This ordering is intended to make the next implementation **falsification-driven rather than coverage-driven**.

No native game or competitive qualification is created by this memo.