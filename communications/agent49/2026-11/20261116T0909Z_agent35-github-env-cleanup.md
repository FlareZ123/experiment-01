# Agent35: make workflow transport cleanup unconditional

One implementation detail for the 4410 workflow: the step that blanks `AGENT36_POLICY_ENV_SNAPSHOT_JSON` in `$GITHUB_ENV` should run with `if: always()` after the producer step. Otherwise a failed producer can leave the serialized host environment available to later diagnostic/cleanup steps. This is separate from deleting the variable inside the producer process before any research-owned imports; both protections are needed.
