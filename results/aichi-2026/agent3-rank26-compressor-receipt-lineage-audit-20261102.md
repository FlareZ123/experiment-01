# Rank26 Battle Compressor receipt-lineage contradiction: fail-closed archived v2 audit

**Agent 3 | 2 November 2026 | immutable historical artifact reanalysis, no new native games.**

## Verified contradiction

The native source-owner prompt observer in the rank26 prospective v2 experiment reports a positive *physical Battle Compressor settlement* in some source-first global-turn-one baseline games where the independent captured source decision trace includes **no Battle Compressor card play**. Its purported identical card movements also recur during the same turn. These data cannot certify the causal Battle Compressor effect or physical first-turn resource conversion.

**Reanalysis of every actual source-first deal in the original 24-deal cohort (14 distinct original physical deals, two policy arms each):**

| Native evidence | Baseline | Treatment |
| --- | ---: | ---: |
| Accepted first-turn source Battle Compressor `PlayCardAction` occurrences | **0** | **9** across eight deals |
| Claimed positive first-global-turn owner prompt receipts | **21** | **11** |
| Deals with at least one claimed positive first-turn receipt | **8/14** | **8/14** |
| Deals with positive receipts and zero corresponding source plays | **8/14** | **0/14** |
| Number of receipts on those no-play deals | **21** | **0** |
| Deals with more first-turn receipts than source BC plays | **8/14** | **1/14** |
| Deals with repeated identical ordered physical-ID sets among those first-turn receipts | **7/14** | **1/14** |
| Repeated within-turn physical-ID receipt occurrences beyond the first | **12** | **1** |

Example: original repeat **72**, physical source seat **B**. The baseline source's only first-turn printed card play in the captured decision trace was **Escape Rope** (then Pass), with **zero Battle Compressor**. Its observer nevertheless emitted **two** first-turn `ResolvePromptAction` positive records for the exact same physical identities: Carmine card ID72, Iono ID73, Lightning Energy ID117. In the treatment of the **same physical initial deal**, the source selected one first-turn Battle Compressor and the observer reported a different trio, Lightning IDs117/118 and Exeggcute ID64. Source card IDs are scoped to each arm; this does not prove causality of the treatment observer.

Another example: repeat **82**, source seat **A**. The baseline recorded **four** positive first-turn settlements and no first-turn Compressor card play; three of four records reuse the same physical IDs. The treatment played one Compressor but logged **three** first-turn receipts, including duplicate sets. Both patterns demand a direct source-action-to-native-prompt lineage join.

These contradictions concern the **provisional observer** and its metric. They do not negate the independently captured zero-versus-eight **deals** with actual source-first Battle Compressor plays in original v2, nor independently prove native Store card duplication, an illegal Battle Compressor payment, or competitive results.

## Reproducible evidence and strict gate

- **Source immutable prospective v2:** [native CI 41412768803](https://github.com/FlareZ123/experiment-01/actions/runs/41412768803), [raw artifact 13126447034](https://github.com/FlareZ123/experiment-01/actions/runs/41412768803/artifacts/13126447034). The downloaded ZIP SHA256 is `e316ccb67a754a02ff356f1e371b6720a14d300e2d467d6af2ab2509053e96e6`; inner JSON SHA256 is `54453ce61f93ffa81696f220b1dd85bed9fe39e5798bc0df66f31f7ea6902afc`. Pinned Twinleaf: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This is the same 24-source-deal/48-native-arm record previously published in [v2](agent3-rank26-compressor-physical-v2-native-20261102.md) and [v2.1](agent3-rank26-postcompressor-gates-v21-replay-20261102.md). The latter already identified the anomaly qualitatively; this audit supplies a complete original-action/receipt denominator and exact contradictions.
- **New reusable pure auditor:** [`scripts/agent3-rank26-compressor-provenance-audit.cjs`](../../scripts/agent3-rank26-compressor-provenance-audit.cjs), function `auditRank26CompressorProvenance(parsedV2Artifact)`; [pure tests](../../tests/agent3-rank26-compressor-provenance-audit.test.cjs). It rejects wrong artifact schema, cross-checks each source-first `PlayCardAction` count against its original summary, flags orphan receipts, excess receipts and duplicate within-turn physical IDs, and preserves all 14 original source-first deals including zero-receipt failures.
- **Scope:** Pure offline archive reasoning. No additional game, release, prospective selection or engine patch. An audit row with matching counts still **does not** certify card text, actual paper payment, prompt lineage, ownership, or effect/Prize follow-through.

## Decision-changing correction

For original rank26, the statement **"baseline had 8/14 first-turn physically settled Battle Compressor prompts"** is **withdrawn as a Battle Compressor causal fact**. The same applies to interpreting aggregate 20 baseline first-turn Lightning movements and other apparent receipt counts as first-turn Compressor conversions. The native receipt observer was triggered without an attested originating source card play in every one of those baseline cases.

Before admitting any such receipt, implement a per-native-Store-instance provenance join between (1) accepted `PlayCardAction` for the exact owner physical Battle Compressor printing, (2) the issued matching owner source-deck prompt, (3) exactly one fully resolved prompt selection, (4) the actual deck/discard zone delta with distinct card objects, (5) continuous turn and actor identity, and (6) a physically legal and appropriately paid effect. Fail closed when the chain is incomplete. A cached `owner.supporter` zone plus a generic `ChooseCardsPrompt` is insufficient to establish origin. Whether this mismatch arises from stale zone state, nested Store dispatch, clock attribution, or another mechanism remains **unresolved**.

**Benchmark status unchanged:** 29/32 original opposing printed 60s authenticated; no competitively qualified game or demonstrated 99.5% fixed-deck result.
