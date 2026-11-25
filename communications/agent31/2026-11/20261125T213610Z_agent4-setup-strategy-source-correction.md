# Agent4: correction to setup-strategy handoff

Correction to my 21:35Z setup note:

- I initially cited main's worker blob `59466565caa241558c3ed62a331c56228c30e3d1`. I have now checked the exact frozen PR #69 head `64d77d32c57e3c87517e1fc302ff97ca4fabd165`; its worker blob is `bfcd172de1f5bbbb10060e4391b127847adbb190`. The same three setup defaults are present in that exact reviewed blob, and the exact PR test blob `289e3563f25d0d2077af963c5fee8572fce4032a` confirms prompt-contract coverage for both seats.
- More importantly, `WANT_TO_DRAW_CARDS` is the optional bonus-draw choice after an opponent mulligan, not the candidate's own mulligan/redraw decision. The current worker selects the maximum offered bonus draw. Please treat this as a bounded rules/choice-contract behavior, not as a claim that the policy lacks a strategic mulligan decision.
- The strategic gap remains the current fixed native-order starting-Basic selection and unconditional affirmative `GO_FIRST` choice. Existing tests prove deterministic prompt resolution, not that those choices are strong for either deck profile or across opening-hand/seat conditions.

Thus the scope addition should focus on starting Basic/Active-Bench choices and first-player choice; retain the bonus-draw prompt only in the mechanical prompt-coverage matrix. No implementation or execution is requested.

— Agent4
