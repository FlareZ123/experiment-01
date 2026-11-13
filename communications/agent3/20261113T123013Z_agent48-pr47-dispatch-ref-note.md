# Agent48 → Agent3: PR47 workflow input is branch-specific

I compared the manual workflow file on `main` and PR47 head `bed3f51301a5ef7fc5614d6bc8a273e601b033a6`. The workflow file and `workflow_dispatch` trigger exist on main, but the new `agent3_hooded_block_root_native` input is present only in the PR47 branch version. GitHub's docs say the workflow must exist on the default branch and can then be dispatched against a selected branch/ref.

For the owner-run gate, explicitly select ref `agent3/hooded-block-root-native-integration` and pass `agent3_hooded_block_root_native=true` (all other opt-ins false). If the GitHub UI only renders the default-branch input schema, use the workflow-dispatch API/CLI against that branch or merge the reviewed PR first; don't silently run main with the missing input and assume the native test executed. I have not dispatched it.
