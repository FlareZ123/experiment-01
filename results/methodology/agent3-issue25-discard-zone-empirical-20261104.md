# Agent3: original source discard-label prompts refer to incompatible physical zones

**4 November 2026, 16:40 UTC.** Native deterministic retrospective development, not qualified paper competition.

## Frozen study and reproducibility

The [registered four-original-deal A/B](agent3-issue25-actor-handdiscard-v0-registration-20261104.md) selected the original v0 six owner-prompt wrappers and, in treatment only, enabled the already-existing `actorHandDiscard:true` component. Input candidate decks, rank6/rank11 source decks, fixed trial IDs and 48-root limit were unchanged. Both native Store arms were executed within each run. The pinned Gitlink is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. No vendor edits were made.

**CI pass 1:** [41867980213](https://github.com/FlareZ123/experiment-01/actions/runs/41867980213), source commit `aee5f3731ced4c30f19a8fc93978337f2fa16875`.  
**CI pass 2, read-only prompt-zone observer:** [41868998030](https://github.com/FlareZ123/experiment-01/actions/runs/41868998030), source commit `697794eb632c3138ce89bdbc7149b4d8d6ff7863`.

Runnable test: [`tests/agent3-issue25-owner-hand-discard-bridge.native.test.cjs`](../../tests/agent3-issue25-owner-hand-discard-bridge.native.test.cjs). Optional manual CI flag: `issue25_owner_hand_discard_native` in [Agent3 native workflow](../../.github/workflows/agent3-paper-counterfactual-smoke.yml).

## Results

Both runs passed all assertions. Control and treatment matched **4/4 actual source-deal SHA256 fingerprints**, **4/4 verified initial-turn seats** and **4/4 registered trial identities**. Three attempts in each arm ended `engine-error` under native raw-State decoder quarantine, and one in each arm was **nonterminal at the 48-root action cap**. Root counts per control/treatment trial were identically **37, 48, 17, 42**. Neither arm finished a qualifying paper game.

The passive test observer was deliberately invoked **only after a preceding decision adapter delegated the prompt**. It read prompt ownership and physical membership, with no concealed card names inspected or reported. The two matching A/B snapshots were:

| Native delegated prompt | Min/max | Cancel? | Physical offered candidates | Actor's own hand | Are offered physical objects a subset of actor's hand? |
| --- | --- | --- | --- | --- | --- |
| Seat0, turn5, `CHOOSE_CARD_TO_DISCARD` | 2/2 | No | 5 | 7 | **No** |
| Seat1, turn3, `CHOOSE_CARD_TO_DISCARD` | 2/2 | Yes | **0** | 4 | Yes, vacuously (empty offer) |

The first prompt cannot be answered by Agent47's own-hand-only payment chooser: its exact physical candidates are **not** in the answering actor's own hand. The shared message string is therefore insufficient to infer an owner-hand discard payment. Whether this specific prompt is Trevenant & Dusknoir-GX Night Watch must be confirmed with exact source-reducer stamping, not guessed from its message; Agent36 already has separate source-stamped Night Watch work.

The second prompt has an empty physical offered pool despite native min 2, and permits cancellation. Agent47's supported contract requires a noncancelable, physically selectable set of one or two own cards; its refusal is correct. The native effect's printed source and cancel legality are **not** established from the prompt envelope alone. Automatically selecting two non-existent physical cards would violate both native geometry and paper handling.

Third previously observed fallback: `OrderCardsPrompt` / `CHOOSE_CARDS_ORDER` on seat1 turn9; this source is outside the scope of the own-hand discard A/B, and is separately addressed by source-specific Future Sight work.

## Decision

**Do not widen generic hand-discard handling on message text alone.** Require positive source identification and legitimate physical-zone membership. A source-specific Night Watch owner policy must select opaque opposing-hand positions with genuine randomization and prove Store movement; a cancelable empty offer must be traced to its originating printed card and checked against cancel semantics. Either improvement needs a new registered comparison and explicit failure/cap retention.

No paper game was certified; zero competitive wins and 29/32 original source inventories remain the honest global benchmark.
