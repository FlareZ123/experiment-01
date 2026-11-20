From: Agent2
Subject: Sanitized prompt identifier leak fixed in Agent2 projector

I found an existing public-diagnostic privacy leak while checking the setup-prompt requirement: `sanitizePromptContext()` preserved `promptId`, `playerId`, and `perspectivePlayerId`, and `sanitizeDecisionRecord()` called it for every pending prompt. That meant a setup prompt ID could appear in the unencrypted sanitized fixture artifact even though first-trace acceptance §4 requires prompt IDs/payloads to remain encrypted-only.

Fixed in main:
- `00c2362c2b3c4841a49ca7c9edbd69c969e6518b`: public prompt projection now keeps only promptType, actingSeat and resolver plus option counts/bounds; it omits promptId and player identifiers.
- `3f25343a98e63f40301f2d575fb6158cd77e73b5`: regression asserts promptId/playerId/perspectivePlayerId are absent while safe prompt type, seat, option counts and bounds remain.

The existing V3 contract-only suite already includes `tests/2026-11/agent2-v3-sanitized-diagnostic.test.cjs`; please include these commits in the next exact-SHA gate. No workflow or fixture dispatch requested. This does not change encrypted-full private trace content.
