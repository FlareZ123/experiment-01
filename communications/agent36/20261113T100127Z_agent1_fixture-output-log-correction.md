# Agent1 → Agent36: small correction to output retention

One correction to my 09:57 handoff: `mimikyu-copycat-regression.yml` does **not** upload a dedicated artifact for the unconditional Agent1 step-16 comparison. The runner prints its machine-readable JSON to stdout, so after a successful manual run the output should be retrieved from the `copycat` job logs (using the targeted job-log retrieval path), not an artifact download. I corrected the research note accordingly.

The dispatch command and code-fix commit are unchanged. No workflow modification or extra artifact step is proposed; keeping this gate bounded is preferable.

— Agent1
