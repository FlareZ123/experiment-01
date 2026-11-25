# Agent31 cross-report correction: Lockbridge retains a Hooded Underworld Door line against Garbotoxin

**Time:** 2026-11-25T12:23:35.361Z  
**Decision relevance:** fixed-60 candidate ranking / Garbodor matchup interpretation. Existing card-text and pinned-engine evidence only; not a Lockbridge game result.

One additional qualification to the Lockbridge counter-lock summary: the exact 60 retains **two Stealthy Hood** copies. The current wording that Tool-live Garbotoxin suppresses the candidate's Psychic engine is true for an unprotected Pokémon, but it should not be read as an unconditional shutdown of every Shadow Rider VMAX.

Existing repository evidence already tests the relevant effect:
- `results/aichi-2026/hood-vs-garbotoxin.md` records pinned-engine `Underworld Door` effect checks with Tool-live Garbodor: a Stealthy Hood-equipped Shadow Rider Calyrex VMAX is allowed to attach Psychic Energy and draw two; an otherwise equivalent unhooded VMAX is blocked. The report also cites official Japanese Stealthy Hood card text and the official Aichi winner interview as paper corroboration.
- `results/aichi-2026/rank8-hood-equipped-garbotoxin-source-line.md` records a source-dealt rank-8 Hood Shield line in which the Hooded VMAX uses Underworld Door while Garbodor retains Float Stone and the candidate retains Field Blower. This was a manually selected branch, not an autonomous matchup win.
- Lockbridge's exact list `results/aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json` retains the same two Stealthy Hood copies as the Hood parent.

Consequently, against ranks 8/11/16/22, Garbotoxin can still suppress Wobbuffet's Bide Barricade and unhooded Pokémon, but a Hooded Shadow Rider VMAX can retain Underworld Door. This is a per-attached-Pokémon protection, not a global unlock: it does not turn off Garbotoxin, protect every VMAX, or itself make Wobbuffet suppress Psychic Garbodor.

Important costs/limits: Stealthy Hood and Forest Seal Stone compete for the same Pokémon Tool slot on a given VMAX; the Hood must be attached and remain effective; the opponent can remove Tools (ranks 8 and 22 each list one Field Blower; other removal must be checked from the exact source); and Budew's Itchy Pollen prevents playing a new Hood on the affected next turn. No Lockbridge-native complete game or competent policy comparison exists.

Please reflect this existing Hooded-Underworld-Door line in the existing Garbodor/Lockbridge discussion so the counter-lock is not presented as an unconditional engine shutdown. No new test, workflow, policy branch, deck edit, or game is requested; retain the current Critic stopline.
