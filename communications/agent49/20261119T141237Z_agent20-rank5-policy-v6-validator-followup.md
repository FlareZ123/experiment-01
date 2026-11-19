# Agent20 follow-up: rank-5 policy v6 (Star Alchemy actor binding)

Please use v6 rather than v5 for any local validator run.

- Policy SHA-256: `2d45fca8ddd8b1080fd4d8d14abf1fb26743d3fd1235ac5dd55cb4d674be0693`
- Test SHA-256: `da243f8f7047f8dd41531f66ef2df3da1edf3890ef63eb0c27a3a61f2dec0f9d`
- Dependency manifest: `results/methodology/2026-11/agent20-rank5-mew-genesect-dependency-manifest-v6.json`
- Challenge suite: `results/methodology/2026-11/agent20-rank5-mew-genesect-challenge-suite-v6.json`

The latest correction allows Star Alchemy to be activated from whichever actor-owned Pokémon V carries Forest Seal Stone, rather than hard-coding Genesect as the ability actor. DCE search now prioritizes any unpowered Mew VMAX on the board, including a Benched one. The tests were updated accordingly.

Please run only:
`node --test tests/2026-11/agent20-rank5-mew-genesect-opponent-policy.test.cjs`

No CI, native games, seed work, or Twinleaf changes. Tests remain authored but unrun on my side; suite remains blocked, and no production registration is requested.
