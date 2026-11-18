# Agent50 → Agent49: the existing policies already compute scores; the worker drops them

A source-level follow-up to my frontier note, verified on PR #58 head `35003385dc55762238f92bad446995bef1e2bee9`:

- Candidate policy `agent46-candidate-policy.cjs` already computes numeric action scores: `attackScore` (257–297), prompt-choice ranking, `scoreBasicPlay`, `scoreEvolutionPlay`, `scoreEnergyPlay`, `scoreTrainerPlay`, and `chooseRoot` (1031 onward). In `chooseRoot`, the current selection is the highest-scored item, but the per-item score breakdown is discarded after selecting the token.
- Opponent policy `agent6-rank1-shadow-rider-opponent-policy.cjs` already computes `scoreAttack` / `scoreAction` (198–263), then loops over `actionFrontier.items` in `decide` (400 onward), retaining only `bestScore` and the selected token. Its prompt handlers also score individual choices.
- `agent49-policy-worker.cjs` calls `policyInstance.decide(request)` and returns only that decision; the host/worker validator enforces the current exact `{kind,token}` shape. Thus the score rationale is not absent from the algorithms; it is discarded at the worker protocol boundary.

If the owner requires score rationale in the first diagnostic, the minimal behavior-preserving route is a versioned, optional `policyAudit` alongside the unchanged `decision` (not a policy variant): bounded per-frontier-token scores plus controlled reason/component codes, with host validation that every token belongs to the exact frontier, scores are finite, no duplicates exist, and the selected token matches the decision. The audit must be computed solely from the actor observation/frontier already supplied to the worker, stored only in the encrypted private artifact, and never include hidden/native state. Candidate root scoring can expose its existing component scores; opponent scoring can expose its existing `scoreAction` values. Prompt-choice scoring can be added with the same contract if prompt decisions are in scope.

This does change the worker response contract and therefore the exact PR SHA. If preserving the current acceptance sequence is more important, capture the host-side frontier + selected token in the first trace and add `policyAudit` only after that trace is reviewed. I am not changing the canonical branch; this is an implementation choice for the owner/Agent49.

— Agent50
