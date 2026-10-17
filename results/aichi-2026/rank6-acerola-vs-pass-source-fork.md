# Rank-6 Acerola response decision fork

**Agent 30, 17 October 2026.** Single physical seed, source Store experiment. Qualified competitive games: zero.

The source-bounded paired result and code are described in the companion compiled CI [39011589861](https://github.com/FlareZ123/experiment-01/actions/runs/39011589861).

## Physical source and decision boundary

Published Aichi rank-1 Shadow Rider, physical seat A and actual first player, versus rank-6 Iron Thorns, physical seat B. Both complete source inventories fixed, source seed `20367160`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

An accepted source Guzma & Hala line discarded Trainers' Mail and Tropical Beach, preserved the held Guzma, fetched Double Colorless Energy, played Thunder Mountain, and dealt 140 Volt Cyclone damage to opposing Shadow Rider V. On champion turn three, the bot evolved that Pokémon to Shadow Rider Calyrex VMAX, attached a Psychic Energy, and proposed Acerola with the VMAX at 140 damage and two Energy attached; a Dialga-GX occupied its only Bench slot.

The intervention replaces exactly this Acerola proposal with a legal Pass. In both branches the original bot evaluates Acerola before replacement. Root-Store action divergence occurs at ordinal **42**, with every previous source action equal and immediate pre-action source-zone digest `b4fdcb8a938d46909cfd8b2f00ad1aa086dc8e05515473a929e990d8272d4936` and Card-history digest `c0831a1e92e90f5c6965a21efc5b2d24390219b01dba92d8c425679e7134ec3b` equal.

Both original proposals consumed exactly **40** observed policy random values. The SHA-256 of the 40 big-endian Float64 samples matches in both arms: `cddd386d2d516288986bad41d6f6b3776dceb2bbb7d611903b0deff2fe3e58fc`. This bounds RNG-sequence equality for the observed `Math.random` route; it is not exhaustive closure-state evidence.

## Bounded outcome

| Source champion response | Champion actions on turn three | Remaining Prizes A / B after 125 actions | Finished? |
| --- | --- | --- | --- |
| Generic bot | Acerola, Bench Shadow Rider V, Pass | 6 / 4 | No |
| Targeted alternative | Pass with damaged VMAX Active | 6 / 6 | No |

The generic bot's Acerola returned the damaged VMAX and promoted Dialga-GX with no Energy attached, leaving an empty Bench until a new Shadow Rider V was played. Under the single forced Pass, the partially powered VMAX remained Active. Both continuations showed four rank-6 Iron Thorns attack announcements and zero champion attack announcements before the action cap; they advanced to different game turns.

At printed 320 HP, a Shadow Rider VMAX after two plain 140-damage Volt Cyclone hits would have 40 HP remaining, before other attack modifiers or effects. That creates a credible opportunity-cost question about Acerola. In this fixed engine sample the branch which preserved VMAX had lost no Prizes to Iron Thorns at the cutoff, compared with two Prizes lost after Acerola. These rows are censored diagnostics; no game finished.

## Qualification and provenance

[First compiled genuine fork CI 39011218141](https://github.com/FlareZ123/experiment-01/actions/runs/39011218141) and [compiled random-value check 39011589861](https://github.com/FlareZ123/experiment-01/actions/runs/39011589861) succeeded. [Runner](../../simulation/twinleaf/rank6-acerola-pass-counterfactual.cjs), [targeted decision hook](../../simulation/twinleaf/rank6-acerola-pass-fork.cjs), [earlier three-arm public response](rank6-post-volt-cyclone-response.md).

One physical seed, generic player policies, action-cap censoring and incomplete source reducer/whole-State verification preclude a win-rate conclusion. The original bot itself has known information and tactical shortcomings; matching observed random values does not ensure identical all-state closure behavior after different actions. Review the opponent's other legal responses and test both starting orders, additional seeds and validated playing policies before pursuing competitive inference.

`sourceReplayMechanicsVerified:false`  
`qualifiedForCompetitiveInference:false`  
**Qualified games: zero. The 99.5% objective remains unverified.**
