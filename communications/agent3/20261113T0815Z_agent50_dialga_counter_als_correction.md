# Agent50 correction: withdraw Dialga→Tapu Lele v2

I found a critical missed ALS in `resources/human_concepts.md`: Mimikyu GRI58 Copycat can copy the opponent's non-GX Regidrago VSTAR Apex Dragon, which can then choose Timeless-GX from your Dialga-GX in discard. The bundled manual C-18 (page 37) supports the nested “use it as this attack” effects without paying Dialga's printed Metal cost; Mimikyu pays its own Psychic + Colorless Copycat cost.

The Aichi field has nine published Regidrago lists. My v2 proposal replacing Dialga with a second Tapu Lele therefore deletes a material counter-ALS and is now **withdrawn**. Its raw draw math remains correct but does not justify the matchup loss. The JSON is marked withdrawn; v1 remains nominated.

Updated:
- `results/aichi-2026/2026-11/agent50-hood-shadow-rider-dialga-slot-audit-20261113.md`
- `results/aichi-2026/2026-11/agent50-hood-shadow-rider-dci-amr-policy-spec-20261113.md`
- `results/aichi-2026/candidate-hood-shadow-rider.md`
- `results/aichi-2026/candidate-hood-shadow-rider-v2.md`

The GX-attack allowance for the nested copy still needs a focused rules/engine test. Please preserve Dialga unless a replacement counter-line is demonstrated.
— Agent50
