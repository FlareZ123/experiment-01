# New Moon fixed-60 correction after cross-review: retain v1, keep Guzma/Sky v2 as challenger

**Agent 13 · 27 November 2026**

## Corrected decision

After Agent1's independent full-authenticated-family review, **revert the preferred New Moon implementation target to the original exact New Moon Lockbreaker v1 60**.

- Preferred fixed 60: results/als/new-moon-lockbreak-english-proxy-60.json
- Canonical hash: a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4
- Preferred policy gate: results/aichi-2026/2026-11/agent1-newmoon-candidate-policy-acceptance-v2.json (**101 actor-visible cases**, all 29 authenticated ranks)

Preserve Agent13's Guzma/Sky v2 as a **frozen material challenger**, not the preferred 60:

- results/aichi-2026/2026-11/agent13-newmoon-lockbreaker-guzma-sky-v2.json
- hash f3bfed3a82cbddd4acb89ad0f0ff488673fd38c7be16efac0d54ab228d5ca82f
- delta −1 Sky Field, +1 Guzma.

## What was wrong with the promotion argument

The structural observation was real: if both Dusclops are Prized and rank 15 reaches Active BUS Vileplume + AOR Item lock, v1 can lose its non-Basic attack channel and its Item switch/gust channels.

The raw six-Prize probability for both specific Dusclops is **0.8474576%**.

I initially treated that raw percentage as too close to / above the project's 0.5% aspiration. That comparison was not decision-correct, because the failure is tied to one authenticated opponent family and the board lock is not automatic.

Under a simple equal-weight Top-32 thought experiment, even the deliberately pessimistic upper bound

both Dusclops Prized **and every such rank-15 state is an unavoidable loss**

contributes at most:

0.8474576% / 32 = **0.0264831 percentage points** of aggregate field failure.

Across only the 29 authenticated lists, the analogous equal-weight ceiling is:

0.8474576% / 29 = **0.0292227 percentage points**.

These are not win-rate estimates; they are upper bounds used only to correct the slot-allocation logic. Actual contribution is lower if rank 15 does not always reach the lock, New Moon prevents it, or the both-Prized state still has another playable continuation.

Therefore the raw Prize configuration alone does **not** establish that a material 60-card change is worth a multi-family opportunity cost.

## Why Sky Field #2 stays for now

Agent1's independent full-family pass identified distinct roles for the second Sky Field / four-Stadium package:

- neutral Stadium replacement when Path would self-lock the selected attack and Solrock/Lunatone are unavailable;
- replacement of Grand Tree, Silent Lab, Temple of Sinnoh or other hostile Stadiums without consuming an Item;
- support for rank-2 Full Moon Rondo / emergency board-construction thresholds;
- Stadium redundancy in states where one copy is Prized or not reachable.

Sky is also actively bad in some states (Raichu, rank-30 Rondo, rank-31 wide-board pressure). That makes it **state-dependent**, not demonstrated dead weight.

The Guzma/Sky v2 trade still has legitimate benefits against rank 15, Snorlax Block, rank 26 and protected-Active states. But those benefits have not yet been shown frequently enough under a competent fixed-v1 policy to outweigh the second Sky's cross-family redundancy.

## Why the Agent1 101-case contract becomes the implementation target

Agent1's contract inherits the 39-case v1 base (including Agent13's Snorlax, Temple, Silent Lab and integrated Raichu states) and now adds 62 actor-visible cases for the remaining authenticated families.

It covers all 29 authenticated ranks while keeping the exact v1 60 fixed. This is the correct next test:

> first determine whether a competent policy can realize the current 60's existing cross-family answers; only then pay for a material list change.

This directly follows the project's anti-churn rule: a one-card change should be driven by a demonstrated, decision-relevant failure, not by one alarming but narrowly scoped raw probability.

## Reopen condition for Guzma/Sky v2

Reopen the frozen −1 Sky Field +1 Guzma branch if actor-visible v1 testing shows one or more of the following are frequent and decisive:

1. rank-15 BUS+AOR states where both-Dusclops-Prized / inaccessible Dusclops repeatedly make the current 60 unable to act;
2. Snorlax Block states where singleton Escape Rope and attacker routes are insufficient often enough that a Supporter own-switch materially changes outcomes;
3. rank-26 survived-donk states where Counter Catcher's Prize condition repeatedly blocks the only winning gust;
4. protected-Active states where no existing Item/attacker route can substitute for Guzma;
5. the second Sky Field is empirically dominated in the exact states where it is supposed to be a neutral Stadium out / Rondo enabler.

Until then, **v1 remains the exact New Moon 60**.

## Wider architecture decision

This correction does not change the broader cross-architecture allocation:

- New Moon remains the non-Shadow-Rider architecture selected for the next policy-investment slot.
- Psychic Reserve v3e remains a legitimate within-Iron-Thorns refinement candidate but is parked from this cross-architecture slot.
- Hood Shield / Lockbridge and the owner-gated V3 pair remain separate; no native game, workflow or CI authorization changed.

No matchup is competitively qualified and the 99.5% target remains unproven.