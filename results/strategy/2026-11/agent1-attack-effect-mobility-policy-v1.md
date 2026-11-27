# Attack-Effect / Mobility Policy v1

**Agent 1 · 27 November 2026**

The supplied Advanced Rulebook establishes that when an Active Pokémon moves to the Bench, Special Conditions and effects previously placed on it by attacks are removed. Evolution/devolution can also remove attack effects under the applicable rules.

Policy consequence: every 'can't attack next turn', delayed KO, retreat restriction, damage modifier or similar attack effect must be evaluated together with legal mobility.

## Source Mew VMAX — copied Techno Blast

Cross Fusion Strike can use Benched Genesect V's Techno Blast. The copied effect prevents the attacking Mew VMAX from attacking during its next turn.

Mew VMAX has no Retreat Cost.

If another attacker is already Benched, the source can legally retreat the affected Mew VMAX for free on its next turn; the attack effect disappears when Mew reaches the Bench. The promoted attacker can then attack.

Horror House does not prevent this ordinary retreat. Therefore the candidate must not convert 'Techno Blast used' into 'source cannot attack next turn' without checking the board.

## Candidate Latias ex — Eon Blade

Eon Blade does 200 and says Latias cannot attack during the next turn.

Latias's Skyliner Ability gives candidate Basic Pokémon no Retreat Cost while it is live, including Latias itself.

If a second attacker is Benched and Skyliner is not suppressed, New Moon can:

1. use Eon Blade;
2. next turn retreat Latias for free;
3. remove the Eon Blade attack effect by moving it to the Bench;
4. attack with the promoted Pokémon.

If a legal switch effect later brings Latias Active again that same turn, the old attack effect is already gone. Whether that extra switch is worth spending is a separate decision.

Under Iron Thorns / Silent Lab / Klefki states that suppress Skyliner, do not assume the free retreat.

## Trevenant & Dusknoir-GX — Pale Moon-GX

Pale Moon-GX places a delayed effect on the Defending Pokémon: at the end of the opponent's next turn, that Defending Pokémon is Knocked Out. With an extra Psychic attached it also discards all Energy from the opponent Active.

The delayed KO is not unconditional. If the Defending Pokémon legally moves to the Bench before the end of that next turn, the attack effect is removed.

Before choosing Pale Moon, enumerate:

- ordinary retreat cost after any extra-Psychic Energy discard;
- switch/gust-style board actions available to the opponent;
- evolution/devolution that removes the attack effect when legal;
- Item/Supporter/hand locks that remove those mobility channels;
- whether the opponent can simply attack for the game before the delayed KO matters.

Pale Moon becomes much more realistic in a state where the opponent's hand-play mobility is locked and its Active has no payable retreat or board-only switch.

## Snorlax / retreat prohibitions

A 'can't retreat' effect or Snorlax Block stops **normal retreat**, not every possible switching effect. Conversely, a free Retreat Cost from Skyliner does not override an explicit 'can't retreat' prohibition.

Keep these as separate state variables:

- retreat cost;
- permission to retreat;
- switch-effect access.

## Decision rule

For every attack effect that constrains a future turn:

1. identify the exact Pokémon carrying the effect;
2. list legal ways it can leave Active before the effect matters;
3. list whether those ways are suppressed by current Item/Supporter/hand locks;
4. only then value the future restriction/KO.

## Acceptance additions

- LATIAS-EON-ROTATE: Eon Blade restriction active, Skyliner live, second attacker Benched. Permit free retreat and attack with the other Pokémon.
- PALEMOON-MOBILITY: Pale Moon effect on opponent Active, but legal retreat/switch exists. Do not score the delayed KO as guaranteed.
- PALEMOON-LOCKED-MOBILITY: Pale Moon effect plus opponent has no actor-visible legal way to leave Active before turn end. Credit the delayed KO unless a higher-priority game result intervenes.

No deck change or competitive result follows.