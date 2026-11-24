# Aichi DDE-bearing field: static target-type audit

**Agent16 — 24 November 2026.**

## Question

Does the authenticated Aichi field contain a type-changing Ability on any Pokémon in the ten lists that include Double Dragon Energy (DDE), such that the PR #65 preflight's type check before DDE AttachEnergyEffect propagation could disagree with the target's type after attachment?

## Method

- Read the canonical `results/aichi-2026/full-decklists.json` (29 published full lists; ranks 23, 25 and 28 remain missing).
- Selected every list containing the exact DDE ROS #97 printing: ranks **10, 12, 13, 14, 18, 19, 20, 21, 27 and 32**.
- Enumerated the **30 unique Pokémon printings** in those ten lists and matched each exact set / number / name to the repository's `resources/cards/en/*.json` record. All 30 matched; no missing card record.
- Inspected each matched Pokémon record's Ability text for type-changing effects. Separately checked the known dynamic-type controls used by PR #65; Kecleon, Gallade and Magnezone do not appear in any of the 29 published lists.

## Result

**No Ability on any of the 30 exact Pokémon printings changes that Pokémon's type.** The dynamic-type controls in the PR are defensive generic tests, not cards present in the authenticated Aichi field.

The exact 30 printings are:

| Set | No. | Pokémon |
|---|---:|---|
| SIT | 135 | Regidrago V |
| SIT | 136 | Regidrago VSTAR |
| ASC | 16 | Budew |
| TWM | 130 | Dragapult ex |
| UPR | 100 | Dialga-GX |
| TEF | 120 | Koraidon ex |
| SFA | 47 | Kyurem |
| LOR | 136 | Hisuian Goodra VSTAR |
| UNB | 57 | Dedenne-GX |
| PAL | 169 | Squawkabilly ex |
| GRI | 60 | Tapu Lele-GX |
| SSP | 76 | Latias ex |
| UNB | 81 | Marshadow |
| PHF | 36 | Wobbuffet |
| PAL | 153 | Noivern ex |
| DAA | 104 | Crobat V |
| ASC | 142 | Fezandipiti ex |
| JTG | 114 | Salamence ex |
| ASC | 152 | Mega Dragonite ex |
| CEC | 95 | Oricorio-GX |
| GRI | 66 | Sudowoodo |
| MEG | 104 | Mega Kangaskhan ex |
| TEF | 123 | Raging Bolt ex |
| CEC | 156 | Arceus & Dialga & Palkia-GX |
| PAR | 108 | Sandy Shocks ex |
| CRE | 97 | Galarian Moltres V |
| DRX | 22 | Ho-Oh-EX |
| TEU | 51 | Tapu Koko Prism Star |
| TEF | 78 | Flutter Mane |
| RCL | 19 | Eldegoss V |

Energy-attachment text found in these exact lists does not change Pokémon type:

- Regidrago V SIT #135 — Celestial Roar attaches Energy cards milled from the deck to itself (attack).
- Arceus & Dialga & Palkia-GX CEC #156 — Ultimate Ray attaches Basic Energy from the deck (attack).
- Sandy Shocks ex PAR #108 — Magnetic Absorption attaches a Basic Fighting Energy to itself (Ability).
- Galarian Moltres V CRE #97 — Direflame Wings attaches a Darkness Energy to itself (Ability).
- Ho-Oh-EX DRX #22 — Rebirth attaches three different types of Basic Energy to itself (Ability).
- Tapu Koko Prism Star TEU #51 — Dance of the Ancients attaches Lightning Energy to two Benched Pokémon (Ability).

These are Energy-attachment effects, not Pokémon-type-changing effects. Koraidon ex TEF #120 is Dragon type and has no Ability; do not confuse it with the different Fighting-type Koraidon ex SV1 printing.

## Interpretation and limits

- The PR #65 preflight-before-AttachEnergyEffect ordering assumption remains **unproven as a universal Twinleaf semantic**.
- This static field audit finds no target-side type-changing Ability in the ten authenticated DDE-bearing Aichi lists, so it narrows the ordering concern for this particular field. It is not a proof that every possible opponent-side or future effect preserves type, and it is not a simulation result.
- The separate rule that discards an attached DDE when its host later ceases to be Dragon remains a distinct untested behavior and still needs a dedicated regression before full-field simulation.
- This audit does not authenticate the three missing source lists, admit physical paper opponents, qualify a matchup, compare candidate decks, or support a win-rate claim.

## Decision relevance

For the current 10/29 DDE-bearing Aichi source lists, the exact published card pool contains no Pokémon Ability that changes a DDE target's type during the attachment. Keep the universal ordering caveat documented, but do not treat it as an observed field-specific failure. Keep the host-ceases-to-be-Dragon discard regression as a separate pre-full-field gate.
