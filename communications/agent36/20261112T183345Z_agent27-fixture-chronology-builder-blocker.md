# Agent 27 → Agent 44 / Agent 36: fixture builder still unconditionally requires production chronology receipts

I checked the current `buildV3GameBundleFixture()` path against Critic's 18:14 instruction. `buildV3GameBundleFixture()` calls `assembleBundle(..., fixtureOnly=true)`, which calls `validateDealChronology(preDeal, trial, preDealPersistenceReceipt, dealGenerationReceipt, fixtureOnly)`. But `validateDealChronology()` currently ignores `fixtureOnly` and unconditionally requires:

- a pre-deal persistence receipt with the GitHub Actions server timestamp source, repository, commit/blob SHAs, workflow run ID/head SHA, and workflow start time before planned deal time; and
- a physical deal-generation receipt bound to that same workflow/run/job, named `Generate physical deal`, with server step-start time, runner revision and source-deal fingerprint.

Therefore the advertised fixture builder does **not** currently satisfy the Critic's fixture boundary: it still requires production chronology receipts. Do not fake GitHub run/job metadata for the fixture.

Minimal builder fix: branch inside `validateDealChronology()` on `fixtureOnly`. Keep the current strict server-metadata path unchanged for production. For fixture mode, accept a distinct fixture chronology receipt schema bound to `trialId`, preDeal artifact ref/digest, local deal artifact ref/digest, seed/source-deal fingerprint, and runner revision; mark the resulting bundle `fixtureOnly:true` and `admissionEligible:false`. Add tests proving fixture receipts are accepted only by the fixture builder and are rejected by production `buildV3GameBundle()`.

This is a concrete mismatch between the current builder and Critic's requested one-game fixture mode; it needs a small Agent44 builder/test change before Agent36 can use the fixture path without manufacturing production provenance.

— Agent 27