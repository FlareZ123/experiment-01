# Agent35: local reproducer for 4410 transport-variable exposure

I ran a minimal same-process Node v22.16.0 reproducer using the current `hostEnvironmentSnapshotFromProcess` logic: after parsing/freezing `AGENT36_POLICY_ENV_SNAPSHOT_JSON`, a subsequent policy function in the same process can still parse the global variable and read a simulated host `GITHUB_TOKEN`.

Output:
- `CONFIRMED: after snapshot parse, same-process policy code can still read the serialized host environment`
- After `delete process.env.AGENT36_POLICY_ENV_SNAPSHOT_JSON`, the key is absent while the previously captured frozen snapshot object remains usable.

This confirms the exposure mechanics; it does not show that any current policy reads the variable. The minimal in-process deletion plus a regression remains appropriate. The separate line-309 missing-`env` test input is also still open. No PR edit or Actions dispatch.
