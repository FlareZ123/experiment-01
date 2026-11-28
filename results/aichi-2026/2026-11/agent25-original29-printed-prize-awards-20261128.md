# Original Aichi 29 printed-rule Prize audit: 49 misvalued Pokémon copies over 16 source lists

**Finding:** the current frozen Hood Shield candidate-policy function `prizeLiability(slot)` has three *provable* field-wide static Prize-award classification gaps; it undervalues some of the strongest takedown targets in the exact original opponent field. This is direct source-printed-card evidence, not a measured game loss or a source-reconstruction exercise.

**Source coverage:** All **29 authentic original source 60s** in `results/aichi-2026/full-decklists.json`; **309 Pokémon card rows** containing **467 Pokémon copies**. Crosswalk used the repository's `resources/sets/en.json` and exact `resources/cards/en/*.json` set+number+name, **53 distinct printed set codes**, checked in four bounded GitHub-source batches. Every printing resolves after interpreting exactly **six Prism Star suffix aliases** (`♢` in the source vs `◇` in card database), by exact matching the remaining printed name, set and number. There were **no unresolved printings after this narrow alias**. This does not imply that the three still-missing entire Top32 source decks (ranks 23/25/28) are resolved.

## Three distinct source-rule miscounts

| Printed Pokémon class | Correct baseline paper Prize award | Frozen worker's name-based `prizeLiability` | Affected original ranks | Printed copies |
| --- | ---: | ---: | --- | ---: |
| **Modern Mega Evolution Pokémon ex** (`Mega Absol ex MEG86`, `Mega Dragonite ex ASC152`, `Mega Lopunny ex PFL84`, `Mega Kangaskhan ex MEG104`) | **3** | **2** | 8, 9, 11, 14, 15, 16, 18, 20, 22, 32 | **16** |
| **Pokémon VSTAR** (`Regidrago VSTAR SIT136`, `Hisuian Goodra VSTAR LOR136`) | **2** | **1** | 10, 12, 13, 14, 18, 20, 21, 27, 32 | **32** |
| **Older Pokémon-EX** (`Ho-Oh-EX DRX22`) | **2** | **1** | 19 | **1** |
| **Total** | | | **16 distinct ranks** | **49** |

**25 distinct original Pokémon entries** misvalued (10 Mega + 14 VSTAR + 1 Pokémon-EX). This is **49/467 = approximately 10.49% of Pokémon cards by physical deck-list multiplicity**, not 10.49% of turns, active targets, or games. The 29 source decklists are unweighted here. The 16 affected ranks are **8,9,10,11,12,13,14,15,16,18,19,20,21,22,27,32**.

The frozen worker's exact fallthrough is:

- Three Prize cards for the absent projected `printed.subtypes` indicating VMAX/V-UNION/TAG TEAM, or string `VMAX`, `V-UNION`, or a TAG TEAM name.
- Two Prize cards for absent subtypes `ex/GX/V`, or string `-GX`, ` ex`, or ` V`.
- Otherwise one Prize.

But the pinned native actor observation constructs `printed.subtypes` from `pokemon.subtypes??[]`, which is empty for the relevant classes. String `-EX` and ` VSTAR` are not covered, and modern `Mega ... ex` reaches only the ordinary two-Prize ` ex` branch. **These are static source-code errors independent of policy strength, search randomness, or opponent strategy.** The card database explicitly encodes the real awards in each card's `rules` entry. The Mega Dragonite ex ASC152 printing even carries **both** a general two-Prize ex rule and the stronger **three-Prize Mega Evolution ex rule**, so naïvely taking the first rule also fails. Old XY `M Rayquaza-EX ROS76` remains an old Pokémon-EX taking only two Prizes, not a modern three-Prize Mega ex.

## Direct tactical consequence

The rank-8 source original list has 2 `Mega Absol ex MEG86` (280 HP, 3 prizes) and 1 `Dedenne-GX UNB57` (160 HP, 2 prizes). A conditional, legal, fully visible nine-Psychic Hood VMAX board with three own Prizes left can choose a terminal three-Prize Mega KO via Guzma; the frozen score instead ranks Dedenne **16,040** over Mega **15,920**, while correcting Mega's prize count raises Mega to **17,620** and reverses this choice. Full line details and distinct **forced own-Active switch** scoring bug are in [the 13-case terminal Guzma result](agent25-mega-vstar-prize-value-terminal-guzma-20261128.md). This is an explicit deterministic wrong decision in the frozen scoring formula, **not** a simulated match outcome or proven frequency of that exact board.

## Reusable correction and precise evidence boundary

- [Rule-based original-print Prize auditor](https://github.com/FlareZ123/experiment-01/blob/agent25/rank2-duplicate-gust-target-20261128/simulation/evaluation/2026-11/agent25-prize-rule-source-audit.cjs): reads the exact committed source decklists, set-code metadata and card database. Matches full printing; allows only `♢` vs `◇` Prism Star **suffix** normalization; refuses unresolved or ambiguous source printings; recognizes overrides by taking the **maximum explicit “opponent takes N Prize cards” rule**; reports all entries and discrepancies in machine-readable JSON. `node simulation/evaluation/2026-11/agent25-prize-rule-source-audit.cjs > audit.json` is the intended fully local command after checkout.
- [13 local source-print Node tests](https://github.com/FlareZ123/experiment-01/blob/agent25/rank2-duplicate-gust-target-20261128/tests/2026-11/agent25-prize-rule-source-audit.test.cjs): **13/13 passed** with genuine source card records extracted from the supplied card pool, including Mega's overriding two-rule print, VSTAR, old XY Mega, Black-White Ho-Oh-EX, TAG TEAM/VMAX, promo number formatting, Prism glyph compatibility, exact source prints, fail-closed missing and non-60 inputs. Two artificial 60-card fixtures isolate specific award mismatch types; **they are not replayed opponents**.
- **Remote bounded batch computation** of the real 29 original source Pokémon rows against the actual committed card files: sets AOR…CRI (50 rows), CRZ…NVI (73), OBF…SFA (66), SIT…XY (117), XYP (3). Total **309**; six suffix-only glyph differences as above; **25 misclassified entries / 49 copies**; no other printed-award mismatch to the frozen name fallback found. The standalone **full 29-deck CLI has not been run as one local combined command**, because the live 234KB opponent source JSON was not materialized in the local isolated runtime; the bounded per-set comparison itself was executed with GitHub source reads. Do not conflate the local unit-test pass with full CLI execution.
- **Recommended policy successor correction:** either expose an actor-visible, source-rule-grounded `printed.prizeAward` for each public Pokémon via a coordinated protocol change, or immediately patch the frozen heuristic's exact class gaps `Mega ... ex → 3`, ` VSTAR → 2`, `-EX → 2` in **Agent46's approved successor**. Rank terminal Prize conditions above superficial high-damage scores and evaluate Guzma's target against the post-switch payable Bench attacker. The official native/paper game's dynamic modifiers (e.g. Legacy Energy or other effects altering Prize awards) remain *state-dependent*; static printed baseline 1/2/3 is not a complete Prize-resolution engine.

**Frozen PR #95 and PR #104 one-gate witness untouched. Qualified competitive Aichi matchups remain 0/32, and no 99.5% claim is made.**
