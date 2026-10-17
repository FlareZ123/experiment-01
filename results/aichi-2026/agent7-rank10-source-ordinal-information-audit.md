# Rank-10 source-ordinal Copycat decision audit

**Agent 7, 17 October 2026.** A scoped information-boundary and source-replay experiment for one archived rank-10 Regidrago source game. **Zero competitively qualified games**; no inference about the 99.5% target.

## Why the decision fork needs another control

The original [source-dealt Shred counterfactual](../../simulation/twinleaf/rank10-mimikyu-shred-source-fork.cjs), described by [Agent 38](agent38-rank10-second-turn-shred-opportunity.md), replaces a real `RetreatAction` with Mimikyu's `Copycat` using an actual `ChooseAttackPrompt` for discarded Dialga-GX's `Shred`. One source-game branch reversed the pinned engine's recorded winner in [compiled CI 38995971001](https://github.com/FlareZ123/experiment-01/actions/runs/38995971001). The result diagnoses a consequential decision on one physical shuffled deal.

The fork wrapper historically called `SimpleTacticsAi.decodeNextAction` before overriding the proposed retreat. That original selection can explore speculative game states and consume information or mutate transient state; other repository audits observe policy-time Store mutations. A matching archived pre-action zone hash alone does not prove that this preliminary bot call was inert or information-set-clean. A generic bot's choice may depend on its simulator's access to both players' hidden zones. This is an *unresolved possible dependency*, rather than a demonstrated leak in this exact action.

## Controlled alternative

The opt-in `rootActionOrdinal:215` mode in [mimikyu-turn28-shred-fork.cjs](../../simulation/twinleaf/mimikyu-turn28-shred-fork.cjs) counts dispatches on the authentic first-`AddPlayerAction` Store. At root dispatch ordinal 215, it checks the same bounded tactical prerequisites using the visible attacking and defending board, remembered opposing `Apex Dragon` announcement and its own discarded Dialga-GX. With `forceShred:true` it emits `AttackAction('Copycat')` directly, bypassing `decodeNextAction` for that specific decision. Its subsequent `ChooseAttackPrompt` still selects the exact printed `Shred` instance from the original discard. The unchanged control branch must independently show ordinal 215 was the opponent-facing `RetreatAction`.

All other root decisions still use the research bot. The ordinal is a deliberately fixed source-game position; this is a stronger diagnostic for one transcript and does not constitute a general competitive strategy.

The [source comparator](../../simulation/twinleaf/rank10-mimikyu-shred-source-fork.cjs), when run with `COPYCAT_ORDINAL_AUDIT=1`, produces an `ordinalSourceAudit` object comparing the original branch and the direct-ordinal branch: first root-action divergence, action 215 pre-dispatch zone and Card-history digests, existence of a real Shred selection, final winner and Prize counts, and byte equality of complete recorded match summaries against the original proposal-dependent Shred branch. If the source prefix changes unexpectedly, the experiment fails its assertions.

## Post-fork opponent-response audit

The [public response projector](../../simulation/twinleaf/rank10-copycat-response-ledger.cjs) records the following root decisions over the first five turns after the source-ordinal fork: attack announcements, copied attack names, active-Pokémon promotion choices, pass/retreat actions and Prize-count transitions. It deliberately removes hidden Prize identities, prompt source catalogs and any full private deck or hand contents. [Independent pure tests](../../tests/rank10-copycat-response-ledger.test.cjs) verify that a deliberately inserted unrevealed-card identifier is absent from its output. The source comparator exports both `counterfactualNextFiveTurns` and, when selected, `ordinalSourceAudit.nextFiveTurns`. Compiled CI validation for this extension is pending.

The source-ordinal bypass skips one generic bot call. It can therefore also alter the later consumption of policy-specific random numbers, even if the original decision did not modify the root game state. A different eventual winner must be interpreted alongside the immediate source fingerprints and action sequence, rather than attributed to any one kind of hidden-information exposure without additional controls.

## Evidence and limitations

- Fixed source: published rank-10 Regidrago versus rank-1 Shadow Rider, seed `4246551499`, candidate physical slot B, candidate actually first; no deck substitution.
- Pinned upstream Twinleaf revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; experimental rule and clone hooks remain opt-in, with their own validation gaps.
- New pure falsification tests under [tests/mimikyu-turn28-shred-fork.test.cjs](../../tests/mimikyu-turn28-shred-fork.test.cjs) exercise the exact-ordinal decision with a bot that **throws if consulted** and the mismatched-ordinal fallback.
- A separate bounded mock metamorphic test perturbs opaque hidden zone contents and retains the same Copycat/Shred decisions. That is limited to the provided mock source state and snapshot, since a full root-game information-set audit requires much more.
- The earlier pure hidden-zone test and the other source suite passed [compiled manual CI 39004397243](https://github.com/FlareZ123/experiment-01/actions/runs/39004397243), whose source head preceded the new ordinal mode.
- The current-head opt-in complete source comparison was dispatched as [manual CI 39004930338](https://github.com/FlareZ123/experiment-01/actions/runs/39004930338). **Its outcome requires direct verification** before a source equality claim can be made.

Even a successful direct-ordinal comparison leaves source reducer-closure semantics, full paper rules, opponent competence, unsupported card effects, information-set safety of all other bot actions and multiple independent seeds unresolved. **`sourceReplayMechanicsVerified:false`; `qualifiedForCompetitiveInference:false`.**
