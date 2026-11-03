# Agent 7: exact last-attack Lillie alternative before original rank-6 native deckout

**3 November 2026 | unchanged previously exposed rank-6 original-source seed; independently verified native detached Store alternative.** This report concerns native player-policy competence and owner resource management. **Zero paper-competitively qualified games.**

## The specific unresolved question

[Agent 12's 3 November Pass-only study](agent12-rank6-deckzero-lillie-native-negative-20261103.md) found no candidate-owned Pass decision with a near-empty deck in the original source-dealt rank-6 game that ended by deck exhaustion. A Pass-only alternative therefore cannot explain the actual terminal. The next logical question was whether the candidate's final **non-Pass owner decisions** held a playable deck-refilling Supporter before its deck exhausted.

The exact previously registered game `6:71:A:champion-reference`, physical source rank6 Iron Thorns original 60 in seat1 and fixed champion Shadow Rider reference60 in seat0, used seed `1855410067`. Both the control and companion New Moon arm retain the [original 2 November precommitted registration](registrations/agent7-lillie-pass-rank6-prospective-20261102.json) and its **86-option unchanged** [frozen source policy](../../simulation/evaluation/agent20-frozen-rank6-canary-v1.json). Profile SHA256: `6ff3ee325098cfc68253928a9dd5370da52c9cc64b86a4435be2b07a0d392dc6`. The actual pinned Twinleaf commit is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Genuine original-root evidence and native clone

The read-only [late-owner root observer](../../simulation/twinleaf/agent7-late-owner-root-physical-audit.cjs) attaches to genuine Store `AddPlayerAction` instances and accepts only the **physical candidate's own** root actions. It reads no opponent hidden hand or deck identities. It changes no original actor choice. From turn16 onward the original champion game contained **27 accepted candidate owner roots**: **22** recorded at least one held `Lillie's Determination M1L`; its **only** late Pass occurred at turn16 when Lillie was absent. Later roots were card plays and attacks. The companion fixed New Moon game had **32** late owner roots, **three** with held Lillie, and remained action-capped rather than a native terminal.

On the **actual champion turn40 owner AttackAction root (Store ordinal191)**, the candidate had:
- own deck **1**; own hand **34**;
- **two physically held Lillie's Determination M1L**;
- **six remaining Prize cards**, `supporterTurn=0`, no pending prompt;
- a native-selected **AttackAction**, which was accepted in the original timeline.

The candidate's own deck first reached **zero** at the immediately following turn40 `ResolvePromptAction` (Store ordinal192), with its hand **35**, both Lillies still held and `supporterTurn=0`. The original native game subsequently ended in source rank6's favor through candidate deck exhaustion with all six Prize cards remaining for both players and **zero source AttackActions**.

The existing [detached native Lillie probe](../../simulation/twinleaf/agent7-frozen-candidate-lillie-pass-clone.cjs) was invoked **before** the genuine selected turn40 AttackAction, against a deep-cloned Store. The root's physically held Lillie was native-accepted; its `WaitPrompt → ShuffleDeckPrompt → WaitPrompt` chain resolved fully on **the same global turn40**. The selected physical Lillie left the owner's hand and entered its discard, the Supporter allowance became **1**, the resulting hand became **8**, and the resulting deck became **26**. This matches exact printed-draw bookkeeping: (1+34-1-8=26). The original genuine Store then continued with its unchanged AttackAction.

## Why the deck was depleted

The original complete candidate root ledger contains **12 consecutive Filch AttackActions**, on global turns **18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38 and 40**; the source used no attacks. The authentic candidate rank1 sixty includes Mimikyu GRI58, whose printed Filch attack costs one Colorless and instructs the player to **draw two cards** (attached card database `cards/en/sm2.json`, card ID `sm2-58`). Repeated draw-only attacks explain the rapid depletion. A late Lillie replenishment supplies another draw window, but continued Filch choices may deplete it again. A competent policy must evaluate whether to attack with Filch, change Active Pokémon or conserve the deck, using actual native/paper rules. None of these follow-up tactics has been verified in the present original Store game.

## Reproduction and parity

The following two independently executed manually dispatched compiled runs preserved both original full native root ledgers:
- [Read-only late root census, run 41569250291](https://github.com/FlareZ123/experiment-01/actions/runs/41569250291), archived [original source artifact 13200317388](https://github.com/FlareZ123/experiment-01/actions/runs/41569250291/artifacts/13200317388).
- [Same-root detached Lillie, run 41569878791](https://github.com/FlareZ123/experiment-01/actions/runs/41569878791), archived [same-root artifact 13201092002](https://github.com/FlareZ123/experiment-01/actions/runs/41569878791/artifacts/13201092002). Exact `NATIVE_LILLIE_SETTLED`; `nativeRootAccepted=true`, `promptsSettled=true`, `printedDrawCountVerified=true`.

In both, original champion SHA256 of the **entire** native root action ledger remained exactly `5d6dece97c6f8f90b51c41805741fd4229b035cbbc027b1643e0fad738f47e8f`. Companion original New Moon SHA256 remained `d0f8f0c4d5df72810739dd32ddfe5b209bdcde87064d0787b7c4f09013db7eb8`. Both trial 60s, exact physical seed and original source behavior were unchanged. The actual native original game outcome was unchanged; no treatment move was executed in the real original Store.

Reproduce under pinned vendor with [retrospective driver](../../simulation/evaluation/agent7-rank6-deckout-late-owner-roots-retrospective.cjs), [observer](../../simulation/twinleaf/agent7-late-owner-root-physical-audit.cjs), [seven focused pure tests](../../tests/agent7-late-owner-root-physical-audit.test.cjs), and the **existing manual-only** workflow [agent7-prospective-rank6-lillie.yml](../../.github/workflows/agent7-prospective-rank6-lillie.yml) with `deckout_late_owner_roots=true`. The focused CI only runs this two-game historical cohort and skips its old larger prospective Lillie panel.

## Strategic inference and limits

**Established:** the original rank6 native candidate bot chose Attack at a root where physically held Lillie could instead be played and refill the deck from 1 to 26 while the original Supporter allowance remained unused. The missing policy channel is **proactive Supporter resource preservation before attack**, rather than Pass substitution. The existing Pass-only experimental policy cannot intervene in the original last Attack; a separate owner-root priority rule would be required.

**Still unproven:** the source's final winner would reverse under that intervention, the candidate would have a profitable following attack, future cost/lock interactions and opponent responses would be paper-faithful, the native scenario is representative, or Lillie should be played at any particular threshold before a future attack. The detached clone fixes a deterministic shuffle order for a local effect-count witness only. The altered follow-on strategy has **not yet been executed in a real original-Source Store game**. Supporter use trades away 26 other physical hand cards through the shuffle; these are important UDP/DCI and subsequent access opportunity costs. Prior Agent7 prospective **Pass-only** Lillie experiments even moved one game from action cap to an original-source native terminal. Do not infer game win value from native effect acceptance alone.

Next legitimate test: preregister fresh original-source physical seeds, both actual seats, both **unchanged fixed candidate 60s**, an exclusive owner-only emergency deck-retention Supporter priority before selected Attack/Pass when the original bot otherwise risks imminent deck exhaustion, and a correctly matched no-change control. Include accepted physical Prompt settlements, opponent continuation, source attack/Prize, loser terminal predicate and all caps. This is a native policy-competence pilot, not competitive field certification. The exact original `1855410067` can serve only as an explicitly **retrospective development fixture**.

The project remains at **29/32 exact original source sixties** (ranks23,25,28 unavailable), **zero competitively qualified games** and **no fixed optimized list selection**.
