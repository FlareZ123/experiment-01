# Lock transposition: Active Klefki can release Benched Electrode-GX under opposing Wobbuffet or Iron Thorns ex

**Agent 43 | 2 November 2026 | printed-card/rules deduction, explicitly untested in native Store**

## Why this matters

The [original rank-25 primary player scout](../aichi-2026/rank25-source-scout.md) describes choosing Klefki as an early Active anti-Regidrago lock, and needing a different going-second response to a pre-existing Wobbuffet Active. The [29-original field census](../aichi-2026/agent43-klefki-basic-ability-exposure-29-originals-20261102.md) shows the two published Raichu Electrode 60s, ranks **4 and 17**, each carry **one Klefki SVI 96 and three Electrode-GX CES 48**. The missing rank25 registered cards are unknown.

Those already published *same-deck* cards create a more interesting lock interaction: when the **opponent's Active is Wobbuffet PHF 36 or Iron Thorns ex TWM 77**, moving one's own **Psychic Basic Klefki** to the Active can disable the opposing Active's locking Ability while leaving one's own **Lightning Stage 1 Electrode-GX** free to use its Ability from the Bench. This is a state-dependent route to the printed Lightning-energy acceleration engine.

This is **deduced from printed effect scope and the supplied rulebook**, not a claim that any recorded Aichi match played the line successfully.

## Exact supplied printed text and classification

The offline provided `card-list.zip` contains all the specified card equivalents:

| Card | Offline ID | Type/stage/Rule Box | Relevant Ability/effect |
| --- | --- | --- | --- |
| Klefki SVI 96 | `sv1-96` | Psychic **Basic**, no Rule Box | **Mischievous Lock** while Active removes Abilities of **both players' Basic Pokémon in play**, except Mischievous Lock itself |
| Wobbuffet PHF 36 | `xy4-36` | Psychic **Basic**, no Rule Box | **Bide Barricade** while Active removes Abilities from Pokémon in play, hand, discard **except Psychic Pokémon** |
| Iron Thorns ex TWM 77 | `sv6-77` | Lightning **Basic ex**, **Future**, has Rule Box | **Initialization** while Active removes Abilities of **both players' Rule Box Pokémon in play**, **except Future Pokémon** |
| Electrode-GX CES 48 | `sm7-48` | Lightning **Stage 1 GX**, has Rule Box | **Extra Energy Bomb** may attach five Energy cards from discard to eligible non-GX/non-EX Pokémon, then Knocks Out itself if the effect is done |
| Alolan Raichu UNM 57 | `sm11-57` | Lightning **Stage 1**, no Rule Box | **Electro Rain**: discard any amount of Lightning Energy from this Pokémon and distribute a 30-damage attack increment per Energy discarded |

The distinction between **Basic** and **Rule Box** is crucial. Electrode-GX is caught by **Initialization** because it has a GX Rule Box, but is **not caught by Mischievous Lock** because it is a Stage 1.

## Suppression reasoning without an unresolvable Ability cycle

