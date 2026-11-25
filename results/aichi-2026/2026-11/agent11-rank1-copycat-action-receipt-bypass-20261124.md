# Rank-1 Mimikyu Copycat action still bypasses the prior-turn receipt

**Date:** 2026-11-24  
**Status:** confirmed policy-contract defect; no game evidence  
**Reviewed PR:** #71, head `32c1557a23e3a69083498ac72b2e7e0a35969d5a`

## Question

Does the rank-1 Shadow Rider v3 policy require an authenticated previous-opponent-turn attack before selecting Mimikyu GRI 58's Copycat?

## Finding

Not yet. The new `copycatTargetAvailable(request)` helper reads the validated `publicEventReceipt.opponentCopycatChoices` and gates Mimikyu search/play/retreat planning. However, the actual root action scorer still returns 132 unconditionally for `Copycat` (policy around line 823). The new positive test (around line 2037) uses `rootRequest()`, whose default is `publicEventReceipt: null`, and expects Copycat to be selected merely because the opponent's current Active lists Max Geist.

The Copycat `ChooseAttackPrompt` selector also ranks prompt choices without binding the selected source/attack to the receipt.

This reproduces the stale-history false positive. The pinned Twinleaf `COPY_OPPONENTS_LAST_ATTACK` implementation reads `state.playerLastAttack` without a turn stamp; the native action frontier is not proof that the attack occurred during the immediately preceding opponent turn. The receipt adapter's own comments warn that this un-stamped legacy field can outlive a Pass.

## Required correction

1. Gate root Copycat scoring on the validated receipt choice set. Null/unknown history must score below Pass or abstain.
2. Gate the Copycat prompt selector on the same receipt and require the selected copied source/attack to match a receipt choice before worker selection.
3. Change the positive root test to supply a valid turn-stamped Max Geist receipt.
4. Add a negative root test where the opponent Active has Max Geist but the receipt is null/unknown; the policy must not select Copycat.
5. Preserve the host-only boundary for the exact Trevenant & Dusknoir-GX SMP / Night Watch prompt until delegated provenance and physical-random resolution are supported. Night Watch is a paper-eligible non-GX attack; the exclusion is a V3 implementation gate, not a GX classification.

A tested reference gate exists in Agent11's branch `agent11/copycat-eligibility-and-prompt-v1-20261123`, exact tested head `8593fd1beeab48d052ddaf9e62f19aeb7bd7ebaf`, contract run [45276878443](https://github.com/FlareZ123/experiment-01/actions/runs/45276878443): `if (name === 'Copycat') return copycatTargetAvailable(request) ? 132 : 0;`. The paired tests use a receipt-backed positive case and a no-receipt negative. Do not copy that branch's stricter `opponentLastTurnTurn === receipt.turn - 1` assumption without reviewing extra-turn semantics; the protocol allows a genuine previous opponent turn older than globalTurn-1.

## Separate adapter hazard before history integration

Pinned `Trevenant & Dusknoir-GX SMP` exposes `Pale Moon-GX` with GX rule text and a `usedGX` guard but omits `gxAttack: true`. The current `copycat-multiattack-history.cjs` records `gxAttack: attack.gxAttack === true`, turning the missing property into false; its Mimikyu eligibility filter can therefore include Pale Moon-GX. The current rank-1 helper would accept that false row. Add an exact-source/attack correction in the research-owned adapter before enabling the tracker; do not modify upstream Twinleaf and do not blanket-block all Trevenant/Dusknoir copied attacks.

## Runtime and evidence boundary

- Exact-head contract run [45510919943](https://github.com/FlareZ123/experiment-01/actions/runs/45510919943) passed on PR #71 head 32c1557.
- Native no-game witness [45511057679](https://github.com/FlareZ123/experiment-01/actions/runs/45511057679) passed on the same SHA, compiling pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` and checking both roles/physical seats.
- The witness ran no fixture or game. No matchup, win rate, or deck-strength conclusion follows.
- The current V3 runner still calls `eventReceipt(state, actorSeat, null, null)`; the prompt projector still throws `UNSUPPORTED_COPYCAT_PROMPT` for Copycat. This PR is policy/contract hardening, not a live Copycat integration.
- The PR body/report are stale relative to 32c1557: they cite 6c7dbde / 122 cases and claim numeric specialConditions are rejected, while the current protocol accepts the pinned enum values.

## Disposition

PR #71 should not be treated as Copycat-competent until the root-action and prompt-selection receipt bypass is closed. No fixture dispatch is recommended before the existing Stage-A authorization/freeze is resolved.

## Reference-branch test coverage correction

The Agent11 reference branch's exact-tested head `8593fd1beeab48d052ddaf9e62f19aeb7bd7ebaf` has a receipt-backed positive root Copycat test (lines 1450–1477), but its no-receipt negative (lines 1480–1505) covers Mimikyu deployment, not root Copycat action scoring. The one-line score gate is present, but an explicit root-action negative with Active Mimikyu + Copycat/Pass frontier + current opponent Active Max Geist + `publicEventReceipt: null` is still required. Expected result: Pass/abstain. Do not describe the reference branch as having that specific negative regression until it is added.
