# Root-action SHA-256 is blind to card-selection semantics

**Agent 6, 20 October 2026. Severity:** high **evidence-identification limitation** for existing retrospective policy comparisons. Evidence: pinned research source inspection and deterministic Node 22 local projection counterexample, no new compiled Store match, no claim that previous archived matches differed.

## Concrete code-level cause

[Headless runner](../../simulation/twinleaf/headless.cjs) computes `selectionInfo = selectedCardsEvidence(pending, action, state)` **before** native dispatch at approximately line 1032 and writes it into the selective `decisionTrace` as `cardSelection` (approximately lines 1347–1371). It separately builds `rootActionLedger` at **lines 1373–1392** for each successful root dispatch, with:

```text
actionOrdinal, turnBefore, turnAfter, playerSlot, action,
pendingPrompt, initiatingRootActionOrdinal,
optional playedCard, optional ability, optional attack,
optional attackChoice (print, attack name/index, source index)
```

**It does not include `selectionInfo`, `optionInfo`, the payload of `ResolvePromptAction.result`, general Item-target slot indices, or any post-action state hash.** This is a semantic projection, even though it covers every root dispatch.

[Canonical bilateral development](../../simulation/evaluation/agent41-bilateral-v2-development.cjs) forms `rootActionLedgerSha256 = sha256(rootTrace)` at approximately line 462, where `sha256` at line 61 is SHA-256 over `JSON.stringify(value)`. The optional `paperSupporterComparisonTrace` is even narrower, excluding `pendingPrompt` and most context. Thus **equal root hashes prove equal recorded action skeletons only**. They cannot independently certify equal deck-search selections, discard targets, Bench targets, or state transitions.

## Constructive non-cryptographic collision

At the already observed, actual **rank11 New Moon turn1 root10** owner `Fog Crystal CRE` `ChooseCardsPrompt`, the actual archived answer selected `Psychic Energy MEE`. The owner K1 audit showed `Gengar & Mimikyu-GX TEU` still in its own deck, a printed-legal **alternative search target** for Fog Crystal. See the [exact first-prompt audit](../aichi-2026/agent6-rank11-fog-crystal-k1-donor-energy-contention.md).

For example, projecting either choice through today's root-ledger fields yields the same synthetic record:

```json
{"actionOrdinal":10,"turnBefore":1,"turnAfter":1,
 "playerSlot":1,"action":"ResolvePromptAction",
 "pendingPrompt":"ChooseCardsPrompt",
 "initiatingRootActionOrdinal":9}
```

In a local Node 22 test with `createHash('sha256').update(JSON.stringify([record])).digest('hex')`, both projected alternatives gave the **identical** SHA-256 `300eec23396e389b2f5591d38c94f62159a4a2fb69529cd56930120d8fb55a08`. Appending a selected-printing field to otherwise identical hypothetical records gave **different** hashes (`ce57b6b5f8de1847bf85a04ca4791e053a636ed8c2caaad80f7b327bfbbd7b84` for Energy; `78be84edfb64f096e009ec869c335cd5831519a1ed53f4714abdd77c51e63f9b` for Gengar).

**This is a deliberate projection collision, not a SHA-256 hash-function collision.** No actual Gengar-selected alternative game was run. Different choices could lead to distinct later root *skeletons*, which would of course then yield different whole-game hashes; the counterexample proves the weaker point that a same hash is not sufficient evidence of equal native selections or states.

## Immediate evidence consequence

The recent successful [Agent41 baseline versus quota-guard paired archive](https://github.com/FlareZ123/experiment-01/actions/runs/39405536198) reported unchanged historical four-arm `rootActionLedgerSha256`. This correctly demonstrates **no recorded root-skeleton divergence** under the tested guard, and its separate native Supporter-event and source-own-deck evidence remain valuable. It **cannot by itself** establish that every hidden prompt choice and every state transition was identical. For the rank11 New Moon candidate, both archives also separately record the *same explicitly selected Fog Crystal Energy*; that separate evidence is stronger for this one selection. The source-side or any other unrecorded prompts still require explicit accounting if an unchanged-state assertion is needed.

The source-deal fingerprint and actual starting-seat fingerprint verify their own specified input identities. Neither closes this post-choice semantic gap. A replay should not silently promote same-prefix root hashes to full physical state equality.

## Recommended protocol improvement (research-code only)

1. Preserve existing root hashes as `root-skeleton-v1` for backward compatibility; do not invalidate useful recorded attack and Supporter data.
2. Build a **separate canonical semantic-choice manifest** at the *actual native pending prompt*, using already-present [typed source-prompt reference codecs](../../simulation/twinleaf/source-prompt-action-codec.cjs) and `selectedCardsEvidence`, not invented textual interpretations. Record deterministic choice identity, owner seat, root ordinal, prompt class, selected printings/indices where valid, and a cryptographic commitment to any hidden information that must remain private. Keep owner and opponent zone access restrictions.
3. After native dispatch, also attest the effect's **public-state delta** and legally owner-visible relevant zone delta (card moved into hand, discard, Bench, attached Energy etc.). Do not leak true Prize composition or opponent hidden cards into bot decisions. A choice manifest alone does not prove Store effects settled.
4. For paired `first semantic divergence` diagnostics, compare pre-divergence input deck/seed identity, chosen native prompt actions and real state outcomes alongside root skeletons. Track which differences are from different random shuffles, card choices or policy actions; qualify only supported invariant claims.
5. Add **pure negative control**: two `ResolvePromptAction` card choices identical in root skeleton but different selection; existing SHA remains equal, semantic witness differs. A compiled Store control may then demonstrate distinct accepted card movements in an owner-realistic setting. Do not infer a competitive game from that control.

This finding is about **evidence sufficiency**, not a statement that any particular prior reported 4-arm pair has mismatched state, a new game win, or superiority of a deck. Target remains 29/32 exact opponent 60s, zero competitively qualified games, no demonstrated 99.5%.
