# Owner-root Special Energy: physical recipient attestation (29 October 2026)

**Author:** Agent 5. **Scope:** Narrow diagnostic correctness repair in the shared canonical actor-only Store witness. No decklist, action preference, game result or policy-option default changed.

## Reproducible failure mechanism

The existing `choosePublicContextSpecialEnergy` and `chooseTelepathPsychicRecipient` selectors can return a native-neutral `{kind:'attach-special-energy',slot:'bench',index,...}` intent. `agent34-actor-only-root-policy.cjs` translates such an intent into a `PlayCardAction` whose target is the specified Bench slot.

Previously `rootPhysicalSnapshot` in `simulation/twinleaf/agent5-owner-root-slice.cjs` selected that Bench slot only for **Basic** Energy, and `rootPhysicalWitness` checked `activeEnergies` for **all** Special Energy. Consequently an actual Special Energy attachment to the intended Bench could be reported as `no-confirmed-public-effect` merely because the Active's Energy stayed unchanged. An attachment to a wrong zone could instead pass if the Active changed.

## Minimal correction

- `rootPhysicalSnapshot` now reads the intended Bench slot's Energy cards for both Basic and Special Energy intents, leaving the prior Active, retreat and non-Energy snapshot paths intact.
- `rootPhysicalWitness` selects that recorded target for a Special Energy Bench intent, while retaining Active-zone checking for Active targets and the existing Double Colorless Energy path.
- The intentional relaxed **hand-size** criterion for Special Energy remains, since an on-attachment draw can alter the hand before a final prompt settles.
- New `tests/agent5-special-energy-bench-witness.test.cjs` exercises an exact printed Telepath Bench target, wrong Bench target, accidental Active movement, an Active Speed Lightning attachment with extra drawn cards, and an absent target. All five pure tests passed in [first compiled run](https://github.com/FlareZ123/experiment-01/actions/runs/40964149592).
- The first broad manual workflow failed **for an unrelated preexisting stale snapshot fixture** in `tests/agent5-owner-root-slice.test.cjs`, which omitted the module's existing `activeToolPrintings:[]` field. This fixture was corrected separately; [second manual workflow](https://github.com/FlareZ123/experiment-01/actions/runs/40964297824) passed the aggregate pure actor-root step and continues native checks at this report's initial checkpoint.

## Evidence classification and limits

This is a **source-code mechanism plus synthetic public-zone regression**, not an observed positive native Store Bench attachment. In particular, it does not show that a realistic policy selects Telepath Energy at the right time, that a native attachment resolves all search/draw prompts, or that a subsequent attacker can use the Energy. Independent native Store and representative game-policy receipts remain required. Existing opt-ins and the downstream rule/clock/hidden-information qualification vetoes remain unchanged.

The larger [29 October Critic arbitration gate](../../communications/broadcast/20261029T214047Z_critic_firstmatch_policy_arbitration_gate.md) therefore still applies: exact printed legal owner opportunity, alternative action cost, native dispatch and target, full settlement, and both-player continuation must be tested before candidate-strength claims. No change to **29/32 exact original 60s**, **zero competitive-qualified games** or the absence of demonstrated **99.5%** performance.
