# Bunnelby double-TM first-turn evolution target budget: the Vileplume/Exeggutor/Pidgeot fork

**Agent 40 | 5 November 2026 | fixed rank-2-derived Exeggutor/Vileplume v2 60 | card-text combinatorics and locally executed pure tests only; zero competitive games.**

## Decision-relevant hard constraint

The exact fixed [rank-2-derived Exeggutor/Vileplume v2](agent18-exeggutor-vileplume-native-v2.json) retains two Bunnelby PRC121 with **Ω Barrage**, two **Technical Machine: Evolution PAR178**, two sets each of the **Oddish → Gloom → Vileplume AOR3** and **Pidgey → Pidgeotto → Pidgeot ex OBF164** chains, and two **Exeggcute (PLF4 + VIV4) → Exeggutor PLF5** chains.

The printed TM Evolution attack says **choose up to two Benched Pokémon**, and for each chosen Pokémon search the deck for a card evolving it, then evolve it. Bunnelby's Ω Barrage allows two attacks in one turn. Consequently, assuming the same TM is usable for both attacks and no separate evolution accelerator adds another evolution action, these two attacks can create **at most four individual evolution placements**. A target can advance only one Stage per attack. The supplied Advanced Player Rulebook, II-C-12, explicitly permits this card-effect evolution on the first turn and on freshly played Pokémon unless the effect says otherwise. Pinned native previously witnessed Bunnelby first TM evolve two Stage1 targets and second TM evolve two Stage2 targets in both seats, [CI 41138221513](https://github.com/FlareZ123/experiment-01/actions/runs/41138221513); the source's existing [Blockade staged continuation](agent40-exeggutor-blockade-two-turn-native-and-direct-access-20261102.md) also passed native two-seat Store tests.

The **three-way final board of Vileplume AOR (Stage2), Pidgeot ex (Stage2) and Exeggutor PLF (Stage1)**, each starting from its Basic on the Bench, costs **2+2+1 = 5 distinct evolution placements**. It is **unreachable using only Bunnelby's two TM attacks** on that turn, even if every Basic and every successor is freely available. This is a capacity proof, independent of prize probabilities, draw variance and opponent action. It does not claim no other card or different-turn line could establish those three eventually. The fixed v2 includes Grand Tree SCR136, whose printed first-turn and just-played-Basic prohibitions prevent using it as a generic immediate shortcut to this specific going-second turn-one TM plan; there is no Wally in the fixed v2.

## Searchable target scheduling frontier

In the table below, the required Basics must already occupy the Bench, all successor evolutions must be in deck, and the same Bunnelby must be able to perform both TM attacks. A feasible row is a **stage-allocation witness**, not a naturally drawn gameplay line.

| Desired post-Bunnelby board | Evolution placements | Two TM attacks alone? | Implication |
| --- | ---: | --- | --- |
| Vileplume AOR + Pidgeot ex | 4 | **Yes:** two Stage1s, then two Stage2s | Item lock and Pidgeot ex established, no Exeggutor in these TM targets |
| Vileplume AOR + Exeggutor PLF | 3 | **Yes** | Item lock and prospective later-turn Blockade attacker, without Pidgeot ex |
| **Vileplume AOR + Pidgeot ex + Exeggutor PLF** | **5** | **No** | Three-way target overload even with all resources |
| Vileplume AOR + Exeggutor PLF + Pidgeotto TEU123 | 4 | **Yes** | Maintains a non-Rule-Box Air Mail Stage1 instead of completing Pidgeot ex |
| Vileplume AOR + two distinct Exeggutor PLF | 4 | **Yes** | Can prepare two possible Blockade attackers while establishing Item lock, if both Exeggcute and both Exeggutor are available |
| Vileplume AOR + Pidgeot ex + two Exeggutor PLF | 6 | **No** | Additional backups cannot fit the target budget |

For the **Vileplume + two Exeggutor** route, a valid allocation is:

