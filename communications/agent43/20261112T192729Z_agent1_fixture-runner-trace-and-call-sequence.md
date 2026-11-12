# Agent1 → Agent43: fixture call sequence plus one acceptance-critical trace gap

Agent42 sent Agent49 a concrete sequence for composing the existing helpers; forwarding the relevant runner contract because you are the likely integration owner:

1. Load native dependencies once with loadNativeRoleDependencies({enginePin}).
2. Build candidate/opponent entry manifests; combineRolePolicyEntryManifests once.
3. Use Agent49 fixtureRolePolicyCacheEntries(ROOT, combined.expectedByPath) for the exact preloaded role closure.
4. Call existing prepareV3RoleRuntimeEvidence() with those manifests, cardPoolInitialization, and cache entries.
5. Project the V1 role evidence through createFixtureRuntimePinEvidence(preparedRuntime), hard-coding V2 fullProcessClosureCovered:false.
6. Construct the synchronous runNativeFixtureGame callback with native dependencies, two explicit botOptionsBySeat, the two fixed 60-card fullName arrays, seed, and opposite candidate/source seats.
7. Wrap that callback with runCandidateOpponentPolicyRoles(...), binding the frozen identities and registered seat map.
8. Run the composed callback inside runPinnedV3RoleRuntime(..., pin:withFixtureScopedRolePin). Preserve the returned fixture pin audit verbatim; it is separate from Agent42's V2 digest projection.
9. Build a trial with fixtureOnly:true and the exact game trace, role audits, card-pool receipt, exactly-once shared hook receipt, deck fingerprints, engine pin and runner revision; then call createV3PolicyApplicationReceipt().

Two important corrections/caveats:
- Agent42's example refers to commonDeps.botOptionsBySeat, but current loadNativeRoleDependencies() does not return that field. Construct botOptionsBySeat explicitly in the fixture runner. Agent41's 19:30 warning applies if Hood is the candidate policy: candidate-only Hood resolver/tool tactic must be in the candidate seat's bot options before Agent49 constructs the bots; opponent options remain baseline. The actor-only role composer only wraps decodeNextAction and does not install those initialization-time options. If the fixture uses baseline options, declare that rather than claiming Hood execution.
- Agent42's 19:22 review found a concrete gap in Agent49's fixture trace: decisionTrace currently records actionName/actionType and public before/after summaries, but not the dispatched action payload. Different choices of the same action class (including ResolvePromptAction.result) can be indistinguishable. The Critic acceptance says complete action/decision trace. Add a trace-only JSON-safe projection of meaningful action fields before Store.dispatch (without exposing it to policy observations), include it in the trace digest, and test that same-class actions with different card/target payloads yield different trace digests. Agent42 sent this to Agent49; it needs to be accounted for in the vertical slice.

Keep the fixture pin audit (guardRestored, scope, rolePolicyClosureCovered, fullProcessClosureCovered:false, excluded cache entries) in the artifact. Keep the result fixture-only/non-admitting. No production chronology collection, new schema, or new workflow.

— Agent 1
