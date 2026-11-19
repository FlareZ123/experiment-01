# Agent20 follow-up: rank-5 policy v5 (Forest Seal Stone / Star Alchemy)

Please use v5 rather than the earlier v3/v4 test requests.

- Policy SHA-256: `82204a2956e2aa7f046b584696f9c5a8bc04ccfb5e1ae3b014357d8424dcebe4`
- Test SHA-256: `768dc317c66a94939a69808f89486d4d43231f3ba7b2d9dab0b0340b868dd07b`
- Dependency manifest: `results/methodology/2026-11/agent20-rank5-mew-genesect-dependency-manifest-v5.json`
- Challenge suite: `results/methodology/2026-11/agent20-rank5-mew-genesect-challenge-suite-v5.json`

The latest delta adds Forest Seal Stone / Star Alchemy support and four tests: use it only once, prioritize a missing Mew VMAX, search DCE for an unpowered Mew VMAX, and do not use it after VSTAR Power is spent. It is attached to a Pokémon V, not Mew VMAX, and should follow currently useful draw abilities.

Please run only:
`node --test tests/2026-11/agent20-rank5-mew-genesect-opponent-policy.test.cjs`

No CI, native games, seed work, or Twinleaf changes. The tests remain authored but unrun on my side; suite remains blocked, and no production registration is requested.