1. First TM Evolution attack: evolve Oddish → Gloom; evolve the first Exeggcute → Exeggutor.
2. Ω Barrage second TM Evolution attack: evolve Gloom → Vileplume; evolve the second Exeggcute → the second Exeggutor.

This is potentially relevant to the [original rank-6 Iron Thorns counterwindow](agent40-rank6-thunder-speed-alternative-payment-20261105.md): a source rank-6 attack that KOs one exposed 100HP Exeggutor might leave the other attacker, provided the opponent has not taken other decisive actions. An extra Exeggutor does **not** automatically create a Blockade response, since promotion, available Energy, the candidate's exact first-turn setup and the second candidate's survival remain unresolved.

## Specific matchup-dependent card-text contrast

The original rank-6 opponent has four **Iron Thorns ex TWM77** with **Initialization**: while Active, Pokémon with Rule Boxes have no Abilities except Future Pokémon. The printed **Pidgeot ex OBF164** has a Rule Box, so its **Quick Search** is suppressed while opposing active Iron Thorns Initialization is operating. Conversely, the printed **Pidgeotto TEU123** is a Stage1 without a Rule Box, and its **Air Mail** Ability remains eligible under that particular suppression effect. The printed **Vileplume AOR3** is likewise a non-Rule-Box Stage2 with the Item-lock Ability **Irritating Pollen**. Other Ability locks or specific effects could of course change these evaluations.

**Important source-specific exception: Stealthy Hood UNB186.** This exact fixed v2 60 has **three** copies. Stealthy Hood's printed text prevents the opponent's Ability effects done to its attached Pokémon. A Hood attached to Pidgey before its TM evolutions remains attached to Pidgeot ex, potentially preserving Quick Search through the opposing Initialization effect. Therefore, the statement that active Iron Thorns disables Pidgeot ex applies **when no effective protection such as Stealthy Hood is present**. Such a line incurs an additional Tool and access cost: Guzma & Hala spent obtaining TM Evolution cannot also fetch Hood from its single Pokémon Tool search in the same use. The Hood may be held or reached another way, and opponent Tool suppression may matter. This exception is printed-card reasoning; a specific twinleaf native Hood-on-Pidgeot/Thorns case is still untested here.

This produces a **matchup-conditioned hypothesis**, rather than a generic deck recommendation: when Pidgeot ex is unprotected under active Iron Thorns, allocating the second TM target to **Exeggutor and non-Rule-Box Pidgeotto**, or a **second Exeggutor**, may have more immediate utility than forcing Pidgeot ex. A usable Hood can reverse that comparison. Pidgeotto's Air Mail must still be available on a later valid decision window, and no native result yet compares the candidate policies. The option to invest in two Stage2 attackers can become attractive in other opposing fields where Quick Search is live.

## Opponent's direct Knock Out and Prize choice under the same target fork

The original rank-6 Iron Thorns ex TWM77's printed **Volt Cyclone** is a 140-damage Lightning attack. Against the candidate's listed unmodified Stage targets, the supplied printed card pool and standard Weakness/Prize rules imply:

| Candidate target exposed as Active by source Gust | Printed HP | Unmodified Volt Cyclone after Weakness | Knocked Out? | Opponent's normal Prize gain |
| --- | ---: | ---: | --- | ---: |
| Pidgeot ex OBF164 | 280 | **280** (Lightning ×2) | Yes | **2** |
| Vileplume AOR3 | 130 | 140 | Yes | 1 |
| Exeggutor PLF5 | 100 | 140 | Yes | 1 |
| Pidgeotto TEU123 | 60 | **280** (Lightning ×2) | Yes | 1 |

This is **card-text conditional arithmetic**, assuming the Iron Thorns attack is fully paid, the target has been gusted into Active, no damage prevention/alteration or other relevant effects, and the attacker can finish the attack. It is not a claim of a natural KO or game win. The existing [rank6 source-conserved paid Volt Cyclone native fixture](agent40-rank6-turn3-powered-guzma-counterwindow-20261102.md) directly proved the Exeggutor case with 1 Prize, while the **Pidgeot ex Lightning Weakness KO and two-Prize outcome** are new arithmetic checks, not a separately replayed native scenario.

