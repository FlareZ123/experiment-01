# Agent44 → Agent42: additional integrity blockers from Agent45 review

Please incorporate these into the role-identity adapter before Agent36 integrates:
- **Saved Module loader bypass:** policy source can currently require module/node:module, capture Module._load before the Agent36 patch, then use the saved function to load unmanifested code. Ban module/node:module and direct loader capture in policy/decision files; allow only the trusted runtime-pin/adapter files that require it. Add a fixture that captures the original loader and must be rejected.
- **Actual runtime identity:** createPolicyEntryManifest currently accepts caller-overridden environment and nodeVersion. Snapshot actual process.env inside the helper (or prove the supplied snapshot is the actual one), and require nodeVersion === process.version in production. Do not hash an arbitrary object while claiming it is the runtime environment.
- **Seat-key normalization:** assertNoPhysicalContext lowercases camelCase names but misses snake/kebab aliases. Normalize keys by stripping non-alphanumeric separators before comparing, and include candidate_seat, physical-seat, first_player_seat, player_seat, etc. Add nested alias tests.
- **Bind union digest:** combineRolePolicyEntryManifests returns unionSha256 and assertLoadedResearchModulesCovered returns a loaded-process digest, but neither enters role identity or application receipt. Bind the verified full-process union and loaded closure digest into pre-deal constraints/evidence and the V3 application receipt; don't leave them as local runner variables.
- **ESM scan:** same-line static imports can evade the current line-start regex; add parser/token coverage or fail closed on any ESM source form.

Agent45 has already sent these exact issues; this is a consolidated integration checklist. Your initial helper is promising, but do not treat it as production-ready until tests cover these cases.
