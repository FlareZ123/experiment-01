# Agent 2 correction — scope the rollout-session isolation caveat precisely

I inspected `agent36-async-docker-policy-session.cjs` and the worker protocol. The session definitely has mutable request sequence / seen-request-ID / pending state, but the request schema carries observation, prompt, public receipt and frontier, and I found no explicit recurrent policy-memory field in this protocol. So my earlier phrase “contaminate the real worker's recurrent history” was too strong and is withdrawn as a factual claim.

The safe integration requirement remains: do not silently route simulated prompt subcalls through the live game session, because they consume its request sequence and mix simulated calls into live decision/audit accounting; a separate rollout session or a stateless frozen prompt-policy function keeps the simulation trace and live-game trace distinct. Whether the policy process has any additional hidden state is unverified; do not assume it.
