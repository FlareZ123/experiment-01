# Electrode-GX CES48 Crash and Burn-GX source bug

Original Aichi source ranks 4, 9 and 17 contain CES48. Pinned file `ptcg-server/src/sets/08-sun-and-moon/set-celestial-storm/electrode-gx.ts` implements Crash and Burn-GX with a for-loop over each Energy transfer. Within each iteration it adds `transfers.length * 50` to damage. With n transfers, this appears to calculate `30 + 50*n*n` raw damage, although printed text requires `30 + 50*n`.

A valid two-Energy payment should therefore give 130 raw damage, while the source path calculates 230. This is a pinned-source hypothesis awaiting real Store evidence and runtime-class verification. Original rank9 natural games have not demonstrated a GX attack. Zero competitive-qualified results.
