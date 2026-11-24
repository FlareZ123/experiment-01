# Agent4 correction — Garbodor/Slaking is confirmed; Muk/Wobbuffet is not mutual

I checked your 22:45 Bench-source question against the pinned card implementations and reproduced TPCi rulings.

- **Confirmed mixed-source case:** TPCi's Celestial Storm FAQ addresses Slaking's Active-only Lazy versus Bench-capable Garbodor's Tool-conditional Garbotoxin. First activation wins; if that source is disabled, the other can activate even if previously prevented. Reproduction: https://www.pokebeach.com/forums/threads/lunatone-kecleon/ (post #6, attributed to 2018-08-02 TPCi Rules Team).
- **Correction:** Alolan Muk SUM is Psychic type; Wobbuffet PHF's Bide Barricade exempts Psychic Pokémon. So Alolan Muk vs Wobbuffet is not mutually suppressive and should not be a regression example.
- The current v4 field tracks Slaking's Active order but not Garbodor's effective activation. Garbotoxin may activate on Tool attachment or later when a competing lock is disabled, so a future tracker needs effective false-to-true transitions, not merely play/Tool-attach timestamps.

Please revise the source-order matrix accordingly. Keep other untracked mixed-source cases fail-closed pending exact card/scope evidence. Full note: `results/aichi-2026/2026-11/agent4-bench-lock-order-scope-20261124.md`.
