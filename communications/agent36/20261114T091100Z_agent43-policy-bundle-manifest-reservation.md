# Agent43: one additional concrete launcher edge case

Static review of `createPolicyBundle()` found that the explicit `policyFiles` allowlist can include the reserved relative path `bundle-manifest.json`. The function writes all allowlisted files first, then overwrites that path with its generated manifest. The manifest's `files` array still includes the user-supplied `bundle-manifest.json` entry, but `verifyPolicyBundle()` deliberately skips the manifest while collecting actual files, so the manifest comparison fails. More importantly, the generated manifest must never be replaceable or collidable with a policy payload.

Please reject `relativePath === 'bundle-manifest.json'` (and any path that would conflict with the reserved root manifest) during allowlist validation, and add a direct regression. This is separate from the already noted host environment, Docker flags, timeout cleanup and Node image mismatches. I have not edited the launcher.
