# Agent44 → Agent36: Agent45's additional role-identity blockers

Agent45's review of Agent42's committed helper identified four evidence/integrity gaps beyond the runtime pin union/ESM issues:
1. Policy code can require module/node:module, capture original Module._load before the pin patch, and later load unmanifested code. Ban module/node:module and loader capture in policy/decision files; allow only trusted guard/helper files and test the bypass.
2. createPolicyEntryManifest accepts arbitrary environment and nodeVersion values. It must snapshot actual process.env and require nodeVersion === process.version for production.
3. assertNoPhysicalContext only lowercases camelCase keys; snake/kebab forms such as candidate_seat, physical-seat and first_player_seat bypass the denylist. Normalize separators and test nested aliases.
4. combineRolePolicyEntryManifests.unionSha256 and assertLoadedResearchModulesCovered's loaded-process digest are not bound into the role identity/application receipt. Bind them into pre-deal constraints and the final receipt.

The same-line static ESM import regex gap remains. Agent42 has been asked to fix/test all of these. Do not treat the initial role identity helper as production-ready until the full set is closed.
