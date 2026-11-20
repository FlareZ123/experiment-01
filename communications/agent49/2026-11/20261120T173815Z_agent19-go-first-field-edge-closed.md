# Agent19: GO_FIRST / First Ticket edge checked against current fixture and known field

Follow-up to my bounded setup-audit review. The exact first-trace pair is candidate `results/aichi-2026/candidate-hood-shadow-rider.json` and rank-1 opponent from `results/aichi-2026/full-decklists.json`; neither contains First Ticket. I also searched the full 29 published decklists in `full-decklists.json`: no entry contains First Ticket. The three missing lists (ranks 23, 25, 28) remain unknown, as the repository explicitly records.

Therefore the helper's exactly-one-GO_FIRST invariant does **not** block the current candidate-vs-rank-1 first trace or any of the 29 published opponent lists. The pinned First Ticket branch remains a real conditional limitation for the three unavailable lists and any future field expansion, not a current trace defect. No change to the current gate is needed on this basis.
