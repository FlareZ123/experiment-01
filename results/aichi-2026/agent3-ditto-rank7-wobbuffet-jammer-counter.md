# Source rank 7: Wobbuffet + Tool Jammer/Faba response to shielded Ditto → Vileplume

**Agent 3, 19 October 2026. Classification: published opponent-list observation, printed-card/rulebook interaction hypothesis, and pinned-engine source audit.** A targeted real-Store counterfactual has been added to [the Ditto Stage-2 probe](../../simulation/twinleaf/ditto-stage2-store-probe.cjs) and [its tests](../../tests/ditto-stage2-store.test.cjs) but has **not yet obtained compiled CI validation**. Nothing here is a replay of an authentic rank-7 starting hand, a naturally established board, or a competitive matchup outcome.

## Exact source evidence

The canonical [Aichi Open League 2026 published rank printings](full-decklists.json) identify rank **7, Snorlax Stall**, as having:

| Card | Exact printing | Copies | Contribution |
| --- | --- | ---: | --- |
| Wobbuffet | PHF 36 | 3 | Its Active-only Bide Barricade removes non-Psychic Pokémon Abilities |
| Tool Jammer | BST 136 | 1 | Its Active-wearer effect disables opposing Active Pokémon Tools other than Tool Jammer |
| Faba | LOT 173 | 2 | Supporter can place an opponent's attached Tool in the Lost Zone |
| Guzma | BUS 115 | 1 | Can change both Active positions subject to legal targets |
| Field Blower | GRI 125 | 1 | Item that can remove Tools **if Item lock is already lifted** |
| Megaton Blower | SSP 182 | 1 | ACE SPEC Item that cannot itself be used while Item lock persists |

Rank **10 Regidrago** independently contains one Wobbuffet PHF 36 and one Faba LOT 173, without Tool Jammer. Rank **21 Regidrago** contains Wobbuffet but no listed Faba or Tool Jammer. This report specifically concerns rank 7's exact counter configuration; other source archetypes and matchups are distinct.

## Paper interaction to falsify

The candidate's proposed going-second sequence is `Ditto 30C Surprisingly Transform → Vileplume AOR` with **Stealthy Hood UNB** carried onto the new Active. Under ordinary conditions, Active Vileplume's **Irritating Pollen** prohibits both players from playing *Items* from hand. Stealthy Hood protects the wearer from opposing Ability effects such as an Active Wobbuffet's non-Psychic Bide Barricade. This protection matters whether or not the Ditto attack's original setup was consistent.

A source-legal counter may proceed in two ways, when the necessary cards and board transitions are available:

1. **Faba, a Supporter**, can put the Hood in the Lost Zone despite Vileplume's Item lock. If the opponent already has Wobbuffet Active, Bide Barricade can then remove the non-Psychic Vileplume's Ability.
2. **Tool Jammer, a Pokémon Tool**, may be attached to a Wobbuffet that is or becomes Active. Under the Tool's printed rule, the opposing Active Vileplume's Stealthy Hood loses its effect. Bide Barricade can then suppress Irritating Pollen. Older Tools bearing an Item label are still Pokémon Tools under Advanced Player's Rulebook B-02, so mere Item lock does not prohibit attaching Tool Jammer. Faba and Tool Jammer face different availability and timing constraints.

The second line specifically requires **Wobbuffet Active** and **Vileplume Active with Hood** simultaneously. Tool Jammer attached to a Benched Wobbuffet is inactive. Tool Jammer's text only suppresses Tools attached to an *opponent's Active*. A Vileplume moved to the Bench, after an otherwise established board, may escape this suppression. These distinctions prevent treating the two-card combination as unconditional lock removal.

Rank 7's own Field Blower and Megaton Blower are Item cards, so neither immediately answers an unbroken Irritating Pollen lock. They become relevant once another effect lifts that restriction. The actual opponent can also fail to access Faba, Tool Jammer, Wobbuffet or a switching line in time.

## Engine fidelity

The pinned Twinleaf revision is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Its native `ptcg-server/src/sets/09-sword-and-shield/set-battle-styles/tool-jammer.ts` has an effectively empty `reduceEffect` body, so an uncorrected native comparison can miss Tool Jammer's suppression of Hood.

The shared repository already contains an **opt-in reversible compatibility fix** in [`simulation/twinleaf/tool-jammer-hook.cjs`](../../simulation/twinleaf/tool-jammer-hook.cjs), originally written and audited by Agent 11. It acts on actual `ToolEffect`, preserves the Tool Jammer exception and skips a disabled Tool Jammer. Reusing this hook is preferable to inventing another card patch.

The targeted test matrix appended here reuses a real Ditto AttackAction that produces Active Vileplume with Hood, then stages rank 7's printed Active Wobbuffet with/without Tool Jammer:

| Staged board | Expected Hood suppression | Expected Vileplume Item lock |
| --- | --- | --- |
| Wobbuffet Active, no Tool Jammer | No | Still blocks both players |
| Wobbuffet Active + native unpatched Jammer | No, due to documented engine gap | Still blocks both players |
| Wobbuffet Active + research-hooked Jammer | Yes | Suppressed, both players' Item plays become possible |

These are **expectations to be checked** in compiled Store CI. They must not be repeated as observed outcomes until run confirmation. A later full `PlayCardAction` with owner-visible hand and switching remains a stricter acceptance test. Control source states must be independently generated, not retrospectively chosen wins.

## Decision consequence

This is a consequential tactical reason to reject any inference that one successful Ditto → Hood-Vileplume turn translates to permanent universal Item lock. The exact rank-7 source 60 has at least two printed response families under ordinary turn rules, subject to draw availability, Supporter use, positioning and the full opponent policy. A complete Ditto 60 still needs a fallback line, retest against rank 7, and comparison to the established fixed-list candidates over the full 32-rank field.

**Global qualification remains unchanged:** 29 of 32 exact source lists, zero independently qualified competitive games, no demonstrated final 60 or 99.5% win rate.
