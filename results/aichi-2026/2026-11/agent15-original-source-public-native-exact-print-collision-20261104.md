# Real source-name collision exposure and native public exact identifier witness

**Agent 15 | 4 November 2026 | Pure original-29 source-identity audit plus read-only original-rank 5/11 native two-seat replay. Zero qualified competitive games.**

## Why exact identifiers matter and when they do not

The shared actor-observation interface historically represents cards in hand and public discard as `fullName` strings of the form `name + set`. This is safe for identifying a publicly visible card *family* but cannot uniquely specify a card's actual set-number or printed mechanic whenever multiple numbered cards share that name and set. The supplied public English database has 16,475 indexed name+set keys, 493 with divergent recorded subtype/HP metadata, and 38 crossing the `Rescue Carrier` <=90 HP boundary. These are **whole English archive** statistics, **not** the incidence of that problem in Aichi original decks.

The new source-aligned [`originalSourceNameSetAmbiguityCensus`](../../../scripts/agent15-discard-target-source-census.cjs) was applied to the complete 29 frozen printed original 60s after **verified** source display, promo set and MEE aliases. Only **13 physical original cards across five name+set keys** encounter different public English subtype/HP records. Among those 13, **zero** have conflicting Pokémon-vs-Trainer/Energy subtype and **zero** cross the Rescue Carrier 90-HP eligibility threshold. This bounds the practical value of exact IDs **for this specific five-Item discard recovery screen** on the known 29 field. It does **not** make the source card's *attack/Ancient Trait* unambiguous.

| Name+set shorthand | Source physical copies | Original ranks | Source number | Mechanic distinction requiring exact print |
| --- | ---: | --- | --- | --- |
| `Bunnelby PRC` | 6 | 2, 3, 15, 26 | **121** | `xy5-121` has **Ω Barrage**, Burrow/Rototiller; `xy5-120` lacks that Ancient Trait and has Trip Over |
| `Oddish UNB` | 4 | 2, 15 | **5** | `sm10-5` 50 HP, Stun Spore/Seed Bomb; `sm10-6` 60 HP, Hook |
| `Electrike PRC` | 1 | 7 | **60** | `xy5-60` 50 HP **Ω Barrier**, Thunder Fang; `xy5-59` 60 HP, Charge/Bite |
| `Jirachi XYP` | 1 | 2 | **67** | English `xyp-XY67` **Stardust/Dream Dance**; other XYP Jirachi numbers have different attacks, even though `XY67a` is a same-mechanics art variant |
| `Toedscool PAR` | 1 | 9 | **16** | `sv4-16` 60 HP Kick/Absorb; `sv4-15` 50 HP Clinging Spore/Vine Slap |

These original collector references are from the frozen manifest and verified English archive records. They are **not** new claims of exact Japanese event printing/reprint equivalence. Bunnelby's Ω Barrage difference is especially relevant to the original turn-two double-attack ALS: any simulator or policy that derives attack options from `Bunnelby PRC` alone can substitute the wrong Pokémon. This is a **representation risk**; whether the current native actor chooser actually makes that error requires a direct reproduced root. Agent49 independently investigated the PRC60 Omega Barrier native variant, with explicit disambiguation evidence. The targeted pure source report makes no claim to be the first to identify those particular mechanics.

## New read-only native public card identifier evidence

The new [`owner-public-exact-print-identity.cjs`](../../../simulation/twinleaf/planning/owner-public-exact-print-identity.cjs) constructs a **separate English exact catalogue key** from bundled `ptcgoCode + number`, retaining target-relevant conflicting variants. It extracts from each actual owner *public discard* card `fullName`, `set` and `setNumber` only. That last property is explicitly marked **native catalogue identifier, not necessarily a physically printed collector number**, to handle special cases such as the unnumbered Japanese Palace Book SM-P source key NAN25. The read-only per-root audit is a sidecar of the existing Agent5 manually opted-in owner root. It does not change `actorObservation`'s default public API, take an action, inspect either concealed deck or face-down Prizes, or consult the opponent's hand.

A controlled [pure test](../../../tests/agent15-public-exact-print-identity.test.cjs) demonstrates why this matters: `Bouffalant BLW/90` is eligible under a 90-HP recovery target, whereas `Bouffalant BLW/91` is ineligible, despite identical `Bouffalant BLW` display strings. An absent catalogue ID, a native/card name mismatch or conflicting target-relevant metadata remains **unknown**, never guessed. It is a general demonstration, not a claim that Bouffalant BLW occurs in the 29 authenticated Aichi lists.

**Genuine pinned source native replay:** [manual original rank5-vs-rank11 three-arm run 41745986561](https://github.com/FlareZ123/experiment-01/actions/runs/41745986561), pinned research commit `b142abc2139ef4f2e6f2f839322ee2a0bd00c3bd`, reused the existing original source pair and exact fixed seeds. Two original games completed; both exact source physical deals and both control/observed/repeated-control whole-game traces matched **2/2**. It observed 50 genuine owner decisions without dispatch errors or selected policy change. The same **one physical Super Rod PAL** was held at four owner roots; the genuine public owner discard identifiers were:

- `Professors Letter BKT`: native `BKT/146`, matched a bundled English Item; exact recovery-target result **false**.
- `Darkness Energy MEE`: native `MEE/7`, **absent from bundled English exact-print index**, so exact-only target result **unknown**. The independent source-verified MEE Basic Energy metadata previously established its Basic subtype and returned a positive **target candidate** for Super Rod. Full Item legality and prompt behavior remain unproved.

The two metadata layers are deliberately separate: neither absence from the English archive nor unknown `MEE/7` authorizes a negative paper-play certificate. This native replay's archived artifact **13283252528** has ZIP sha256 `03fad1ac34190949b8d2f6293c4585edffccdb09e934ead120198ffaf3465390`. All physical and trace receipts are read-only and compare against the unchanged existing bot.

**Pure original-source audit:** [manual CI 41746332658](https://github.com/FlareZ123/experiment-01/actions/runs/41746332658), source `421befa72b85454bcf4e55accf4f7409df9de7d5`, succeeded, artifact **13284435035**, ZIP sha256 `b740cc247d26b91361a635bf421f1e7f95dd3e59b104e15ad07dc59c4ef5d474`. Archived `originalSourceNameSetAmbiguities` gives 13 physical copies, five exact keys, 0 conflicting source subtype copies, 0 Rescue Carrier threshold-conflicting source copies, and original-specific ranked records. The full source census also retains 1,740/1,740 *public category* coverage only with separately marked Japanese-only source provenance.

## Strategic and methodological consequences

The five new recovery-target negative rules deserve a conservative interpretation. The source-name shorthand data-loss problem is real and demonstrable, but in the **current exact Aichi original field** its practical effect on those rules' target eligibility is **zero observed copies**. Its more urgent known relevance is selecting the right **printed attack/Ancient Trait and turn plan**, especially `Bunnelby PRC 121` and `Electrike PRC 60`. The project already contains specific ALS research and PRC60 disambiguation: the general message is to preserve **native set/number and actual printed mechanics** in actor-only state analysis rather than relying on broad graph connectivity or printed names alone.

No meaningful change to one fixed optimal 60, frozen decision policy, native legal action-set performance, total 32 opponent coverage or qualified competitive game outcomes follows from this descriptive observation. Field ranks 23, 25 and 28 remain unpublished. No 99.5% Aichi field win rate has been demonstrated.
