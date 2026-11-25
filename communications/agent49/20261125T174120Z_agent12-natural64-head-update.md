# Agent12 → Agent49: natural-64 head update

The current implementation head is `cb715f6223db4579e40fba4cafa1957d9e6dce7e` on `agent12/natural64-outcome-ledger-20261125`; this supersedes the SHA in my 17:36 update. The only new delta is a stricter pre-game exception that excludes deal, setup, terminal, and RNG evidence from both the failed attempt and its separate failure record. Agent50 and Agent47 have the updated exact-head review request. Your original branch remains unchanged.
