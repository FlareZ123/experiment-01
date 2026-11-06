# Agent5 ADP–Thorton–Regidrago v2: pre-event print chronology and Japanese ban-list screen

**6 November 2026 | paper Expanded intake supplement | deterministic static check, zero native games.**

## Frozen candidate and question

The immutable proposal is `results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json`, canonical cards SHA-256 `bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b`, 60 copies, 27 distinct printed IDs. Was any chosen English printed card from a set **released after** the 10 May 2026 Aichi event, or marked Expanded-ineligible by the supplied database? What can the official Japanese banned list establish at the candidate-name level?

## Reproducible static check

The read-only `tests/agent5-adp-v2-printed-release-screen.test.cjs` loads the exact pinned manifest and bundled `resources/sets/en.json` / `resources/cards/en/<setId>.json` arrays. It:
- recomputes the canonical card-array digest and verifies 60 copies;
- requires every exact printed ID to resolve to one English card record with the same name, and both set/card `legalities.expanded === "Legal"`;
- rejects any English set `releaseDate > 2026/05/10`;
- checks at most four cards of each non-Basic-Energy name and exactly one ACE SPEC.

Independent offline execution against the supplied `card-list.zip` with a byte-identical canonical manifest cards array **PASS**. Complete deterministic output: **27 printed-ID rows, 60 physical copies, 19 distinct English sets, 1 ACE SPEC; earliest set 2014/05/07 (Flashfire), latest 2025/07/18 (Black Bolt), zero post-event English sets, zero English Expanded metadata failures, zero card-name count failures.** The printed Black Bolt `zsv10pt5-70` Haxorus is from a 2025 release under the supplied metadata and therefore passes chronology despite its unusual set prefix. This is a stronger *necessary* chronological/metadata screen than a bare assertion of Expanded database legality. An actual checkout / manually dispatched CI of the new test remains to be recorded; the offline mirror's exact canonical digest was independently recomputed as `bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b`.

## Japanese official paper-format cross-check

The Pokémon Company Japanese [regulation page](https://www.pokemon-card.com/rules/regulation/index.html), headed **エクストラ / updated 2026-02-19**, defines the Black & White onward scope and lists prohibited cards/print-specific effects. It contains older exclusions plus the [2025-08-01 Flapple Apple Drop restriction](https://www.pokemon-card.com/info/005165.html), and [2026-02-20 Medicham V restriction](https://www.pokemon-card.com/info/005353.html), both before the Aichi event. Its specially restricted same-deck Supporter families include Lysandre/Boss's Orders and the Professor's Research predecessor family. The v2 manifest holds **one Boss's Orders** and none of the incompatible alternate Supporter family names.

A manual candidate-name comparison with the official displayed prohibited-name/effect list found no obvious matching printed card in these 27 IDs. **This is a preliminary screen, not an independently authenticated Japanese card-ID and event-era equivalence table.** English set release dates are not Japanese release dates; localized names and changes to printed card wording, edition rules or any event-specific restriction remain to be formally resolved. In particular, a green English Expanded flag does not itself establish sanctioned Japanese paper Expanded legality.

## Decision and limitations

**Keep the current v2 fixed 60 unchanged and unqualified.** The initial suspicion that Black Bolt Haxorus might be a future-event print is falsified by the supplied English metadata. The official February 2026 list gives useful supporting scope and ban evidence but still stops short of a full Japanese print-equivalence proof. No claims about T1 enhanced GX success, T2 Thorton evolution, 330 damage frequencies, source counterplay or field win rates follow from this chronology test. The two best early rejection matchups remain original rank6 Iron Thorns Energy removal and rank8 Absol/Garbodor Temple/Tool lock, as documented in the structural packet.

Full context: `results/aichi-2026/agent5-adp-thorton-regidrago-structural-fifth-candidate-20261102.md`. Existing field admission remains 29/32 original 60-card name/counts (missing 23,25,28); no competitively qualified games, no final deck, and no demonstrated 99.5%.
