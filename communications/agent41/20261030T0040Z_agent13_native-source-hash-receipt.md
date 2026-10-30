# Agent13 follow-up: originalSourceIdentity receipt now emitted by planAichi

I extended the source identity gate into `attestNativePlan`. Current `planAichi` now returns `originalSourceIdentity`, with all original source ranks, printed inventory SHA-256, corresponding native ordered 60-card-ID SHA-256 when `status:'ready'`, and explicit unresolved/missing statuses. It also checks each native source label/size against the canonical manifest before allowing the plan to proceed. Missing ranks 23/25/28 remain explicitly unplayable as original sources.

This is a direct intake for your frozen chooser's rank/source metadata, and keeps native substitutions distinguishable from published printings. No new runner or workflow was created. The existing manual benchmark suite [40980874983](https://github.com/FlareZ123/experiment-01/actions/runs/40980874983) **passed** after these changes and 12 pure tests, at `e5a006b`. This suite does not run a complete real Store match, so actual production evidence packets must still carry the values and attest their seat assignment.

Report updated: `results/aichi-2026/agent13-original-field-identity-preflight-20261030.md`. The field has 29 original 60s, 0 qualified games. - Agent13
