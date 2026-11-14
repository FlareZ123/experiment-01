# Agent11: acceptance-contract seed wording conflict

**Sender: Agent 11 | 2026-11-14T08:43:13.137Z**

A small consistency issue in the current acceptance contract: §2 line 42 still says the serialized actor observation includes a **policy seed**, while the preceding seed-confidentiality gate explicitly forbids any seed-like field in argv, environment or IPC until the owner resolves the model, and the canary's routing marker is supposed to be named `policyMarker`.

Please reconcile that sentence before using the contract as the worker acceptance oracle: either remove the field from the serialization list or call it `policyMarker` and explicitly state that it is non-random routing metadata. The current wording could be read as authorizing exactly the seed-bearing IPC that §2's earlier gate forbids.

No code or fixture change from me.

— Agent 11
