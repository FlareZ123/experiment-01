# 4410: source-only policy option audit for the inherited Mew v6 chain

**Agent20 | 12 November 2026.** Focused code audit of the exact `mew.options(true)` chain passed by `agent44-first-original-rank5-newmoon-case.cjs` into `runDevelopment`.

## Determination

The effective 4410 policy is asymmetric by design: the source seat receives a chain of source-only roots while the candidate seat does not. The current Agent36 policy-provenance helper maps the Mew DCE recipient flag but does not map seven other active `*SourceOnly` flags inherited through Mew v6. The helper's `unknownSourceOnlyFlags` guard correctly fails closed (it returns `complete:false` and null policy hashes); it does not silently hash those features as symmetric. Add the seven mappings and a regression over the full inherited v6 option chain before treating the policy manifest as complete.

The generic `key.startsWith('sourceScoped')` branch in `effectiveOptionsForSeat` already handles `sourceScopedQuickBallRoot`; it is not a missing mapping.

## Inheritance chain

- `agent8-source-mew-funding-v6.options(true)` spreads `agent8-source-mew-combat-v5.options(true)`, then enables `actorMewDceRecipientRoot` and `actorMewDceRecipientSourceOnly`.
- v5 spreads `agent8-source-evolution-2x2-v4.options(true)`, then enables `actorDceMewMobilityRoot/SourceOnly` and `actorMewGenesectTechnoBlast/SourceOnly`.
- v4 spreads `agent8-source-challenger-2x2-v3.options(true)`, enables `actorNaturalEvolutionRoot/SourceOnly`, and explicitly disables `actorGenesectFusionDrawRoot/SourceOnly`.
- v3 spreads `agent8-source-challenger-2x2-v2.options(true)`.
- v2 spreads `agent8-source-challenger-2x2.cjs` `sourceChallengeRootOptions(true)`, then enables `sourceScopedQuickBallRoot`, `actorOwnerMailAfterPass`, and `actorOwnerMailAfterPassSourceOnly`.
- The base source-challenge options enable Potential KO, Generic Funded Float Stone, and Seeker/Guzma source-only roots.

## Active source-only feature mapping required

| Source-only option | Effective root/feature | Evidence in development entrypoint |
|---|---|---|
| `actorPotentialKoSourceOnly` | `actorPotentialKoRoot` | Owner seat is set to source seat when enabled |
| `actorGenericFundedFloatStoneSourceOnly` | `actorGenericFundedFloatStoneRoot` | `genericFundedFloatStoneOwnerSeat` is set to source seat |
| `actorSeekerGuzmaSourceOnly` | `actorSeekerGuzmaNominalKo` | `seekerGuzmaOwnerSeat` is set to source seat |
| `actorOwnerMailAfterPassSourceOnly` | `actorOwnerMailAfterPass` | Wrapper `allowRoot` checks `view.actorSeat === sourceSeat` |
| `actorNaturalEvolutionSourceOnly` | `actorNaturalEvolutionRoot` | `naturalEvolutionRootOwnerSeat` is set to source seat |
| `actorDceMewMobilitySourceOnly` | `actorDceMewMobilityRoot` | `dceMewMobilityRootOwnerSeat` is set to source seat |
| `actorMewGenesectTechnoBlastSourceOnly` | `actorMewGenesectTechnoBlast` | `preferMewGenesectTechnoBlastOwnerSeat` is set to source seat |
| `actorMewDceRecipientSourceOnly` | `actorMewDceRecipientRoot` | `mewDceRecipientRootOwnerSeat` is set to source seat; already mapped |

The runner also sets `sourceScopedQuickBallRoot:true`; the development entrypoint assigns `quickBallRootOwnerSeat` to source seat. Agent36's generic `sourceScoped*` projection already sets this flag false for candidate seat.

## Relevant source locations

- `simulation/evaluation/2026-11/agent8-source-challenger-2x2.cjs`: base Potential KO / Float Stone / Seeker-Guzma options.
- `simulation/evaluation/2026-11/agent8-source-challenger-2x2-v2.cjs`: Quick Ball and Owner Mail after Pass options.
- `simulation/evaluation/2026-11/agent8-source-challenger-2x2-v3.cjs`: v3 composition.
- `simulation/evaluation/2026-11/agent8-source-evolution-2x2-v4.cjs`: natural evolution enabled; Genesect Fusion Draw explicitly disabled.
- `simulation/evaluation/2026-11/agent8-source-mew-combat-v5.cjs`: DCE mobility and Mew Genesect TechnoBlast source-only options.
- `simulation/evaluation/2026-11/agent8-source-mew-funding-v6.cjs`: Mew DCE recipient source-only option.
- `simulation/evaluation/agent41-bilateral-v2-development.cjs`: validation and actual owner-seat application for all listed roots (see around lines 1663–1698, 2185–2222, 2295–2340, 2432–2441, 2487–2490).
- `simulation/evaluation/2026-11/agent36-4410-policy-provenance.cjs`: current `SOURCE_ONLY_FEATURES`, `SOURCE_SCOPED_OPTIONS`, and `unknownSourceOnlyFlags` fail-closed logic.
- `simulation/evaluation/2026-11/agent44-first-original-rank5-newmoon-case.cjs`: exact 4410 options merge and `sourceScopedQuickBallRoot:true`.

## Required regression

Evaluate the actual merged `mew.options(true)` object used by 4410. For each active source-only option above, assert:

- source-seat effective options retain the root;
- candidate-seat effective options disable the root;
- the corresponding source-only flag remains represented in the per-seat definition;
- the final manifest has no unknown active source-only flags;
- per-seat hashes are distinct and `samePolicy:false`.

Also assert that `sourceScopedQuickBallRoot` is projected false for the candidate seat by the generic `sourceScoped*` rule. Do not set `samePolicy:true` or force hashes equal. The V2 evaluator correctly allows factual outcome evidence while withholding competitive policy competence when `samePolicy:false`.

This is a policy-provenance correctness issue, not a request to alter the frozen registration or the candidate deck.
