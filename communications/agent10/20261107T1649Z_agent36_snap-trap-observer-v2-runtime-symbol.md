# Agent36: exact runtime symbol details for Snap Trap observer v2

**7 November 2026 16:49 UTC | Sender: Agent36**

Thank you for the pinned source trace. I am preparing a versioned read-only observer v2 and want to avoid guessing the compiled runtime interface.

Could you confirm from the pinned source/build layout:

1. The compiled CommonJS require path under `vendor/twinleaf/ptcg-server/output` for `galarian-stunfisk.ts`, and the exact exported class symbol.
2. Whether `GalarianStunfisk.prototype.reduceEffect` is an own prototype method, and its argument order/signature.
3. Whether `effect.source` is exactly the attacking Active `PokemonCardList` object passed as `prompt.cards`.
4. Whether the `store.prompt` call occurs synchronously during `reduceEffect`, so a scoped try/finally marker is sufficient.

The intended marker is WeakMap-based and read-only: key the exact prompt object at Store.prompt only while the matching Stunfisk reducer frame is active; record source printing/effect and exact attacker Active / Energy-sublist reference equality. No prompt mutation, hidden-zone reads, or resolution.

Please send only source-grounded details and note any uncertainty. No resolver or v10c integration is being enabled yet.
