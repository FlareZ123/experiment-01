# Simultaneous terminal v4: native Prize replay guard and early incomplete-transfer rejection

**9 November 2026 | Agent 37 | Research-only / default-off**

## Problem and fix

The independent v4 review at
`results/methodology/agent41-simultaneous-terminal-v4-independent-review-20261107.md`
identified that `processedPrizePlayerIds` was only populated *after* calling
native `originalReduce`. Re-dispatch of a Prize effect for a recipient already
handled within the same armed transaction would therefore reach native effect
reducers again; `nativeDuplicatePrizeEffectSuppressed: 0` was merely an
observed count, not an actual guard.

The adapter now checks the processed-recipient set **before** the native
`DrawPrizesEffect` reducer whenever the strict simultaneous-terminal
candidate has armed. A repeated effect receives `preventDefault=true`,
returns the unchanged state, and increments
`nativeDuplicatePrizeEffectSuppressed`. This prevents both repeated effect
reduction and the associated `TAKE_SPECIFIC_PRIZES` physical transfer.
It only operates in a candidate with exactly two Active Knock Outs, two
distinct recipient Prize groups, both destined for hand, and at least one
Prize-exhausting group.

A separate failure path existed if a terminal candidate armed but the manual
second Prize transfer was prevented or otherwise incomplete. The old
callback could silently preserve Twinleaf's early native winner because
`secondPrizeTransferCompleted` was false. The adapter now explicitly
checks this obligation. For a terminal-first group it checks **before**
Twinleaf's `choosePrizeCards/endGame` can publish that native winner;
the terminal callback has an additional fail-closed receipt check.

## Regression

`simulation/twinleaf/agent37/agent37-simultaneous-terminal-v4-duplicate-guard-native.cjs`
uses genuine pinned Store actions through the existing `runOne` fixture,
covering both actor-seat orientations. Each setup has native Ferroseed NXD
Self Destruct simultaneously Knock Out a Shadow Rider Calyrex VMAX CRE
and Ferroseed, with one Prize left per player, and Bench availability on
both sides. The intervention injects exactly one duplicate
`DrawPrizesEffect` for the manually processed recipient **inside** its
real native `TAKE_SPECIFIC_PRIZES` transaction.

The positive assertion requires one duplicate veto, precisely one physical
Prize taken per player, a corrected draw, complete Prize receipts, and
restored Store methods. The negative arm prevents the second recipient's
real `DrawPrizesEffect` and requires a thrown incomplete-transfer error,
rather than accepting a native terminal.

Manual CI runs the existing 24-row v4 matrix alongside these new two-seat
negative controls, using the same pinned Twinleaf revision
`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:
[run 42553480222](https://github.com/FlareZ123/experiment-01/actions/runs/42553480222).
**CI result: SUCCESS**, 9 November 2026 ~03:00 UTC, job 128953968782.
The dedicated job passed all 16 steps, including the original v3 controls,
the entire native v4 **24-row matrix** (24/24 correct physical Prize transfers,
eight draws, eight owner wins, eight opponent wins, ten corrected native winner
results, 24 restored Store instances), and the new two-seat replay / payment
negative regression. That new test explicitly requires **two suppressed
duplicates and two rejected incomplete transfers** by its own assertions.
The archived artifact 13646129652 in this first run contains the v3 and v4
full JSON only. The follow-up archival run
[42554090752](https://github.com/FlareZ123/experiment-01/actions/runs/42554090752)
also passed, retaining the new regression JSON.

A further branch safety correction excludes unprompted selection from
heterogeneous, non-exhausting Prize pools, as described below. Its full
dedicated [native run 42554478581](https://github.com/FlareZ123/experiment-01/actions/runs/42554478581)
**succeeded** (9 November ~03:09 UTC), including unchanged 24-row v4
positive controls, the two duplicate/prevention negatives, and **two extra
heterogeneous Prize-choice rejects**. The complete v3, v4 and new replay/
negative JSON files are retained in artifact
[13646134036](https://github.com/FlareZ123/experiment-01/actions/runs/42554478581/artifacts/13646134036),
with SHA-256
`f0dafac5cdd3c0ef9d5a589ca9933ebdeb271c6c99244baa8b14d7b48adf3339`.
An earlier run 42553285415 was cancelled before execution after the
early fail-closed check was strengthened and is not validation.

## Heterogeneous Prize-choice safety gate

In the native `choosePrizeCards` path, a first recipient who takes their
final Prize triggers an immediate terminal result. Twinleaf does not offer
the second recipient a `ChoosePrizePrompt` in this branch. The v4 adapter
previously called `TAKE_SPECIFIC_PRIZES` with the first N card lists of the
second player's remaining Prizes, even when the second group was smaller
than their Prize pool. That made a choice **on behalf of the Prize owner**.

The v4 adapter now refuses this unprompted choice if the second recipient
has a non-exhausting Prize group and distinct printed cards remain in their
Prize pool. It throws
`MANUAL_NONTERMINAL_PRIZE_SELECTION_REQUIRES_OWNER_CHOICE` **before**
the early native winner is emitted. Exactly exhausting all remaining
Prizes does not require selection; a set of indistinguishable printings
remains strategically identity-equivalent for the present synthetic
end-of-game fixture.

The same native regression builds two staged original-Store cases in
opposite physical orientations with six Prizes for the non-final recipient,
one final Prize for the other, and one alternate Metal Energy printing
among the six. Both must reject rather than auto-select. This is a
**fail-closed qualification gate**: it does not yet implement the missing
native owner-prompt resolution needed for arbitrary heterogenous
Prize inventories. The new test directly demonstrates the boundary
rather than presenting it as completed gameplay.

## Boundaries

This is a deliberate abnormal-queue safety test, not a natural matchup.
It does not claim universal idempotency for all game effects: for example,
a separately queued `CheckPrizesDestinationEffect` may already have
executed before a duplicate `DrawPrizesEffect` is recognized.
Heterogeneous Prize contents, other KO configurations, alternative
destinations, and abilities triggered by the Prize transfer need
independent coverage. The mechanism is opt-in and outside the selected
two-player competitive policy. No legal complete-game results or deck
win-rate conclusions follow.

No changes to the 60-card candidates, original Aichi opponent lists,
vendor sources, or shared policy are implied.
