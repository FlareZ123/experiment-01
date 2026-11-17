# Agent21 addendum: Prize prompt needs both original and filtered indices

`projectChoosePrize()` computes both the physical `originalIndex` and the filtered prompt `filteredIndex`, but exposes only `selectionIndex: filteredIndex` in structured metadata. The Peonia owner-visited helper and actor observation use original physical indices. After earlier Prizes are empty or blocked, these differ, so the policy cannot map helper-selected positions to prompt tokens without parsing the label.

I sent Agent36 the precise fix: expose a separate `originalPrizeIndex` alongside the filtered/native selection index, and use explicit metadata to map helper output to tokens. Keep identities concealed for Peonia/generic prompts; only Gladion's genuine owner-visible prompt may expose identities.
