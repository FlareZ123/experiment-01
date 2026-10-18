# Agent 26: fail-closed completed-game provenance

**18 October 2026, 01:00 UTC.** Evidence class: archive integrity and Node regression. This report describes no new played game, paper-rule validation, or win-rate result.

## Research question

Can a completed source-locked campaign be accepted by the evidence envelope when the raw engine did not supply the policy or engine settings that the analyst declares in its provenance?

Before this change, `createEvidenceEnvelope` used conditional checks of the form `row.observedEngine && ...` and `row.effectiveMatchOptions && ...`. A completed row with an omitted `observedEngine`, `observedRngProtocol`, `observedPolicy`, `resolvedEngineRevision` or `effectiveMatchOptions` skipped that disagreement check. Similarly, `auditArchive` allowed a completed row without `observedSeed`, because it only compared a present value. The baseline synthetic completion fixture showed the envelope could be created without those fields. This was a provenance-validation weakness, not evidence that any historical result was forged.

A second contract mismatch existed: the source-locked runner emits `status:'match-policy-echo-mismatch'` when a requested correction cannot be verified against the game response, but `auditArchive` did not recognize this status as an accounted failure.

## Change and falsification criteria

- `simulation/evaluation/aichi-evidence-envelope.cjs` requires the raw observed seed to equal the scheduled seed for every completed record.
- For every completed record, the envelope now requires exact affirmative matches of the observed engine, resolved engine revision, observed RNG protocol, observed policy identifier and the full effective match-options object to the explicitly supplied provenance.
- Missing or altered engine-policy fields fail closed. This remains a self-reported engine echo and cannot substitute for independent code attestation.
- The runner's `match-policy-echo-mismatch` status is accepted as a failed trial, with no candidate winner.
- `tests/aichi-evidence-envelope.test.cjs` now covers deletion of each raw evidence field, changed match flags, missing raw seed, and classification of a policy-echo mismatch. Its comparison fixture constructs a genuinely different observed-and-declared policy rather than changing only the analyst's declaration.

The falsification criterion was a full run of the existing manually dispatched Node statistical benchmark suite. The first run [39084742199](https://github.com/FlareZ123/experiment-01/actions/runs/39084742199) reported 191/192 passes; the sole failure was a legacy synthetic comparison fixture whose changed declaration conflicted with the newly required original observed options. It exposed the intended compatibility break rather than a rules change. Updating the fixture to represent the alternate policy as actually observed allowed the corrected [run 39084807171](https://github.com/FlareZ123/experiment-01/actions/runs/39084807171), at commit `d8b13abdcb38a665484723dbedf8b6e70aecdda7`, to complete successfully.

## Interpretation

The envelope now refuses to accept a completed game whose recorded execution settings are missing or differ from the submitted provenance. This strengthens comparisons against silent policy and engine-drift claims, including analyses of champion, Hood and Temple runs. It provides no proof that the engine actually obeyed its recorded settings, that the rules were correct, that a policy was competent, or that a match was competitive.

Older historical archives lacking the new required fields may fail this contract and remain useful only at their original lower evidence level. Do not retrofit missing fields or reclassify results to avoid the check.

**Unchanged strategic status:** 29 of 32 exact Top 32 source lists, zero independently qualified competitive games, and no demonstrated 99.5% fixed-deck success.
