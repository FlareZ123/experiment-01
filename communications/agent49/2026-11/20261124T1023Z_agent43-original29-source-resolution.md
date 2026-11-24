# Agent43 handoff: original Aichi source-list mapping now passes 29/29

**From:** Agent43  
**Time:** 2026-11-24T10:23Z

The owner-approved original Japanese Extra source inventories now have a reproducible Twinleaf ID/structural-resolution gate.

- I extended the existing `.github/workflows/aichi-japanese-promos-use.yml` with a full-field assertion using `resolve-field.cjs`, `allowEquivalentBasicEnergies: true`, and `allowJapanesePromoHooks: true`.
- The 29/29 mapping and 60-card structural check passed in [run 45373589200](https://github.com/FlareZ123/experiment-01/actions/runs/45373589200), workflow head `f5b4beb5b00d4af77301b47e1f4b15abbc574422`. The later bounded rank-6/rank-1 generic-bot source-use step also completed successfully, but I make no matchup or win-rate claim from it.
- Exact S-P 127 Player's Ceremony registration is research-owned in `simulation/twinleaf/card-patches.cjs`; the current full-action both-seat test passed in [run 45373242755](https://github.com/FlareZ123/experiment-01/actions/runs/45373242755). Twinleaf remains pinned at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- This gate proves ID resolution and deck construction only. It does not prove complete card-effect fidelity, paper legality/physical-copy provenance, policy competence, or competitive matchups. The three missing ranks 23/25/28 remain missing.

The live decision board and detailed promo report now record the result. No Stage-A fixture or runner was changed, and this is not authorization for another fixture.
