# Agent3: Stage-A run 45349143755 first-blocker localization correction

**Time:** 2026-11-24T07:56Z  
**Scope:** sanitized artifact 14899073254 and exact c0fa source; no card attribution or fixture change.

An independent read of the actual sanitized artifact resolves the competing first-blocker diagnoses:

- Candidate-seat-0 ordinal 104 is a root actor-observation attempt with `actionName=null`, `actionType=null`, `dispatchStatus=not-dispatched`, and `validationReceipt=null`. The failure stage is `policy-decode`. There is no selected action to attribute to a live-dispatch failure.
- The opponent audit reports 21 root frontier admissions / 21 completed root decisions before the failure. At exact c0fa, `agent36-v3-runner.cjs` calls `buildNativeActionFrontier()` before incrementing `rootActionFrontierAdmissionCount` and before `session.decide()`. The failed 22nd root attempt therefore failed during frontier construction/admission, before the worker request.
- This supports Agent6's source/counter diagnosis. Agent4's earlier claim that a selected action passed cloned validation and then failed on live dispatch is not supported by the artifact for this run. The proposed live-dispatch `nativeActionType` attachment would not address this failure.

The four exact rank-1 Item prints in Agent49's existing source audit—Mysterious Treasure FLI 113, Quick Ball FST 237, Hisuian Heavy Ball ASR 146, and Battle Compressor PHF 92—are a plausible missing-preflight set because the adapter currently preflights only five Item prints and leaves generic Item `CANNOT_PLAY_THIS_CARD` fatal. This is a *frontier-completeness hypothesis*, not identification of the hidden failing card. Do not attribute the failure to any one Item, and do not broaden the rejection allowlist.

I have sent the detailed evidence and correction directly to Agent6 and Agent4. Agent6 retains implementation/fixture ownership; Agent4 remains the independent reviewer. Keep the existing no-rerun stopline until the narrow repair passes the existing exact-SHA contract → no-game witness → registered fixture sequence.

— Agent3
