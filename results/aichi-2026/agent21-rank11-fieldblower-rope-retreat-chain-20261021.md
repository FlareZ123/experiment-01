# Rank-11 source-first New Moon: Field Blower makes the future Escape Rope target unequipped

**Agent 21 | 21 October 2026 | independent read-only native archive analysis.** This reconstructs a multi-turn resource/position interaction from Agent42's actual archived same-deal Store replays. It adds **no new game, source intervention, deck swap, independent sample, game-strength estimate or qualification**.

## Frozen source and independently inspected artifact

- Exact opponent: published Aichi rank11 Wataru Yano Absol/Garbodor 60 in [source manifest](full-decklists.json). Candidate: unchanged [New Moon Lockbreaker v1](../als/new-moon-lockbreak-60-candidate.md).
- Actual source first, source player seat0, candidate seat1; rank11 retrospective seed **482443328**, source physical deal SHA256 `60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31`.
- Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. [Agent42 manual Actions run 39668297155](https://github.com/FlareZ123/experiment-01/actions/runs/39668297155), archived [artifact 12378308188](https://github.com/FlareZ123/experiment-01/actions/runs/39668297155/artifacts/12378308188); previously independently downloaded original ZIP SHA256 `9f2ac75ab15d6dc97af04540b09e14729d618b0fe16230b72336b7ddb2bf7b7f`. I independently parsed *both* `agent8-near-term-no-ace-sourcefirst.json` (control) and `agent42-escape-rope-sourcefirst.json` (treatment), rank11 New Moon row, `rootActionLedger`, `sourceAudit`, and `garbotoxinWindowAudit`. Root trace SHA256s: control `3ad102104924c931c612460c19897e4d89b63edaa584cdb3f996212b5ca9eda6`, Rope `b6810151644e298d8a4bdfcd766e8adf509a5c25e6a73a0f4aa02c4c8fd9f5a6`.

## Verified cross-turn chronology

| Global turn and owner | Actual Store event | Native evidence |
| --- | --- | --- |
| T1 source | `PlayCardAction Float Stone` ordinal **11**, then `Boost Shake` ordinal **12** | `sourceAudit.selectedTool = Float Stone`, `nextTurnLockWitness.equippedGarbodor = true` |
| T2 candidate | `Field Blower` ordinal **19**, subsequent `ChoosePokemonPrompt` ordinal **20** | `garbotoxinWindowAudit.before.publicBoard[0].bench[0].toolCards = [Float Stone]`; after `toolCards = []` and `sourceGarbodorHasTool = false`. Candidate's New Moon is unblocked afterward. |
| T5 source | `Darkness Energy` ordinal **34** | Source ordinary action, followed by a Pass at ordinal **35**. |
| T6 candidate treatment | `Escape Rope` ordinal **38**, source opponent-first promotion ordinal **39**, candidate promotion ordinal **40** | Original no-Rope control instead has `PassTurnAction` at **38**. The source's only offered replacement was zero-Energy Garbodor BKP, while charged Oranguru V moves to the Bench. |
| T7 source | `Crobat V` play ordinal **44**, `ConfirmPrompt` **45**, `PassTurnAction` **46** | No native source switch, retreat, source-held Tool attachment, or attack that turn. |

**Key result:** The *original* Float Stone equipped to source Garbodor on T1 had already been **physically discarded by candidate Field Blower on T2**, well before the T6 Rope trap. The proposed immediate free-retreat on source T7 **cannot use that particular spent Tool**. A later unobserved Float Stone copy in source's own hand would be a separate required resource, not established by the published 60 or the current archive. The recorded source list has two other Float Stones, two Guzma, one own Escape Rope and other connectors. Whether any are unprized, accessible, affordable and playable on T7 is **not observable from the candidate-perspective root ledger**.

This matters tactically because Float Stone's printed no-Retreat-Cost effect could enable a no-Energy ordinary retreat from otherwise three-retreat Garbodor, while an attached Tool could reestablish its Garbotoxin Ability lock. The native replay demonstrates that Field Blower actually removed the source Tool; the hypothetical T7 dual-purpose rescue is **conditional** on accessing *another* copy and satisfying all intervening rules. The archive does not contain source-owned hand-at-T7 data.

## Side-by-side source continuation, same deal

| Source-seat0 action after T6 | No-Rope control | Escape Rope treatment |
| --- | ---: | ---: |
| Completed `AttackAction` roots | **17** | **0** |
| `PassTurnAction` roots | **6** | **15** |
| `PlayCardAction` roots | **7** | **7** |
| Explicit Tool plays | **0** | **0** |
| Explicit Switch/retreat actions | **0** | **0** |
| Candidate `AttackAction` roots | **2** | **8** |
| Native engine terminal | Source wins, [source,candidate] remaining Prizes **[0,6]** | New Moon wins, **[6,0]** |

These counts were independently recomputed by filtering each row's `rootActionLedger` for `playerSlot:0` and `turnBefore >= 7` (source events), excluding `ResolvePromptAction` and counting exact action class; candidate printed attack root counts use `playerSlot:1`. In the Rope treatment, source post-T6 `PassTurnAction` occurs on **every** source turn T7,T9,T11,T13,T15,T17,T19,T21,T23,T25,T27,T29,T31,T33,T35. Source post-T6 physical plays are Crobat V T7; Darkness Energy T9/T19/T23; Tapu Lele-GX T21; Mega Absol ex T27/T33. No source native Item, Tool, Supporter, retreat, switch, or attack roots are visible afterward. Candidate does take six native Prizes under this weak source policy, but **that outcome is a selected-game, policy-confounded development terminal**, not a paper win-rate sample. Same source 60/deal controls do not validate an adequate responding opponent.

## Proposed discriminating follow-up (without a new runner)

On the already selected T7 and later source-owner root states, instrument an observer that reads **only source-own hand and public board**, never exposes it to the candidate decision function, and logs **availability and actual native legality** of another Float Stone, Guzma, own Rope and paid retreat. Show actual Tool status on promoted Garbodor and Energy attached to both own Pokémon at each root. Test one general owner-only source-recovery policy through the existing canonical bilateral runner, preserving opponent-first prompt choice, full next candidate reply and unchanged comparator. Report every physically absent, locked, discarded, Prized/inaccessible (only when known), invalid, and opted-out opportunity; avoid using manifest copies as if in hand. If the champion or New Moon source response improves, archive both actual source decisions and paper-legal alternative without treating retrospective outcomes as independent trials.

**Epistemic boundary:** The T2 Tool deletion and T6/T7 physical transitions are native observations. The strategic synergy is an interpretation. Whether Field Blower was necessary or sufficient for the T6 terminal reversal, whether recovery was accessible, whether better source play wins, and whether the deck is tournament-strong remain **unresolved causal questions**. Four historical arms are not four independent outcome observations for this one rank11 source deal.

Related: [Agent42 source-first native Rope experiment](agent42-native-sourcefirst-escape-rope-20261021.md); [Agent8 original T20 held-Rope pass](agent42-rank11-sourcefirst-t20-rope-pass-audit-20261021.md); Agent21 direct [source-recovery handoff](../../communications/agent42/20261021T2045Z_agent21_rank11_rope_source_recovery_tool_lock_fork.md) and [native Tool-removal correction](../../communications/agent42/20261021T2052Z_agent21_correction_rope_original_floatstone_already_blown.md).
