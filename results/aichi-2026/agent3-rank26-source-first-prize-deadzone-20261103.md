# Original rank26: exact Prize dead zone for the first-turn Crisis Punch line

**Agent 3 | 3 November 2026 | exact finite-population calculation and source-text argument.** This is a necessary-resource impossibility result for a particular first-turn attack, **not a probability of losing a game**, not a measured native matchup, and not evidence that any candidate reaches the 99.5% objective. The original rank26 printed 60 is unchanged.

## The previously uncounted blocker

Rank26's [authenticated source 60](full-decklists.json) includes **one Redeemable Ticket (JTG 156)**, **one Double Colorless Energy (SUM 136)**, **two Basic Lightning Energy (MEE 12)**, **two TM: Crisis Punch (PAF 90)**, **two Hisuian Heavy Ball (ASR 146)**, **one Meloetta ex (BLK 44)** and **one Tapu Koko Prism Star (TEU 51)**.

Redeemable Ticket resets face-down Prize cards if it can be played. Hisuian Heavy Ball can retrieve a *Basic Pokémon* from Prizes, but the exact 60 has no equivalent generic direct Prize retrieval for non-Pokémon resources. If Ticket itself is already Prized, several accompanying Prize configurations necessarily block the special **going-first first-turn** Meloetta Crisis Punch attack, even granting arbitrarily favorable access to every unprized source card. This is an upper-resource bound, independent of hand DCI, draw/Item efficiency, or the current bot policy.

| Unavailable Prize configuration (all include Ticket) | Probability conditional on source valid opening seven |
| --- | ---: |
| Ticket and singleton DCE | **0.86068338%** |
| Ticket and both Basic Lightning cards | **0.05981775%** |
| Ticket and both TM: Crisis Punch cards | **0.05981775%** |
| Ticket and both Hisuian Heavy Balls and Meloetta ex | **0.00305697%** |
| Ticket and both Hisuian Heavy Balls and Tapu Koko Prism Star | **0.00305697%** |
| **Union of all five, overlap deduplicated** | **0.97964370%** |

**Exact conditional union:** `8787403607887 / 896999961737880` = **0.9796436992998269%**. Before conditioning on a valid Basic-containing initial seven, the corresponding six-Prize event is `120642 / 12515965` = **0.9639049006608759%**. The sum of the five marginal percentages is not the union because their Prize configurations can overlap.

Why the blockers follow from the printed 60:

1. The first-player turn-one Crisis Punch attack requires the starting-turn exception of Meloetta ex's Debut Performance and the physical TM attachment. Two Prized TMs block the attack itself. Meloetta Prized with both Heavy Balls Prized prevents an early Meloetta from entering play.
2. Crisis Punch costs **three Colorless Energy**. The single DCE provides two units. The only stated extra first-turn acceleration route is Tapu Koko Prism Star's Dance of the Ancients, attaching one of two discarded Basic Lightning cards to each of **two different Benched Pokémon**. DCE Prized, or both Lightning Prized, blocks the energy channel. Koko Prized while both Heavy Balls are Prized also blocks it.
3. Source self-KOs may give *opponent* Prize cards for Crisis Punch's one-opponent-Prize condition, but do not give the **source** access to its own Prized resources. The exact original 60 contains no other generic Prize retrieval effect capable of repairing those specified blocked resources before the signature first-turn attack. If a different printed source interaction can recover one of those materials, that specific row must be challenged and retested.

### Exact enumeration with opening-hand conditioning

[Reproducible BigInt SFT](../../tests/agent3-rank26-firstturn-prize-deadzone.test.cjs) verifies the seven named original-printing counts and the source's **12 Basic Pokémon**. Label ten distinct physical cards: Ticket, DCE, Lightning A/B, Heavy Ball A/B, Crisis TM A/B, Meloetta and Koko. Those contain **two Basics, eight non-Basics**; the remaining source 50 comprise **ten Basics and forty non-Basics**.

For each of the `2^10` possible marked-card Prize-inclusion masks, test the five blocked-resource predicates, then enumerate how many unmarked Basic/non-Basic cards fill out the **six** Prize slots. For each exact type count, weight by the number of Basic-valid opening sevens remaining among the other 54 cards:

```text
Prize multiplicity = C(10, other Basic Prizes) * C(40, other non-Basic Prizes)
Valid initial sevens = C(54, 7) - C(48 - total non-Basic Prizes, 7)
```

The SFT weights all disjoint exact Prize masks by those counts and divides by `P(initial seven contains a Basic) = 1 - C(48,7) / C(60,7)`. It reduces the final rational with BigInt arithmetic and checks every individual event. **No simulation randomness, card-access heuristic, or opponent policy enters this calculation.** The actual repository SFT was evaluated against its exact source `full-decklists.json` under a deterministic V8 harness, with all assertions passing; remote Node and native Twinleaf CI were not yet run for this report.

## Consequence for the source-policy pipeline

This small but exact exclusion matters because proposed first-turn rank26 pressure is sometimes discussed as though access to three Damage Pumps and two recyclable Eggs alone could enable the attack. The [zero-Unown damage-donor line](agent50-rank26-unownless-crisis-punch-ledger-20261103.md) demonstrates a **conditional available path**, while the present Prize union demonstrates a set of **conditionally unavailable paths** under a fully permissive policy. Neither establishes the actual first-turn attack frequency.

The existing source policy has a [default-off, narrow Egg-to-Egg fifth-KO option](../../simulation/twinleaf/rank26-exeggcute-pump-policy.cjs), with [pure guard tests](../../tests/agent3-rank26-egg-to-egg-guard.test.cjs). No full physical natural draw, all-prompt native payment, fifth-KO plus two-recipient Energy attachment, settled first-turn Crisis Punch, capable opponent reply or 25-minute tournament adjudication has been certified here.

Keep the 29/32 original source-inventory coverage and **zero competitive-qualified games** unchanged. A next prospective original-source experiment should stratify the physical Prize configurations and log whether this exact certified impossibility event occurs, along with every failure to construct the signature action for other reasons. Avoid treating the complement **99.02035630%** as attainable first-turn success.

**Related source evidence:** [original rank26 roster](full-decklists.json), [Agent50 no-Unown paper sequence](agent50-rank26-unownless-crisis-punch-ledger-20261103.md), [source original-printing admissions](original-source-admission-matrix-20261102.md), [official Lost Origin Damage Pump](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/swsh11/156).
