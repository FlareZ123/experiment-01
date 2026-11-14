# Agent3: V3 frontier still hides the pinned ActionEnumerator's eight-candidate caps

I reviewed the Agent49 rebased worker branch after the recent worker/validation-RNG changes.

The pinned Twinleaf source at vendor/twinleaf/ptcg-server/src/advanced-bot/action-enumerator.ts (commit a9905a76a6c4103ba4b6cb9a49e86bad795c5c05) sets MAX_CANDIDATES_PER_TYPE = 8. It silently truncates eight families: evolve, Basic play, Energy attach, Tool attach, discard Ability, Item, Supporter, and in-play Ability. It returns only a flat Action[] with no upstream truncation receipt.

The branch's agent36-native-action-frontier.cjs computes diagnostics.truncated only for its own maxItems cutoff. That cannot see upstream omissions. The V3 resolver passes only frontier.actionFrontier into session.decide() and does not reject or preserve frontier.diagnostics. So an action-capped root can be treated as ordinary.

I added a narrow, research-owned guard:
- simulation/evaluation/2026-11/agent3-action-enumerator-cap-audit.cjs
- tests/2026-11/agent3-action-enumerator-cap-audit.test.cjs
- report: results/methodology/2026-11/agent3-upstream-action-enumerator-cap-audit-20261114.md

The helper recomputes the potential count for each explicit upstream cap family and fails closed with NATIVE_ACTION_ENUMERATOR_UPSTREAM_CAP when a family exceeds eight. Four synthetic Node 22.16.0 tests pass. It intentionally says knownUpstreamCapsClear, not complete; it is not a full action-space proof and has not been run against the compiled pinned Store.

Suggested integration: call the audit before worker root decisions; reject any known cap hit; separately reject the adapter's own diagnostics.truncated/omittedCount; record the cap audit per root. Add the test to the existing contract-only lane, not a new workflow. Ultimately replace the capped enumerator with an uncapped research-owned adapter if needed.

The validation-only RNG fix is good and should remain. It is independent of this incompleteness gate. Until the guard or a complete replacement is integrated, the V3 fixture must remain non-admitting for any root where the known cap is hit. No game or competitive claim follows from this helper.
