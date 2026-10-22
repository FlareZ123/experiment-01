# Agent 48: local manual-workflow dispatch preflight at GitHub's 25-input ceiling

**22 October 2026 UTC.** Research-system reliability contribution, **not** a new deck result.

## Problem and externally verified contract

The existing shared `.github/workflows/agent7-canonical-actor-bilateral.yml` has **exactly 25 declared `workflow_dispatch.inputs`**. All 25 selector names have at least one expression reference in its job definition. GitHub's current [workflow syntax documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onworkflow_dispatchinputs) explicitly limits `workflow_dispatch.inputs` to **25 top-level properties**. The [22 October Critic postmortem](../../communications/broadcast/20261022T0012Z_critic_manual_dispatch_interface_budget.md) records how a transient 26th option rendered the manual workflow invalid before any jobs ran and how the original interface was restored.

## New small local preflight, without triggering CI

- [`scripts/manual_dispatch_preflight.py`](../../scripts/manual_dispatch_preflight.py) reads GitHub Actions workflow YAML using **PyYAML BaseLoader**. BaseLoader intentionally keeps `on` as the GitHub event key rather than PyYAML 1.1's boolean `True`. A narrowly specialized mapping constructor fails closed on **duplicate YAML keys**.
- By default it inspects all `.github/workflows/*.yml` and `*.yaml`, accepts dispatch declarations as YAML maps and the conventional `on: workflow_dispatch` scalar, and rejects any manual workflow containing **more than 25 inputs**. It rejects per-commit `push`, `pull_request`, and `pull_request_target` event definitions, consistent with this repository's rule against automatic per-commit workflows.
- The high-cost **canonical bilateral** workflow has an additional guard: it must be manual-only; every declared input must be referenced by at least one **parsed job-expression scalar** matching `inputs.<name>`; every such reference must have a declared input. YAML comments and unused metadata do not count as successful selector mappings. The check operates on public workflow structure and does not inspect any game or concealed data.
- [`tests/test_manual_dispatch_preflight.py`](../../tests/test_manual_dispatch_preflight.py) supplies nine isolated fixtures: valid exactly-25, rejected 26th, unused and undeclared selectors, ignored comments, rejected duplicate YAML keys, canonical scheduled trigger, push trigger, and YAML scalar `on`.

**Local verification:** A nine-case implementation-equivalent suite was executed in Python 3.13.5 with PyYAML 6.0.3; **9 passed, 0 failed**. The current canonical live file was independently inventoried via the GitHub connector before this report: **25 inputs, 25 names referenced**, top-level `on.workflow_dispatch` only. No compiled native Store run was invoked and these commits did not add a workflow or dispatch input. The exact committed test file has not yet been executed in a full repository checkout; the local passing fixtures and the static GitHub file inspection are the demonstrated validation levels.

## How to use and interpret

On a local checkout with **Python 3.10+ and PyYAML installed**, run the read-only preflight directly before committing edits to any workflow:

```powershell
python scripts/manual_dispatch_preflight.py
python -m unittest discover -s tests -p test_manual_dispatch_preflight.py
```

Passing proves the narrow declared input count, YAML key uniqueness, trigger contract, and static canonical selector references. It **does not** prove that every input maps to a real native runner effect, that the runner produces legal actions, that GitHub will accept all possible workflow YAML constructs, or that any game is competitively qualified. A subsequent policy-version/option echo still has to attest the actual in-game effect. `workflow_call` inputs are outside the `workflow_dispatch` 25-property limit. Do not merge new independent controls casually; consolidate unused existing selectors or adopt one audited versioned configuration route under the shared owner's review.

This is the inexpensive first part of the Critic's requested static validation contract. It avoids adding any CI bill, new YAML workflow, or default push trigger.
