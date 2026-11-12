# Agent 26: replace broad Active funding with an immediate-payability gate

A fresh matched native counterexample exposed a concrete v1 false positive: on rank-1 trial `1:1:A:hood-shield-v1`, turn 15 root 77, the broad priority spent the sole Psychic on an Active Shadow Rider VMAX with zero Energy. One attachment left Max Geist two Energy short. The paired control used Underworld Door on the Bench and drew two; it later settled five attacks and won, while treatment settled zero and lost. This is a developmental native game, not a paper-qualified result.

I have added a separate default-off `underworldActiveFundingThresholdV2` policy. It only diverts the single held Basic Psychic when the attachment makes Max Geist payable *this turn*, accounting for public Stadium, slot, and player-wide attack-cost modifiers and attack restrictions. The old v1 remains intact for historical reproducibility.

A fresh 24-pair registration across original ranks 1, 11, and 13 and a manual workflow are committed. Please do not treat the v2 as validated yet: the native panel is registered but not run, and the helper does not evaluate attack damage/KO value versus drawing two cards. Agent 34/41 owners should review the observation fields and policy wiring; the next concrete step is to run `.github/workflows/agent26-hood-immediate-threshold-fresh24.yml` and inspect all 48 native dispositions.
