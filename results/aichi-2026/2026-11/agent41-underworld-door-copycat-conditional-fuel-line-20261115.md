# Conditional Underworld Door fuel line for Active Mimikyu Copycat

**Agent41 · 15 November 2026 · card-text/rules derivation only**

## Question

Can a Psychic Energy in hand be treated as immediate attack fuel for Active Mimikyu GRI 58 Copycat when the manual attachment for the turn has already been spent, one Psychic Energy is already attached to Mimikyu, and Shadow Rider Calyrex VMAX Underworld Door is available?

## Short answer

**Not by directly activating Underworld Door on Active Mimikyu.** The ability only attaches to a *Benched* Psychic Pokémon. A Psychic Energy attached to a different Benched Pokémon does not pay Active Mimikyu's attack cost. However, the nominated Hood Shield Shadow Rider list contains Latias ex and Guzma, which create a conditional retreat → attach → switch-back line that can make the Energy available on Mimikyu.

## Exact card-text basis

The repository's pinned English card records establish:

- `resources/cards/en/swsh6.json`, `swsh6-75`, Shadow Rider Calyrex VMAX: Underworld Door attaches a Psychic Energy from hand to **1 of your Benched Psychic Pokémon**, then draws 2 if an Energy was attached this way.
- `resources/cards/en/sm2.json`, `sm2-58`, Mimikyu GRI 58: Copycat costs **Psychic + Colorless** and can use the opponent's non-GX attack from their last turn.
- `resources/cards/en/sv8.json`, `sv8-76`, Latias ex: Skyliner gives **your Basic Pokémon in play** no Retreat Cost.
- `resources/cards/en/bw9.json`, `bw9-99`, Float Stone: the Pokémon it is attached to has no Retreat Cost.
- `resources/cards/en/sm3.json`, `sm3-115`, Guzma: switch an opponent's Benched Pokémon with their Active; if that occurs, switch your Active with one of your Benched Pokémon.

## Conditional line

Given Active Mimikyu with one Psychic attached, one Psychic Energy in hand, the manual attachment already spent, a live Shadow Rider VMAX Underworld Door, and an unused Supporter for the turn:

1. Mimikyu must have a free-retreat source: either Latias ex is in play with Skyliner unsuppressed, or Float Stone is attached to Mimikyu, or is in hand and can legally be attached before retreat (Mimikyu must not already have a Tool and Items must be playable). The candidate list contains both options. Mimikyu is Basic, so either live effect lets it retreat to the Bench and retain its first Psychic Energy.
2. Activate Underworld Door and attach the held Psychic Energy to the now-Benched Mimikyu. The ability then draws 2.
3. Play Guzma (or another legal switch effect with the same relevant result) to switch your Active Pokémon with the Benched Mimikyu while switching an opposing Benched Pokémon Active.
4. Mimikyu returns Active with Psychic + Psychic and can pay Copycat's Psychic + Colorless cost, assuming the copied-attack condition and attack permissions remain live.

This is a multi-action line. It is not available merely because Underworld Door appears in the frontier.

## Required public-state prerequisites

A policy may classify this as immediate attack fuel only if it can establish all relevant facts from the actor's current public state:

- A free-retreat source is active: Latias ex is in play with Skyliner unsuppressed (no Path/Ability lock or other suppression), or Float Stone is attached to Mimikyu and its Tool effect is not removed/negated, or Float Stone is in hand and can be attached before retreat (no existing Tool on Mimikyu and no Item lock).
- Mimikyu is Basic, Active, has one Psychic attached, is not Asleep or Paralyzed, has a Benched Pokémon available to promote, and the once-per-turn retreat has not already been used.
- Underworld Door is available and unused on a Shadow Rider VMAX.
- The hand Psychic Energy is still present and the ability's Benched target is legal.
- Guzma is in hand or accessible through a legal route such as VS Seeker; the Supporter for the turn is unused.
- The opponent has a Benched Pokémon to gust, and the switch effect can legally resolve.
- No effect prevents retreat or switching. The retreat action itself must still be unused this turn: the advanced manual says retreating can only be done once per turn (A-03, page 8). Latias removes the Energy cost, not the once-per-turn limit. The manual also excludes Asleep/Paralyzed Pokémon from retreating (A-03).
- The opponent used a non-GX attack last turn that Copycat can copy.

If any prerequisite is absent or unknown, the policy must not claim that Underworld Door funds this turn's Active Copycat. Attaching the Energy to another Benched Psychic can still improve future Max Geist damage or other future lines; that is a separate DCI/AMR value, not immediate Active-attack payment.

## Implication for policy work

Agent47's 15 November 01:40 example described Active Mimikyu with one Psychic, a spent manual attachment, one Psychic in hand, and Underworld Door available, then treated the ability as directly completing Copycat's cost. That state alone is insufficient. The valid version additionally needs the Latias/Skyliner retreat and Guzma (or equivalent) switch-back prerequisites above.

The reusable Agent47 attack-fuel selector currently reasons about one remaining legal manual attachment to the Active Pokémon; it does not model this multi-action ability/retreat/switch route. It should not be treated as a drop-in implementation. Any future extension should compare exact legal action sequences and validated prompt choices, rather than assume that an Energy attached anywhere on the board pays an Active Pokémon's attack cost.

## Evidence class and limits

- **Card-text facts:** directly supported by the four repository card records above.
- **Sequence:** a rules/card-text derivation from those effects; no Twinleaf native Store execution was performed.
- **Not established:** that the sequence is reachable in a natural game, that the opponent's board permits Guzma, that it is strategically better than an alternative, or that it improves any matchup or win rate.
- **No implementation:** no candidate list, policy, simulator hook, fixture, workflow, or CI run was changed.

This is a narrow conditional route for the existing Hood Shield Shadow Rider candidate, not a deck change or competitive-strength claim.
