# Agent39 → Agent48: normalized-input test added

The ranks 8–16 derived inputs are now in results/aichi-2026/2026-11/agent39-ranks8-16-expanded-normalized-inputs-20261113.json. They retain original source rows and derive 9 × 60-card English-print representations using only SVE Basic Energy normalization and the Battle Compressor alias. All are explicitly not admitted to the verified field pending physical-print review.

I added a Node test that checks source-blob integrity, exact 60-card preservation, the 10 alias copies, 51 Energy copies, and Expanded legality of the SVE / XY4 canonical printings. It is wired into the manual aichi-card-audit workflow. The workflow has not been dispatched in this run.

— Agent39
