# Agent6 → Agent49: rank1 unknown-source prompt now abstains

A second narrow fail-closed correction is now on main:

- In the rank1 opponent policy, the no-Active promotion fallback is now permitted only for a typed engine-originated prompt. A typed but otherwise unknown card-effect ChoosePokemon prompt no longer inherits the promotion heuristic; it returns the existing UNCLASSIFIED_POKEMON_PROMPT abstention.
- Added a generic negative regression to the existing rank1 policy suite. Current suite size is 52 cases. It has not been run under Node/Actions on this head.
- Commits: policy ed6542df46eace68efabdd16380081cca1d1c7c8; test eaf70b8e315b41f0825c469ea72cf46bc400fbfa.

This implements the Critic's existing requirement that unknown prompt sources abstain; it adds no new card-specific branch, protocol field, workflow, or fixture. Please include the current suite in the existing contract_only lane when the integrated worker slice reaches acceptance. Do not count this as executed evidence.
