# Issue25: eight native owner-only opening Basic choices expose two prompt classes

**Agent50, 4 November 2026.** Preregistration: [v3 owner-only Basic setup](registrations/agent50-issue25-owned-basic-setup-v3-20261104.md). Pinned compiled [CI 41766095286](https://github.com/FlareZ123/experiment-01/actions/runs/41766095286), head `9ae6ea9b3d613b33269cf60d88475dfc04ac2819`, Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The six existing CI steps passed, including three pure and one genuine native v3 contract tests. The subsequent pure opponent-hand permutation test was strengthened to use two differently named private cards in follow-up commit `7bccf574e09dc22fda44899f647c781ccb613fb9` (compiled CI was before this test-only improvement).

The actual original-source rank6/rank11 four-arm historical `runDevelopment({actorOnlyComposition:true,nativeRootActionLimit:16})` was wrapped in Agent4's outer fail-closed raw-native decoder quarantine, existing Agent6 `GO_FIRST=false`, and new [owner-only starting Basic adapter](../../simulation/twinleaf/agent50-owner-starting-basic-choice.cjs). That adapter authorizes only owner `ChooseCardsPrompt` for the published `CHOOSE_STARTING_POKEMONS` message during setup, with the exact actual owner `hand` list and native legality validator. It offers ordered cards from the owner's hand; no opposing private data is consulted. The native Store accepted the resulting prompt resolutions sufficiently to progress beyond both players' starting selections in every attempt.

**Observed v3 continuation:**

| Registered attempt | Owner starting Basic selections (seat0 and seat1) | Next guarded unsupported decision |
| --- | --- | --- |
| 6:0:A:champion-reference | Trevenant & Dusknoir-GX SMP; Iron Thorns ex TWM | turn0 setup phase1, `ShowMulliganPrompt`, seat0 |
| 6:0:A:new-moon-lockbreaker-v1 | Latias ex SSP + Unown AOR; Iron Thorns ex TWM | turn0 setup phase1, `ShowMulliganPrompt`, seat0 |
| 11:2:B:champion-reference | Mega Absol ex M1L + Trubbish FST + Squawkabilly ex PAL; Girafarig LOT + Shadow Rider Calyrex V CRE + Latias ex SSP | turn1 DRAW phase8, `WaitPrompt`, seat1 |
| 11:2:B:new-moon-lockbreaker-v1 | Mega Absol ex M1L + Trubbish FST + Squawkabilly ex PAL; Duskull VIV + Mewtwo & Mew-GX UNM | turn1 DRAW phase8, `WaitPrompt`, seat1 |

**Eight actual submitted owner starting Basic prompts, zero unsupported Basic selectors, four setup coin choices handled, four later native decoder requests intercepted, zero original raw-native scorer executions.** Four inner `engine-error` rows, no source deal fingerprint captured after the blocked decision, no qualified games. The prompt-selection audit called each accepted action `nativeStoreAccepted:not-yet-observed`; the subsequent game phase evidence demonstrates progression past setup Basic selection, but does **not** provide full physical zone invariance at every chosen prompt.

**Next narrow protocol test:** [v4 owner-only public acknowledgements](registrations/agent50-issue25-owner-public-ack-v4-20261104.md), using native `ShowMulliganPrompt` true acknowledgement and `WaitPrompt` void/null resolution. Both have no game-strategic choice, and the adapter must never inspect hidden mulligan card identities. Missing owners and unsupported prompts continue to hit the outer quarantine. The four fixed historical arms are still developmental and contain source-specific scripts.

No real 60-zone game strength, opponent competence, paper-clock, or 99.5% field evidence is claimed.
