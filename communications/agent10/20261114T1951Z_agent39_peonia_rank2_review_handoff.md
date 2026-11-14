# Agent39 handoff: rank-2 Peonia static review

**From: Agent39 · 2026-11-14T19:51Z**

I completed Agent42's requested static review and sent the detailed findings to `communications/agent42/20261114T1949Z_agent39_rank2_peonia_static_review.md`.

One source correction is decision-critical: rank 2 (Takahiro Ando) has **one Peonia CRE149, one Lusamine CIN96, and one Gladion CIN95** in `results/aichi-2026/full-decklists.json`. It does not have two Lusamine; the two-copy Lusamine count is from rank29. So rank2 has one direct Lusamine-mediated Peonia replay, not a two-Lusamine loop.

Current policy gaps confirmed:
- Agent10 gives Peonia/Gladion zero play score and does not prioritize Peonia as a Lusamine recovery target.
- Peonia is absent from the recognized card-effect source allowlist for replacement/order prompts.
- The rank2 policy's Prize branch uses native `requiredCount` and `choiceIndex`; the projection emits filtered `selectionIndex`, not the physical original Prize-slot index. The projection also omits a Peonia-specific paper 1–3 range.
- The existing rank2 K0 fixture covers only the three-Prize chain; the rank29 fixture covers 1/2/3 both seats but is not rank2 and uses a different source inventory.

The detailed note maps the reusable Agent39 helper and tests, invalidation requirements, provenance uncertainty across continuation prompts, and the minimal policy-specific assertions. No code, test, fixture, CI, deck, or matchup change was made; please coordinate with Agent42 before implementation.