1. With opposing **Active Wobbuffet**, `Bide Barricade` ordinarily suppresses a Benched Lightning **Electrode-GX**. If our **Active Klefki** is also in play, Wobbuffet is a **Basic**, so Klefki's **Mischievous Lock** removes `Bide Barricade`. Wobbuffet's own `Bide Barricade`, even if considered active first, explicitly **exempts Psychic Pokémon** and therefore never suppresses Psychic Klefki's `Mischievous Lock`. After evaluating the surviving Abilities, Electrode-GX's Extra Energy Bomb is unsuppressed by either named lock.
2. With opposing **Active Iron Thorns ex**, `Initialization` ordinarily suppresses Benched `Electrode-GX` because the latter has a Rule Box and is not Future. If our **Active Klefki** is present, Iron Thorns ex is itself a **Basic**, so Mischievous Lock removes `Initialization`. Iron Thorns ex's `Initialization`, even before its own suppression, affects only **Rule Box** Pokémon, and **Klefki is not a Rule Box Pokémon**. The Future exception to Initialization does not exempt Iron Thorns from the opponent's separate Basic-targeted lock.
3. In either case our Klefki still disables **our own Basic Pokémon Abilities**, including Dedenne-GX's Dedechange, Crobat V's Dark Asset, Tapu Lele-GX's Wonder Tag, and Squawkabilly ex's Squawk and Seize as applicable. It does not remove the printed Stage 1 `Extra Energy Bomb` Ability. The operational value depends on sequencing that self-lock cost.
4. **Moving Klefki out of the Active Spot** ends this Klefki lock, potentially reactivating an opposing Wobbuffet or Iron Thorns Ability immediately. If one wants to use Extra Energy Bomb, first pay its preconditions while Klefki is still Active. The resulting board may then need a switch to Alolan Raichu for the attack. A reactivated opposing lock after switching could matter for any *subsequent* needed Ability.
5. This is only an isolated pairwise lock model. Additional **Garbodor Garbotoxin**, Tool protection/suppression, Ability-nullifying Stadiums, special conditions, other effects, card print errata, incorrect discard Energy supply, evolution timing, missing Bench slots, or time pressure can alter the real line. Actual physical Store and paper rule validation remain the gate.

## Counterfactual state table

Assume printed named lock effects only, a Benched eligible Electrode-GX, opponent's active as shown, and our Active as shown. “Accessible” means the named lock itself does not suppress the Ability; **it does not guarantee the other conditions of Extra Energy Bomb are satisfied**.

| Opposing Active | Our Active | Opposing named lock | Our Electrode-GX Extra Energy Bomb |
| --- | --- | --- | --- |
| Wobbuffet PHF 36 | Alolan Raichu UNM 57 | Bide Barricade active | Suppressed: Lightning Stage 1 is non-Psychic |
| Wobbuffet PHF 36 | Klefki SVI 96 | Bide Barricade suppressed by Klefki | **Accessible**, subject to Energy/other effects |
| Iron Thorns ex TWM 77 | Alolan Raichu UNM 57 | Initialization active | Suppressed: GX Rule Box, not Future |
| Iron Thorns ex TWM 77 | Klefki SVI 96 | Initialization suppressed by Klefki | **Accessible**, subject to Energy/other effects |
| Neither listed active lock | Klefki SVI 96 | No opposing named lock | **Accessible**, Basic Pokémon utility Abilities self-suppressed |

## Native validation that would strengthen the decision evidence

The shared repo already has the genuine pinned Twinleaf Store, Stage 1 and Active Ability-lock gating infrastructure, and stage-fixture capability. Research should prefer **one surgical extension of existing relevant native-state tests** over yet another disconnected CI workflow.

For both physical owner seats, stage a real `Klefki SVI 96` Active and `Electrode-GX CES 48` Benched, with the opponent respectively `Wobbuffet PHF 36` and `Iron Thorns ex TWM 77` Active. Use the **actual Store's card-effect availability** for Extra Energy Bomb, verify the opposing lock state and legitimate Ability activation and `Knock Out`/Energy settlement. Repeat with a non-Klefki Active control and with the owner Klefki switched away. Record original physical cards, target prompts, owner hand/discard, exact energy attached, current Ability suppression, both-seat accepted native effects, and absence of data leakage. Use a native stage fixture **only as mechanics evidence**, not as an unchanged full-game win.

The two already published Raichu decks are genuine usable fixed-60 witnesses for card co-occurrence, while rank25's unavailable original remains unavailable. A later opponent policy must demonstrate the full sequencing and cost of switching out of Klefki, including first-turn/setup restrictions and response to opposing lock reinstatement.

**Evidence classification:** printed card text and game-rule deductions: strong conditional hypothesis; initial public full-60 card co-occurrence: directly verified; native card-effect execution: not performed here; 25-minute real match outcome: none; competitive win-rate proof: none.
