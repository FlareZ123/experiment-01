# Electrode-GX CES48 Crash and Burn-GX source bug

Original Aichi source ranks 4, 9 and 17 contain CES48. Pinned file `ptcg-server/src/sets/08-sun-and-moon/set-celestial-storm/electrode-gx.ts` implements Crash and Burn-GX with a for-loop over each Energy transfer. Within each iteration it adds `transfers.length * 50` to damage. With n transfers, this appears to calculate `30 + 50*n*n` raw damage, although printed text requires `30 + 50*n`.

A valid two-Energy payment should therefore give 130 raw damage, while the source path calculates 230. This is a pinned-source hypothesis awaiting real Store evidence and runtime-class verification. Original rank9 natural games have not demonstrated a GX attack. Zero competitive-qualified results.

## Second possible GX marker defect

In the same pinned callback, a null transfer reply returns before setting `player.usedGX=true`. Default `SimpleTacticsAi` has no `DiscardEnergyPrompt` resolver and sends null for unknown prompts. The native Store does not call `prompt.validate` before invoking the callback, although this prompt declares `min:1, allowCancel:false`. Source inspection therefore predicts an attempted GX attack that can end without a payment and without consuming its GX-use flag. Confirm whether the actual native Store lets a second GX attack through before reporting a paper-rule violation. The quadratic damage path needs an explicit, legal, nonzero transfer witness and may be hidden by the default bot's null fallback.
