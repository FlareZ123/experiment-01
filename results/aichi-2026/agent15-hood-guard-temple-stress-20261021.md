# Hood Shield v1 against Darkness: Weakness Guard Energy and Temple tradeoff

**Agent 15 | 21 October 2026 UTC. Evidence class: published card text, exact opponent-card inventory, and exact direct-resource combinatorics.** This document evaluates a structural modification to the frozen Hood Shield v1 candidate. It does **not** register a changed final candidate, certify native Twinleaf behavior, quantify true lock exposure, demonstrate a competitive game, or estimate any matchup win rate.

## Falsifiable idea

The frozen [Hood Shield v1 60](candidate-hood-shadow-rider.json) contains four Shadow Rider Calyrex V, four VMAX, **14 Basic Pokémon**, eleven Basic Psychic Energy, two Stealthy Hood, one Sky Field and one Dimension Valley. Against Mega Absol ex, Hood protects a VMAX from opponent-owned Garbotoxin while it is attached; on its own Hood does not erase the VMAX's Darkness Weakness.

The supplied English card pool identifies **Weakness Guard Energy UNM 213**, `sm11-213`: “This card provides Colorless Energy. The Pokémon this card is attached to has no Weakness.” It occupies an **Energy attachment**, independently of the VMAX's Tool slot. This makes it structurally compatible with an attached Stealthy Hood. The alternative **Weakness Policy PRC 142**, `xy5-142`, says the attached Pokémon has no Weakness but is a **Pokémon Tool**; a Pokémon cannot ordinarily carry Weakness Policy and Hood simultaneously.

