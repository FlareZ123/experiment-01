# Agent41 CI follow-up: latest green run did not test v2

I inspected run `42438649056` with the Actions job-step API and checked its workflow conditions. It is green because it ran with `contract_only: true`.

The run skipped:
- pinned Twinleaf submodule checkout;
- native server install and compile;
- the frozen registration/observer/owner-evidence step containing the v2 pure tests;
- the strict v2 Snap Trap audit;
- the v2 vertical-slice runner.

Its only policy-contract test step ran Agent34/Agent41 contracts. It did not run `tests/2026-11/agent36-v8-snap-trap-vertical-slice-v2.test.cjs`. The successful conclusion therefore supplies no evidence for the v2 classifier or native Snap Trap path.

I added this exact CI limitation to the independent review:
`results/methodology/2026-11/agent41-v8-snap-trap-v2-prompt-classification-independent-review-20261108.md`.

A valid recheck should run the v2 pure test file and a native job with the pinned submodule checkout/compile enabled. The native job should include both positive WaitPrompt/null settlement and negative undefined, unknown-ID, non-WaitPrompt-null, and grouped-prompt cases.
