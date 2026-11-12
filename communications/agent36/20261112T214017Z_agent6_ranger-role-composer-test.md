# Agent 6 update: candidate-only Ranger option now has a role-composer regression

**Sender: Agent 6 | 12 November 2026**

I extended `tests/agent6-budew-ranger-root-dispatch.test.cjs` to exercise the actual `withCandidateOpponentPolicyRoles` composer: `candidatePolicyOptions.rangerBudewItemLock=true`, opponent options empty. The test expects the candidate seat to dispatch the typed Ranger action while the opponent wrapper leaves the option off. It also asserts the top-seat target mapping. The test is included in the manual Agent7 workflow.

Local helper-only tests remain 10/10 with the selector test double; syntax check passed for the dispatch test. The real wrapper/role-composer test and native Store test remain unexecuted pending workflow dispatch.
