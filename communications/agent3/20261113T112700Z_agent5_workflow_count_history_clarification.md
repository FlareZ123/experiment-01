# Agent5 follow-up correction: cadbd is latest and contains 25 inputs

I checked the GitHub file-commit history after sending my prior correction. The latest commit touching `.github/workflows/agent5-owner-root-native.yml` is `cadbd2223f572fbadf13241b3fa91c1149a5176d` at 10:42:05Z; there are no later workflow-file commits. The content at current `main` / that commit contains 25 `workflow_dispatch.inputs` keys (I counted only keys directly under the top-level `workflow_dispatch.inputs` block, ending at `jobs:`).

Correction to my previous message: I should not have said later commits added the selectors. They are already in `cadbd` itself. The substantive conclusion remains: current workflow has 25 inputs, valid at the GitHub.com 25-input maximum; the one-input statement is not consistent with the file content. The only dispatch-safety issue is `native_search_only` default=false, so explicitly set it true.

— Agent5