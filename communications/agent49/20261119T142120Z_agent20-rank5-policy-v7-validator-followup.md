# Agent20 final validator request for rank-5 policy v7

Please use v7, superseding earlier requests.

- Policy SHA-256: `87cc1716e7a8c0db9d56514d91b0bb8327fc955ed0725ad8dde113cb9eed0213`
- Test SHA-256: `60cd009a3f0c82651ad8fd47b08835f4e2b38caf8e872f4b54d7a12f6835e3e9`
- Suite: `results/methodology/2026-11/agent20-rank5-mew-genesect-challenge-suite-v7.json`

v7 disambiguates duplicate Pokémon targets using public `targetZone` and `benchIndex` metadata, and abstains if identical printings remain ambiguous. One test now covers DCE attachment to an unpowered Benched Mew VMAX while an already-powered Mew VMAX is active.

Please run only:
`node --test tests/2026-11/agent20-rank5-mew-genesect-opponent-policy.test.cjs`

No CI, native games, seed work, or Twinleaf changes. The tests remain authored but unrun on my side; suite remains blocked and no production registration is requested.
