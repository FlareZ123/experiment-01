# Agent 3: every available Aichi Top32 original deck has locally verified Pokémon-stage identities

**4 November 2026 | source database provenance repair and full 29-original coverage audit; no new native match or competitive outcome.**

## Previously blocked original source identities

The existing [original stage scanner](../../scripts/agent38-original-field-tool-visibility.cjs) correctly refused to guess missing Basic/Evolution stages. Its underlying [printing resolver](../../scripts/agent38-candidate-printing-audit.cjs) used only `resources/sets/en.json` for set-code-to-file routing, although that convenience index omits some **authentic files already present** in `resources/cards/en/`.

An independent inspection found the exact resolved local physical identities:

| Original source printing | Bundled record | Local evidence |
| --- | --- | --- |
| Trevenant & Dusknoir-GX, SMP 217 (rank 1) | `resources/cards/en/smp.json`, `smp-SM217` | Pokémon, **Basic**, TAG TEAM, GX; Expanded Legal |
| Jirachi, XYP 67 (rank 2) | `resources/cards/en/xyp.json`, `xyp-XY67` | Pokémon, **Basic**; exact match |
| Regirock, XYP 49 (ranks 3 and 7) | `resources/cards/en/xyp.json`, `xyp-XY49` | Pokémon, **Basic**; exact match |
| Karen, XYP 177 (multiple originals) | `resources/cards/en/xyp.json`, `xyp-XY177` | Trainer Supporter; exact match |
| Ditto ♢, LOT 154 (ranks 4 and 17) | `resources/cards/en/sm8.json`, `sm8-154` | Pokémon, **Basic**, Prism Star; corpus spells name `Ditto ◇` |
| Tapu Koko ♢, TEU 51 (ranks 8, 19, 22 and 26) | `resources/cards/en/sm9.json`, `sm9-51` | Pokémon, **Basic**, Prism Star; corpus spells name `Tapu Koko ◇` |

The symbols **♢** (white diamond suit) and **◇** (white diamond) are distinct Unicode code points. The original source prints use the former, while the matching local database records use the latter. Treating that one glyph difference as a missing Pokémon stage was a text-identity problem. It did not indicate a genuinely missing card.

## Conservative implementation

The [existing source printing resolver](../../scripts/agent38-candidate-printing-audit.cjs) now permits explicit routing from the missing set-index promo codes `SMP` and `XYP` to `smp-SM<number>` and `xyp-XY<number>` **only when the number contains ASCII decimal digits**. The original exact-ID, exact-name and Pokémon/Trainer/Energy supertype guards still apply. This does not accept arbitrary promo card names or unknown printings.

The only permitted source-name variation is a final ` ♢` compared with the bundled final ` ◇`, with **both the exact printed set-and-number ID and the database's actual `Prism Star` subtype required**. No generic punctuation-insensitive or substring identity matching was added. Forged SMP218, XY999, ordinary heart-suffix names and wrong Prism Star print numbers remain unresolved.

The rank-1 original Trevenant & Dusknoir-GX Basic stage is now obtained **directly from the existing bundled `smp-SM217` record**. Agent38's prior explicit external website fallback remains opt-in and is unnecessary for the actual rank-1 source. The original 14-Basic count and 14.450287% conditional Field Blower direct exposure estimate remain numerically unchanged; **their provenance improves**.

## Complete original-source census result

An actual 29-original scan of the immutable published [source roster](../aichi-2026/full-decklists.json), using the updated resolver against the installed bundled card records, returned:

```json
{"originalSources":29,"resolved":29,"unresolved":0,"remaining":[]}
```

The preceding version of the code returned **23 resolved, 6 unresolved**, specifically the two original Ditto ♢ source ranks 4,17 and four Tapu Koko ♢ original ranks 8,19,22,26. The SMP and XYP repair had already resolved all remaining other ranks. Thus this report describes a substantive improvement in the completeness of **source-stage identity classification for already supplied original lists**, not acquisition of any new opponent deck composition.

The [source printing tests](../../tests/agent38-candidate-printing-audit.test.cjs) check every changed exact promo record, card subtype, printed legality flag, forged numeric printing and impossible Prism label. The [original 29-stage scanner tests](../../tests/agent38-original-field-tool-visibility.test.cjs) now require `resolvedOriginals===29`, `unresolvedOriginals===0` and empty unresolved inventory. The [manual-only Agent3 pure CI 41772779677](https://github.com/FlareZ123/experiment-01/actions/runs/41772779677) completed **SUCCESS** and printed `AGENT3_ALL29_ORIGINAL_STAGE_COVERAGE {"resolved":29,"unresolved":0,"remaining":[]}`. No Twinleaf compile or game run was requested.

## Boundaries and use

- A locally verified Basic or evolution stage is one necessary input for hypergeometric opener and mutual-mulligan calculations. It does not certify every 60's paper Expanded event-era legality, native card implementation, original Japanese artwork, or hidden decision policies.
- A source roster with `rank` and printing details is still required. **Ranks 23, 25 and 28 have no authenticated complete original 60** and are untouched. This remains **29/32 decklists**, even though every one of the 29 known lists now has all its Pokémon stages resolved.
- A document or CI classification is a deterministic resource-index result, not gameplay evidence. There are **zero competitively qualified Aichi field games**, no final selected fixed 60, and no credible demonstration of the 99.5% target.

**Agent 3**
