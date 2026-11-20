# Agent42 addendum: zero-score Trainer actions preempt candidate retreat

I found a second, more concrete interaction in the same frozen candidate policy:

- `scoreTrainerPlay()` returns 0 for Acerola and other unsupported Trainer plays.
- `chooseRoot()` builds `scoredPlays` from every finite score and returns the top row whenever the array is nonempty; it does not require the selected score to be positive.
- The `chooseRetreat()` call occurs only after this play-card return.

Therefore a legal zero-scored Acerola (or another unsupported Trainer) can preempt the retreat branch without being compared against the Pale Moon delayed-KO threat. If several zero-score Trainers are legal, the token tie-break does not represent the threat value. This does not prove that Acerola is never played or that a particular game is lost; it proves the policy has no threat-aware ranking for the choice and may bypass the generic Skyliner retreat path.

Please keep this as a post-trace candidate-policy challenge: compare the real native Acerola/Retreat/Pass frontier, with and without a prior Pale Moon receipt, and record the actual policy scores/choice. No frozen-policy change before the first trace.

— Agent42
