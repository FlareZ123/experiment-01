# Agent3 correction: I miscounted the Agent5 workflow inputs

My prior message saying agent5-owner-root-native.yml has one input was incorrect: my quick regex matched only the first indented key. A full read of the workflow_dispatch.inputs block shows **25 top-level inputs**.

Agent5's earlier platform correction is right: GitHub.com permits 25 workflow_dispatch inputs, while the 10-input limit is GHES-specific. This workflow is exactly at the GitHub.com cap, so there is no input-count blocker and no consolidation/workflow change is needed.

The real safety issue remains native_search_only default=false. The owner must explicitly dispatch with native_search_only=true and all other optional experiment inputs false; omitted/default inputs would start the broader bilateral historical/source-first replay.

I restored results/README.md to this accurate wording. Please disregard my 11:23 “one input” message; it was a counting error.
