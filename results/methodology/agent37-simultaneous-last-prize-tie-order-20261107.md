# Agent37: simultaneous final-Prize terminal resolution

**7 November 2026 | Pinned Twinleaf Store | Last pre-v3 native CI run 42372968463: success**

## Finding

The pinned Store's native `choosePrizeCards` routine processes Prize groups in `state.players` order. When the first group exhausts that player's remaining Prizes, it calls `endGame` and returns immediately. The second group's Prize transfer is skipped.

In the controlled two-Active-KO fixture, both players have one Prize remaining. Native behavior therefore awards the first processed player and leaves the other player with one Prize. The result depends on `state.players` order rather than the paper simultaneous terminal outcome.

Pinned source: `vendor/twinleaf/ptcg-server/src/game/store/effect-reducers/check-effect.ts`. The relevant `choosePrizeCards` logic starts around line 212; the early returns occur around lines 219-221 and 228-230.

## Paper rule: Advanced Player's Rulebook §E

Repository source of truth: `resources/manual/EN_advanced_manual-2025-transcription-structured.md`, §D Knock Out steps and §E Win and Loss table (lines 538-585). The table contains 11 explicitly enumerated terminal combinations; the shared pure helper tests all 16 Boolean combinations, including the ordinary single-terminal and ongoing cases.

The simultaneous terminal table distinguishes promotion availability when both players take their final Prize cards:

- Both players can promote: draw.
- Neither player can promote: draw.
- Exactly one player can promote: that player wins.

The earlier tie-only interpretation was incomplete. The adapter now resolves all three outcomes for the supported simultaneous two-Active-KO case.

## Research-owned terminal resolver v3

Implementation: `simulation/twinleaf/agent37-paper-ko-simultaneous-last-prize-tie-v1.cjs`.

Public entry point: `withInstanceScopedSimultaneousLastPrizeResolutionV3`. The `withInstanceScopedSimultaneousLastPrizeResolutionV2` and older `withInstanceScopedSimultaneousLastPrizeTieV1` exports remain compatibility aliases to the corrected v3 implementation.

The adapter arms only when all of these conditions hold:

1. Exactly two players are present.
2. The same checkState batch contains exactly two Active KnockOutEffects, one for each player.
3. No non-Active KO effects occur in the batch.
4. Exactly two Prize groups exist, one per player.
5. Both Prize destinations are their respective players' hands.
6. Each Prize group is sufficient to exhaust that player's remaining Prizes.
7. The game is not in sudden death and the Prize effect is not prevented.

It processes the second Prize group with the research-side `TAKE_SPECIFIC_PRIZES` helper before the native early-return path can finish the game. It then resolves the terminal winner from bench availability:

- Matching promotion availability produces `GameWinner.DRAW`.
- If only one player has a Pokémon available to promote, that player wins, mapped to `PLAYER_1` or `PLAYER_2` using the actual `state.players` order.

The Store's winner log is handled at the same interception boundary as the resolved state winner. Original Store methods are restored after the intercepted EndTurnEffect/checkState transaction. No upstream Twinleaf files are modified.

## Independent review follow-up: native winner-log ordering

Agent41's 13:17 UTC review found that pinned `endGame` emits `LOG_GAME_FINISHED_WINNER` **before** assigning `state.winner`. The previous implementation's audit therefore captured the preterminal `GameWinner.NONE` sentinel. In the mixed-promotion case where only the owner in `state.players[1]` can promote, the final state could be corrected to PLAYER_2 while the already-emitted native log still named the first player (PLAYER_1). The previous audit's `winnerOverridden` value was consequently unreliable.

The follow-up implementation now derives the native early-return winner from the first processed Prize-group player and the current `state.players` order. It records that native enum and player identity, plus the original native terminal log message/name/params. Both native WINNER and DRAW messages are intercepted because the paper table can require either a draw or a winner. The corrected log message/name/params are recorded separately. The post-`checkState` callback requires the native winner log to have been captured before reapplying the paper result to final state.

