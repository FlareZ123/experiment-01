# Agent1 — Underworld Door / Mimikyu Copycat sequencing matrix

**15 November 2026 · card-text/rules derivation · no native execution**

## Question

When can the Hood Shield Shadow Rider v1 list use Shadow Rider Calyrex VMAX's Underworld Door to fund an immediate Mimikyu GRI 58 Copycat, rather than merely attaching Energy elsewhere for future value?

The earlier Active-Mimikyu analysis correctly found that Underworld Door cannot attach directly to an Active Mimikyu. This matrix adds a simpler **Benched-Mimikyu promotion route** and separates it from the more expensive Active-Mimikyu retreat/switch route.

## Candidate resources

The fixed Hood v1 60 contains:
- 4 Shadow Rider Calyrex VMAX (each has its own Underworld Door Ability);
- 1 Mimikyu GRI 58;
- 1 Latias ex SSP 76 (Skyliner);
- 1 Guzma BUS 115;
- 2 VS Seeker PHF 109;
- 1 Float Stone BKT 137;
- 11 Basic Psychic Energy;
- 1 Dimension Valley PHF 93.

The exact inventory is `results/aichi-2026/candidate-hood-shadow-rider.json`.

## Copycat payment

Mimikyu GRI 58 Copycat costs Psychic + Colorless. Its live payment threshold is:

| Stadium state | Energy required on Mimikyu |
|---|---:|
| Dimension Valley active | 1 Psychic |
| No cost modifier | 2 total Energy |
| Wondrous Labyrinth active | 3 total Energy |

Mimikyu must also have a valid non-GX opponent attack from the opponent's last turn and no attack prohibition/status effect that prevents it from attacking.

Underworld Door attaches one Psychic Energy from hand to **one of your Benched Psychic Pokémon**. Energy attached to a different Pokémon does not pay Active Mimikyu's Copycat cost.

Each Shadow Rider Calyrex VMAX has its own once-per-turn instance of Underworld Door. If multiple VMAX are in play and their Abilities are live, each may use its own instance; multiple attachments may target the same Benched Mimikyu. The fixed 60 has four VMAX, so the available number of attachments depends on the actual board and hand, not simply on whether one Underworld Door action is visible. Each successful attachment also draws 2 cards.

## State matrix

| Mimikyu location at start of sequence | Promotion route after Underworld Door | Extra requirements | Immediate Copycat? |
|---|---|---|---|
| **Benched** | Retreat the current Active Pokémon to promote Mimikyu | Retreat unused; current Active can legally retreat. If it is Basic and Latias ex's Skyliner is live, it has no Retreat Cost. If it is an Evolution, a valid Float Stone/free-retreat effect or other legal retreat payment is needed. | **Yes**, if Underworld Door attaches enough Energy and the opponent's last-turn attack is copyable. No Guzma or opposing Bench target is needed on the Latias/free-retreat route. |
| **Benched** | Guzma switches an opposing Benched Pokémon Active and brings Mimikyu Active | Guzma in hand (or VS Seeker access while Items are playable); Supporter unused; opponent has a Benched target; switch not blocked. | **Yes**, if enough Energy is attached. This route does not require Latias or Float Stone. |
| **Active** | Retreat Mimikyu to Bench, use Underworld Door on it, then Guzma to bring it Active again | A live free-retreat source for Mimikyu (Latias Skyliner or Float Stone), retreat unused, Mimikyu able to retreat, Guzma route and opposing Bench target available. | **Yes**, if all prerequisites and the Energy threshold are met. The retreat has already been used, so a second retreat cannot bring Mimikyu back; a switch effect such as Guzma is needed. |
| **Active** | Underworld Door attaches to a different Benched Psychic Pokémon | No legal way to attach to Active Mimikyu. | **No** immediate Copycat fuel from that attachment. It may still provide draw and future Max Geist value. |
| Either | No legal promotion route or insufficient Energy after all available Underworld Door activations | Missing retreat/switch, Ability suppression, no Energy in hand, or payment threshold not met. | **No** immediate Copycat. Keep the attachment's draw/future-energy value separate from attack-fuel value. |

### The simpler Benched-Mimikyu route

When Mimikyu is already Benched, the candidate does not need to retreat Mimikyu at all:

1. Keep Mimikyu Benched with its existing Energy.
2. Use one or more live Underworld Door instances to attach Psychic Energy from hand directly to Mimikyu.
3. If the current Active Pokémon is Basic and Latias ex's Skyliner is live, retreat that Active Pokémon for free and promote Mimikyu. Otherwise use a valid Float Stone/free-retreat route or Guzma.
4. Mimikyu now has the required Copycat payment and may use the opponent's actual non-GX last-turn attack.

The **Latias free-retreat route is strategically important**: it does not consume the Supporter for the turn, does not require an opposing Benched Pokémon, and does not rely on VS Seeker. It can therefore remain available under Vileplume AOR 3's Item lock, provided Latias's Ability and Underworld Door are unsuppressed and the current Active Pokémon is Basic.

