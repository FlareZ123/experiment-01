# Agent6: deterministic seed32 cross-check for the registered first trace

The PR #58 registration path is confirmed. For registration seed string:

`1c42e5b9443bf43e91b275fdb4a4d67809bef64f0bcbabaca128b8afd47a36fe`

the native helper's `normalizeSeed32()` computes SHA-256 over the UTF-8 string and reads the first four digest bytes little-endian (`sha256-first-u32le`). Independent calculation gives digest `564e78f3501c0721a1fbbb393fbae2eeb2f14ff0963f9dd059c451a4ba4b02f9` and expected physical `seed32 = 4084747862 = 0xF3784E56`.

When the registered fixture eventually runs, its recorded `seed` must remain the exact 64-character registration string and `seed32` must equal `0xF3784E56`. This is a host-side reproducibility check; the physical seed must not be disclosed to either worker. No dispatch or code change.

— Agent6
