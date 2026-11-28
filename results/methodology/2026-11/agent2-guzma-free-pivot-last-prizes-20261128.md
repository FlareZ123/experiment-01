# Guzma → Latias ex free pivot → powered Max Geist: missed final Prize line (28 November 2026)

**Agent:** 2. **Problem class:** multiple real sequential actions / tactical line, **not** another passive Ability allowlist or cosmetic card-list swap. **Evidence:** source-verified card text and executable JavaScript decision calls against the exact two-profile successor worker; no native Store, game, CI, or matchup win-rate evidence.

## The missed line

Both fixed Shadow Rider candidate lists have one **Guzma BUS115**, one **Latias ex SSP76**, and multiple **Shadow Rider Calyrex VMAX CRE75**. The provided source card text says:

- **Guzma** switches one opposing Benched Pokémon Active, *then* forces the player to switch their own Active with one of their Benched Pokémon. Playing it does **not** consume the once-per-turn normal retreat.
- **Latias ex Skyliner** gives all Basic Pokémon in play no Retreat Cost while the Ability operates. Latias is Basic; once it becomes Active via Guzma, it can retreat for zero Energy provided that turn's retreat is still available and the Ability is not suppressed.
- **Shadow Rider VMAX Max Geist** deals `10 + 30 × total Psychic Energy cards attached to your Pokémon`. Three basic Psychic Energies on VMAX produce 100 damage. **Dedenne-GX UNB57** is a 160-HP, two-Prize GX; a Dedenne carrying 80 damage is a legal final two-Prize target.

An example with own Active VMAX (three Psychic), own Benched Latias ex, own two Prizes left, opponent Active undamaged Regidrago VSTAR, and opponent Benched Dedenne-GX at 80 HP remaining:

```text
Guzma: switch Dedenne-GX into opposing Active
     → compulsory switch powered VMAX to own Bench, Latias ex to own Active
Retreat Latias ex (Skyliner: cost 0, retreat not used)
     → promote the same powered VMAX
Max Geist (100 damage to Dedenne's remaining 80 HP)
     → KO the GX, take final two Prizes and win
```

Of the 29 exact source-rank 60-card inventories, **18** contain at least one Dedenne-GX (ranks 4, 5, 8–10, 12–14, 16, 18–22, 26, 27, 30, 32). The line is a plausible *tactical opportunity*, not a claim it occurs with any particular frequency. It also applies to other eligible Benched targets given the proper Prize and HP conditions. The opportunity is more significant than direct 100-damage attacks against full-health, higher-HP Regidrago.

## Why the source policy makes the wrong choice

The exact existing candidate worker `simulation/evaluation/2026-11/agent46-two-profile-candidate-policy.cjs` at Git blob `813f22634f8f162d1da3659ad5c5d2d6da32103b`:

1. `guzmaPlans(view)` enumerates the opponent gust and the **compulsory own switch**, but its `guzmaProjectedFinalAttack` and `bestAttackForSlot` check only the new own Active immediately after the forced switch.
2. When that new Active is an uncharged Latias, it has no payable attack, so the planner concludes there is no terminal Guzma route; it omits the *legal free retreat back to the original attacker*.
3. `choosePokemonRecipient` applies the same one-switch-only terminal assumption at the subsequent Guzma **own Pokémon** selection prompt, so even a root-level Guzma fix alone would not reliably select the correct pivot with multiple Benched Pokémon.

The original worker instead chose `Max Geist` for 100 damage against full-health Regidrago (not a KO), leaving the two-Prize final gust available but unexecuted.

## Bounded proposed policy change

The executable reproducer linked below implements this source-test-only patch *in memory*. It adds `guzmaFreePivotFinal(before,after,ownIndex)` that checks **all** of the following before certifying a projected final attack:

- A legal own Bench pivot was chosen, with the **original Active** now at that same Bench index; fail closed if the identity differs.
- The normal retreat has **not already been used** this turn, as proven by the current root's `globalTurn` and `retreatedTurn` stamp.
- `ownRetreatCost(after) === 0` **in the projected post-Guzma game state**. This handles working Skyliner or a live Float Stone, but not unknown/suppressed Abilities, dead Tools, or unaffordable paid retreats.
- A virtual retreat returns the previous attacker to Active, marks that turn's retreat spent, and `guzmaProjectedFinalAttack` certifies an **actual payable direct last-Prize attack** against the gusted target, with existing damage/immunity/remaining-HP restrictions still enforced.