### Active-Mimikyu route

If Mimikyu begins Active and lacks the Energy needed for Copycat, Underworld Door cannot target it. The only candidate-specific immediate route identified here is:

1. Retreat Mimikyu to the Bench using live Latias Skyliner or a valid Float Stone.
2. Attach Energy to the now-Benched Mimikyu with one or more Underworld Door instances.
3. Use Guzma to switch Mimikyu Active while gusting an opposing Benched Pokémon.

This is strictly more demanding than the Benched-start route because it needs a free-retreat source for Mimikyu and a separate switch-back effect after the once-per-turn retreat has been spent.

## Gale Thrust interaction: a concrete payoff

Rank 15's published Lopunny/Vileplume list contains Mega Lopunny ex PFL 84. Its non-GX attack **Gale Thrust** does 60 damage, plus 170 if the attacking Pokémon moved from the Bench to the Active Spot this turn.

If the opponent used Gale Thrust last turn and Mimikyu is Benched:
- Underworld Door can attach to Mimikyu directly;
- Latias can let the current Active Basic retreat for free, promoting Mimikyu (or Guzma can promote it);
- Mimikyu itself moved from Bench to Active this turn, so the copied Gale Thrust condition is satisfied;
- Copycat can therefore deal **230 damage** if the live Copycat cost is paid.

This is a general sequencing pattern for any copyable attack whose text checks whether “this Pokémon” moved from Bench to Active this turn. The condition is evaluated for the copying Pokémon, Mimikyu, not for the original Mega Lopunny.

Against rank 15, Vileplume AOR 3's Irritating Pollen prevents both players from playing Item cards from hand. Therefore VS Seeker is unavailable while that Ability is live; the Guzma route requires Guzma already in hand. The Latias free-retreat route avoids this Item/Supporter dependency if the current Active Pokémon is Basic and Latias is live. Pokémon Ranger clears attack-origin effects, not Vileplume's persistent Ability-based Item lock.

## Public-state prerequisites and failure cases

A policy must not treat Underworld Door as immediate Active Copycat fuel unless it can establish:
- the exact Mimikyu location (Active or Benched) and attached Energy;
- the number of available, unused, unsuppressed Underworld Door instances;
- enough Psychic Energy still in hand for those Ability activations;
- the live Stadium-modified Copycat cost;
- a legal promotion route after the attachment;
- an unused retreat if the route relies on retreat;
- Latias ex in play with Skyliner unsuppressed if relying on free retreat for Basic Pokémon;
- no Asleep/Paralyzed condition, retreat lock, or switch prohibition affecting the relevant Pokémon;
- Guzma in hand and the Supporter slot unused if relying on Guzma; VS Seeker is not a valid out under a live Vileplume AOR 3 Item lock;
- an actual non-GX attack receipt from the opponent's last turn.

Underworld Door can still be correct for draw or future Max Geist damage even when it cannot fund an immediate Active Copycat. These are separate DCI/AMR values and must not be conflated.

## Evidence class and limits

- **Card-text facts:** Shadow Rider VMAX Underworld Door, Mimikyu GRI 58 Copycat, Latias ex SSP 76 Skyliner, Float Stone, Guzma, and the rank-15 Mega Lopunny ex Gale Thrust.
- **Rules derivation:** retreat-to-promote, Guzma switch sequencing, and the copied attack's “this Pokémon” condition applying to Mimikyu.
- **Not established:** natural-game reachability, frequency of the relevant opponent attack, opponent response, or any matchup/win-rate improvement.
- **No implementation:** no candidate policy, decklist, hook, fixture, test, workflow, or CI was changed.

## Related work

- `results/aichi-2026/2026-11/agent41-underworld-door-copycat-conditional-fuel-line-20261115.md` — Active-Mimikyu retreat/attach/Guzma route.
- `results/aichi-2026/2026-11/agent1-copycat-field-target-map-20261115.md` — field-wide Copycat target inventory, including Gale Thrust.
- `communications/agent46/20261115T014700000Z_agent41-underworld-door-active-target-correction.md` and `communications/agent46/20261115T015000000Z_agent41-underworld-door-valid-switch-line.md` — original active-state correction and valid route.
- `results/aichi-2026/2026-11/agent50-hood-shadow-rider-dci-amr-policy-spec-20261113.md` — current DCI/AMR policy specification.

**Conclusion:** A Benched Mimikyu can be funded by Underworld Door and promoted either by a free retreat (often the simpler route when Latias supports a Basic Active) or by Guzma. The active-Mimikyu retreat/attach/Guzma sequence is a separate, more constrained case. This distinction is necessary for any future attack-fuel selector; no current V3 policy should claim the route is executable until the Copycat host/engine support gate is resolved.
