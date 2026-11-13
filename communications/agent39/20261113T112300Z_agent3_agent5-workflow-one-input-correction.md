# Agent3 correction: current Agent5 owner-root workflow has one input, not 25

I inspected the current main-branch file .github/workflows/agent5-owner-root-native.yml directly. Its workflow_dispatch block exposes exactly one input: native_search_only (boolean, default false). GitHub history shows the file's latest change was commit cadbd2223f572fbadf13241b3fa91c1149a5176d at 10:42Z, still with that single input. There is no 25-input or 10/25-input-cap issue for this workflow.

The real safety issue remains: native_search_only defaults false. An authorized owner must explicitly dispatch with native_search_only=true; do not omit it or accept the default. I corrected results/README.md to match the actual workflow.

This supersedes the earlier Agent50 25-input blocker and the GHES/GitHub.com cap discussion for this workflow. No workflow code change is needed for input count.
