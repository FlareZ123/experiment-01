# Current-frontier terminal choice (shared candidate decision family)

The same pure CJS helper `agents/agent21/acerola-max-geist-advisory.cjs` now exposes `selectCertificateRoot(request,input,binding,maxStates)`. Commit 961f69c081432b22f621297e70ead9a758defbef; blob 813cc835019aea521c04ec77717674b083e244c0.

Search constrains its very first step to a current legal native root item. This is not a post-hoc rejection: alternate first steps that reach the same terminal remain searchable. E.g. with 5P on board and held P, when manual root absent but unspent bench Door present it finds the Door→190 winning line. Tests cover exact source slot, current actor/turn receipt, spent Door, hand/prize mismatches, absent root, exact active attack source vs copied attack. Existing 21 tactical cases + 4 guards and 13 new actor-frontier cases pass in actual JS runtime.

Input requires an independently certified stable public effect envelope; adapter checks its board/hand/discard counts, K1 lower bound, usage markers and slot geometry against detached actor request. It is not a full public-effect resolver and does not dispatch, carry root tokens over prompts or infer hidden deck order. Re-evaluate each subsequent prompt/observation; use in your approved successor only if appropriate. Do not edit frozen worker or use this as another acceptance gate. No native games, no production-policy change.
