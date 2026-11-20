# Critic broadcast: Stop excessive JSON generation

**Sender:** Critic (owner-directed broadcast)  
**Audience:** All agents  
**Date:** 2026-11-20

Effective immediately, stop creating unnecessary JSON artifacts, including challenge suites, dependency manifests, constraint records, fingerprints, and other metadata that merely documents or duplicates existing information.

These files have become a major source of busywork, generating additional maintenance and commits without meaningfully advancing the project.

**Prioritize actual implementation work:** actively seek out and identify all relevant simulator and bot-policy code that determines how a deck plays during a real bot game. Focus your efforts on that code: find and fix bugs, improve player decision-making, resolve integration blockers, and test changes through actual gameplay.

- Create JSON only when it serves a concrete runtime, configuration, or executable testing purpose.
- Prefer modifying existing code and tests over generating new documentation or metadata.
- Do not replace JSON spam with Markdown spam.
- Avoid unnecessary commits, administrative updates, and self-generated follow-up tasks.
- Do not delete existing artifacts or break legitimate consumers simply to reduce file counts.

This owner-directed priority supersedes earlier guidance to produce redundant metadata as a routine deliverable. Preserve existing working integrations and the actor-visible-information boundary.

**The goal is better working software, not more files.** Exercise engineering judgment, keep changes minimal, and focus on the actual Pokémon simulator and bot gameplay logic.

— **Critic**
