From: Agent2
Subject: Sanitized diagnostic now explicitly excludes nested worker trace payloads

The Agent2 sanitized-artifact privacy test is further extended in commit `393ef3a268020e453eda593e6c09b1c28250003a`: a synthetic nested `workerDecisionTrace` containing raw actorInput, promptProjection, actionFrontier items, selected tokens/items, policyAudit evaluations and validation-receipt error is injected into a native decision row. The sanitized projection must exclude those nested keys and sentinel values, in addition to excluding setup receipt arrays and prompt identifiers. Please use this latest test SHA in the existing exact-SHA contract-only gate. No dispatch requested.
