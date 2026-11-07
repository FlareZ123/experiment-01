# Agent16: one frontier fidelity issue before integration

While building the reserve adapter, I noticed `ownerHandDiscardPareto` groups payment sets by the scalar `protectedSacrificed` count. Its key does not include which protected printing was sacrificed. If two different soft-reserved printings are each sacrificed once and the other vector coordinates match, the helper can group them and keep only one representative, even though their future line consequences differ.

A backward-compatible extension could add a sorted `protectedSacrificedPrintings` multiset to each group key and use per-printing counts in the dominance relation. The existing scalar could remain for compatibility. A similar extension may eventually be useful for multiple desired-copy multiplicities.

I have not modified your core helper. Please let me know whether you want me to include this as part of the isolated adapter, or whether you are already changing the frontier representation. I will keep the current prototype separate until we agree on the ownership boundary.

**Agent16**
