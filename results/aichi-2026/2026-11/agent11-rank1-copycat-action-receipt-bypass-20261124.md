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


---

## Resolution update — 25 November 2026

The **rank-1 policy-contract bypass described above is now closed** on PR #71's replacement branch:

- Current PR documentation head: `cbeb19e1c79961d80387b23f5882f202f0702c82` (report-only commit).
- Exact tested policy/test head: `3bfd7aca57eb340dd24f1ef740e55e47f94e082f`.
- Policy blob: `22d3db7d3f8b2348e12f8ad4416f024c153ed22e`.
- Test blob: `7a4b55bd38d3e028191b4d0b3371e1e253e810fd`.
- Dedicated exact-head contract run [45529074554](https://github.com/FlareZ123/experiment-01/actions/runs/45529074554) passed 132 rank-1 policy/prompt/worker/action-frontier cases plus Node 22 syntax checks.
- Agent11's consolidated exact-head review is recorded in PR #71 review `6050470566`; Agent2's independent review remains pending.

The final policy gates root Copycat scoring on validated receipt choices (score 0 falls through to Pass), and binds prompt selection to the Mimikyu/Copycat source, exact copied-source printing, exact copied attack name, exact choice metadata, and the same turn-stamped receipt row. Missing receipt, empty choices, source mismatch, attack mismatch, and exact Trevenant & Dusknoir-GX / Night Watch cases fail closed. Positive root and prompt cases use a valid Max Geist receipt.

The pre-play Mimikyu helper intentionally does **not** require `mimikyuCopycatCompatible === true`: that flag describes the currently Active Pokémon and would suppress pre-play Mimikyu search/deployment. It continues to require a receipt-backed eligible choice. The final prompt helper does require active-Mimikyu compatibility because it is invoked for an actual Copycat prompt.

No strict `opponentLastTurnTurn === receipt.turn - 1` check is used. A genuine previous opponent turn may be older than `globalTurn - 1` when the actor has an intervening extra turn; the tracker snapshot turn is authoritative. The protocol validates attack-row turns against that snapshot.

**Important boundary:** this closes a policy/contract bypass, not live Copycat support. The V3 runner still passes null tracker history and the host prompt projector still rejects Copycat provenance. No native game, fixture, matchup, or competitive result ran on the new head. The old no-game witness `45511057679` remains evidence only for the superseded `32c1557` head.

### Broader tracker/protocol hazards remain open

Agent47's source audit `results/aichi-2026/2026-11/agent47-copycat-gx-flag-field-audit-20261125.md` confirms four GX attacks whose pinned Twinleaf attack objects omit `gxAttack: true`: Pale Moon-GX, Tingly Return-GX, Strafe-GX, and Altered Creation-GX. These affect 19/29 available Aichi lists; Dedenne-GX appears in all nine published Regidrago lists. Do not enable tracker history until Agent49 adds source-text GX fallback and end-to-end tracker/receipt/protocol regressions.

Separately, the shared protocol's blanket rejection of `copycatAttack: true` incorrectly excludes non-GX Regidrago Apex Dragon. The supplied `human_concepts.md` line 320 identifies the Shadow Rider counterline that copies Apex Dragon and then uses it to copy the deck's own Dialga-GX Timeless-GX; treat this as a high-priority hypothesis requiring paper-rules/source validation, not established game evidence. Mimikyu's own Copycat remains ineligible, and GX attacks remain ineligible. Agent49 owns this source-aware protocol correction; no change or tracker enablement is authorized by this report.

**Current disposition:** rank-1 Copycat policy contract fixed and independently reviewed by Agent11; Agent2's independent review is pending. Live tracker/prompt integration and the shared GX/Apex protocol hazards remain blocked. The fixed rank-1 60-card list and candidate 60-card list are unchanged. No win-rate or 99.5% claim follows.
