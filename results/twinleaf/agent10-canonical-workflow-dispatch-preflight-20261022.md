# Canonical manual-dispatch input preflight

**Agent 10 | 22 October 2026 UTC | local syntactic contract only.**

## Why

The canonical bilateral workflow \`.github/workflows/agent7-canonical-actor-bilateral.yml\` currently declares **25 workflow_dispatch inputs**, the maximum permitted by [GitHub's current documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onworkflow_dispatchinputs). Agent 12's accidental 26th input produced a GitHub workflow-validation failure without any compiled research match. The later edit restored the maximum. [Critic's incident report](../../communications/broadcast/20261022T0012Z_critic_manual_dispatch_interface_budget.md) calls for an inexpensive edit-time guard.

## Delivered implementation

- [Checker](../../scripts/check_canonical_dispatch.py): parses GitHub Actions YAML with the existing PyYAML \`BaseLoader\`, retaining the literal \`on\` event key (which ordinary YAML 1.1 Boolean coercion can mishandle). A custom mapping constructor rejects duplicate keys rather than silently losing a duplicated input.
- Restricts this **canonical** workflow to \`workflow_dispatch\` only and enforces the documented **25-input maximum**. Requires a nonempty jobs mapping, declared input types, and explicit defaults for Boolean inputs.
- Compares every input referenced by the **job definitions** with every declared dispatch input, failing on an unused selector or an undeclared reference. This catches wiring drift without claiming the corresponding runner option implements an effective game policy.
- [Regression tests](../../tests/test_workflow_dispatch_contract.py): valid 25-selector contract, forbidden 26th selector, per-commit trigger, dead selector, undefined reference, duplicate YAML key, and the YAML \`on\` coercion pitfall. An eighth test parses the real canonical workflow when run from the repository checkout.

## Verification and deployment boundary

A local Python 3 / PyYAML **6.0.3** run passed all seven fixture cases. The live-repository test was skipped in that isolated scratch environment because the GitHub repository checkout is not available inside the local shell. A separate read-only GitHub-file audit counted all **25** currently declared canonical inputs and detected at least one actual \`inputs.<name>\` reference in the workflow for each. That string-level check is weaker than executing the full YAML preflight on the repository checkout.

The two source files were committed directly to \`main\` via GitHub's file API. The actual GitHub runner, native Twinleaf engine, and full canonical workflow parser have **not** been executed by this contribution. Researchers can run \`python tests/test_workflow_dispatch_contract.py\` with **PyYAML 6.x** locally before modifying this workflow. No workflow, automatic push trigger, new dispatch flag, or CI run was added.

The checker intentionally does **not** certify that each input maps to a versioned and effective policy, that the matched action targets are physical and owner-visible, that the bot is competent, or that a game is competitively qualified. Those require independent native Store and policy tests.

## Impact on the fixed-deck objective

Preventing another invalid workflow preserves scarce shared time and CI budget while Agents 12/41 and other collaborators qualify real bilateral games. It does **not** change the 29/32 exact-source-list count, produce an additional qualified match, choose a final fixed deck, or support a 99.5% win claim.
