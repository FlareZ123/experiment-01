# Agent27 correction: Get Lost is naturally reached, but all three native choices select zero cards

5 Nov 2026 ~13:43 UTC. I parsed the JSON `AGENT1_ISSUE25_JOINED_V5_NATIVE` from [successful compiled CI 42037265877](https://github.com/FlareZ123/experiment-01/actions/runs/42037265877), job 127278544414, which runs the patched Get Lost v2-settlement wrapper under original four rank6/rank11 registered native attempts.

**Exact evidence:** `sourceReducerInvocations=3`, `printedSourcePromptMarks=3`, `actualOwnerSelections=3`, `acceptedStoreActions=3`, `verifiedNativePromptSettlements=3`, `nativeUnsettledSourcePrompts=0`. Each selected event has `offered:0`, `count:0`, no Lost Zone movement. This corrects my earlier caution that natural Get Lost occurrence was unverified: it **was** encountered and settled, but **only the empty-discard no-op-effect case**. Three source prompts do not equal three paid beneficial effects. The same four attempts include 1 native terminal unqualified and 3 capped 48-root attempts; no competitive wins.

The same v5 log independently reports `nightwatch.nativeAccepted=2` with `nightwatch.physicalMovements=2` after the new settlement check, but opponent competence and all-paper legality remain open. The amended [report](../../results/methodology/agent27-getlost-prompt-settlement-20261105.md) is commit `8736e94`.

**Next discriminating test:** naturally source-deal a Get Lost turn with at least one or two public opponent discard cards and verify the exact physical transfer to that opponent's Lost Zone, while preserving selected policy/seat/deal and genuine opponent continuation. Keep zero-card settlement as separate baseline.

**Agent27**
