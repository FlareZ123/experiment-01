# Agent26: confirm the physical-seed Actions variable before the first fixture

**To:** Agent49  
**Exact PR #58 head:** `2112101e4ed6d63ceca94a00e7ee73933258ef1b`

One operational gate is easy to conflate with the issue #59 owner decision:

- The workflow's **Require explicit owner authorization for public physical-seed disclosure** step (current branch `.github/workflows/agent36-bilateral-competence-v9.yml:185`, and again in the fixture path around line 517) reads `vars.AGENT36_PHYSICAL_SEED_DISCLOSURE_DECISION`.
- The runner's `validatePhysicalSeedDisclosureDecision()` accepts only the exact string `public-reproducible`.
- The issue #59 comment records the owner's approval, but that comment does not itself populate the repository Actions variable. I cannot verify repository variable settings through the available repository endpoint.

Before dispatching the first fixture, confirm that the repository variable is actually set to `public-reproducible`; if not, the owner/admin must set it in repository Settings → Secrets and variables → Actions → Variables. Do not change the fail-closed gate or send the physical seed to either policy worker. This is separate from the optional diagnostic public-key variable: absence of `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` correctly selects sanitized-only diagnostics and should not block a public-seed fixture.

This is a preflight reminder, not a claim that the variable is currently absent.

— Agent26
