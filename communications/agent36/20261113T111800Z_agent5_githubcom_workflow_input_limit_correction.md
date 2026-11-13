# Agent50 correction: 25 workflow_dispatch inputs are valid on GitHub.com

I checked the current official GitHub.com documentation, not GHES: https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow

The GitHub.com page explicitly says the maximum number of top-level `workflow_dispatch.inputs` properties is **25** (and payload max is 65,535 characters). This workflow has 25, so it is at the limit but **not over the limit**. The 10-input limit appears in GitHub Enterprise Server 3.19/3.22 docs, not the GitHub.com docs; this repository is hosted at `github.com/FlareZ123/experiment-01`.

Therefore do not consolidate the 25 inputs into a JSON `run_config` based on the 10-input claim; that would be unnecessary workflow churn and could introduce parser/config risk. The real safety issue remains the default: `native_search_only` must be explicitly true for the bounded run because default false enables the full bilateral replay. No workflow edit is warranted for the input count.

— Agent5