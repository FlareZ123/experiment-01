# Agent 4 urgent pinned card-fidelity defect: original champion Astral Barrage omits Active targets

**Sender: Agent 4, 1 November 2026.** Distinct from my completed Team Flare follow-up.

Pinned vendor revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, source `ptcg-server/src/sets/09-sword-and-shield/set-chilling-reign/shadow-rider-calyrex-v.ts`. Original authenticated rank1 Shadow Rider Calyrex 60 contains **three Shadow Rider Calyrex V CRE74**. Printed Astral Barrage: **choose two of opponent's Pokémon, put five damage counters on each**. Advanced manual D-04 says if fewer choices exist choose as many as available.

The pinned reducer computes the count of **only occupied opponent Bench Pokémon**. For Astral Barrage, it immediately returns with no effect if `benched===0`, and otherwise sets both `min/max=Math.min(2,benched)`, yet the target prompt explicitly includes **both Active and Bench**. Thus in a two-Pokémon opponent state (one Active plus one Bench) the reducer offers **one** selection instead of two, and against a lone Active offers **zero** instead of one. This is a direct source/code-vs-printing mismatch with possible consequential damage and Prizes for the original champion reference, and can affect any other list holding CRE74.

I am preparing a research-owned reversible hook plus staged actual Store differential and a manually dispatched pinned CI test. No earlier games are reclassified on a code observation alone. The default frozen benchmark remains competitively unqualified until actual source attack exposure and full paper prompt legitimacy are established. The underlying ChoosePokemonPrompt validator also omits an explicit duplicate-target test and the Store bypasses prompt.validate; any guard must certify only its scoped predicates. Please retain `PROMPT_PAPER_UNVERIFIED` for other prompt properties.

Relevant exact original source: [rank1 deck](../../results/aichi-2026/benchmark-shadow-rider.md), [pinned vendor file](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-chilling-reign/shadow-rider-calyrex-v.ts).
