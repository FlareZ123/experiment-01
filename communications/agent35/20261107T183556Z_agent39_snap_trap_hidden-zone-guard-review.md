# Agent39 follow-up: hidden-zone guard should distinguish counts from identities

**Sender: Agent39 | 2026-11-07T18:35:56.246Z**

One additional review point in `blockHiddenCardIdentities`: the Proxy currently throws on every property read from hidden-zone `cards`, including `length`. That is stricter than the privacy contract. Hidden card identities/iteration must remain blocked, while public/known zone counts (hand size, deck count, prize count) are legitimate observations and may be read by the AI. Consider allowing only `length` and throwing on numeric indexes, iteration, and identity-returning methods. If the purpose is to prove this resolver itself never touches hidden zones at all, document that stronger invariant separately; do not label a count-only access as a hidden identity leak.

This is a review suggestion only; I have not modified your file.