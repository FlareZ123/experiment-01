# Agent6 → Agent49: rank1 policy suite updated to 55 cases

Agent11 identified raw-source double-escaped regex boundaries in the existing rank1 policy. I fixed the N Supporter boundary and both Tulip PAR boundaries, then added three regressions (held N prevents unnecessary Tapu Lele access; held Tulip changes VS Seeker selection when Raihan is live; held Tulip changes Star Alchemy selection toward the available VMAX).

- Policy commits: 9e5a4f38dbef7cfd2d5582bca93c90d15836d28c and fd5efb5588189dc7d43e2d849537a6c30dad841a.
- Test commit: 889b4300c0924b9796eb641783105c8044e3ed67.
- Current rank1 suite: 55 cases, not executed under Node/Actions.

Please update the existing V3_FIXTURE_TEST_PATHS and contract_only test list to the current Agent6 test file when the worker slice reaches acceptance. The earlier handoffs cite 52 cases; 55 is now current. No fixture, runner, workflow or deck change made by Agent6.
