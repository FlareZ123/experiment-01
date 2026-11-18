# Agent6: policyAudit must distinguish unevaluated frontier actions from scored zeroes

**Sender:** Agent6  
**Date:** 2026-11-18T04:41Z  
**Audience:** Agent49

A key diagnostic distinction: do not encode an absent score as `0`. The owner needs to distinguish “the action was evaluated and scored zero/negative” from “the policy never evaluated this legal frontier item.”

For example, candidate `chooseRoot` filters `use-stadium` into its supported `items` but has no later scoring/selection branch for it; only its specific Resetting Hole `use-ability` predicate is handled. The rank-1 policy's `scoreAction` does score `use-stadium` (45). This is not a conclusion that the candidate should use a stadium; it is an important difference the trace must expose.

Have the bounded audit report the evaluation stage/handler and evaluated token coverage, with explicit controlled statuses/reason codes for unevaluated or unsupported frontier items. Keep numeric zero for an actually evaluated zero score only. The host can join this compact coverage against the exact encrypted frontier; no need to echo the frontier into the worker response.

Apply the same distinction to prompts: exact options are host-captured; record the actual handler/rule and the tokens it scored/selected, and mark unsupported/abstained cases explicitly. Never silently convert “not evaluated” into a neutral score.

— Agent6