The native regression now asserts both asymmetric promotion directions on both physical seats. For owner-only promotion, actorSeat 0 retains native PLAYER_1 with no override, while actorSeat 1 records native PLAYER_1 and corrects it to expected PLAYER_2; both emit the owner's correct name. For opponent-only promotion, actorSeat 0 records native PLAYER_1 and corrects it to expected PLAYER_2, while actorSeat 1 retains native PLAYER_1 with no override; both emit the opponent's correct name. Both symmetric states, where both players can promote or neither can promote, assert a DRAW log with no winner name. Code and test commits: `50b86df060b4a34fec53871c636f87d0feff887d`, `30103377cdb416b06611c63c4f71fa6fad55fdfe`, `57842b540eb696ca24f1f012f7965646318216e8`, `ab7ebbfd27674f1ad9cf45c9e538454a303c9cab`, `28456211752281b283fe6ef139c1ab29de557e5a`, `d95668bc42f13c49e894699b897d4cbeed9676c5`, `3d21c90fb6e8893597212b0e47e450d3cc4a1512`, `ecc4affa8b82a55dcf987826930b3b53d905123e`, `a961170d4c1aac7f3308cc703f578b4d73a05f27`, `f3f5ff81187e018a0531c51b4052a77722ca7ef3`, `5f0fb75aacca9a7ae0c6c8e88fa91cc5dd3f8998`, `e2c8288c447f86f5d158f5629635b8ddd3929d24`, and `bccd6f19c9348674c90e85974999b985137e4a6c`.

**Validation status:** the successful pre-v3 CI run above predates this log/audit correction and expanded matrix. Dedicated v3 workflow run 42379603688 completed checkout, Twinleaf compilation, syntax checks, and the full native resolver runner successfully; the runner's own assertions passed and artifact 13577440831 was uploaded. The final workflow assertion step then failed because two aggregate audit flags (neighborStoreIsolationVerified and restorationVerified) were missing from the JSON wrapper. Those flags are now computed from the per-seat v3 audit receipts and asserted in commit ee6a0fa47c4293b5c59fcb212463b8f8d17d2620. The fresh full-workflow rerun 42389470404 succeeded on main head c65b304031e24092afde7c8f3192391072dec933. Its native runner and final aggregate assertions both passed. Earlier run 42379416019 failed before the runner at nested submodule credential traversal; the direct-submodule checkout fix is in place and 42379603688 passed checkout. The unrelated Agent36 one-game run 42378455670 failed later in its v10b owner-information attribution step and did not execute this terminal runner. That failure is not evidence for or against resolver v3. Keep the adapter opt-in and do not claim full native CI validation until the dedicated rerun succeeds.

### Scope and limitations

This is a one-attack EndTurnEffect/checkState adapter, not a whole-match wrapper. A multi-turn runner must apply it around each attack transaction separately.

Promotion availability is currently inferred from whether the player's Bench contains a Pokémon. Effect-based promotion restrictions are not modeled. The adapter also deliberately excludes non-hand Prize destinations, non-Active KOs, additional KO effects, more than two players, sudden death, and other simultaneous loss conditions such as deck-out. These are explicit unsupported cases, not evidence that the native implementation handles them correctly.

## Native regression coverage

Runner: `simulation/twinleaf/agent37-simultaneous-last-prize-tie-native.cjs`.

The regression now covers, on both physical actor seats:

- Both players able to promote: both Prize groups transfer and the outcome is a draw.
- Only the owner able to promote: both Prize groups transfer and the owner wins.
- Only the opponent able to promote: both Prize groups transfer and the opponent wins.
- Neither player able to promote: both Prize groups transfer and the outcome is a draw.
- Pure terminal-table checks for both players able to promote, neither able to promote, first-only promotion, second-only promotion, and reversed player ordering.
- A one-sided last-Prize control: an ordinary single-player Prize win remains a win.
- A non-hand Prize-destination control: the adapter declines to arm and does not perform the second Prize transfer.

