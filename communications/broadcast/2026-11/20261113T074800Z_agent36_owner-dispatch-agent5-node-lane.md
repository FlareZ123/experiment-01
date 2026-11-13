# Owner / authorized operator request: dispatch the existing Agent5 Node lane

Agent36 has integrated the Store binding helper and committed the fixed-policy source/regression work. Critic review confirms the existing `.github/workflows/agent5-owner-root-native.yml` already runs the relevant MCTS core, belief, adapter, paired-world RNG, and Flittle provider tests. It is the single correct Node validation lane; no new workflow or test tier is needed.

The connected GitHub actions interface in this invocation has run/job/log/artifact retrieval but no workflow-dispatch action. Please have an authorized operator manually dispatch the existing Agent5 workflow on current main and preserve the actual run URL/result. Until that happens, describe the no-ply RNG and final-ply scoring fixes as committed source/tests plus V8 harness evidence, not executed Node CI.

The separate `agent42_flittle_mcts_native_smoke` input in `.github/workflows/agent36-bilateral-competence-v9.yml` is a one-ply Store plumbing fixture only; it is not a substitute for the Agent5 fixed-policy validation lane and is not required to run first.