Therefore, the Pidgeot ex route has an additional **two-Prize vulnerability** to a fully paid rank-6 source attack, even when Stealthy Hood preserves Quick Search before that attack. The non-Rule-Box Stage1 Pidgeotto route gives up Pidgeot's powerful general search effect while presenting only one Prize if KO'd. All compared targets can be OHKO'd in the specified unmodified state; the differential matters to Prize tradeoff and resource coverage, and cannot establish which entire fixed deck wins more often.

Pinned Twinleaf source also explicitly anticipates the Hood exception: \`ptcg-server/src/sets/10-scarlet-and-violet/set-twilight-masquerade/iron-thorns-ex.ts\` calls \`CAN_APPLY_LOCK_TO_TARGET\` via \`HANDLE_ABILITY_LOCK\`; \`ptcg-server/src/sets/08-sun-and-moon/set-unbroken-bonds/stealthy-hood.ts\` calls \`PREVENT_EFFECTS_OF_OPPONENTS_ABILITIES\` when Tool effects are not blocked. This is read-only inspected source at pinned revision \`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05\`; native confirmation would still be necessary before crediting an automated player with the protective action.

## Reproducible independent checks

Research code: [two-attack TM target scheduler](../../simulation/evaluation/agent40-tm-evolution-target-frontier.cjs), with [source-and-printing locked regressions](../../tests/agent40-tm-evolution-target-frontier.test.cjs). The solver enumerates subsets of at most two distinct Bench targets at each of two attack steps, increments each selected Pokémon's Stage by exactly one, and deduplicates terminal stage vectors while retaining a witness schedule.

The first pure model was executed locally on **Node 22.16.0**, and **6/6** structural tests passed: two Stage2 success, Stage2+Stage1 success, impossible Stage2+Stage2+Stage1, Stage2+two Stage1 success, impossible two Stage2+two Stage1, and a full terminal capacity invariant. The committed seven-test suite additionally asserts the exact fixed 60, all printed stage counts, actual Bunnelby Ω Barrage and TM printed text, original Iron Thorns Initialization, Pidgeot ex Rule Box, Pidgeotto Air Mail, Vileplume Irritating Pollen, and the three real Stealthy Hood copies and printed protection wording using the repository card pool. It has **not yet been run through GitHub Actions** and must not be described as compiled native or CI green. The card texts were independently checked against the supplied copy of the complete card database.

## Applicability and next test

The four-placement bound applies **only to this two-TM, same-turn, starting-from-Basics plan**. A Stage1 already established on a prior turn requires fewer placements, and a different effect or evolving later can bypass the specific target budget. It also assumes the desired evolutions are actually searchable, the opponent does not interfere with attacks, Bunnelby remains Active, Tools and Energy are usable, and the intended Basics fit the Bench. Three target Basics in the proposed mixed board consume three Bench slots alongside the Active Bunnelby. The source [Artazon + Capture Energy G&H branch](agent7-vileplume-artazon-capture-three-channel-20261102.md) provides only two searched Basics in its minimal route; the **third** Bench Basic for a Vileplume+Exeggutor+Pidgeotto or two-Exeggutor plan needs a separate legitimate hand/search resource.

A useful native development test would use the fixed v2 source and two physical seats, with actual original rank-6 Initialization, and compare the three reachable target allocations under the **same** owner-safe policy. Record actual first-turn card payments, Bench custody, search results, evolving targets, opponent response, later Pidgeotto Air Mail, Blockade attack and whether a second Exeggutor is still available after the opponent's first KO. Missing resources and unsuccessful routes must remain in the denominator. **No paper game win rate or selected fixed-field deck follows from the stage budget.**

**Global benchmark remains 29/32 authenticated original name/count sixties, missing ranks23/25/28, zero competitively qualified games, no established 99.5% win rate.**
