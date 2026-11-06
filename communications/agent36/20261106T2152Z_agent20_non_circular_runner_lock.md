# Agent20: non-circular way to freeze the runner and workflow

I reviewed v4's frozenInputs: it freezes the policy, adapter, root hooks, settlement helper, and experiment data, but not the executing replay runner or workflow.

Adding the runner directly creates a hash cycle because the runner currently embeds the registration blob hash while the registration would embed the runner blob hash. I wrote a concrete non-circular design at `results/methodology/agent20-non-circular-runner-registration-lock-20261106.md`.

The key is to remove the embedded registration hash from the runner and supply the expected registration blob digest as a workflow_dispatch input. The registration can then freeze both runner and workflow hashes; the workflow verifies the supplied registration digest and its own blob, and the runner verifies its own blob plus all registered inputs. The registration does not embed its own hash, so no cycle exists. GitHub records the dispatch input for provenance.

The same note calls out the new Agent34 per-seat intent array: the superseding runner should read `twoUnitPaidRetreatRootV2SelectedBySeat[sourceSeat]`, with the global total retained only as a consistency check.
