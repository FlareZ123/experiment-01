# V5 owner-driven Prize selection before a simultaneous terminal outcome

**Agent 37 | 9 November 2026 | Paper-mechanics research, opt-in/default-off.**

## Concrete defect addressed

The v4 simultaneous-terminal adapter fixes a native premature winner only when it can settle both Prize transfers without making an unauthorized player choice. In a two-Active-KO attack, the first recipient can take their last Prize while the other recipient is due a non-exhausting Prize group. Pinned Twinleaf `choosePrizeCards` immediately processes the first last-Prize group and ends the game before opening a second recipient's `ChoosePrizePrompt`. V4 now fails closed for heterogeneous outstanding Prizes, but this prevents completing otherwise playable games.

The new **separate v5 adapter** at
`simulation/twinleaf/agent37/agent37-simultaneous-terminal-v5-owner-choice-adapter.cjs`
builds on the strict v4 two-Active-KO/two-hand-destination boundary and adds the missing **actual owner `ChoosePrizePrompt`** for this case. It does not replace the unchanged v4 source, the selected-v8 common policy, or the pinned upstream engine.

At the original first recipient's `DrawPrizesEffect`, v5 stages the owner prompt. It intercepts the premature native winner log and defers publication. The native terminal-phase callback clears the provisional winner and leaves the game in an attack-phase state with an unresolved prompt. The actual Prize recipient then resolves `ChoosePrizePrompt` using the pinned Store's `ResolvePromptAction` path. The prompt callback dispatches `TAKE_SPECIFIC_PRIZES` on the selected **physical Prize card lists**, asserts their exact original card objects arrived in that player's hand, verifies both recipients' full Prize transfer counts, applies the supplied Rulebook v3.4 §E terminal matrix, and publishes exactly one corrected terminal log and final state. The Store wrapper restores its original methods after settlement. A final guard rejects executions that return with an unresolved owner prompt.

This is a targeted correction to **native terminal outcome ordering and Prize-owner agency**. No scripted decision is inserted into the adapter's native owner prompt. The external caller chooses among the real face-down Prize card lists and the native prompt validates the selection.

## Native both-seat experiment

Fixture: native Ferroseed NXD `Self Destruct` simultaneously KOs the attacker and a 3-Prize Shadow Rider Calyrex VMAX CRE; one recipient has one final Prize remaining and the other has six distinct Prize *positions*, with one physical `Metal Energy MEE` card and five Psychic Energy cards. The synthetic state includes physical evolution, Energy and Bench cards. Both sides of the Prize allocation are exercised through reversal of `state.players` ordering:

- **Owner actor seat 0:** original first group reaches its last Prize; the opposing recipient chooses one of six Prize cards.
- **Owner actor seat 1:** original first group reaches its last Prize; the attacking recipient chooses three of six Prize cards.

For each seat, the native `ChoosePrizePrompt` is resolved twice on independent identical staged deals, once selecting only Psychic Energy and once deliberately selecting the Metal Energy. In each arm the native terminal winner, remaining Prize counts and total taken cards are identical; the physical card actually selected differs. This demonstrates that the other recipient's *choice* is executed by the engine, including cases where the selected card is not the earliest Prize position.

The underlying physical fixture runner `simulation/twinleaf/agent37-simultaneous-ko-e21-promotion-native.cjs` gained a narrowly optional, fixture-only `choosePrize` callback. Its default native Prize selection is unchanged. The v5 regression is
`simulation/twinleaf/agent37/agent37-simultaneous-terminal-v5-owner-choice-native.cjs`; it is incorporated into the same **manual-only** workflow as v3/v4.

### Evidence and validation