The shared fixture helper `simulation/twinleaf/agent37-simultaneous-ko-e21-promotion-native.cjs` accepts optional `enemyHasBench` and `ownerHasBench` parameters; existing callers retain the default of `true`.

The four native promotion-availability families were added after the winner-log correction. They are committed in v3, but the expanded suite has not yet been rerun in CI.

## CI evidence

[Manual native workflow 42372968463](https://github.com/FlareZ123/experiment-01/actions/runs/42372968463) completed successfully for the pre-v3 implementation. Its successful steps include the simultaneous last-Prize tie adapter regression and the public attack-settlement regression suite. This run is later than the earlier 42372045012 success and is the last pre-v3 terminal-workflow run; it still does not validate the winner-log correction or expanded v3 matrix. The v2 regression's green result did not detect the native log/audit defect later identified by Agent41, because the old assertions did not compare the original native log receipt to the paper-correct winner.

Earlier incremental runs also passed:
- [42370344373](https://github.com/FlareZ123/experiment-01/actions/runs/42370344373): initial two-seat tie correction and one-sided Prize control.
- [42370733404](https://github.com/FlareZ123/experiment-01/actions/runs/42370733404): non-hand Prize-destination negative control.
- [42371084916](https://github.com/FlareZ123/experiment-01/actions/runs/42371084916): promotion-availability guard before the full winner resolver was added.
- [42371075778](https://github.com/FlareZ123/experiment-01/actions/runs/42371075778): shared Aichi Dusclops conditional self-KO regression after the fixture helper change.

Two intermediate workflow failures were test-expectation mistakes, not native regressions: the reversed-seat pure test initially expected PLAYER_2 when the winning player was actually `state.players[0]`; a later test also assumed the native winner was always PLAYER_1. Both assertions were corrected to use the actual player ordering and observed native winner. The successful run above contains those corrections.

**Competitive games qualified: 0.** This is a bounded paper-rules fidelity improvement, not evidence of competitive deck strength or a 99.5% win rate.


## v3 native runner result from run 42379603688

The uploaded runner artifact 13577440831 contains a complete native result from pinned Twinleaf commit a9905a76a6c4103ba4b6cb9a49e86bad795c5c05. The native regression process and all of its in-process assertions completed successfully on both physical seats:

- In each both-can-promote case, the native engine chose the first processed player (native PLAYER_1), even though both players exhausted their Prize cards and both could promote. The receipt preserves the original WINNER log message, native player ID/name, and params.
- The v3 hook completed both Prize transfers to hand, suppressed the premature terminal callback, and emitted the paper-rule DRAW outcome with a DRAW log and no winner name for both seats.
- Both asymmetric promotion-availability seats, both opponent-only promotion seats, and both neither-can-promote seats passed their corrected outcome assertions.
- The single-player last-Prize control remained a win. The non-Hand Prize-destination control did not trigger the simultaneous-last-Prize correction.
- Store log/reducer restoration and other-store isolation were true in both primary tie rows.
- The artifact reports competitiveGamesQualified=0.

This is strong native regression evidence for the terminal resolver behavior, not evidence of competitive deck strength or a paper-rule certification. The workflow itself remained red only because its final wrapper assertion expected top-level aggregate fields that were absent from the artifact. Commit ee6a0fa47c4293b5c59fcb212463b8f8d17d2620 now derives and asserts those fields from the per-seat audit receipts. That follow-up is now green: run 42389470404 passed every workflow step, including the aggregate wrapper assertions.


## Final v3 native workflow validation

**Manual workflow run 42389470404 succeeded** on 7 November 2026 at 16:06 UTC, using research head `c65b304031e24092afde7c8f3192391072dec933` and pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Checkout, direct submodule initialization, pinned-revision verification, Twinleaf compilation, syntax checks, the bounded native resolver runner, and the final JSON assertions all passed. The aggregate `neighborStoreIsolationVerified` and `restorationVerified` flags were computed from both per-seat v3 audit receipts and passed the workflow assertions.

The retained artifact is [`agent37-simultaneous-last-prize-v3-native-42389470404`](https://github.com/FlareZ123/experiment-01/actions/runs/42389470404/artifacts/13580668331), ID `13580668331`, 2,003 bytes, SHA-256 `3d8a7291cf36fbd7a3aa878c7ab59382b55ccf75bf014475728f60cff29e386d`. It expires 21 November 2026. This closes the previously missing full-workflow assertion gate. The scope remains the bounded native terminal fixture: it does not certify a complete paper match, official 25-minute clock, deck legality, or competitive strength. `competitiveGamesQualified` remains zero.


## Extended 3-to-1 Prize-group native regression

**Manual native workflow run [42400712562](https://github.com/FlareZ123/experiment-01/actions/runs/42400712562) succeeded** on 7 November 2026 at 18:21 UTC, research head `2a69356c82c02e777eefd6d26a726a7701d05e63`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The workflow compiled the pinned Store, checked adapter/runner syntax, ran the original v3 matrix plus the new fixture, and passed the final JSON assertions.

The new fixture stages Ferroseed NXD against Shadow Rider Calyrex V / VMAX CRE, with 260 damage already on the 320-HP VMAX. Ferroseed's Self Destruct then Knocks Out both Actives in one check-state batch. The native engine's VMAX KnockOutEffect supplies a three-Prize group; the single-Prize Ferroseed supplies a one-Prize group. Initial remaining Prize counts are three for the Ferroseed owner and one for the VMAX owner, so both groups exhaust their respective remaining Prizes simultaneously.

The test covers all four promotion-availability states in both physical player seats (**eight native rows**). Every row asserts:
- exactly two Active KO effects and two Prize groups;
- both Prize transfers complete to hand, with **3 owner Prizes and 1 opponent Prize** taken in that turn;
- both players have zero Prizes remaining and no Prize/promotion/Powerglass prompt remains open;
- the expected §E result (draw when promotion availability matches; the only player able to promote wins otherwise);
- the corrected final winner enum and corresponding WINNER/DRAW log receipt;
- Store method restoration and isolation from a neighboring Store.

Artifact: `agent37-simultaneous-last-prize-v3-native-42400712562`, ID `13585213456`, 2,220 bytes, SHA-256 `49b8650895bfca41b39973f5d7c10d74d76dfdebe8c842e0b1a827d5745fbfd6`, retained through 21 November 2026. The preceding run [42400546464](https://github.com/FlareZ123/experiment-01/actions/runs/42400546464) stopped in the new fixture before any terminal assertion because the card lookup omitted Twinleaf's `CRE` printing suffix; the runner was corrected to use `Shadow Rider Calyrex V CRE` and `Shadow Rider Calyrex VMAX CRE`, then the complete rerun passed.

**Evidence boundary:** this is a staged native Store mechanics regression. The fixture uses Twinleaf's English card definitions and its `Format.EXPANDED` setting; it does not certify Japanese-language printing provenance or Aichi Japanese Extra deck legality. It is not a full paper game, competitive policy test, or deck-strength result. `competitiveGamesQualified` remains zero.

The adapter remains limited to exactly two Active KOs, two Prize groups both sufficient to exhaust the respective remaining Prizes, hand destinations, no non-Active KOs, no additional KO effects, no sudden death, and two players. Mixed §E terminal rows (for example, one player's final Prize together with the other player's inability to promote), simultaneous last-Pokémon outcomes without both Prize groups final, and deck-out remain outside this adapter and require separate tests/resolution work.


## VMAX Prize-count audit and overkill clamping

A second pinned native run, [42401217366](https://github.com/FlareZ123/experiment-01/actions/runs/42401217366), succeeded at 18:27 UTC on research head `a868a19865017d438c39664da5d777e8aff9180a`, with the same Twinleaf pin. It expanded the matrix to **16 rows**: two Prize profiles × two physical seats × four promotion states.

- `exact-3-to-1`: owner starts with three Prizes and opponent with one; the engine records KO Prize counts `[3,1]` and transfers `[3,1]`.
- `overkill-3-to-1`: owner starts with two Prizes and opponent with one; the VMAX KnockOutEffect still records a three-Prize group, while the native Prize transfer correctly clamps the actual transfer to `[2,1]`.

The adapter now exposes `knockoutPrizeCounts` (target printing, native Prize count, active status, owner ID) and `prizeGroupCounts` (group count and destination) in its audit. The runner asserts the VMAX effect contributes exactly three Prizes, Ferroseed contributes one, both groups target hand, and the expected number of actual Prize cards is taken in both profiles. The workflow gates all 16 rows and all these receipts.

Artifact: `agent37-simultaneous-last-prize-v3-native-42401217366`, ID `13585029982`, 2,638 bytes, SHA-256 `30ba436fa007f89631c1e5093648586b8f54302d4cefe5bd666383d4764e7514`. This is still staged native mechanics evidence only; all qualification boundaries above remain unchanged.


## Independent Prize-ledger compatibility cross-check

Agent27 independently confirmed that `auditExtensionLedger` stores actual before/after Prize counts for both seats and does not infer or require the KO Prize-group count to equal the actual transfer delta. Its dedicated Node 22 clock regressions passed **58/58** in [run 42402050726](https://github.com/FlareZ123/experiment-01/actions/runs/42402050726), then **59/59** after exhaustive 49-pair-per-entry-rule coverage in [run 42402221617](https://github.com/FlareZ123/experiment-01/actions/runs/42402221617). Agent27's messages are preserved at `communications/agent37/20261107T1836Z_agent27_multi-prize-ledger-answer.md` and `communications/agent37/20261107T1839Z_agent27_exhaustive_prize-ledger-test.md`.

This independently establishes **ledger-state compatibility** for exact and overkill Prize deltas. It does not validate Twinleaf's KnockOutEffect counts, the native Prize transfer sequence, terminal adjudication, Japanese Extra legality, or a complete competitive game. Keep those evidence layers separate.


## 7 November 2026 19:58 UTC: independent review closure and native first-group log provenance

Agent41's independent review of the 16-row 3-to-1 / overkill v3 extension is accepted. I independently compared the adapter, native runner, shared fixture helper, and manual workflow at successful run [42402760367](https://github.com/FlareZ123/experiment-01/actions/runs/42402760367), head `d3eaba630e7b4a0c3b9705e47ba7fd002b1914ed), against current main before the follow-up. All four Git blob SHAs were identical:

- Adapter: `74631b9fd2f937a31990f5b56797a5c99c32242d`
- Runner: `bcce6b20c4a094b096ff05e57551d0346d7582a5`
- Fixture helper: `f90256c430836b59bef33b9a62747e274eb3cfed`
- Workflow: `4ab36f9eac70346d1d6153e45e471db004fd5648`

Run 42402760367 completed successfully on pinned Twinleaf. Artifact ID `13586112471`, 3,258 bytes, SHA-256 `69fc0a4887821aea36a75f9f5e147b18dc383fd48ba3598d59e889dc4ed45dcb`, expires 21 November 2026. This is the exact-current-source 16-row run requested in the independent review, and supersedes the earlier 42401217366-only chronology above.

### Native log assertion tightened across every row

The prior helper allowed either a native WINNER or DRAW log when the first Prize-group player had no Bench. Agent41 pointed out that the pinned native `choosePrizeCards` path still ends the game with the first processed Prize-group player as winner; Bench availability does not change that original native receipt. This was an under-specified test assertion, not evidence that the corrected paper outcome should follow the native winner.

The runner now requires, for every applicable row, the original native `LOG_GAME_FINISHED_WINNER`, native `GameWinner.PLAYER_1`, the first Prize-group taker's physical player ID and name, and the exact original `{name}` log parameters. Each of the 16 asymmetric Prize rows now retains the original native log message/type/name/params, native winner ID/name, and explicit first Prize-group taker ID/name in its JSON receipt. The workflow's final aggregate assertion independently checks these fields across all 16 rows, including all four promotion-availability states when the first player has no Bench.

Manual workflow [42408536179](https://github.com/FlareZ123/experiment-01/actions/runs/42408536179) succeeded on 7 November 2026 at 19:57 UTC, research head `5e7b2fd205c43451ea4a24d087a2ce6ce28d845a`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Checkout, pinned Store compilation, syntax checks, the native runner, and all final JSON assertions passed. The log ends with `Agent37 v3 native regression passed.` Artifact ID `13588343124`, 3,407 bytes, SHA-256 `8f434998934ff5d482fc7a267107f958f2f49f15766dd91db4e5843a6b4ad5aa`, expires 21 November 2026.

A non-fatal post-job cleanup warning remains: recursive Git cleanup sees `vendor/twinleaf/vendor/pokemon-cards-css` without a URL in the parent `.gitmodules`. All workflow steps, including artifact upload, completed successfully; no vendor or submodule metadata was changed.

This closes the specific original-native-log provenance gap for the 16-row v3 fixture. The adapter remains research-owned and opt-in. The result is bounded native Store mechanics evidence, not a complete paper game, Japanese Extra deck-legality certificate, or competitive qualification. `competitiveGamesQualified` remains zero.


## 7 November 2026 20:09 UTC: mixed terminal rows expose incomplete Prize-group transfers

The existing mixed-terminal diagnostic previously counted only winner mismatches. That hid a larger paper-settlement defect: **12 of 16 rows omit one player's Prize-group transfer**, even where the native winner happens to match the expected §E result.

The relevant paper sequence is Advanced Player's Rulebook §D step 4 (both players take the Prize cards they get from simultaneous KOs), then step 5 (next-turn player promotes first), followed by §E terminal adjudication. The diagnostic uses the two actual KO Prize groups recorded by the native fixture: a three-Prize Shadow Rider Calyrex VMAX group received by player 101 (owner), and a one-Prize Ferroseed group received by player 202 (opponent).

For the two mixed profiles, the expected transfer amounts are derived from those group counts and each player's starting Prize count:

| Profile | Expected owner transfer | Expected opponent transfer | Native incomplete rows |
| --- | ---: | ---: | ---: |
| Owner starts at 1 Prize; opponent at 6 | 1 | 1 | 6/8 |
| Owner starts at 6 Prizes; opponent at 1 | 3 | 1 | 6/8 |
| **Total** | | | **12/16** |

In all six incomplete `owner-final` rows, owner receives 1 but opponent receives 0 instead of 1. In all six incomplete `opponent-final` rows, opponent receives 1 but owner receives 0 instead of 3. The remaining two rows in each profile transfer both groups. The omitted group depends on which player's final-Prize condition is processed first.

Four of the 12 incomplete rows also have a winner mismatch: the final-Prize taker has no Pokémon to promote while the other player can promote, which the §E table resolves as a tie. The other eight incomplete rows retain the expected winner, so winner-only comparison was insufficient to detect the missing Prize transfer.

The runner now derives expected transfers from the captured two Prize groups and starting Prize counts, records expected/actual transfers and missing recipients per row, and preserves the exact 16-row output. The existing manual workflow asserts 12 incomplete rows, split 6/6 across the two profiles, and prints the transfer receipts. It does not silently treat these baseline defects as a successful paper result.

Manual native run [42409458179](https://github.com/FlareZ123/experiment-01/actions/runs/42409458179) succeeded on 7 November 2026 at 20:09 UTC, research head `110342df6ad1451328f7a988552a32444310685e`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. All workflow steps, including the 16-row transfer-completeness assertions, passed. Artifact ID `13588673584`, 3,648 bytes, SHA-256 `cdb730cae8d505dacc18ea3b8ca469ac0923905a7d9da706dbad7d1d6e839435`, expires 21 November 2026.

**Disposition:** this is a newly explicit native baseline defect, not a v4 correction. The v3 adapter still only arms when both Prize groups exhaust both players' remaining Prizes. A separate opt-in mixed-terminal adapter must process both Prize groups exactly once, apply the full §E table, preserve the original native winner/log receipt, and cover both physical seats before any integration is considered. No upstream code was modified; no complete paper game or competitive game is qualified.


## 7 November 2026 20:14 UTC: exhaustive Rulebook §E outcome helper

To make the mixed-terminal paper expectation auditable and reusable for a future adapter, the shared research adapter now exports a pure `resolveRulebookETerminalOutcome` helper. It takes four explicit Boolean conditions: whether each player took all Prizes and whether each player can promote. It resolves all 16 combinations:

- the 11 combinations explicitly enumerated in the Advanced Player's Rulebook §E table;
- ordinary single-Prize win/loss conditions when only one player takes all Prizes and the other has no simultaneous loss condition;
- ordinary no-Pokémon win/loss conditions when neither player takes all Prizes;
- the ongoing case when neither terminal condition is met.

The existing both-final v3 resolver now delegates to this helper, preserving its prior outcome behavior. The mixed-terminal diagnostic also uses the same helper instead of its earlier special-case expression, so the paper outcome matrix and the future adapter share one explicit rule implementation.

New test file: `tests/agent37/rulebook-e-terminal-outcome.test.cjs`. It checks all 16 Boolean states, verifies seat-swap symmetry (wins invert; draws and ongoing remain unchanged), and rejects non-Boolean inputs. All three Node test groups passed in CI.

Manual workflow [42409977942](https://github.com/FlareZ123/experiment-01/actions/runs/42409977942) succeeded on 7 November 2026 at 20:14 UTC, research head `6a83aedbb9b1860341b0adcb5bd78b724327eb89`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The pure rule tests, adapter/runner syntax checks, native v3 regression, mixed-transfer assertions, and artifact upload all passed. Artifact ID `13589620469`, 3,648 bytes, SHA-256 `eaf965ba97e6835e584ece210275d16d9ff1aef6f30053df48091a50620b321a`, expires 21 November 2026.

This helper is an adjudication model, not a mixed-terminal settlement fix. The native baseline still omits one Prize group in 12/16 mixed rows. A separate adapter must complete both transfers exactly once and then use this rule helper to choose the terminal result.


## 7 November 2026 20:44 UTC: opt-in mixed-terminal v4 passes all 16 rows

A separate v4 adapter now closes the controlled mixed-final-Prize gap without changing the v3 adapter's narrower contract:

- Adapter: `simulation/twinleaf/agent37/agent37-simultaneous-terminal-v4-adapter.cjs`
- Runner: `simulation/twinleaf/agent37/agent37-simultaneous-terminal-v4-native.cjs`
- Shared pure outcome resolver: `resolveRulebookETerminalOutcome` in `simulation/twinleaf/agent37-paper-ko-simultaneous-last-prize-tie-v1.cjs`

The key sequencing rule is order-sensitive. If the first native Prize group is already terminal, v4 manually transfers the other group before the terminal callback. If the first group is nonterminal, v4 leaves the second native `DrawPrizesEffect` in place and uses its completion to end the game. The audit distinguishes the two paths, verifies both groups' actual `prizesTakenThisTurn` deltas against the recorded KO groups, captures the original native terminal player and winner log, then applies the §E outcome to the fully settled state. The v4 wrapper is per-Store, opt-in, and restores the original Store methods.

The v4 fixture is identical to the v3 mixed baseline: Shadow Rider Calyrex VMAX (three Prize cards) plus Ferroseed (one Prize card), with both physical seats, both one-final-Prize profiles, and all four promotion-availability combinations. Run [42412363070](https://github.com/FlareZ123/experiment-01/actions/runs/42412363070) succeeded on 7 November 2026 at 20:44 UTC, research head `a1e1bc09cab20fdb79861230c5d09ff72f80f009`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

V4 result summary:

| Measure | Result |
| --- | ---: |
| Mixed terminal rows | 16 |
| Both Prize groups transferred exactly once | 16/16 |
| §E draws | 4 |
| Owner wins | 6 |
| Opponent wins | 6 |
| Original native winner logs captured | 16/16 |
| Native winner corrections | 4 |
| Store method restoration | 16/16 |
| Competitive games qualified | 0 |

The workflow cross-checks each v4 row's expected and actual Prize transfers against the v3 native baseline's recorded Prize-group expectations. Artifact ID `13589789207`, 5,115 bytes, SHA-256 `27cffecf707f0961e09948ed178632bea77384488f6c326210d5b353196e6bab`, expires 21 November 2026. The same manual workflow still runs the v3 both-final regression, the 12/16 mixed native baseline diagnostic, the exhaustive §E tests, and the v4 mixed-terminal regression.

**Disposition:** v4 resolves the 16 controlled mixed-terminal cases that v3 intentionally leaves unsupported. This is still a narrow staged native mechanics fixture, not a complete paper game, Japanese Extra legality proof, shared-policy integration, or competitive qualification. Keep v4 default-off until broader sequencing, interruption, replacement-destination, prevention, non-Active KO, simultaneous no-Pokémon, deck-out, and full multi-turn acceptance tests are established.


## 7 November 2026 20:53 UTC: v4 expanded to mixed and both-final cases, both sequencing paths observed

The v4 runner now includes eight additional both-final cases (owner starts with 3 Prizes, opponent with 1), alongside the 16 mixed cases. This validates the same adapter's compatibility with the v3 both-final scope while retaining the mixed-terminal expansion.

Run [42413075016](https://github.com/FlareZ123/experiment-01/actions/runs/42413075016) succeeded on 7 November 2026 at 20:53 UTC, research head `2826462cfd41bf56169a9a7eb2b80d794d49ce6b`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

| Measure | Result |
| --- | ---: |
| Total v4 rows | 24 |
| Mixed rows | 16 |
| Both-final rows | 8 |
| Both Prize groups transferred exactly once | 24/24 |
| §E draws | 8 |
| Owner wins | 8 |
| Opponent wins | 8 |
| Original native winner logs captured | 24/24 |
| Native winner corrections | 10 |
| Store method restoration | 24/24 |
| First-group-terminal manual transfers | 20 |
| Second-group-native transfers | 4 |
| Competitive games qualified | 0 |

Both second-group sequencing paths are therefore exercised: v4 manually transfers the second group in 20 rows where the first processed group is already terminal; in four rows it leaves the second native Prize effect to process and terminate the game. All 24 rows preserve exact Prize deltas and the expected §E result.

The workflow now asserts the 24-row summary, the 16 mixed rows against the v3 baseline, and the eight both-final rows with the [3,1] expected Prize transfers. Artifact ID `13590536576`, 5,271 bytes, SHA-256 `01baec92a972f95242e0e8143d30f32dd78468f6ee3d592db688711cf1a5b63e`, expires 21 November 2026.

**Disposition:** the v4 result now covers 24 staged native terminal transactions across both mixed and both-final profiles. It remains a narrow fixture, default-off, and unintegrated. It does not establish complete paper-game fidelity or competitive strength.


## V4 scope clarification: deterministic selection for a nonterminal Prize group

The manual second-group transfer in v4 selects the first available Prize cards with `otherPlayer.prizes.filter(...).slice(...)`, then calls the pinned `TAKE_SPECIFIC_PRIZES` helper with `skipReduce:false`. This preserves the native `CheckPrizesDestinationEffect` and `DrawPrizesEffect` processing, including destination overrides and prevention. The adapter verifies that the expected number of cards actually reaches the player's hand.

When this manually transferred second group is nonterminal, the paper game would ordinarily ask that player to choose which Prize cards to take. The controlled fixture instead uses the first available Prize cards as a deterministic legal selection. The game ends in the same terminal transaction, so no subsequent turn or decision can depend on the selected cards. This does not invalidate the bounded transfer-count and §E outcome assertions, but it means v4 does not validate strategic Prize selection or the exact final hand composition. Any future shared-policy integration must delegate this choice to the owner policy or retain the native ChoosePrizePrompt. V4 remains default-off and is not a competitive Prize-selection policy.
