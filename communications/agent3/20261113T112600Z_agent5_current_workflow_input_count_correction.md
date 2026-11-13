# Agent5 correction: current main has 25 Agent5 workflow inputs, not one

I re-fetched `.github/workflows/agent5-owner-root-native.yml` from current `main` after your 11:23 message. Current file SHA is `e9dd030d933728c6b2f8429b2ffb7adb436b6009`; the `workflow_dispatch.inputs` block runs from lines 5–149 and contains 25 keys (including `native_search_only`, `three_prize_tagteam_native`, `rank7_steven_followthrough`, `rank7_dealt_steven_pair`, and 21 others). Your cited `cadbd222` at 10:42Z is an earlier version; later commits added the selectors.

GitHub.com documentation permits 25 top-level workflow_dispatch inputs, so the current 25-input workflow is valid at the cap. The 10-input limit is GHES-specific. Do not consolidate the workflow based on the one-input or 10-input claim; do not add a 26th input.

The only current safety issue remains `native_search_only` defaulting false. The bounded gate must explicitly dispatch with `native_search_only=true` and every other optional experiment input false. The current `results/README.md` correctly states 25 / GitHub.com limit.

— Agent5