- Initial full pinned native run [42555652550](https://github.com/FlareZ123/experiment-01/actions/runs/42555652550) **SUCCESS** 9 November ~03:20 UTC, including all prior v3/v4 regressions and four v5 physical owner-choice scenarios. Artifact [13647600709](https://github.com/FlareZ123/experiment-01/actions/runs/42555652550/artifacts/13647600709).
- The v5 code and regression were then strengthened to assert **exact object identity** of every chosen Prize in the recipient's hand; the native prompt must be exposed with `GameWinner.NONE`, while the game remains outside `GamePhase.FINISHED`; no terminal log may be visible before the choice, and exactly one must be published afterward.
- Strengthened manually dispatched regression [42555976012](https://github.com/FlareZ123/experiment-01/actions/runs/42555976012) **SUCCESS**, ~03:24 UTC. It established these exact object, preterminal ownership, and single native terminal-log requirements in all four mixed-Prize owner-choice arms.
- Engine pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. V5 remains research-owned, opt-in and deliberately disconnected from the common bilateral playing policy.

## Hidden-information-safe prompt activation

The first v5 draft activated this prompt only when the nonterminal
recipient's remaining Prize cards had distinct printed names. That
implementation itself would reveal concealed Prize composition through
whether a prompt appears. It was corrected: **whenever the first
recipient exhausts their Prizes, the other recipient's group has not
already been processed, and that other Prize group does not exhaust
their pool, v5 always prompts the actual owner**, regardless of
the face-down Prize identities. Neither prompt construction nor the
fixture's positional selection requires inspecting concealed printings.

The native test now includes a homogeneous six-Psychic-Energy
recipient Prize pool alongside the heterogeneous Metal/Psychic pool.
Both must expose exactly one owner prompt and defer the result.
For the heterogeneous pool, each owner can select either the
known *position* of the alternate Prize or an initial-position set;
the position is preassigned by the fixture and the selection policy
does not peek at card content. The resulting actual card printing
is checked retrospectively after the native Store transfers it.
This adds one homogeneous prompt scenario per physical actor seat.

The corrected hidden-information-independent native cohort
[42556275942](https://github.com/FlareZ123/experiment-01/actions/runs/42556275942)
**passed** 9 November 2026, including six owner-driven prompt scenarios across
the two seats. That version offers exactly one native owner prompt regardless
of whether all six Prize printings are identical, and still verifies
the retrospective physical selection difference.

The expanded [run 42556501447](https://github.com/FlareZ123/experiment-01/actions/runs/42556501447)
**SUCCEEDED**, 9 November 2026 ~03:29 UTC, with **eight v5 cases**:
the six owner-prompt selection/pool combinations plus two
Rulebook §E **promotion-asymmetric draws**. In the latter, the first player
to exhaust Prizes cannot promote an Active, while the other recipient can.
Both native cases resolve the other player's genuine Prize prompt and
**correct the premature winner to DRAW**, with one final draw log.
The unchanged v3/v4 native regressions in the same job also passed.
Machine-readable output is retained in [artifact 13647413426](https://github.com/FlareZ123/experiment-01/actions/runs/42556501447/artifacts/13647413426),
SHA-256 `e31eeca6c101b5baa1f7371ea7d02d24a32c19ee0faf2592282a8dea18c4f71e`.

## Native second-group-first-terminal ordering

A distinct pinned `choosePrizeCards` failure occurs when the first
`state.players[0]` recipient's group is **non-exhausting** and the
second `state.players[1]` recipient's group is their final Prize.
The engine constructs the first recipient's normal
`ChoosePrizePrompt` in a local array, then encounters the second
recipient's terminal group, immediately calls `endGame`, and returns
an empty prompt list, silently discarding the first recipient's
pending choice.

The same v5 deferred-prompt implementation is intended to restore
this owner decision. Two new native fixtures reverse the earlier
first-group-terminal setup. For both physical actor-seat orientations,
the non-exhausting first recipient chooses an actual physical Metal
Energy Prize from a six-Prize pool after the second recipient's early
native game end is intercepted. The required result includes one
prompt, that exact physical Metal card transferred to the chooser's
hand, the original final winner, and precisely one terminal log.

The dedicated [native run 42557016589](https://github.com/FlareZ123/experiment-01/actions/runs/42557016589)
**SUCCEEDED** 9 November 2026, including the **10/10 v5 cases**
(two additional second-final-group owner-choice recoveries) and
the unchanged passing v3/v4 suites.
Archived full JSON: [artifact 13647603395](https://github.com/FlareZ123/experiment-01/actions/runs/42557016589/artifacts/13647603395),
SHA-256 `47f055504c2d0a1c0df88fbfdc76c6068f8b0ccbe12f863c11efe328318fcd56`.
Both second-group-terminal orientations resolved the previously dropped
nonterminal first-group Prize choice with exact physical selected-card custody
and exactly one terminal log.

## Exact Prize-zone membership beyond native prompt validation

The pinned `ChoosePrizePrompt.validate` checks that the result has
the correct number of nonempty `CardList` references, with no
duplicates. It does **not** require those references to belong to
the chooser's actual physical Prize zone. An arbitrarily constructed
nonempty `CardList` from the player's deck can therefore pass the
native prompt validator's visible checks while being an invalid Prize.

V5 now asserts that **every selected `CardList` is physically present
in `otherPlayer.prizes`** before allowing any native
`TAKE_SPECIFIC_PRIZES` effect. This is separate from the existing
post-transfer exact-object hand-custody assertion. The new negative
fixture returns one deliberately forged, nonempty CardList plus valid
Prize lists, confirms that the native `ChoosePrizePrompt.validate`
accepts that malformed response, and requires v5 to reject it before
Prize effects. Both physical seat orientations are exercised.

The expanded manual native run
[42557798190](https://github.com/FlareZ123/experiment-01/actions/runs/42557798190)
was dispatched with the original ten successful v5 cases and the two
new ownership rejects. Its result remained pending at first writing.

## Unsolved limits

The current staged transaction is not a naturally played 60-card match and is not a competitive paper game. Two Active Knock Outs, exactly two positive Prize groups, ordinary hand destinations, and simple Bench-based promotion eligibility remain required. The exact card objects in the staged Prize pool are known to the test controller; this test is deliberately a native mechanical fixture, not a player information-policy certificate. When deployed in an autonomous game, the `ChoosePrizePrompt` decision must be restricted to owner-visible information and the recorded selected Prize positions must be audited for information leakage. Other effects on Prize destinations, midprompt rule changes, heterogeneous Prize-triggered Abilities, multiple KO events, clock transitions, and discarded or redirected Prize cards require separate tests.

The adapter's provisional `GamePhase.ATTACK` re-entry during the owner prompt is a research-side compatibility mechanism with the pinned native Store, and needs further integration testing before any default activation. Do not count the synthetic terminal outcomes as qualified match wins.

**Decision:** v5 provides a concrete missing owner-choice execution path. Preserve v4 as the conservative fallback until an independently reviewed, owner-safe, two-player release integrates v5 without introducing new temporal or information leaks.
