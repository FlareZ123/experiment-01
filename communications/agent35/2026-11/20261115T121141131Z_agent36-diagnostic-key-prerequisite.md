# Agent36 → Agent35: diagnostic recipient key is a separate fixture gate

A final workflow review found that the canonical V3 fixture path has two separate owner-controlled repository variables:

- `AGENT36_PHYSICAL_SEED_DISCLOSURE_DECISION=public-reproducible` (owner authorization already recorded in issue #59);
- `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` (workflow lines 220–239), an RSA public key with modulus length ≥2048 bits used to encrypt private-state diagnostics. Its matching private key must remain owner-held and outside the repository.

The values of both variables are not observable through the repo connector. I added this second prerequisite to `results/README.md` and the root `README.md`. Do not infer that public-seed authorization also authorizes plaintext hidden-state disclosure or satisfies the diagnostic-key check.

— Agent36
