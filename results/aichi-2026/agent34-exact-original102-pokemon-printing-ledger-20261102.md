# All 102 distinct original-source Pokémon printings: exact card-pool admission

**Agent 34, 2 November 2026.** This is a card-printing identity and printed-text coverage correction. It does **not** establish native card implementation identity, paper-rule effect fidelity, owner-policy competence, original-source game wins, or a competitive win rate.

## Question and frozen scope

The existing [original printed attack-exception census](../../simulation/evaluation/agent34-source-printed-attack-exemptions.cjs) takes the authenticated [29 published Aichi source 60s](full-decklists.json) and the supplied source [card-pool set directory](../../resources/sets/en.json). An earlier [compiled corpus pass](https://github.com/FlareZ123/experiment-01/actions/runs/41363731066) found **102 distinct Pokémon source printings but left 13 unresolved**, meaning its attack-effect exposure counts could silently exclude valid originals. Ranks 23, 25, and 28 have no authenticated original 60 and remain outside this census.

## Root causes and exact correction

A separate, deterministic scan of the locally supplied `card-list.zip` (SHA-256 `c39af257e60a79a485aad09c7d7723b6afbb42eae1ba74e280b8a3f77581350a`) and the repository source's 102 unique `name|set|number` triples found the following **13 resolvable cases**:

| Source identity issue | Distinct source printings | Resolution |
| --- | ---: | --- |
| `SMP`, `XYP` promo codes absent as `ptcgoCode` | 3 | `SMP 217 -> smp-SM217`; `XYP 67 -> xyp-XY67`; `XYP 49 -> xyp-XY49` |
| Base sets and gallery subsets share `CRZ/LOR/SIT/ASR` source codes | 8 | Compare collector number and canonical card name across both exact candidate set IDs; admit only one matching card ID |
| Source uses `♢`; database uses `◇` for Prism Star names | 2 | Exact set and collector-number-guarded normalization of only that symbol: `Ditto LOT 154 -> sm8-154`, `Tapu Koko TEU 51 -> sm9-51` |

The `XYP 67` resolver deliberately matches `xyp-XY67` and excludes the separate `xyp-XY67a` record. Ambiguity remains an explicit failure when there are zero or multiple exact matches.

**Offline source-pool check:** after these three bounded corrections, all **102/102** registered unique Pokémon printings have exactly one matching physical card-pool ID, with **zero unresolved or multiply matched**. This is an exact, finite card-identity resolution statement, not simulated match evidence.

## Repository changes and verification

The source census now resolves source printings through a precise promo-code map, candidate gallery-ID disambiguation and Prism Star glyph normalization. It retains an `unresolved` list and emits a complete `resolved` ledger for downstream original-printing checks: source identity, participating ranks, card-pool set ID, card ID, canonical name and collector number. [Regression tests](../../tests/agent34-source-printed-attack-exemptions.test.cjs) check the original 102, specific critical IDs, promo variants, gallery collision and glyph identities. [Existing manual CI workflow](../../.github/workflows/aichi-rank24-prospective-policy.yml) runs the exact bundle.

The older 13-unresolved compiled result remains valid for the **older resolver version**; its incomplete counts must not be represented as the complete current source inventory. A native action-chain witness still needs the genuinely installed executable printing, accepted Store root, prompt settlement, payment, effect, KO/Prizes, and opponent continuation. The ledger supplies one input to such a witness, not that witness itself.

## Competitive qualification

Authenticated source decklists **29/32**, unresolved exact ranks **23/25/28**. The four proposed fixed challenger 60s have **zero competitively qualified games** under a two-player paper-valid policy. No 99.5% performance evidence is implied.
