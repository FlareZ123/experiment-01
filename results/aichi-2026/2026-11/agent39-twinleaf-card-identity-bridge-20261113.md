# Agent39: Aichi diagnostic field → Twinleaf card identity bridge

**Status:** adapter and pure contract tests committed; actual 24-deck Twinleaf resolution has **not** yet been run.  
**Source field:** CI run [43407979154](https://github.com/FlareZ123/experiment-01/actions/runs/43407979154), artifact [14027319169](https://github.com/FlareZ123/experiment-01/actions/runs/43407979154/artifacts/14027319169).  
**Pinned vendor:** `vendor/twinleaf`, commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Why an explicit bridge is needed

The normalized English card-pool name/ID is not necessarily Twinleaf's decklist key. Examples from the pinned source:

- Resource name `Battle Compressor Team Flare Gear` / card-pool ID `xy4-92` maps to Twinleaf fullName `Battle Compressor PHF`.
- Resource name `Ditto ◇` maps to Twinleaf fullName `Ditto Prism Star LOT`.
- Resource name `Tapu Koko ◇` maps to Twinleaf fullName `Tapu Koko Prism Star TEU`.
- Promo display number and engine set number can differ: source XYP 177 maps to card-pool number `XY177`, which is the Twinleaf `setNumber`.

Joining on normalized display name alone would therefore create false misses or incorrect deck keys.

## Bridge contract

Implementation: `simulation/twinleaf/2026-11/agent39-aichi-twinleaf-decklist-bridge.cjs`.

The bridge:

1. Loads the pinned compiled Twinleaf `CardManager` and all arrays exported by `output/sets`.
2. Builds an index by the actual Twinleaf fields `Card.set + Card.setNumber`.
3. Resolves each normalized row using `normalized.printing.set` plus `normalized.card_pool_printing.number`, then emits the matched `Card.fullName`.
4. Checks `isCardDefined` and `getCardByName` on the same manager instance.
5. Merges duplicate source rows that resolve to one Twinleaf fullName, preserving row-level provenance separately.
6. Emits `registered60: [{printing, copies}]` per deck, matching the input contract used by Agent5's public decklist prior provider.
7. Fails closed on missing/ambiguous identities, bad row/copy totals, or any deck not exactly 60 cards. No partial `registered60` is emitted for an incomplete deck.

The output retains the source-field schema, source dataset, official-banlist status, physical-print status and explicit diagnostic-only / paper-admission flags. A complete bridge means only that Twinleaf card objects resolved; it does **not** establish paper legality, physical source-print authenticity, or competitive strength.

## Reproduction and test status

After building the pinned submodule so `vendor/twinleaf/ptcg-server/output` exists, extract `aichi-expanded-identity-audit.json` from artifact 14027319169 and run:

```sh
node simulation/twinleaf/2026-11/agent39-aichi-twinleaf-decklist-bridge.cjs /path/to/aichi-expanded-identity-audit.json [output.json]
```

The output records the pinned Twinleaf revision, resolved `registered60` decks, source-row mappings and any unresolved rows. Exit status 1 means the bridge is incomplete; status 2 means a runtime/build/input error.

Pure contract tests: `tests/2026-11/agent39-aichi-twinleaf-decklist-bridge.test.cjs`. Local Node 22 check: **5/5 tests passed**. The tests cover canonical-name differences, source-vs-canonical promo numbering, duplicate-row merging, missing/ambiguous identities, and count mismatch. The test and syntax checks are included in the existing manual owner-only Node22 workflow `.github/workflows/agent5-owner-root-native.yml`; no workflow was dispatched.

**Not yet demonstrated:** whether all 812 source rows across the 24 lists resolve against the pinned Twinleaf build. The next step is to run the bridge after the authorized owner integration gates/build are available, then review its unresolved report before any simulation.