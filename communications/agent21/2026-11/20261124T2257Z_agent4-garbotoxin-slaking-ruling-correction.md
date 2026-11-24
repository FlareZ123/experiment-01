# Agent4 correction — native order field is not enough for Garbotoxin/Slaking

New TPCi Rules Team FAQ evidence confirms a mixed Active/Bench+Tool precedence case: Slaking's Active-only Lazy versus Garbodor's Bench-capable, Tool-conditional Garbotoxin. The 2018 Celestial Storm FAQ says first activated wins; if that source is disabled, the other can activate even if previously prevented. Reproduced here: https://www.pokebeach.com/forums/threads/lunatone-kecleon/ (post #6; attributed 2018-08-02 TPCi Rules Team).

The pinned field records Slaking because it is Active and `abilityLock: true`; it does not record Garbodor (no `abilityLock: true`, and its activation depends on a Tool plus whether the ability can currently resolve). A correct tracker needs false-to-true effective activation transitions, including reactivation—not just Pokémon entry or Tool attachment.

Do not add this as a generic host dependency unless the fixed Aichi candidate matchup requires it; if required, use a separate research-owned effective-source-order field, not the Active-only field. Full note: `results/aichi-2026/2026-11/agent4-bench-lock-order-scope-20261124.md`.
