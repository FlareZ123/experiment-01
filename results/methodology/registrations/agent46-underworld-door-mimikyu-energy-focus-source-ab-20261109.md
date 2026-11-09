# Agent46: preregister native Underworld Door Mimikyu response Energy targeting

**Registered 9 November 2026 before the new Energy-target policy code.**

## Problem

In the original rank1 versus rank10 full-60 source Fog-study, opponent Regidrago made 38 baseline / 39 treatment actual Apex Dragon attacks, and Mimikyu appeared on several treatment final Benches. The candidate never made Copycat. One missing tactical capability is obtaining two Psychic Energy on Benched Mimikyu and promoting it at the correct attack window. Rank1 carries Shadow Rider Calyrex VMAX CRE; its real Underworld Door Ability attaches a basic Psychic Energy from hand to a Benched Psychic Pokémon, drawing two cards. A native prompt resolver can choose Mimikyu as the recipient when it is an eligible legal target.

## Precommitted experiment

- **No cardlist modifications.** Authenticated original Aichi rank1 Shadow Rider Calyrex versus rank10 Regidrago, both physical candidate seats, same developmental native rules/Copycat and opponent policies in both arms.
- Six fresh independently drawn source seeds `[2145606871,1755802779,805507324,1889111531,1465231646,1025444877]`. Two seats, two arms: **24 attempts, 12 same-source starting-position pairs**.
- Control: the already implemented owner-visible Fog Crystal plus Mysterious Treasure dual-axis search/discard/Bench setup.
- Treatment: exact same setup, plus a **new owner-only Underworld Door Energy focus**. A native legal Underworld Door Ability is proposed when original owner has an available Shadow Rider Calyrex VMAX and Benched Mimikyu with fewer than two Psychic Energy, opponent Regidrago V/VSTAR is publicly in play, and owner holds a basic Psychic Energy. At the *actual* owner-visible `ATTACH_ENERGY_TO_BENCH` prompt, propose one physical basic Psychic Energy assigned to the real Benched Mimikyu target using the printed native prompt validator. Do not add, move or reveal hidden cards directly. Never override a rejected native action.
- Fix `maxActions=180`, exact startup fingerprints per paired seat+seed, identical native correction flags and initial 60s, and record action caps/errors along with accepted native attack traces, actual opponent Apex declarations, emitted prompt proposals, and native final board.
- Report even if prioritizing Mimikyu damages Shadow Rider's normal draw/attack strength. Never treat proposal callbacks as accepted Source Store actions. Do not interpret any native terminal as an independently paper-qualified competition game.

Primary success condition is an **incremental actual native Copycat attack after native opponent Apex**. Additional prompt receipts are explanatory evidence only. Zero competitive-paper-qualified games and no claimed 99.5% result.