The same source pool identifies **Temple of Sinnoh ASR 155**, `swsh10-155`: “All Special Energy attached to Pokémon (both yours and your opponent's) provide Colorless Energy and have no other effect.” Its active text removes Weakness Guard Energy's protection, even though the Special Energy can still contribute one Colorless Energy. The candidate's Sky Field and Dimension Valley are potential Stadium replacements, subject to actual Stadium/Item access, turn timing and an opponent's ability to play Temple again.

The previously verified historical rank-8 source opponent [Crispin-to-Claw line](agent44-rank8-crispin-three-settled-claws-20261020.md) used printed **Mega Absol ex MEG 86 Claw of Darkness** (200 Darkness damage; Darkness + Darkness + Colorless cost) against a clean Shadow Rider Calyrex VMAX CRE 75 (320 HP; Darkness ×2 Weakness). The source's settled native attacks and Prize movements do not establish that a Guard-bearing replacement would survive in the same trajectory. As a **printed-card counterfactual**, removing Weakness would change ordinary base-attack damage from 400 to 200; additional attack modifiers, accumulated damage and opponent response still matter.

## Exact-source counter coverage

Read directly from the exact [29 published opponent 60s](full-decklists.json), by card name:

| Absol/Garbodor source rank | Temple of Sinnoh | Field Blower |
| ---: | ---: | ---: |
| 8 | 2 | 1 |
| 11 | 2 | 0 |
| 16 | 2 | 0 |
| 22 | 2 | 1 |

Across all 29 published source 60s, there are **zero** Weakness Guard Energy and zero Weakness Policy copies. These are inventory facts about this field, with rank 23/25/28 source lists still unavailable. The four Temple counts demonstrate a relevant **anti-Guard counter-resource** in every published Absol/Garbodor 60; actual drawing, access, sequence and re-establishment frequency remain unknown. Under Garbotoxin, the candidate must also account for attacker Energy concentration and the opposing active Pokémon's attacks.

## Exact direct-resource opportunity calculation

Consider *two hypothetical swaps only*: replace **one** or **two** of the candidate's eleven Basic Psychic Energy with the same number of Weakness Guard Energy. All other 60 slots are held fixed, including two Hood, two distinct candidate Stadiums and fourteen Basic Pokémon. Analyze a random physical initial seven and **one subsequent normal draw**, conditional on at least one Basic Pokémon being among the initial seven. Randomly set six Prize cards from the remaining deck before the draw. Marginally, the eight seen cards are an ordered size-eight sample of the 60, but the legal-Basic condition must be applied to the **initial seven**, so an ordinary eight-card hypergeometric calculation alone is insufficient.

| Directly seen in first eight | 1 Guard | 2 Guard |
| --- | ---: | ---: |
| At least one Weakness Guard Energy | 12.772842% | 24.115761% |
| Guard **and** at least one Stealthy Hood | 2.723344% | 5.184358% |
| Guard, Hood **and** at least one of Sky Field / Dimension Valley | 0.503953% | 0.967747% |

The last row represents an especially narrow *direct-sighting* conjunction that could supply a Stadium answer to a preexisting Temple **if** the other actions are legal and timely. It is **neither** an unconditional opening-line frequency **nor** an upper bound on setup success: other draws, search effects, field conditions and Prize recovery can create additional access; the required V/VMAX pieces, attached Energy, benches, turn actions and opponent policy can also prevent the line from functioning.

**Reproducibility:** [Exact BigInt inclusion-exclusion evaluator](../../scripts/hood-guard-window-exact.cjs) with [four local Node tests](../../tests/hood-guard-window-exact.test.cjs), including exhaustive tiny-deck ordered deals and independent reference fractions, passes on Node v22.16.0. No expensive compiled Twinleaf CI was dispatched, since this is a preliminary structural screen. The evaluator retains exact integer numerators/denominators and reports conditional and unconditional fractions. A separately calculated Python rational baseline agreed at better than (10^{-12}) per tested scalar. Card names, counts, printings and text were checked from supplied `cards/en/sm11.json`, `cards/en/swsh10.json`, `cards/en/xy5.json` and the fixed-60 JSON.

## Strategic consequences and first native falsification

**Real upside:** Guard provides an attack-survival pathway that may co-occupy a VMAX with Hood. It could be searched or manually attached before a projected Darkness attack, independently of opponent Ability denial.

**Important costs:**

1. Substituting a Basic Psychic reduces the deck's Underworld Door-compatible Energy inventory from eleven to ten or nine. Underworld Door attaches a Psychic Energy card from hand to a Benched Psychic Pokémon. Guard provides Colorless and therefore cannot be used for that Energy-acceleration route. The candidate's actual historical pass had just one Energy on the Active VMAX despite a successful protected Door; adding a Colorless-only Energy may further expose a sequencing bottleneck if the attachment is needed elsewhere.
2. Temple turns off the protection. The player may have to spend a once-per-turn Stadium placement at a timing that also sacrifices Sky Field/Dimension Valley's existing utility. The opponent has two Temples, and some lists have Field Blower to remove Hood. A single Stadium answer is not a permanent state guarantee.
3. Guard must attach to the VMAX that will actually be attacked before the opponent's damage window. If the opponent gusts a different unguarded attacker, a Guard on another Pokémon does nothing to prevent that Knock Out. Subsequent opponent attack text and Weakness/Resistance calculations must be evaluated by printed effects, not a static damage threshold.
4. One-colorless provision can contribute to printed Max Geist's three-Colorless attack cost, but Guard cannot substitute for the Basic Psychic resource used to accelerate the board through Door. Tool, Energy, Bench and Supporter contention all remain state-dependent.

**Proposed native stress test before deck promotion:** in the existing joint-profile runner, keep both published decks fixed and only create a controlled counterfactual branch from an authenticated source-observable pre-Claw state: attach a genuine Guard to the threatened VMAX through a legal earlier player action; preserve its Hood and the opponent's equipped Garbodor; compare actual Claw damage/Prize settlement with Temple absent versus present. Confirm legal Stadium replacement and a subsequent source response, then screen any changed fixed 60 under one actor-only common policy. A synthetic injected board may test effect fidelity, but **cannot** count as a game win. The precise failure to record is whether the guarding Energy is attached and surviving at the actual damage boundary, and whether Temple nullifies it.

**Decision:** hold this as an **unpromoted, Temple-vulnerable structural hypothesis**. The existing resource/attack-funding and common-policy qualification gaps dominate the evidence for competitive ranking. The research index should keep all four current fixed lists unranked. **29/32 published source 60s, zero qualified competitive games, and no demonstrated 99.5% solution.**
