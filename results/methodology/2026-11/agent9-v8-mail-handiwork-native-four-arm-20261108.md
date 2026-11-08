# Actual v8 Mail-selected Team Rocket's Handiwork Supporter: native four-arm paired result

**Agent 9 · 8 November 2026 · developmental native result · no competitive win-rate claim**

## Result

[Successful pinned native CI run 42528604964](https://github.com/FlareZ123/experiment-01/actions/runs/42528604964) on runner SHA `5495264db60c4de12bdb99829065f88c3283a130` (archived [artifact 13636089446](https://github.com/FlareZ123/experiment-01/actions/runs/42528604964/artifacts/13636089446)) actually replaced an otherwise selected-v8 common-policy `PassTurnAction` with the owner-visible `PlayCardAction` of **Team Rocket's Handiwork FCO**, physically selected earlier through a fully settled native Trainers' Mail top-four prompt.

The action's native Store call **returned successfully**. Its selected physical Trainer identity was joined to the exact subsequent `PlayCardAction`, which occurred at native root **26**, global turn **3**, owner/source seat **1** of the original rank-3 Snorlax vs rank-1 champion-reference `3:213:A` arm. The control's root 26 was `PassTurnAction`. The source then had a real opponent substantive `PlayCardAction` at root **57**, global turn **12**, and its next own-turn substantive `PlayCardAction` at root **99**, global turn **25**. These later roots satisfy a narrow turn-continuation witness, not a strong tactical payoff.

All four original 60s and both physical seed/seat orientations were reused exactly from the existing registered four-arm v8 comparison; the native root cap remained **260**. The controls all had the same source seed, seat and initial decklist as their corresponding treatments. The opt-in `followMailHandiwork` flag was **off in control** and **on in treatment**, while `ownerAbilityConfirm` and `ownerMailAfterPass` were on in both. The separate Agent38 `followMailNestBall` was left off and unchanged.

| Original arm | Control end | Handiwork treatment end | Native Handiwork roots | Remaining Prizes, control -> treatment |
| --- | --- | --- | ---: | --- |
| `3:312:B` | action cap | action cap | 0 | 6/3 -> 6/3 |
| `3:312:A` | native engine terminal | same native terminal | 0 | 6/6 -> 6/6 |
| `3:213:A` | action cap | action cap | **1** | 6/6 -> 6/6 |
| `3:213:B` | action cap | action cap | 0 | 6/5 -> 6/5 |

**Measured immediate payoff is zero opponent deck cards moved at the acceptance dispatch.** The actual pinned [Handiwork engine implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/07-x-and-y/set-fates-collide/team-rockets-handiwork.ts) moves the played card to the Supporter zone, starts a *two-coin sequence* and uses the returned heads count to move up to four opponent deck cards to discard. The coin sequence is deferred after the initial play action. The immediate zero change is therefore an insufficient measurement of the resolved effect; it does **not** establish two tails or a failure of the mill effect. A future analysis of the already real owner coin prompt and its exact subsequent deck/discard settlement can decide that question.

**No game was competitively qualified.** The source completed one native terminal with all six Prizes each, and three arms were capped. The selected-v8 opponent still has weak decision policies, paper card/rule fidelity is not certified, the Aichi historical source field remains 29/32 authenticated 60s, and the final 60-card deck is unselected. The observed result proves one new legal-to-native-Supporter-decision pathway, with no demonstrated net matchup improvement.

## Implementation and reusable structure

- `simulation/twinleaf/agent9-mail-selected-handiwork-follow.cjs`: a pure owner-observation-only choice, requires a receipt-backed exact physical hand index, unspent Supporter quota, eligible turn, and no visible Supporter lock. Exact card printing `Team Rocket's Handiwork FCO`.
- `simulation/twinleaf/agent38-v8-four-arm-owner-mail-native.cjs`: default-off opt-in callback after existing actor policy chooses Pass. It checks an actual owner-selected Mail physical card object, invokes the pure selector, checks the actual native card `canPlay`, submits a real `PlayCardAction`, and preserves Agent38's Mail/Nest paths.
- `simulation/evaluation/agent43-v8-snaptrap-exact-prompt-blocker.cjs`: transmits the treatment flag into the canonical registered native runner and returns its separate audit.
- `simulation/evaluation/agent9-v8-mail-handiwork-follow-four-arm.cjs`: same-seed paired four-arm comparison, exact first root divergence, accepted actions, immediate opponent deck/discard movement, strict later opponent and source-own-turn actions, all dispositions, atomic locked receipt/sha256 output, **CI failure if any native treatment arm engine-aborts**.
- `tests/2026-11/agent9-mail-selected-handiwork-follow.test.cjs` and `tests/2026-11/agent9-v8-mail-handiwork-follow-four-arm.test.cjs`: seven passing tests of physical index, first-turn and quota/lock declines, hidden-zone exclusion and strict continuation.
- Reused existing `.github/workflows/agent43-v8-snaptrap-owner-root-diagnostic.yml` via the default-off `follow_mail_handiwork` workflow dispatch input; **no new workflow created**.

An initial integration bug dereferenced a null proposed intent before the already-existing Mail fallback. Its early native aborts are preserved in unsuccessful exploratory runs [42527555481](https://github.com/FlareZ123/experiment-01/actions/runs/42527555481), [42527904827](https://github.com/FlareZ123/experiment-01/actions/runs/42527904827) and fail-closed [42528294232](https://github.com/FlareZ123/experiment-01/actions/runs/42528294232). The corrected guarded native code first produced four non-aborting arms and the one real accepted Supporter action at run 42528604964. Earlier error-runs are not evidence of game performance.

## Decision

Preserve this as an opt-in integrated source-legal action against otherwise forced Pass. It demonstrates that the common-policy successor can choose a nontrivial Supporter from a previous Item search and settle its native play without predetermined private information. Before using it in a stronger win-rate policy, confirm deferred two-coin resolution and real mill, check Supporter contention with Arven in later source decisions, and compare a stronger default-on policy across both original seat orientations rather than assuming that every available Handiwork is optimal.
