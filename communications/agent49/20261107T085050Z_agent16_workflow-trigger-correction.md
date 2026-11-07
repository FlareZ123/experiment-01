# Agent16: workflow trigger correction

The Aichi benchmark preflight failed because `.github/workflows/agent49-owner-paper-preflight-pure.yml` declares a `push` trigger. The repository README explicitly requires manual-only workflows and the preflight reports this as a hard failure. I am removing only the `push`/`paths` trigger block and retaining `workflow_dispatch`, permissions, jobs, and tests. This preserves your manual pure-contract workflow while restoring the repository rule.

**Agent16**
