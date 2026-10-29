# Original Aichi 60-card K0 owner-root information-set audit

**Agent 18, 29 October 2026.** **Result:** native compiled first-owner-root K0 invariance and observer-on/off limited-outcome parity, in four genuine source roots. **Competitive-qualified games: zero**.

## Question and registration

Can the actor-only owner-root policy preserve the same action choice when a genuinely dealt paper Expanded Aichi 60-card game is briefly contrasted against a different but owner-indistinguishable hidden deck/Prize configuration? Earlier [staged work](agent18-k0-hidden-world-actor-invariance-20261029.md) validated a sixteen-sequence constructed information-set factorial. This study exercises the same boundary at **real source-dealt original 60-card initial turns**, with no permanently altered deck or game-state card identities.

The [pre-execution protocol](../../agents/agent18/20261029-aichi-sourcefirst-k0-authentic-root-protocol.md) fixes the exact source-pair, comparative design and failure criteria. The script is [`simulation/twinleaf/agent18-aichi-source-k0-native-root.cjs`](../../simulation/twinleaf/agent18-aichi-source-k0-native-root.cjs).

## Reproducible inputs and method

- Exact published decklists from `results/aichi-2026/full-decklists.json`: Aichi **rank 1** Shadow Rider champion and **rank 11** Regidrago; resolve original complete 60-card printing IDs through the existing shared manifest resolver, allowing only its explicit same-set Basic Energy fallback and Japanese-promo bridge. No candidate edit.
- Pinned Twinleaf engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; exact seed `4246551499`; two physical orientations, rank 1 as seat A versus rank 11 as B, then swapped; `maxActions:75`; `strictPromptValidation`, `isolatePolicyRandomness`, `postSuperAliasRepairIsolation`, and `supporterDecisionCorrection` explicitly enabled. These development settings are unqualified for competitive inference.
- Run each source orientation twice with the same input. The first run has no new observer. The second wraps actual pinned `Store.dispatch` to identify the real `AddPlayerAction` Store, then wraps actual `SimpleTacticsAi.decodeNextAction`. At the **first actual owner-root** per physical seat in `PLAYER_TURN` with no unresolved prompt, compare frozen `actorObservation` and `chooseActorRootIntent` before/after swapping two physically different cards: the owner's unseen deck top and an unrevealed face-down Prize. Both `CardList` object references are restored in `finally` **before** allowing the original native decoder to proceed. Source bot decisions remain unchanged.
- Require exactly two real owner roots per source orientation, a face-down Prized printing distinct from the deck-top printing, identical owner views and actor-only choices, exact restoration of the two card object identities, and parity of source deck hashes, winner, action count, turn count, end reason, and remaining Prize counts between observer-off and observer-on runs.

## Native outcome

The first attempted [run 40971236159](https://github.com/FlareZ123/experiment-01/actions/runs/40971236159) **failed before the experiment** due to simultaneously requesting two mutually exclusive speculative simulator isolation profiles. The script removed `prototypeSafeSimulatorIsolation`, retaining the single `postSuperAliasRepairIsolation` profile, in commit `399d5a517e7cc5f0b97aa9f954d52bf7f8c3f06c`.

The corrected full compiled manual [**run 40971573018**](https://github.com/FlareZ123/experiment-01/actions/runs/40971573018) **completed successfully**. It included the source-origin test and the existing hidden-order tests. Exactly **four genuine source owner roots** passed the K0 invariance check:

| Source deck orientation | Physical seat / native global turn | Original unseen deck top ↔ face-down Prize | Unchanged actor-only first-root intent |
| --- | --- | --- | --- |
| Rank 1 A, rank 11 B | Seat 1 / turn 1 | Mega Absol ex M1L ↔ Forest Seal Stone SIT | Bench Latias ex SSP |
| Rank 1 A, rank 11 B | Seat 0 / turn 2 | Teammates PRC ↔ Forest Seal Stone SIT | Attach Psychic Energy MEE |
| Rank 11 A, rank 1 B | Seat 1 / turn 1 | Shadow Rider Calyrex V CRE ↔ Forest Seal Stone SIT | Bench Tapu Lele-GX GRI |
| Rank 11 A, rank 1 B | Seat 0 / turn 2 | Battle VIP Pass FST ↔ Forest Seal Stone SIT | Pass; no supported actor-visible root |

Each root's observed source deck count was **46**, with **six face-down Prizes**, and the native observer reported literal restoration of the swapped card objects. Every original and contrast owner observation and proposed actor action matched.

For both original 60-card orientations, the observer-on and observer-off output fields agreed. The native result had **75 actions**, ended from `action-limit`, had **no winner**, and retained **six Prizes on each side**; the measured native turn counts were **6** and **5** respectively. These are deliberately truncated development trajectories, not complete games.

## Interpretation and limitations

This validates that the current **actor-observation-based first-root proposal** remains invariant under these four actual source K0 owner deck/Prize exchanges. It also confirms selected native output parity for short replay prefixes with the passive observer installed. It does **not** establish full native State equality or engine rules fidelity, or that the unmodified SimpleTacticsAi's decisions are information-safe. Prior full-bot tests in the same hidden-order workflow demonstrate hidden-order-sensitive actions for other prompts. This test does not analyze opponent full-hand uncertainty, K1 search histories, longer-game commitments, stronger candidate tactics, completion of the original source matchups, or overall deck win rates.

The contrast is intentionally **temporary**. The actual source games continue with their original physical card positions after each check. The owner-only choices in the table are **policy proposals** and do not certify that those are best available plays or that the full bot executed those exact actions.

The source-origin audit and [staged sixteen-action-sequence control](agent18-k0-hidden-world-actor-invariance-20261029.md) can be reused as complementary future gates for integrated both-seat choice arbitration. Any adaptation must preserve the native Store provenance and exact visibility boundary.

**Aichi objective remains open:** 29 of 32 original exact full 60s recovered; missing ranks 23, 25 and 28; zero competitively qualified games and no credible evidence of a fixed 60 achieving the 99.5% win-rate target.
