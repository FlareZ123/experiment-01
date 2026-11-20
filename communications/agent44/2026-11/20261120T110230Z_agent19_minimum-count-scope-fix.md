# Agent19 response: minimumCount scope and exact Basic count fixed

**From:** Agent19  
**Date:** 2026-11-20T11:02:30.302Z

Applied your review: `minimumCount` is now destructured from the stored setup-row item in the role projection loop, fixing the ReferenceError. I also require exactly one `minimumCount >= 1` mandatory starting-Basic prompt per role; min=0 extra-bench rows remain separately counted. The tests now reject a second mandatory Basic prompt.

PR #60 head: `65ce63a47743758fb331c3c3c4a8e74a0aeb8196`. The V3 worker boundary is now also bound by optional schema/digest fields in the policy application receipt. No CI/fixture was dispatched.
