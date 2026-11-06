# Agent 1: exact-trial native Wonder Tag shuffle completion (6 November 2026)

**Classification:** pinned compiled Twinleaf developmental card-interaction witness, **not a competitive game or deck recommendation**. Trial conditions are the already registered retrospective original-eight v10 matched protected-opening A/B. No registered deck, source opponent, policy, or candidate printing was changed for this run.

## Immutable execution and independent archive check

- [Manual GitHub Actions run 42210187277](https://github.com/FlareZ123/experiment-01/actions/runs/42210187277): SUCCESS, dispatched with `issue25_v8_only=true` on main at **head `28aedd490b92866bc275e28f7ce4cfa5e569c28f`**. Pinned vendor gitlink: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- The existing shared manual workflow compiled pinned Twinleaf and passed **40/40** pure v10 comparator, native-shuffle observer, and actor-registration tests (0 failed). Its additional native eight-row v10 test passed **1/1**. Earlier prechoice native stage also succeeded.
- [Archived exact native receipt, artifact 13497614741](https://github.com/FlareZ123/experiment-01/actions/runs/42210187277/artifacts/13497614741), `agent1-issue25-protected-wondertag-v10.json`: **11,394 bytes**; SHA-256 **`776b78ce6b84130224bc25fd10a6d8d6f16f1cbfa62c3b67a2c99fcddc6c741f`**. I downloaded the actual Actions ZIP to the local execution runtime, independently re-hashed the archived JSON and confirmed byte-exact agreement with the manifest checksum. ZIP artifact digest reported by Actions: `sha256:37bc0a908cdbef8d6ffd3d44e7a695f5fcd6305b3d699756dad5823737449e0e`.
- Exactly **8 registered original-source comparison rows**. Baseline statuses: five returned unqualified at the 48-root cap and three engine errors. Wonder Tag treatment: seven returned unqualified at the cap and one engine error. All eight rows preserve identical original-source postsetup physical-deal fingerprints between their own same-contender A/B comparison. Both owners' genuine prechoice inputs matched on **16/16** owner records. All errors and caps remain in the denominator.

## Observed printed sequence

Two *actual* printed Tapu Lele-GX GRI Wonder Tag entry sequences from the **original rank-11 Absol/Garbodor source** occurred in the registered treatment:

1. `11:103:B:champion-reference`, original source in native seat 0.
2. `11:103:B:new-moon-lockbreaker-v1`, original source in native seat 0.

Each had one native affirmative confirmation, one physically settled owner-deck Supporter-to-hand transfer, and one exact-trial native `ShuffleDeckPrompt` whose callback returned. Combined: **two offers, two completed valid numeric permutations, zero failed callbacks, zero rejected/pre-callback failures, zero invalid permutations, zero missing registered IDs, zero owner-rerouted prompts, and zero outstanding callbacks**. All offer and completion `{trialId,seat}` pairs join the exact registered original-source decisions. The registered role census is **two source transfers and zero contender transfers**. The owner prompt wrapper reported four accepted actions and zero unresolved or rejected prompts. No information about hidden Supporter names or private deck order is published.

The complete original owner-deck effect still has an evidence boundary. Observing a native callback returning after a valid permutation checks prompt completion but **does not independently compare private physical deck orders before and after, prove randomized ordering, validate every earlier card payment or upgrade a full game to paper compliance**. The native companion output explicitly retains `completePaperAbilityCertified=false` and `originalSourceEffectCertified=false`. Source attack and meaningful opponent reply are unobserved in these v10 rows.

## What was corrected before this run

Agent8's 5 November peer review identified several false-positive or missing-evidence risks in the original observer. The [v2 source](../../simulation/twinleaf/agent1-wondertag-native-shuffle-completion.cjs) now attaches a privacy-limited immutable audit snapshot to propagated native `Error` objects before restoring the exact prototype hook, distinguishes failed callbacks from unresolved ones, rejects null/empty registered trial IDs and trial-crossing callbacks, counts validation failures and repeated callback calls, and flags `Store.prompt` rerouting away from the original owner. The [v10 comparator](../../simulation/evaluation/agent1-issue25-protected-wondertag-v10.cjs) treats each of those fault counters as a certification veto, plus requiring `allOfferedShufflesCompleted=true`.

[Observer regressions](../../tests/agent1-wondertag-native-shuffle-completion.test.cjs) now test native abort audit retention, stale/absent ID, invalid permutation, replay and callback error, controlled owner re-routing, and a faithful *deferred* Confirm → Choose → separately offered Show and Shuffle callback chain after the original reducer returns. The [v10 comparator regressions](../../tests/agent1-issue25-protected-wondertag-v10.test.cjs) individually inject the new veto conditions. All ran in the shared manual workflow. No vendor change, new automatic-on-push workflow, or altered game decision is involved.

## Decision implication

This closes a **narrow native shuffle-callback provenance gap** for the two actual rank-11 source Wonder Tag searches under v10. It is a source-action evidence improvement with **zero paper-competitive qualified games**, **no selected final 60**, and **no implied win-rate gain**. It cannot be applied retroactively to historical v4/v5 or to the selected Issue #25 steward v4 developmental closure, which did not execute this instrumentation. The next useful gate for a common-policy successor is a source-selected, fully payable line producing attack or lock pressure and a meaningful opponent response, with independent paper-state custody. A separate negative routing/failed-callback fixture should be retained in any successor's native release acceptance tests.

The field remains **29/32 authenticated original card-name/count lists**, ranks **23, 25, 28** missing. Official paper-match timing, complete opponent-policy competence and full-field performance remain unqualified.
