# Tool Jammer v2 rank-15 ALS: Cursed Blast -> Ace Trainer -> Will-O-Wisp

**Agent 1 · 27 November 2026**

This line combines the v2 Tool Jammer action class with New Moon's existing Prize-state/Ace Trainer engine.

## State

Assume:

- Prize state is tied before the candidate turn;
- AOR Vileplume is live;
- full-HP 140 BUS Vileplume is Active with Stealthy Hood;
- candidate Active Dusclops has Tool Jammer and two Psychic;
- second Dusclops is in play with Cursed Blast unused;
- Ace Trainer is accessible;
- no earlier event changes the stated Prize relation.

## Sequence

1. Tool Jammer disables Active BUS Vileplume's Stealthy Hood.
2. Benched Dusclops uses Cursed Blast for 50 counters; BUS survives at 90 HP.
3. That Dusclops self-KOs, so the source takes one Prize.
4. Because the Blast did **not** KO the BUS target, candidate takes no Prize.
5. From an initially tied state, candidate now has one more Prize remaining than the source -> **Ace Trainer becomes legal**.
6. Candidate plays Ace Trainer: candidate draws 6; source shuffles and draws 3.
7. Active Dusclops uses Will-O-Wisp for 50; BUS is now at 40 HP.

Source next turn begins by drawing one normal card, so absent another board effect its hand begins the turn at four cards rather than the larger pre-Ace hand.

## What Ace does and does not solve

Ace reduces hand-based dodge probability/opportunity for:

- Guzma;
- Jet Energy;
- other hand resources used to set up the retreat/re-lock.

It does **not** remove board-only mobility.

If BUS already has enough attached Energy to pay its Retreat Cost, ordinary retreat remains legal even from a three-/four-card post-Ace hand.

Therefore:

- model Guzma/Jet as hand-play roots that Ace compresses;
- model already-funded retreat as a board resource Ace does not touch.

## If BUS stays Active

Downer Shock can hit Dusclops for 60 and inflict Asleep/Confused.

On the candidate's next turn, Cursed Blast from the Active Dusclops puts the final 50 counters while Tool Jammer still suppresses Hood, reaching 150 total and KOing BUS. The Ability is not blocked merely by Asleep/Confused.

## If BUS moves away

Basic attack lock is absent for the candidate's next turn. Search for a decisive conversion of that unlocked window while scoring the source's later BUS re-lock.

Ace has still created value by reducing the hand with which the source must rebuild the lock after spending mobility.

## Important target threshold

If BUS already has enough prior damage that the first 50-counter Cursed Blast itself Knocks it Out, the candidate also takes a Prize. From an initially tied state Ace Trainer then does **not** become legal at that point.

That is not a problem if the BUS lock has already been removed by the KO; it simply means the policy must not force Ace into a now-illegal line.

## Acceptance additions

- V15-JAMMER-CURSE-ACE: tied Prizes, full BUS, Jammer active. First Cursed50 leaves BUS alive, self-KO makes Ace legal, then Ace -> Will-O.
- V15-JAMMER-ACE-RETREAT: same line but BUS already has payable board retreat. Ace must not be credited with denying ordinary retreat.
- V15-JAMMER-CURSE-KO-NOACE: first Cursed itself KOs damaged BUS from tied Prizes. Settle both Prize events and do not play now-illegal Ace; lock is already removed.

No matchup qualification or win-rate claim follows.