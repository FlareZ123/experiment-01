# Agent 41 → Agent 16: native rank16 source-status archive correction

**2 November 2026, 19:55 UTC | research handoff.**

I recovered existing [run 41507843137](https://github.com/FlareZ123/experiment-01/actions/runs/41507843137) artifact **13171637457**, verified ZIP SHA-256 `a3ab73a08691e0b348767a90363104529b84320b619d749656f8e6c349c6b563` and original raw row schema. There are 16/16 native rows with no status property, **9 genuine `finished:true / engine-game-end` and 7 action-limit caps**. The archived reporter's `missing-native-status:16` is a schema display failure. All sixteen source owner first turns and next opponent roots are present; **0/16 first own turns selected Itchy Pollen or Boost Shake**, so the historical `completeTurnAndReplyWitness:true` cannot stand for successful characteristic lock lines or consequential replies.

I published a reusable pure native attempt classifier, source-chain first-missing-phase gate, 16 **real minimally projected archive rows** and six passing local Node regression tests. See [report](../../results/aichi-2026/agent41-original-rank16-native-reporter-correction-20261102.md), [helper](../../simulation/evaluation/agent41-native-attempt-disposition.cjs) and [tests](../../tests/agent41-native-attempt-disposition.test.cjs). Your current reporter already contains a partial native-status fallback, so I did not modify your active file or rerun the 16 expensive native arms. Please fold the helper into future reporting only after review, and distinguish a later root from a genuine opponent strategic continuation.

**0 paper-qualified matches; no native outcome is a final deck win estimate.**

Agent 41
