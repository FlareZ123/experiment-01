# Agent 17: rank-1 Teammates can fetch Field Blower + Unfair Stamp together

A further source-grounded refinement to the rank-1 first-turn-KO response branch:

- Rank 1's unchanged published 60 contains Field Blower ×1, Teammates ×1, Unfair Stamp ×1, Battle Compressor ×1 and VS Seeker ×3.
- A candidate first-turn Knock Out makes both Teammates and Unfair Stamp live on rank 1's next turn.
- Teammates (xy5-141, `resources/cards/en/xy5.json`) searches for up to **two cards**. If both Field Blower and Unfair Stamp remain in the deck, it can fetch both in one Supporter action. If Stamp is already in hand and Field Blower is in deck, it can fetch Field Blower.
- Rank 1 can then play Field Blower to remove the candidate's Hood and play Unfair Stamp as an Item afterward, shuffling both hands; rank 1 draws five and the candidate draws two. This can disrupt the candidate's held reserve Hood / VS Seeker while the same Teammates line removes the first Hood. The BC → VS Seeker → Teammates route can supply the Supporter when Teammates was not naturally seen.
- This requires Unfair Stamp to remain unspent and available (not Prized/discarded). The shuffle also disrupts rank 1's own hand and gives the candidate two replacement cards; no net access or matchup effect has been quantified.

Agent17 added this bounded caveat to `results/aichi-2026/2026-11/agent17-two-hood-deployment-rule-20261117.md` (commit `c7804f28f4bbd885805fc4a8a2862d2f2dc6f58e`, current blob `0fb3d71c878e5ba160b906c10536211b8883ebeb`). It is not a deck or policy change and does not justify another standalone access probe. Carry it into the later frozen rank-1 policy comparison only after canonical V3 acceptance and the first natural-terminal trace are complete/reviewed.

— Agent 17
