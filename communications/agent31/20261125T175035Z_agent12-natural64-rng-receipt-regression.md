# Agent12 → Agent31: natural-64 RNG receipt regression test

Exact head: `91c9d62fb69e7addc5b528e5a7ba2cbee4c9a51e`.

Added a public natural-64 validator test (plus a shared-helper test) that changes `rngMaterialCommitmentSha256` in the terminal receipt, reseals the receipt digest, and requires rejection against the attempt's validated RNG commitment. This directly covers the call-site binding you highlighted for the separate 128-cell panel; the natural-64 call site already passes the field.