The owner-side insertions are inside `guzmaPlans` and `choosePokemonRecipient` only. The latter prioritizes a **certified terminal pivot** over the nonterminal `guzmaPivotScore` when selecting the compulsory own switch. Other root actions retain their current priority, and the legal native frontier remains authoritative. No speculative draws, extra manual Energy, paid-retreat enumeration, absent Guzma, or illegal after-attack actions are assumed.

### Executable paired policy test

Self-contained, dependency-free source policy reproducer:

[**agent2-guzma-free-pivot-final-reproduce.cjs**](agent2-guzma-free-pivot-final-reproduce.cjs)

It takes the *trusted actual worker source* as an argument to exported `run(source)`, first rejects missing/duplicate code anchors, compiles original and bounded in-memory patch, then executes both source-bound candidate profiles and physical seats. It does not edit the successor or talk to the engine.

| Actor-visible test state | Baseline root | Patched root |
| --- | --- | --- |
| Live Skyliner, one Latias pivot, Dedenne 80 HP remaining, two Prizes needed | attack Regidrago | **Guzma** |
| Live Skyliner, Latias plus uncharged VMAX on Bench, same final target | attack Regidrago | **Guzma** |
| Normal retreat already spent during this turn | attack Regidrago | attack Regidrago |
| Skyliner suppressed, Latias not equipped | attack Regidrago | attack Regidrago |
| Skyliner suppressed, but Latias has *effective Float Stone* | attack Regidrago | **Guzma** |
| Skyliner suppressed and Float Stone inactive | attack Regidrago | attack Regidrago |
| Benched Dedenne full 160 HP (Max Geist nonlethal) | attack Regidrago | attack Regidrago |
| Three own Prizes remaining versus two-Prize target | attack Regidrago | attack Regidrago |
| Only an unfunded, nonfree Shadow Rider V as pivot | attack Regidrago | attack Regidrago |
| Current opposing Active **already** is damaged Dedenne for direct final KO | **Max Geist** | **Max Geist** |
| Only opposing Benched Mimikyu PAL protected by **Safeguard** | attack Regidrago | attack Regidrago |

Every row × both exact profiles × both physical seats = **44 paired root scenarios (88 actual source-worker root calls), 44/44 expected pairs, 12 intended Guzma upgrades and 32 unchanged controls, zero errors.**

**Real continuation on the policy interface:** for the two-own-Bench scenario, after selecting Guzma, a synthetic owner-visible card-effect prompt contains Dedenne and another opposing Bench target. The patched worker chooses **opponent-0 (Dedenne)**. After the gust, the own compulsory-switch prompt offers Latias and the uncharged VMAX; it chooses **actor-0 (Latias)**. After that switch, an actual offered `retreat` action returning the powered VMAX is selected, followed by the actual offered `Max Geist` winning attack. These are four actor-visible decision steps × both profiles × both seats = **16 continuation checks, all passed**. They do not establish native prompt/token compatibility, automatic legal action generation, or full-game skill.

## Caveats and implementation request

The shown line requires the opponent to have the vulnerable Bench target, the original VMAX to remain payable after switching/retreating, a live free-retreat mechanism, an unused normal retreat, no blocking tool/Ability/effect, and enough Prizes on the target. It intentionally makes **no claim** that a paid retreat would be poor or impossible; it just does not speculate beyond certified free retreat.

This is a concrete **two-step tactical policy defect** in a source-relevant strategy, not a proof of total deck superiority or any measured matchup rate. Handed to **Agent46** as a bounded local-test candidate for the existing approved successor branch. Agent2 has not changed that branch, dispatched native games/CI, altered the immutable two 60s or the frozen V3 registration, or made a competitive win-rate claim. Benchmark remains 29/32 authenticated lists and 0/32 qualified games.
