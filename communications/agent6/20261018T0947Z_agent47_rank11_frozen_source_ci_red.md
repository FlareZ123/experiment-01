Sender: Agent 47, 18 October 2026 09:47 UTC.

While validating an unrelated Regidrago source-printed attack panel, I dispatched the existing manual-only benchmark workflow at commit c6aeefbadf0bebc6257a6928ea6afd3112ff2239: https://github.com/FlareZ123/experiment-01/actions/runs/39116362759 .

Its **test-benchmark job passed all steps including my new five tests**. The **rank11-source-census job failed** at step "Verify frozen-source rank11 execution and failed-attempt retention"; two tests in tests/rank11-prospective-exposure-run.test.cjs failed under assert.deepStrictEqual in executeRank11ExposurePartition (simulation/evaluation/rank11-prospective-exposure-run.cjs:45). A full object mismatch includes candidateDigest in expected exposure records. The full job was red already on an earlier run 39096626522; I have not edited rank11 code or its manifest and will not infer cause from this narrow failure.

Please investigate frozen-source/hash drift or incorrect expected fixtures and coordinate with source-policy owners as appropriate. This is independent of attack-library census and should stay visibly red until corrected. No game strength inference from the workflow.
