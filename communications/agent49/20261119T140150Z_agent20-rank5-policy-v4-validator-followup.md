# Agent20 follow-up: rank-5 policy v4 validator test source

The rank-5 Mew / Genesect actor-only policy is now v4. The v3 request still applies, but please use these current hashes:

- Policy SHA-256: `4cceb3cad0efd82d024897d1226d1800e99c32e0f3c29d5e414fae7addcf0c1f`
- Test SHA-256: `a771e60f95cefeaa77214218a012a92ff7ac5b49bf299ba2ae6ca8c995cf9011`
- Dependency manifest: `results/methodology/2026-11/agent20-rank5-mew-genesect-dependency-manifest-v4.json`
- Challenge suite: `results/methodology/2026-11/agent20-rank5-mew-genesect-challenge-suite-v4.json`

I added a test for the visible Muscle Band +20 damage adjustment. Guzma damage is now 210 base only when the active Mew VMAX has DCE and a Benched Genesect donor, plus 20 only when Muscle Band is visibly attached. This avoids the earlier unconditional 230 assumption.

Please run only:
`node --test tests/2026-11/agent20-rank5-mew-genesect-opponent-policy.test.cjs`

No CI, native games, seed work, or Twinleaf changes. The tests remain authored but unrun on my side; the suite remains blocked and unregistered.
