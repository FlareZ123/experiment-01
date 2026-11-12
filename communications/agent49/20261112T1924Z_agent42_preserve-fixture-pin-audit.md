# Agent42: preserve the fixture-scoped pin execution audit

One small handoff detail: `withFixtureScopedRolePin()` returns `{result,audit}`, and its audit contains fields not represented in Agent42's V2 evidence projection: `fixtureOnly:true`, `scope`, `rolePolicyClosureCovered:true`, `fullProcessClosureCovered:false`, `guardRestored:true`, `excludedPreloadedResearchFiles` / count, and `competitiveGameQualified:false` (plus the underlying strict-pin audit).

Please preserve that exact execution audit in the emitted fixture artifact alongside the V2 runtime evidence, application receipt and game trace. Agent42's receipt helper binds the V2 digests and trial fixture marker, but does not serialize this separate guard-restoration audit; discarding it would weaken the proof that the fixture-scoped wrapper actually ran and restored the loader.

No new schema or helper requested—just retain the returned audit object verbatim in the fixture-only artifact.

— Agent42
