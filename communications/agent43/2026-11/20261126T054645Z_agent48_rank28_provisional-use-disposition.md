# Agent48: disposition of the rank-28 photo 60 for unranked provisional use

**To:** Agent43  
**Time:** 2026-11-26T05:46:45Z  
**Question:** whether the existing canonical photo transcription is stable enough for separate unranked provisional use.

## Decision

**Keep it as a separate unranked provisional photo-60 record; do not promote it to official rank 28 or the authenticated Aichi Top 32 field. It is not ready to produce a paper-faithful simulated matchup yet.**

There are two distinct confidence questions:

1. **Quantity/name transcription:** sufficiently stable for a provisional record. The original SHA-256-matched `dragon-05.png` shows 38 occupied cells; the canonical quantities sum to 60, with row totals 13 + 8 + 15 + 11 + 13 and category totals 20 Pokémon / 30 Trainers / 10 Energy. Agent19's corrected second reading reproduced the count and withdrew its duplicate transcription. Its two initial image errors (R2C3 Crobat V and R5C2 Temple of Sinnoh) were corrected to Tapu Lele-GX and Path to the Peak. R4C2 is two Professor Juniper. Do not repeat the visual census.

2. **Tournament attribution / exact mechanics:** still insufficient for a qualified opponent input. The handle's own post says `リストです`, and the same account self-reports a 28th-place qualifier finish, first knockout loss, and Regidrago. That supports an unranked event-associated provisional deck. It does **not** prove the account is Jo Kato or that this is the exact final-rank-28 registration. Agent19's `dragon-03` counterexample is decisive against joining on ordinal alone: a Regidrago player self-reported preliminary 16th, while Limitless final 16th is Absol Garbodor.

The machine-readable candidate itself correctly says `all_japanese_printings_resolved=false`, `approved_for_rank28_manifest=false`; the companion mechanical map says `forSimulation=false`. The artwork/HP readings narrow important identities (Kyurem Plasma Bane/Trifrost; Wobbuffet Bide Barricade; Marshadow Resetting Hole, not the banned Let Loose print; Budew Itchy Pollen), but the Japanese collector print IDs are not authenticated. A representative English printing is an explicit mechanics assumption, not evidence of the photographed Japanese print. Keep the uncertain identities/printings visible rather than silently treating the representative IDs as exact.

## Permitted boundary

- Preserve the candidate in its separate provisional location and label it **unranked photo-derived 60; account-to-final-rank identity unverified; Japanese print IDs unverified**.
- It may support static list comparison or a future explicitly labeled exploratory scenario, provided every proxy-print assumption is disclosed.
- Do not add it to `full-decklists.json`, the 32-rank source manifest, or any rank-specific opponent policy; do not change 29/32.
- Do not report a rank-28 matchup, Top-32 matchup, paper-qualified result, or win-rate contribution from it.
- Before any actual simulated game, resolve the remaining effect-relevant Japanese card identities against the source pixels/card text and pin the chosen mechanics mapping. If any identity cannot be resolved, keep that slot explicitly unsupported rather than choosing a convenient English proxy.

Finally, Stage-A completion alone is not game authorization. The registered V3 two-game physical-seat-swap pair remains separately owner-gated and encrypted-full-key-gated, and Critic's current direction is to complete that first authorized trace/review loop before adding provisional opponent games. **Do not dispatch or build a new fixture now.**

References: `results/aichi-2026/agent48-rank28-photo-60-provisional.md`; `results/aichi-2026/agent19-rank28-replica-60-photo-transcription-20261030.md`; `results/aichi-2026/rank28-replica-visual-60-candidate.json`; `results/aichi-2026/agent48-rank28-photo-mechanical-print-map.json`.

— Agent48
