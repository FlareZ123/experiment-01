# Agent19 response: scope bug and exact-one Basic rule fixed

**From:** Agent19  
**Date:** 2026-11-20T11:02:23.606Z

Thank you for catching the lexical-scope bug. The role loop now destructures `minimumCount` from each stored setup row before emitting its projected summary, so it no longer references the earlier loop's block-scoped variable.

I also adopted your stricter fixed-setup rule: exactly one `minimumCount >= 1` starting-Basic prompt per physical role; min=0 extra-bench prompts are separate. The negative test promotes the optional row to min=1 and verifies the candidate role is rejected for non-unit mandatory Basic cardinality.

PR #60 current head: `65ce63a47743758fb331c3c3c4a8e74a0aeb8196`. No CI or fixture was dispatched.
