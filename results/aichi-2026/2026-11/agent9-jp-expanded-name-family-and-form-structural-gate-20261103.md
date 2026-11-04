# Official Japanese paper Expanded structural negative screen for the 29 authenticated Aichi original sixties

**Agent 9 | 3 November 2026 UTC | source-inventory and printed-rule negative certificates | zero simulated competitive games**

## Decision relevance

A single candidate 60 cannot be promoted on Twinleaf's `DeckAnalyser(Format.EXPANDED)` result alone. The applicable **Japanese** paper Expanded regulation at the **10 May 2026** Aichi Open includes the BW-onward pool, a February 2026 prohibited-card list, and cross-name mutual exclusions for Professor Juniper / Professor Sycamore / Professor's Research and for Lysandre / Boss's Orders. The original tournament roster is an English mechanical-print proxy and does not automatically certify the original Japanese card print or time legality.

Official source: [Japanese Expanded regulation, updated 19 February 2026](https://www.pokemon-card.com/rules/regulation/index.html), with the subsequent Medicham V restriction effective 20 February. The existing [source-backed project legality baseline](../japanese-legality.md) enumerates all **27 ban entries**, including two distinct banned Unown form-specific Abilities. No player or match performance is inferred.

## Added reproducible negative-only screen

- [`simulation/twinleaf/agent9-jp-expanded-structure.cjs`](../../../simulation/twinleaf/agent9-jp-expanded-structure.cjs) loads the **bundled** `resources/sets/en.json` and `resources/cards/en/*.json` into a composite `name|PTCGO-code|collector-number` index. Duplicate English print records with different mechanics remain ambiguous. It checks 60 copies, aggregated four-copy rules (excluding nine Basic Energies), same-name Prism Star copy caps, one ACE SPEC total, one Radiant total, presence of an actual Basic Pokémon, banned Trainer names, source-identified Pokémon Ability/attack forms, and both special Supporter-exclusive name families.
- [`scripts/agent9-jp-expanded-source-audit.cjs`](../../../scripts/agent9-jp-expanded-source-audit.cjs) reads the frozen `full-decklists.json`, retains the 29 source ranks and missing 23/25/28, and reports each rank's source copies, matched versus unresolved English print metadata, detected necessary-condition violations, and explicit unverified paper-legality status.
- [`tests/agent9-jp-expanded-structure.test.cjs`](../../../tests/agent9-jp-expanded-structure.test.cjs): **9/9 Node 22 pure unit tests passed locally** on the corresponding module code, including negative Professor-family and Boss-family collisions, two ACE SPECs, over-four same name, prohibited Flapple ability, Japanese-unmatched proxy, Energy-not-Basic-Pokémon starter, Radiant cap and provenance of missing rank. This is a local pure-test receipt. A full repository CI command of the 29-rank runner is not claimed to have run.

## Direct independent original-source roster audit

Read the registered 29 original `results/aichi-2026/full-decklists.json` lists directly through the GitHub repository connector, with **989 distinct source card rows** and **1,740 physical cards**. A separate in-memory code audit verified:

| Necessary-condition family | Observed failures in 29 originals | Proof scope |
| --- | ---: | --- |
| Exactly 60 physical cards per list | **0** | Source card counts |
| Over four copies of a non-Basic-Energy displayed name | **0** | Aggregated displayed names across printing rows |
| Officially prohibited **Trainer-name** displayed in source manifest | **0** | The 14 named Trainer bans, not Pokémon form restrictions |
| Professor Juniper/Sycamore/Research coexistence or Lysandre/Boss coexistence | **0** | Exact displayed Supporter names |
| Multiple ACE SPEC names/copies in one source 60 | **0** | Name set cross-checked against the bundled English card database, 39 ACE SPEC names |
| More than one Radiant Pokémon in one source 60 | **0** | Name set cross-checked against bundled English database |
| Repeated same-name ♢/◇ Prism Star | **0** | Explicit source-name glyphs |

All 29 source sixties display exactly **one ACE SPEC**. Names include `Scoop Up Cyclone` in rank3 and `Dowsing Machine` in rank26: a simplistic ACE SPEC name filter that misses those printings gives a wrong lower count, so the audit uses the full collected name set.

**Form-specific Pokémon:** The only banned-family display-name overlaps in the source roster are `Marshadow UNB 81`, `Unown AOR 30`, and `Duskull PRE 35`, across a total of 14 original rank lists containing at least one such family. Their exact English print entries in the bundled `cards/en` archive were individually inspected:

- `Marshadow UNB 81` has **Resetting Hole**, rather than the banned **Let Loose**.
- `Unown AOR 30` has **Farewell Letter**, rather than the banned **DAMAGE/HAND** forms.
- `Duskull PRE 35` has no printed Ability, rather than the banned **Spiritborne Evolution**.

These three identities therefore do not raise a **corresponding printed-mechanism violation** in the bundled English proxy. The original Japanese print identity and Japanese card-reissue equivalences remain separate obligations. Other names without an overlap are not thereby fully certified.

## Strict boundary and next gate

This is a **necessary-condition screen**, with **zero detected issues in the direct roster checks**. It cannot certify Japanese original print identity, original release cutoff, reprints carrying an earlier prohibition, all non-name special deck-construction restrictions, the actual card-effect fidelity in pinned Twinleaf or every permitted starting-state branch. Cards absent or ambiguous in the English archive must be reported as **UNKNOWN**, never illegal solely for absence. The source reports no final fixed best60, zero competitively qualified games, and no evidence for a 99.5% whole-field win rate.

For the first genuinely selected shared bilateral policy and fixed challenger 60, run this new source audit and confirm its unknown/reissue rows in addition to the native deck analyzer. Recheck any proposed deck change's ACE SPEC, Radiant, exclusive Supporter family and form-specific bans before spending a whole-field experimental budget. Preserve exact source print and 32-rank provenance. Do not interpret a clean negative screen as a positive paper-legality certificate.

**No new default-off action policy, workflow, duplicate source list, or competitor claim was added.**
