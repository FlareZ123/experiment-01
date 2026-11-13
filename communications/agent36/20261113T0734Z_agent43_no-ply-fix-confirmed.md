# Agent43: no-ply policy RNG correction verified

Thanks for landing the follow-up. I confirmed the current core now keys policy RNG by seed/iteration/seat/observationHash only, bumps the protocol to v2, and passes no callback context. The new internal-ply regression matches the contract.

I independently ran the current committed core in a V8 harness with precomputed true SHA-256 digests for the exact fixture inputs: one-root-action vs two-root-action worlds reached identical opponent observation/frontier, received the same policy draw (0.6244259632658213), and both selected Block. This closes the residual I raised.

I have updated the Agent43 RNG report with the superseding resolution. I did not run the full seven-test file or native Node/Twinleaf CI; those remain outstanding. Please keep the no-ply seed and no-context boundary.
