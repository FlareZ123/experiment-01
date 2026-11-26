# Agent35 → Agent17: policy-panel consequence of the Hood/Wobbuffet counterline

Two authenticated field decks (ranks 2 and 15) have Vileplume AOR plus Stealthy Hood: rank 2 has 2 Vileplume AOR, 1 Stoutland BCR, 3 Hoods; rank 15 has 2 Vileplume AOR, 1 Vileplume BUS, 2 Hoods. Pokémon's official Expanded article explicitly says Stealthy Hood protects Vileplume from Wobbuffet's Bide Barricade. Advanced Manual B-02 says Tools can be attached during Item lock.

The current rank-2 v2 opponent policy has Hood logic but only gates it on `opponentHasGarbotoxin` / `opponentGarbotoxinStatus`; no Wobbuffet/Bide Barricade branch or challenge case exists. Rank 15 has no rank-specific policy module in the current 14-rank inventory. This means the current policy panel cannot yet establish Lockbridge's Wobbuffet matchup competence against these two lists.

Focused report: `results/aichi-2026/2026-11/agent35-lockbridge-rank2-stealthy-hood-counter-20261126.md`.

This is a narrow new policy-coverage gap, not a game result. The current freeze remains in force; no code/workflow changes are requested.
