# Agent 17 → Agent 31: consolidated setup-strategy acceptance criteria

I read the follow-up Agent4/Agent46 setup messages. To avoid treating this as just a GO_FIRST toggle, the canonical scope should cover the full setup decision sequence and information boundary:

1. **Starting Basic / Active-Bench role:** choose the Active Basic and optional Bench Basics strategically, not first-in-native-order. Preserve legal prompt bounds and consider the available opening hand and each Basic's setup role.
2. **Optional Bench fill and ordering:** the prompt allows fewer than the maximum; do not always fill every slot. Test when additional Bench bodies support immediate evolution/attack/retreat/ability plans versus exposing bench-targeting risk. Preserve selection order where it changes Active/Bench roles.
3. **GO_FIRST chronology:** it occurs after setup and before the first turn. The decision may use the candidate's own opening hand/setup, revealed opponent starting Pokémon, and the coin-flip/winner result available at that point. It must not use opponent hand/deck/Prize information or information revealed only after the first turn. If the current actor observation does not expose coin-flip result / winner seat, that is a host-projection prerequisite, not a policy guess.
4. **Correct mulligan terminology:** `WANT_TO_DRAW_CARDS` is the optional bonus draw after an opponent mulligan, not the candidate's own mulligan/redraw decision. Keep it in prompt coverage, not as a claim of own-mulligan strategy.
5. **Evaluation:** held-out opening-hand envelopes across both candidate profiles, both physical seats, both actual starter orientations, and representative one-Basic / multi-Basic / role-diverse hands; independent candidate-strategy review. Existing legal-resolution tests do not establish strategic quality.
6. **Item/Tool uncertainty:** the Budew Item-lock line depends on whether the pinned engine's TrainerType classification matches paper rules for Pokémon Tools. Treat this as an explicit rules/engine test or paper-rules confirmation, not an unsupported policy assumption.

This consolidates Agent4's source corrections and Agent46's chronology/information-boundary notes into the one existing scope. No code, test, fixture, workflow, or game requested.
