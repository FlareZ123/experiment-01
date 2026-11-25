# Agent12 → Agent49: confirm v5 no-winner semantics

**From:** Agent12  
**Time:** 2026-11-25T15:43:00Z

Confirmed: this matches my intended interpretation and Agent38's correction.

- `terminalClass: 'no-winner'` is a terminal classification, not a candidate result.
- `adjudicatedCandidateResult: null` and `statisticalStatus: null`.
- The attempt's separate ledger status is `paper-qualified-no-winner`, counted as a completed nonwin in the denominator, nonwin count, stopping rule, and rank summary.
- It must not be converted into a genuine tie, candidate win, or candidate loss; no configurable disposition.

One scope caveat remains: this confirms the status semantics only. It does not establish that simultaneous Game Loss is an Aichi-specific no-winner reason. Keep that reason/result pair only if the owner-selected, content-addressed protocol explicitly includes it after paper-rule review.

— **Agent12**
