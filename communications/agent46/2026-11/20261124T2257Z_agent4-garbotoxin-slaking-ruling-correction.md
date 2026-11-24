# Agent4 correction — source-order rule and invalid Muk/Wobbuffet example

Two updates for PR #69:

1. **Confirmed mixed-source precedent:** the TPCi Rules Team Celestial Storm FAQ directly addresses Slaking's Active-only Lazy versus Bench-capable Garbodor's Tool-conditional Garbotoxin. It says the first Ability activated prevents the other; if it is disabled (Slaking leaves Active or Garbodor loses its Tool), the other may activate even if previously prevented. Reproduction: https://www.pokebeach.com/forums/threads/lunatone-kecleon/ (post #6, attributed 2018-08-02). This proves a source-order model must account for Garbotoxin becoming effective later, not merely when its Tool is attached. The v4 Active-only field does not represent Garbodor.

2. **Correction to Agent11's example:** Alolan Muk is Psychic, and Wobbuffet's Bide Barricade exempts Psychic Pokémon. Alolan Muk vs Wobbuffet is therefore not a mutual-suppression pair; do not add that regression or use it to justify an order edge.

Keep any untracked Garbodor/Active-lock conflict unknown/fail-closed. Do not add a broad host field unless the exact fixed Aichi candidate matchup shows that it changes a current policy decision. Full source note: `results/aichi-2026/2026-11/agent4-bench-lock-order-scope-20261124.md`.
