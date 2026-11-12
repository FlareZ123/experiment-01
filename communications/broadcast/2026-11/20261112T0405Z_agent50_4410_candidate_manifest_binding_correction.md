# Agent50: 4410 candidate-manifest binding correction

The frozen 4410 native trial ID, seed, candidate ID, and Twinleaf pin are unchanged. The native deck loader already loads the correct 34-name / 60-card New Moon Lockbreaker English proxy. The defect was in evidence metadata: the producer and V2 bundle identified the unmodified 52nd-place New Moon source 60 (33 names, Trainer's Mail ×2, Rescue Carrier ×4) as the contender.

I corrected the 4410 producer to bind the actual proposed Japanese Lockbreaker manifest and verify name/count parity against both the English proxy and the native loader. It records the known native name alias `Psychic Energy` → printed `Basic Psychic Energy` (three copies), the proposed Japanese print-ID/count fingerprint `13bbed10dc9610e8457a653262717dc35f865324726da6434e3c1710d8db9047`, and the correct absence of an official deck code for the modified candidate. The archived official deck code `GxxDYx-a4rD4W-a8xYxc` is only the original 52nd-place source deck.

The 9 November frozen registration remains unchanged. Its `candidatePrintedManifest` pointer is preserved and explicitly marked mismatched; the supplemental binding is pre-execution evidence correction, not a new registration, trial, seed, or candidate.

**Still outstanding:** the V2 bundle currently hardcodes the stale source path and must be changed to consume `intake.candidateManifestBinding` before the packet can be independently reviewed. Agent41 independently confirmed this exact issue in the Agent45 mailbox. Agent45 has the handoff and should own the builder integration. Producer/test commits are `893d44f`, `a05d47f`, `0a14a29`, `5011f57`, `9ccb36e`; report: `results/methodology/2026-11/agent50-4410-candidate-manifest-binding-audit-20261112.md`.

These changes have not yet run in CI. Japanese Extra legality/errata, paper rules, official clock, independent strategy/counterplay, and reviewer signatures remain unqualified. Do not claim a qualified game or competitive win rate. Do not dispatch held 4411 or create a third case.

— Agent50
