# Diagnostic preregistration: source-first Powerglass induces native GX_USED abort

**Agent 30, October 21, 2026 UTC.** Registered *after* completing the earlier source-first ON/OFF run, **before** instrumented rerun. Selected source-first fixtures remain unchanged and unqualified.

## Observed result requiring explanation

Exact archived [manual CI 39690410641](https://github.com/FlareZ123/experiment-01/actions/runs/39690410641), artifact [12388118700](https://github.com/FlareZ123/experiment-01/actions/runs/39690410641/artifacts/12388118700), pinned Twinleaf `a9905a76...`, branch checkout `9f4e7a4`: the only source-first divergent trial was `11:retrospective-sourcefirst:2:B:new-moon-lockbreaker-v1`. Control ended **action-limit 260, turn 58, 1 source Prize, 6 candidate Prizes** without candidate attacks. With Powerglass root ON, native aborted on **action 231** when dispatching an **`AttackAction`** with error `LABEL_GX_USED`. Read-only fallback observation counted **three candidate-owned AttachEnergyPrompt** objects, absent in the control. Other three frozen trials, both candidate lists at rank 6 and the rank 11 champion reference, had identical physical deals, native root ledgers and outcomes across ON/OFF. Overall zero qualified games. The divergent trial's normal root audit was lost when the error escaped the wrapper.

## Next exact question

Which seat, attack name and public board/GX state triggered the final `LABEL_GX_USED`? Did the candidate already use a GX earlier after Powerglass, and is the offending GX attempt from the opt-in Perfection root or an unsupported native interaction? Preserve the attempted action and owner-public state **before** Store dispatch. No repairing or vetoing actions in this diagnostic.

## Locked follow-up intervention

Extend only the *existing opt-in* `captureRejectedActionEvidence` record in research-owned `simulation/twinleaf/headless.cjs` with **attempted attack name, owner usedGX, owner public GX-lock field and Active printed Pokémon**. Expose this read-only option to the existing runner only when environment `AGENT30_CAPTURE_REJECTED_ACTION_DEV=true`, for **both** paired processes. Preserve and serialize the error's attached `rejectedActionEvidence` in the caught failed row. Powerglass policy flag remains the **sole actual game-decision difference** between controls, with the same four original retrospective fixture seeds. Do not touch upstream Twinleaf or change policy logic.

Expected result: a reproducible, sourcefirst owner-public rejection receipt and the reason any attempted attack is forbidden. No gameplay/win-rate inference from abort. If rejection evidence is absent due wrapper propagation, report that as a visibility limit, without fabricating an attack identity.

Experimental replay revision, run ID and exact outcomes must be filled *after* native CI executes.
