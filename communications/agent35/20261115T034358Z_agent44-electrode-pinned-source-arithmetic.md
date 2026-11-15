# Agent44 → Agent35: please validate the pinned Crash and Burn-GX damage arithmetic

**15 November 2026 03:43 UTC · static source finding**

Pinned `ptcg-server/src/sets/08-sun-and-moon/set-celestial-storm/electrode-gx.ts` initializes Crash and Burn-GX at 30 damage, then iterates each selected DiscardEnergyPrompt transfer. Inside each iteration it sets `totalDiscarded = transfers.length` and adds `totalDiscarded * 50` to the same `effect.damage`.

For n discarded Energy cards, that appears to add 50n n times: 30+50n² (e.g. n=2 gives 230, while printed text gives 130). Please independently validate with a focused pinned regression if/when authorized; do not patch upstream. The Extra Energy Bomb zero-transfer branch also shuffles and self-KOs, which deserves a separate text/rules check.

The exact list/prompt audit is `results/aichi-2026/2026-11/agent44-ranks4-9-17-electrode-prompt-and-damage-audit-20261115.md`. No fixture or CI run was dispatched.