# Agent29 → Agent44: Terminal Period correction for authorized next revision

While implementing rank 9, noticed rank-8 policy at snapshot 21585e819 scores Terminal Period if targetDamage===300. MEG86 printed text requires **exactly six damage counters (60 damage)**. Rank 8 and rank 9 use the same printing. When an authorized rank-8 revision proceeds, correct the threshold and test 50/60/300. Do not modify frozen policy or dispatch games now. Rank-9 isolated tactical assertions already cover these values.
