# Printed Item-play locks in the supplied complete card database

**Agent 8, 1 November 2026 | exploratory metadata inventory, not paper-legality certification**

## Reproducible inventory

Scan `card-list.zip`'s `cards/en/*.json` Pokémon `abilities[].text` and `attacks[].text` for English printed phrases equivalent to `can't play ... Item`. Group by `(Pokémon name, Ability/attack name, text)` so cosmetic print variations do not become separate mechanics. The supplied database yields **41 matching printings representing 24 distinct effect texts**: **six Ability-based patterns and 18 attack-based patterns**. These are printed database records across all releases, **not a prefiltered Expanded legality list** and not counts of unique tournament archetypes. Effects printed differently with the same rule semantics may still count separately; this is an inventory only.

### Six passive Ability patterns

| Pokémon | Ability | Native/model-relevant condition | Scope |
| --- | --- | --- | --- |
| Vileplume (AOR) | Irritating Pollen | Vileplume in play, Ability effective | Both players |
| Gothitelle (BW) | Magic Room | Gothitelle Active and Ability effective | Opponent |
| Trevenant (XY) | Forest's Curse | Trevenant Active and Ability effective | Opponent |
| Jellicent ex (WHT) | Oceanic Curse | Jellicent ex Active and Ability effective | Opponent; also Tool lock |
| Tyranitar (JTG) | Daunting Gaze | Tyranitar Active and Ability effective | Opponent |
| Omastar (TEU) | Fossil Bind | Fewer Pokémon in its controller's play and Ability effective | Opponent |

### Eighteen attack-text patterns

The scan contains single-turn opponent Item-play effects from **Zebstrika (Disconnect), Dragonite (Deafen), Budew (Itchy Pollen), Flaaffy (Disconnect), Frillish (Oceanic Gloom), Cryogonal (Frozen Lock), Beheeyem (Mysterious Noise), Noivern-GX (Distort), Luxio (Disconnect), Shuppet (Enveloping Shadow), Banette ex (Everlasting Darkness), Venomoth (Perplexing Powder), Galvantula ex (Fulgurite), Vileplume (Allergy Storm), Vikavolt V (Paralyzing Bolt), Pikachu V-UNION (Disconnect), Seismitoad-EX (Quaking Punch), and Hoothoot (Proclaim the Night)**. Some require a coin flip, a paid attack, or an effect that can fail. Allergy Storm has a conditional Item-lock branch. Attacks written with this restriction affect the opposing **player** on its next turn; the attacker need not remain in the Active Spot once that effect is established, subject to its printed rules.

## Consequence for game-state evaluation

Checking only a player-level `cannotPlayItemCards` boolean cannot certify Item legality across this pool. The effective action set depends on (a) the identity and location of passive lock Pokémon, (b) whether their Abilities are blocked, (c) turn-scoped effects left by earlier attacks, (d) attack-specific conditions and successful coin outcomes, and (e) any current restrictions from other effects. Consequently:

1. A static per-card lock label is an inadequate action validator.
2. A universal `Vileplume in play => no Items` rule incorrectly suppresses valid actions when Irritating Pollen is disabled.
3. A legal action chooser should reject an Item option before consuming a root decision, then reconsider legal alternatives from that same actual decision state.
4. The native Store remains an executable test reference; a native acceptance is insufficient to certify official paper legality or tactical quality.

## Observed failure that motivated this inventory

[Agent 8's exact original rank15 Fog Crystal / AOR Vileplume forensic report](../aichi-2026/agent8-rank15-fogcrystal-aor-itemlock-diagnostic-20261101.md) documents all eight original simulator failures and matching source-deal evidence. The specific pinned native AOR Vileplume implementation hooks `PlayItemEffect`, which bypassed the paper-veto adapter's boolean-only condition. A separate experimental native-effective AOR predicate is being tested independently, with Wobbuffet PHF Ability-suppression controls.

## Exact scan procedure

Read only `cards/en/*.json` from the provided ZIP. For each Pokémon card, concatenate each `abilities[]` or `attacks[]` text, lowercase it, and select the text if it contains `item` and matches a regular expression for `can't play [any] Item` (including curly apostrophes), or `cannot play Item`. Group qualifying rows by Pokémon name, power/attack name, and full printed effect text. Result: **six Ability groups with nine printings, 18 attack groups with 32 printings**, totaling 24 groups and 41 printings. Results depend on the bundled database version; a complete lock ontology will require manual validation of text variants and current Expanded legality.

**No competitive game, win-rate or deck-strength conclusion follows from this inventory.**
