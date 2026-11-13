# Agent39: Aichi diagnostic field → Twinleaf card identity bridge

**Status:** adapter, per-deck registered-60 hash protocol, and a manual pinned-build lane are committed; actual 24-deck Twinleaf resolution has **not** yet been run.  
**Source field:** CI run [43407979154](https://github.com/FlareZ123/experiment-01/actions/runs/43407979154), artifact [14027319169](https://github.com/FlareZ123/experiment-01/actions/runs/43407979154/artifacts/14027319169).  
**Pinned vendor:** `vendor/twinleaf`, commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Why an explicit bridge is needed

The normalized English card-pool name/ID is not necessarily Twinleaf's decklist key. Examples from the pinned source:

- Resource name `Battle Compressor Team Flare Gear` / card-pool ID `xy4-92` maps to Twinleaf fullName `Battle Compressor PHF`.
- Resource name `Ditto ◇` maps to Twinleaf fullName `Ditto Prism Star LOT`.
- Resource name `Tapu Koko ◇` maps to Twinleaf fullName `Tapu Koko Prism Star TEU`.
- Promo canonical card-pool numbers can carry prefixes absent from Twinleaf's engine set number: source XYP 177 has card-pool number `XY177`, but Twinleaf Karen XYP uses `setNumber = '177'`; source XYP 67 has card-pool number `XY67`, but Twinleaf Jirachi XYP uses `setNumber = '67'`; source SMP 217 has card-pool number `SM217`, while Twinleaf Trevenant & Dusknoir-GX SMP uses `setNumber = '217'`.

| Source printing | Card-pool number | Twinleaf setNumber | Twinleaf fullName |
|---|---|---|---|
| XYP 177 | `XY177` | `177` | `Karen XYP` |
| XYP 67 | `XY67` | `67` | `Jirachi XYP` |
| SMP 217 | `SM217` | `217` | `Trevenant & Dusknoir-GX SMP` |

Joining on normalized display name alone would therefore create false misses or incorrect deck keys. Joining on `card_pool_printing.number` is also wrong for the XYP/SMP promo cases above. There are eight such source rows in the 24-rank field (six Karen, one Jirachi, one Trevenant & Dusknoir-GX); the bridge's test covers XYP 177/XY177, XYP 67/XY67, and SMP 217/SM217.

## Pinned Twinleaf API check

At the pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` revision, the actual upstream interfaces match the adapter assumptions:

- `Card` declares `set`, `setNumber`, and `fullName`; `setNumber` is a string.
- `CardManager.getAllCards()` returns its registered card array.
- `CardManager.defineSet()` rejects duplicate `fullName` and `legacyFullName` entries.
- `CardManager.isCardDefined()` checks the registered name index; `getCardByName()` returns a deep clone, so the adapter correctly checks the returned `fullName` rather than object identity.
- The compiled `output/sets` module is generated from the upstream `src/sets/index.ts` re-exports; the bridge registers each exported card array into a fresh singleton and verifies the before/after card counts.

No upstream source was changed. This source inspection validates the adapter boundary, but it does not substitute for compiling the pinned revision or resolving the 812 rows against the live CardManager.

## Bridge contract

Implementation: `simulation/twinleaf/2026-11/agent39-aichi-twinleaf-decklist-bridge.cjs`.

The bridge:

1. Loads the pinned compiled Twinleaf `CardManager` and all arrays exported by `output/sets`.
2. Builds an index by the actual Twinleaf fields `Card.set + Card.setNumber`.
3. Resolves each normalized row using `normalized.printing.set` plus `normalized.printing.number` (the printed set/number), then emits the matched `Card.fullName`. Keep `card_pool_printing.number` as canonical resource provenance; do not use it as Twinleaf's set number.
4. Checks `isCardDefined` and `getCardByName` on the same manager instance.
5. Merges duplicate source rows that resolve to one Twinleaf fullName, preserving row-level provenance separately.
6. Emits `registered60` as a 60-element array of Twinleaf `fullName` strings for Agent5's `buildTwinleafBeliefInput`; also emits compact `registered60_counts: [{printing, copies}]` and `decklist_for_seat: {id, cards}` for the provider's decklist interfaces.
7. Fails closed on missing/ambiguous identities, bad row/copy totals, or any deck not exactly 60 cards. No partial `registered60` is emitted for an incomplete deck.

The output retains the source-field schema, source dataset, official-banlist status, physical-print status and explicit diagnostic-only / paper-admission flags. It also exposes `diagnostic_reconstruction_eligible` from the audit field status: this identifies a legal English Expanded diagnostic reconstruction eligible for labeled simulation once all Twinleaf rows resolve, without changing the false production paper-admission flag. A complete bridge means only that Twinleaf card objects resolved. Combined with the separate 24-list English Expanded identity, deck-construction and current-banlist screens, it enables a legal English Expanded diagnostic reconstruction; it does **not** authenticate original physical Japanese copies or establish competitive strength. Production paper admission remains 0/32.

## Frozen diagnostic input and exact source denominator

The frozen artifact is run **43407979154**, artifact **14027319169**. Its raw file SHA-256 is `6ac2fbaec602f7c9ffd49c2a90c4c79be78df696cc56decc3631f5ad50c1812b`; the canonical JSON SHA-256 of `diagnostic_normalized_field` is `fba71e372f7e25b174473dc4c22ce2db90ae404a30d9ca14383816ecf94ca7c2`. These values were independently recomputed from the downloaded artifact.

The input contains **24 decks, 812 source rows and 1,440 card copies**. Every deck declares exactly 60 copies:

| Source row | Player | Source rows | Copies |
|---:|---|---:|---:|
| 1 | Yasunori Kato | 33 | 60 |
| 2 | Takahiro Ando | 38 | 60 |
| 4 | Shu Hosoda | 31 | 60 |
| 5 | Yamato Nakano | 30 | 60 |
| 8 | Yusuke Kobayashi | 37 | 60 |
| 9 | Shun Ito | 33 | 60 |
| 10 | Haruku Yoshioka | 36 | 60 |
| 11 | Wataru Yano | 26 | 60 |
| 12 | Risa Sato | 35 | 60 |
| 13 | Hiromu Sasaki | 34 | 60 |
| 14 | Manaya Asano | 37 | 60 |
| 15 | Ryotaro Nozawa | 35 | 60 |
| 16 | Takumi Matsumoto | 29 | 60 |
| 17 | Yuya Yamano | 27 | 60 |
| 18 | Hayato Omuro | 33 | 60 |
| 19 | Mark Takahashi | 37 | 60 |
| 20 | Satoru Imamura | 36 | 60 |
| 21 | Shun Nakajima | 38 | 60 |
| 22 | Haruya Mori | 36 | 60 |
| 26 | Hibiki Yamada | 32 | 60 |
| 27 | Yuya Nagatsuma | 37 | 60 |
| 30 | Koki Takeda | 32 | 60 |
| 31 | Yuhi Yokoyama | 31 | 60 |
| 32 | Kaito Higuchi | 39 | 60 |
| **Total** | **24 decks** | **812** | **1,440** |

These are Limitless/source-row identifiers, not verified final bracket placements. The 24 inputs are diagnostic English Expanded reconstructions; five unchanged Japanese Extra lists remain incompatible, three exact lists remain unavailable, and original physical-copy paper admission remains 0/32.

## Hash and revision bindings

The bridge keeps four per-deck identity layers distinct:

1. `deck_identity_sha256`: print-independent functional identity. SHA-256 of UTF-8 canonical JSON rows `{card_id,count,card_text_sha256}`, sorted by `(card_id,card_text_sha256,count)` using JavaScript UTF-16 code-unit comparison.
2. `source_print_identity_sha256`: normalized source-print identity. SHA-256 of UTF-8 canonical JSON rows `{card_id,count,card_text_sha256,printing,card_pool_printing}`, sorted by `(card_id,printing.set,printing.number,count)` using JavaScript UTF-16 code-unit comparison. This is the source-side hash previously called `normalized_deck_sha256`; it is not a Twinleaf hash.
3. `registered60_hashes.ordered_input_sha256`: SHA-256 of UTF-8 `JSON.stringify(registered60)`, where `registered60` is the exact 60-element Twinleaf `Card.fullName` array supplied to `decklist_for_seat.cards`.
4. `registered60_hashes.canonical_multiset_sha256`: SHA-256 of UTF-8 `JSON.stringify([{fullName,copies}, ...])`, with duplicate full names aggregated and rows sorted by JavaScript UTF-16 code-unit order. This is invariant to source-row order.

The serialization protocols are included in the output as `deck_identity_hash_protocol`, `source_print_identity_hash_protocol` and `registered60_hash_protocol`. Functional and source-print hashes can be computed from the normalized source rows before Twinleaf resolution; registered-60 hashes are emitted only for complete 60-card mappings and are null for incomplete decks. Each rank entry reports source-row total, resolved and unresolved row counts, 60-copy total, completion status, and the complete row-level mapping table.

The result also binds the raw source audit SHA-256, canonical normalized-field SHA-256, research repository revision and actual Twinleaf submodule revision. These are separate from all per-deck hashes. A later game runner may add its own runtime deck hash; this bridge does not invent one.

The normalized artifact's raw and canonical hashes are verified above. Independent Node/Python recomputation over all 24 source decks produced 24 distinct functional hashes and 24 distinct source-print hashes; the recomputed values for source ranks 1, 2, 4, 5, 31 and 32 match Agent5's supplied table. The complete 24-rank source-side hash set is preserved in the [machine-readable hash manifest](agent39-normalized-deck-hash-manifest-20261113.json). The full 24-rank bridge output will carry these hashes for every source rank.

## Reproduction and test status

After building the pinned submodule so `vendor/twinleaf/ptcg-server/output` exists, extract `aichi-expanded-identity-audit.json` from artifact 14027319169 and run:

```sh
node simulation/twinleaf/2026-11/agent39-aichi-twinleaf-decklist-bridge.cjs /path/to/aichi-expanded-identity-audit.json [output.json]
```

The output records the pinned Twinleaf revision, expanded `registered60` string arrays, compressed `registered60_counts`, `decklist_for_seat` objects, source-row mappings and any unresolved rows. Exit status 1 means the bridge is incomplete; status 2 means a runtime/build/input error.

Pure contract tests: `tests/2026-11/agent39-aichi-twinleaf-decklist-bridge.test.cjs`. The original six tests passed locally on Node 22 before the hash extensions. Four new tests now cover ordered-input versus canonical-multiset hashing, compressed-count mismatch rejection, functional versus source-print identity separation, and missing-text-hash rejection; per-rank unresolved-row assertions were also added. Direct Node 22 checks of the hash algorithms and cross-checks against six supplied rank hashes passed, but the full updated repository test file has not yet been run in this environment.

A bridge-only execution path now exists in the [**existing manual Twinleaf headless smoke workflow**](https://github.com/FlareZ123/experiment-01/actions/workflows/twinleaf-smoke.yml): dispatch with `aichi_bridge_only=true`. That job checks out and verifies the repository-pinned submodule, builds Twinleaf using its upstream Node 20.19 runtime, switches to Node 22 for the adapter tests, downloads artifact 14027319169, verifies its raw SHA-256, runs the bridge, and uploads the full row-level JSON. It adds no workflow or push trigger. The default smoke behavior remains unchanged.

**Exact local blocker:** this execution container has no repository checkout, no `vendor/twinleaf` submodule or compiled `ptcg-server/output`, and outbound GitHub DNS/network access is unavailable (the attempted clone failed with `Could not resolve host: github.com`; the local npm cache is empty). The normalized audit artifact is available and its 24/812/1,440 denominators and hashes were verified, but the pinned Twinleaf build cannot be created here. The connected GitHub actions interface also exposes no workflow-dispatch operation. An owner/authorized runner must dispatch the existing manual workflow with `aichi_bridge_only=true` to obtain the actual mapping.

**Not yet demonstrated:** whether all 812 source rows across the 24 lists resolve against the pinned Twinleaf build. No per-rank unresolved count, registered-60 hash, Twinleaf CardManager count, or deck-resolution success is claimed until that run produces its artifact.