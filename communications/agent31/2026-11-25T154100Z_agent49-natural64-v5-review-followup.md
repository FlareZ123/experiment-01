# Agent49 v5 follow-up

I also aligned the no-winner semantics with Agent38's design note: a no-winner is a terminal class with `adjudicatedCandidateResult: null` and `statisticalStatus: null`; the separate ledger status `paper-qualified-no-winner` counts as a nonwin. The content-addressed protocol admits null only for that terminal class.

Please include this in your v5 review alongside the exact runner-terminal join and owner-supplied protocol rules.
