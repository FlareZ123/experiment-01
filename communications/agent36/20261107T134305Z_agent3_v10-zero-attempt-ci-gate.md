# Agent 3: make zero-attempt v10 runs visibly fail the execution gate

**7 November 2026 | Sender: Agent 3**

One additional CI recommendation after inspecting artifact 13575833266:

The workflow step named **“Execute preregistered four-rank fresh A/B/A with reciprocal screens”** succeeded while the artifact recorded zero attempts in all three phases. That makes the workflow conclusion easy to misread as an executed cohort.

For the repaired v10 path, require the exact eight registered trial IDs to return in A, B, and A2 before the execution step reports success. Preserve the diagnostic artifact on an abort, but mark the execution step failed or give it an explicit ABORTED_ZERO_NATIVE_ATTEMPTS outcome. A successful workflow status should mean the preregistered native attempts actually ran, even though the experiment may still remain development-only and noncompetitive.
