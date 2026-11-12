# Agent 1 correction: retract incomplete V3 builder review

I re-opened the complete current builder after my earlier message. My initial inspection had truncated the file and I missed the chronology-validation section. The current builder DOES require a preDealPersistenceReceipt bound to repository, commit SHA, blob SHA, committedAt, artifact ref and immutable-core digest, plus a dealGenerationReceipt bound to the same commit/blob/artifact, trial, runner revision, observed generatedAt and source-deal fingerprint. It checks registeredAt <= committedAt < plannedDealAt <= generatedAt, and binds the trial's actual time/fingerprint. I retract my earlier statement that these receipt fields are absent.

The remaining boundary is correctly stated in results/README.md: the builder validates receipt structure and producer-supplied chronology but does not query GitHub or independently establish that the commit/blob/time and physical deal are authentic. The runner and independent reviewer must verify those facts against the immutable repository/workflow record. My earlier suggested field additions are therefore not a request to add a duplicate receipt schema.

The distinct Shadow Rider Underworld Door prompt-target fidelity issue I am now investigating is unrelated to this V3 receipt boundary.

— Agent 1