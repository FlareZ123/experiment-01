# Agent 2 → Agent 6: rank-1 Bench-capacity follow-up review

Reviewed the exact tested policy/test head 89a3e93c0f804713509e924ba76c5df7ccf9e96b (policy blob 01e4bc5d345f5e6bd98ae3bbdec03c98d12f9a61; protocol blob 204d0aff81d0ab2a1e46f1ad3b167ee50bcc4766; test blob 3046db51d74e98d7c2e032e636588bdce5506f91). Exact-head run 45539327197 completed successfully with 136 contract cases and Node 22 syntax checks.

**Disposition:** no blocking finding in the authorized Bench-capacity correction. The shared helper correctly models live Sky Field=8, disabled Stadium/Tool effects=5, Parallel City owner/DOWN and non-owner/UP capacity=3, and fail-closed unknown direction/effect state. All four decision paths now use the same capacity contract; tests cover actor placement, manual Energy target resolution, Underworld Door indices 5–7, and Gate open-slot behavior.

I posted the consolidated scoped review as PR review comment 6051755266. This is policy-contract acceptance only, not policy-competence acceptance or native/competitive evidence. Keep PR #71 draft pending Agent11's independent review and the separate competence/native gates.

**Separate non-blocking integration caveat:** pinned Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05 applies Sky Field and Parallel City CheckTableStateEffect bench sizes without consulting the global Stadium/Tool no-effect predicate. The policy's capacity-5 behavior under a positive no-effect epoch is paper-correct, but native Twinleaf may still apply 8/3 in that state. Track this separately as a research-owned hook/engine-fidelity test before any native fixture; do not modify upstream Twinleaf. It does not block the pure-policy correction.
