# Agent 21: same-name, different-effect printings in four original Aichi Top 32 sixties

**2 November 2026 | Full authenticated source inventory; no game-win claims.**

## Question and evidence

Could two Pokémon with the same name inside an original opponent's fixed 60 differ mechanically enough that a name-only action policy or source audit becomes ambiguous? **Yes, in four original decks.**

Enumerated every row of the 29 published original sixties in [full-decklists.json](full-decklists.json), Git blob ae773f6201d7aa69d31914dbfee66f3fba692200. Within EACH deck, grouped by card name and distinct set/collector number. Every distinct printed card was independently resolved through the bundled [English sets](../../resources/sets/en.json) and exact [English card records](../../resources/cards/en/). Compared full Ability and attack object arrays, including costs and effects.

The denominator is **29 × 60 = 1,740 original physical card slots**. There are **five** same-name mixed-printing groups, in **four** decks (ranks 15, 16, 22, 31), with **14 physical copies** total. Every one of those five groups has differing printed attacks and/or Abilities.

| Rank and source archetype | Same Pokémon name, exact original counts | Distinguishing printed effect |
| --- | --- | --- |
| 15 Lopunny Vileplume | 2 Vileplume AOR 3; 1 Vileplume BUS 6 | AOR **Irritating Pollen** prevents both players playing Items. BUS **Disgusting Pollen** prevents opposing Basics attacking while this Vileplume is Active. Different lock, board position and scope. |
| 15 Lopunny Vileplume | 1 Pidgeotto TEU 123; 1 Pidgeotto MEW 17 | TEU has **Air Mail** card selection. MEW lacks the Ability and has Flap instead of Gust. |
| 16 Absol Garbodor | 2 Garbodor LTR 68; 1 Garbodor BKP 57 | Both share **Garbotoxin**. LTR attacks with **Sludge Toss**; BKP has **Offensive Bomb**, which causes Poison and Confusion. |
| 22 Absol Garbodor | 1 Trubbish FST 168; 1 Trubbish NVI 48 | FST has **Call for Family** and **Super Poison Breath**. NVI has **Garbage Collection** and **Sludge Bomb**. Setup, recovery and poison lines differ. |
| 31 Dusknoir Chimecho | 3 Dusknoir PRE 37; 1 Dusknoir BCR 63 | PRE **Cursed Blast** places 13 opposing damage counters and KOs itself; BCR **Sinister Hand** repeatedly redistributes existing opposing damage counters. Different Prize and KO geometry. |

The printed behaviors are from the bundled English-equivalent snapshot. The snapshot is a card search resource rather than a certificate of 2026 Japanese event legality or current Twinleaf runtime effect fidelity.

## Implications for the fixed-60 evaluation

The repository's headless native PlayCardAction ledger can expose only a card **name**. Agent 34's existing [live original Store physical card-instance observer](../../simulation/twinleaf/agent34-live-card-instance-receipts.cjs) and [sequential printing join](../../simulation/evaluation/agent34-original-store-printing-join.cjs) already preserve more exact source card identity with conservative certification flags. This inventory gives an exact-field proof why that distinction matters.

A root labeled simply Vileplume, Trubbish or Dusknoir is insufficient to identify a legal attack/Ability/lock or to attribute a KO. Preserve the full set/collector number, actual in-match executable identity, actor seat, ordered Store action/prompt lineage and physical board effect in both-sided policy and paper-action evidence. Name-count equality does not imply printing-level action equivalence.

**Next falsification target:** natural source-dealt rank 31 with both Dusknoir printings (different damage-counter actions), or rank 15 with the two Vileplume lock printings. Register the trial before observing the deal; retain failed/non-reached actions and confirm physical source printing, native effect, and public turn/Prize chronology. This is a proposed native test, **not** an observed simulator mix-up or a claimed competitive win.

## Reproducibility

- [Exact CommonJS census](../../scripts/agent21-mixed-original-printing-census.cjs), initial commit 472d6a9f497ee91266e1d0ccfb69b77fea95b117; script blob b318007076fca71144a6e302cd7c7246edc2e17f.
- [Four regression tests](../../tests/agent21-mixed-original-printing-census.test.cjs), commit 55902daeb17196da2c2a10df1945059a7cad68d1; test blob d7e9c7c933e30890b8699f5f758cc66f68b7f724.
- Executed the exact fetched script and tests in **JavaScript V8** with read-only mocked Node test/filesystem/path/assert adapters using the actual 13 repository code/data files fetched via GitHub. **4/4 tests passed**. This is a real JavaScript source/data execution, not native Node CI or a compiled Twinleaf game.
- Independently used local Python to inspect the same ten card records in the supplied original card ZIP; Ability and attack names agree.
- No new workflows, candidate changes, native engine changes, or invented opponents.

**Boundary:** the original source denominator is still **29/32** with ranks 23, 25 and 28 missing. **Zero competitively qualified games**, no validated strongest fixed 60, and no demonstrated 99.5% win rate.


## Supplemental source metadata guard: reused PTCGO set codes

A second source-level hazard was found while extending the exact-print resolver across source ranks. The bundled English sets metadata contains **nine** PTCGO codes reused between a main set and a companion subset: HIF, SHF, CEL, BRS, ASR, LOR, SIT, CRZ and 30C. A naive one-to-one map from code to the last set ID selects, for example, the Lost Origin Trainer Gallery instead of Lost Origin main. The source original **Pikachu LOR 52** is in the main set, while the distinct **Pikachu LOR TG05** exists in the Trainer Gallery subset. The naive resolver incorrectly failed when asked for LOR 52; it had not affected the five within-deck collision cases reported above.

Across all 29 original sixties, **76 manifest rows representing 142 physical copies** reference one of the five used ambiguous codes (BRS 1, ASR 53, LOR 12, SIT 75, CRZ 1 copies). These are counts of card records needing correctly disambiguated metadata lookup, **not observed native engine failures**. No conclusion about the repository's established CardManager or deck importer follows from this local auxiliary resolver defect.

Fixed the [census resolver](../../scripts/agent21-mixed-original-printing-census.cjs) to search all set-ID candidates with the requested code, collector number and, where available, the expected card name; zero or multiple matches now fail closed. Added explicit LOR main-set Pikachu 52 and Gallery Pikachu TG05 tests to the [same four-test regression](../../tests/agent21-mixed-original-printing-census.test.cjs). Updated script blob 448b8a1e8e2182dce4f2ab846923a31443bf0555, test blob d53f9f89b81bcde37c25d1a3ea2e81aea683b882. Re-executed the exact source/tests under V8 with the actual 15 fetched repository files and read-only Node shims: **4/4 passed**. Native Node CI and native game remained unrun.
