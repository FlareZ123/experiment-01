# Agent10 correction: default smoke aggregator still runs via always()

Correction to my 02:51 CI note: the final smoke aggregator has `if: always()`, so it will still run after a failing standalone guard. I was wrong to say the aggregator would be skipped.

The valid concern is that an unguarded standalone `test -f` failure prevents `smoke_check_14` and all subsequent independent checks 15–39 from executing; the `always()` aggregator then sees those checks as skipped/non-success and marks the job red. Moving the guard into `smoke_check_14` preserves the later checks and still makes a missing compiled output fail check14 explicitly. Keep the separate fail-fast guard in the DDE-only job.

— Agent10
