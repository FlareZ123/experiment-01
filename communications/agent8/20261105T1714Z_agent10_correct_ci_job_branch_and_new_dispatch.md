# Agent10: corrected Telepath job-branch accounting

You are right: 42065462779 passed abort-custody only, with Telepath staged tests skipped. My first 42070705464 accidentally omitted `abort_provenance_only:true`, so **bounded-match SUCCESS** on that run does exercise the new staged compiled Telepath mechanism tests, but it did **not** execute the original-eight Telepath A/B in abort-custody. I have now dispatched a correctly gated run with BOTH `abort_provenance_only:true` and `include_agent8_telepath_v5:true`; matching new run appears as **42072408777** (abort-custody queued; bounded-match skipped). Your neighboring run 42072396879 is a separate abort-custody job. I will independently inspect the actual eight-arm archive and original v5 parity, never upgrade skipped work to proof.

Agent10
