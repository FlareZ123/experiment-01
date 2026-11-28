# Candidate Forest Seal Stone / Tool Jammer Active-only correction

**28 November 2026; Agent 3; review-only successor to draft PR #95.**
Not a change to the frozen V3 deck, owner-controlled fixture, native engine,
runner, CI or competitive policy admission.

## Mechanics and field relevance

The source text of **Tool Jammer BST 136** suppresses Pokémon Tools attached
to the *opponent's Active Pokémon*, provided the Tool Jammer holder itself
is in the Active Spot. It does **not** disable Tools on that opponent's Bench.
The authenticated original Aichi list inventory contains Tool Jammer in
ranks **3, 6, 7, 24 and 29**; this is a source-inventory observation, not a
claim about how often Tool Jammer is equipped, who holds it, or its impact
on actual games.

The developmental candidate worker `toolsKnownLive(view)` previously
treated any opposing Active Tool Jammer as a **global Tool shutdown**.
That made the following actually legitimate conditional actions unreachable
in its policy when the host offered them:

1. attaching `Forest Seal Stone SIT 156` to our Benched Shadow Rider
   Calyrex V CRE 74 when its search effect would be useful;
2. activating the already-attached Benched Stone's `Star Alchemy` Ability.

In contrast, a Stone or Float Stone on our **Active** is suppressed by
Tool Jammer, and `Jamming Tower` / registered global Tool suppression still
nullifies Bench Tools. Iron Thorns ex Active Ability lock is independent
and still requires its own legality check; a source list merely containing
Tool Jammer does not prove a Star Alchemy opportunity.

## Minimal fix

Make `toolsKnownLive(view, recipient)` depend on the actual recipient and
fail closed when recipient is missing. Pass the true recipient to Forest
Seal Stone and Float Stone attach-score paths. At the Star Alchemy root,
require a real printed Stone holder on which the Tool is live. No new
Action tokens, no changes to the native frontier, no hidden-state access.
This belongs in an owner-reviewed candidate policy successor, not in the
frozen fixture or main without owner approval.

## Reproduction and evidence class

Source/strict-protocol test:
`tests/2026-11/agent3-bench-forest-seal-stone-tool-jammer-20261128.test.cjs`.
Both physical seats × seven source-grounded conditions = **14 cases**.
Exact original PR #95 branch worker: **10/14** passing; changed branch:
**14/14** passing in an isolated V8 CommonJS evaluator of the actual
candidate worker and strict policy protocol. Four corrected failures are
the two Bench-Stone actions in both seats. Other controls confirm Active
Stone suppression, no useful Active Stone attachment, no-Jammer Bench
Stone, Jamming Tower, and explicit full-Tool suppression.

No Node test runner, pinned Twinleaf Store continuation, native CI, full
match, qualified Aichi matchup, or competitive win-rate evidence was
produced. Before any integration, verify that a physical Bench-equipped
Forest Seal Stone can emit and execute the native Star Alchemy root
through the source-print bridge with opposing Tool Jammer Active.
