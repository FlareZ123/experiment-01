# A2 Regidrago response frontier: choose Deoxys, Acerola, Ranger or Guzma by public threats

**Agent 15 | 27 November 2026 | deterministic conditional action-response enumeration, not natural matchup win rates.**

## Decision-changing result

After A1 Latias ex Eon Blade KOs a 280-HP Dragon VSTAR and the source responds with **Regidrago VSTAR copying Noivern ex Covert Flight**, the candidate's A2 action should not be chosen by card access alone. The critical competition is between a low-cost **Ranger→Eon** and a higher-up-front-energy but more reply-resistant **Deoxys Max Drain**. An **Acerola→Eon reset** is an intermediate option and **Guzma→Eon** exploits a source's exposed two-Prize Basics. The candidate should check which attacks are publicly available to Apex Dragon in the source discard, the existing attachments/Bench, its own visible HP and damage, whether a two-Prize target remains, and available Supporter/VS/retreat resources.

The model is a bounded counterfactual tree **conditional on** a first successful Eon, an opponent first Covert reply, the next two two-Prize targets being physically available, and no unmodeled gust, Stadium disruption or lock. It is not a simulation of real game starts or a claim that every registered Regidrago deck can perform all six responses in one game.

## A2 choice and A3 continuation

| A2 choice | Must pay or spend on A2 | Plausible A3 route | Major failure mode |
|---|---|---|---|
| **D**: Latias free retreats into funded Benched Deoxys VMAX, Max Drain 320 | One Rider Door + manual attachment, **two Psychic held**, Valley, Deoxys Benched | Repeat Max Drain 320; Ranger only if Rolling Iron reduction requires it; if Deoxys KOs to Timeless+Phantom, promote already funded Latias if source hasn't already won | Two spare P inaccessible, D has previous damage, Clefairy lost, turn lock or source premature Prize win |
| **R**: Pokémon Ranger removes Eon cooldown + first Covert protection, Eon 400 | **Ranger Supporter**, no new P | VS Seeker retrieves Ranger on A3 to clear the next Eon restriction | Source hits already-damaged Latias too hard before A3; VS unusable |
| **A**: Acerola returns damaged Active Latias, replays and funds it, Eon 400 | **Acerola Supporter**, returned two Psychic reattached via Door + manual; free Basic pivot | Ranger A3 clears Eon cooldown and any protective/reduction effect | Needs legal Acerola damage, re-bench/retreat, Door/manual/Supporter; second reply Ryuno/Timeless kills Latias |
| **G**: Guzma gusts exposed 2-Prize Basic and switches Latias to Bench to reset cooldown, then Eon 400 | **Guzma Supporter**, a legally available two-Prize target, one free Basic retreat | VS Seeker→Guzma on A3 against *another* exposed 2-Prize Basic | Overextended source Bench, two gust targets and VS required; Latias may die to source reply |

**Why Ranger is stronger than it first looks:** Pokémon Ranger XY11 104 explicitly removes *all effects of attacks on each player and their Pokémon*. That includes Latias Eon Blade's own no-attack-next-turn effect **and** Regidrago's copied Covert protection. A2 Ranger→Eon uses no new Energy and no pivot. A3 VS Seeker→Ranger can repeat, but leaves Latias exposed to the opponent's second attack.

## Six explicit source reply classes; exact constructed-board coverage

The source reply classes are **Covert Flight**, **Phantom Dive**, **Trifrost**, **Ryuno Glide**, **Rolling Iron**, and **Timeless-GX followed by Phantom Dive**. Damage to the Active under Muscle Band and live Deoxys Protective DNA is 60, 190, 100, 320, 190, and 140+190 respectively. Non-damage Phantom counters and Trifrost Bench damage have distinct effects; the model applies them to the sole full-HP Clefairy. The D line retains Ranger for Rolling; its Timeless sacrifice route is counted only with fewer than three previously lost Prizes. A/G require VS Seeker and source targets; R requires VS Seeker; A requires Racer's other Supporter in a later turn.

| Resource scenario | Deoxys D | Ranger R | Acerola A | Guzma G |
|---|---:|---:|---:|---:|
| **Gate / complete resources, DNA live** | **6/6** | 2/6 | 4/6 | 2/6 |
| **Hood / DNA absent, Deoxys absent** | N/A | 1/6 | 2/6 | 1/6 |
| **Gate / Ranger inaccessible** | 5/6 | 0/6 | 0/6 | 2/6 |
| **Gate / no two spare hand Psychic** | 0/6 | 2/6 | **4/6** | 2/6 |

The exact row-one winning reply sets are D: all six; R: Covert/Trifrost; A: Covert/Phantom/Trifrost/Rolling; G: Covert/Trifrost. These are **counts of reachable continuations across six deliberately enumerated counterfactual action types**, not probabilities or win-rate evidence. Not all attacks are equally likely, physically accessible or strategically sensible. “Six of six” must never be labeled a 100% matchup or source defense; it means the stipulated A3 line succeeds for each of the six isolated replies under an unusually favorable board.

## Correct executable decision policy

After the first source Covert and before consuming A2 resources:

1. Compute an actor-only **source attack payload set** using public discard and current revealed Pokémon/Tools; allow unknown future draws as unresolved rather than treating them as known.
2. Test exact **Deoxys** funding, Active/Bench geometry, damage and last-Prize conditions. If available, its repeated Drain safely avoids A3 Supporter contention against Covert/Phantom/Trifrost/Ryuno, and Ranger is reserved for Rolling.
3. Otherwise test **Acerola** only if damage, Basic pivot, Door/manual reattachment, the second turn's Ranger and the opponent's highest-impact available replies make it worthwhile; Clefairy must survive.
4. Prefer **Ranger→Eon** when it solves the immediate opponent protection and self-cooldown with no new Energy and the expected source response is sufficiently weak. The A3 VS is a real competing use.
5. Prefer **Guzma→Eon** when a public two-Prize Bench target is more valuable than fighting the Active and the second target/VS route is credible. No hidden-source oracle.
6. Re-evaluate after the actual source action on A3, not a fixed scripted three-turn continuation. Lethal attacks should not consume more Supporter or attachment resources than necessary.

This identifies the scarce-resource tradeoff: **Deoxys pays two additional hand Psychic early but leaves the Supporter slot free on A2; Ranger spends no new Psychic but leaves a damaged two-Prizer exposed; Acerola refreshes HP at the price of Supporter plus full reattachment; Guzma needs opponent target cooperation.** A fully funded Deoxys is defensively attractive against hostile known Dragon attacks, but a guaranteed present-turn knockout may favor the economical Ranger line when Deoxys cannot be funded.

## Reproduction and limits

The [stdlib Python action-response checker](../../../scripts/2026-11/agent15-a2-response-frontier.py) and [tests](../../../tests/2026-11/agent15-a2-response-frontier.test.py) were run locally and the 15 scenario assertions passed. Inputs are explicit typed scenarios. This models a single first Covert branch followed by one of six separately stipulated source replies, not adversarial hidden-zone sampling, full opponent policy, ordinary draws, first-turn Gate acquisition, search, prize denial, lock transitions, source promotions, or natural board frequency. Source attack options must be filtered by public discard/current-card access in a real policy. No CI/native game/fixture/worker/deck update is involved.

The original 29/32 Aichi source inventories remain the field evidence; ranks 23,25,28 are unavailable, no competitive matchups are qualified, and no fixed 60 is selected. This research is a priority recommendation for an **existing bounded candidate worker** rather than authorization to change the frozen worker.
