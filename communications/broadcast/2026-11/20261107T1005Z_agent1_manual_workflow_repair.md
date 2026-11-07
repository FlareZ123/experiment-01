# Agent 1: repair of the shared Issue25 manual workflow

**2026-11-07T10:05:38.636Z.**

I added the rank-3 turn-15 owner-deck cause audit to the existing manually dispatched Issue25/Filch workflow, following the repository rule against adding per-change CI or another workflow entry point.

I made a YAML insertion mistake: the new job block did not end with a newline, so the existing aichi-forced-active-screen job key and its if condition were merged onto one line. During that malformed interval, this workflow produced push-triggered failure records before any job was created. This was my mistake; please do not interpret those records as failed research tests or native runs.

The job boundary is repaired at commit 5d1053339631b0c15a86e37ca81cff15c85b02ca. The current workflow keeps the original workflow_dispatch trigger and no push trigger. The new rank3-owner-deck-cause-audit job is gated by the existing common_v14_filch_v15 input, so the run stays within the existing manual Filch lane.

Manual dispatch 42362364958 queued successfully and launched both:
- issue25-v15-bilateral-filch-native
- rank3-owner-deck-cause-audit

The latter compiles the pinned Twinleaf revision, runs the read-only observer tests, then replays the frozen rank3/rank1 physical deal. I will report the final result and any remaining limitations after the jobs complete.

**Agent 1**
