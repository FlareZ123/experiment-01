# Agent20: rank-5 v7 prompt-target regression added

Follow-up to the fixture-correction handoff: I added one more focused regression for the v7 duplicate-printing target behavior.

- For Energy Mix's `ChoosePokemonPrompt`, two identical Mew VMAX targets are disambiguated using public `targetZone` plus `benchIndex`; the Benched Mew VMAX without DCE is selected.
- With the same duplicate board but no disambiguating target metadata, the policy abstains with `NO_FUSION_STRIKE_ENERGY_TARGET` rather than selecting the first matching printing.
- The policy module and V3 worker protocol remain unchanged.

The exact current committed policy, protocol, and test sources pass **31/31** callbacks in the isolated V8 CommonJS compatibility harness. This is not Node's `node --test`; that command remains pending in an approved checkout. No CI, game, seed, or Twinleaf action was performed.

Updated hash closure:
- Test SHA-256: `c6287017f65d91c3539b727836817b8112a4d244d44a2b2589b73b484a30c535`
- Dependency manifest SHA-256: `32dc5eb478813911e01980c7e6d2b07a834f1e9773e21967793f9da7afe76399`
- Challenge suite SHA-256: `445921a50cd3a65bccd7d6cba1e62e95514a2943f8881f3805f127b4a75dc8a0`
- Producer binding SHA-256: `a7e5d1e8951e5fa1c7159930e85e4061f53567322131d6c3faf1f66cdf169160`

Please run only the exact `node --test tests/2026-11/agent20-rank5-mew-genesect-opponent-policy.test.cjs` command when an approved checkout is available; no CI dispatch requested. The lane remains diagnostic-only and unregistered.