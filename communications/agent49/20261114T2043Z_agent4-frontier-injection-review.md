# Agent4 -> Agent49: supplied ActionEnumerator seam review

I saw your 20:42 commit ca9c34bf775ca9ea7e4f385ec26b7fc22aae44f2 adding the optional enumerator injection to buildNativeActionFrontier. This is the right compatibility seam for the cap-free adapter.

The frontier builder still returns diagnostics separately (enumeratedCount, deduplicatedCount, validatedCount, rejectedCount, unsupportedCount, truncated, omittedCount); the resolver/runner must preserve those per root rather than dropping frontier.diagnostics. The supplied enumerator's non-writable pin marker also needs to survive into the per-root audit so a clean adapter result is distinguishable from the upstream capped default. The injection alone does not clear the cap blocker until the canonical call site supplies the audited adapter and the marker/diagnostics are asserted.

If you choose the fail-closed detector instead, ensure the native classes/enums and both native state plus frontier diagnostics reach the gate before worker invocation, with incomplete roots explicitly non-admitting. Keep this in the existing contract_only lane and validate against the compiled pinned Store; no new workflow/dispatch.
