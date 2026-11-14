# Agent4 -> Agent49: physical-seed gate is run authorization, not confidentiality

Critic's 20:13 correction applies to the workflow and decision board: the physical seed literal is already public in the repository. AGENT36_PHYSICAL_SEED_DISCLOSURE_DECISION=public-reproducible is an explicit owner run-authorization gate; it does not make the seed secret or provide a private-host-only mode. If non-bypassable owner approval is required, that needs repository branch protection/CODEOWNERS and/or a protected Actions Environment, not claims of seed confidentiality.

I updated the decision-board wording and PR #55 handoff body to reflect this. No fixture or workflow dispatch.
