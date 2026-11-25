# Agent2 — exact-head Budew/Ranger policy gap in PR #69

I extended the field-cost audit with a source-level check of the current candidate worker. This is a new blocker beyond the decklist comparison; no code/test change is authorized or made.

At branch `agent46/candidate-policy-competence-20261124`, exact head `e7c4d9032fbb0ee162028d744f2bab1debd7a52e` (worker blob `6688bbcc3969088af7eab5b30f36cb72879a4e88`, test blob `3d6cf4f71bd3ce56aab4a9720f93aa9b94ac3b63`):

- `supporterNeedScore()` returns only 5 for Pokémon Ranger; its call sites are Wonder Tag / Star Alchemy search scoring, not root play.
- `scoreTrainerPlay()` has no Ranger branch and falls through to `-Infinity`. `chooseRoot()` selects only finite root-play scores, so a Ranger play-card action cannot be selected.
- `scoreTrainerPlay()` also has no VS Seeker branch; `searchNeedScore()` only values VS Seeker when discard contains Guzma/Raihan/Acerola/Lillie, not Ranger. The policy cannot execute the theoretical Ranger → VS Seeker → Ranger recycle line either.
- The exact test blob has no Budew, Itchy Pollen, Ranger or Ranger-recovery coverage.

This matters because the 29 published Aichi source lists contain Budew in 14/29 (19 copies): all 9 published Regidrago lists, 3/4 Garbodor and both Vileplume. Itchy Pollen is zero-cost and repeatedly imposes Item lock if Budew remains Active. Hood Shield has one Ranger and two VS Seeker; Lockbridge has zero Ranger. Wobbuffet suppresses Abilities, not attack effects; Temple only changes Special Energy.

Suggested bounded acceptance case for a future authorized edit:
1. expose/consume only a trustworthy actor-visible active attack-effect Item restriction (do not infer hidden history);
2. under Itchy Pollen, choose Ranger over Arven/draw Supporters when the unlocked Item actions are materially needed;
3. after Ranger clears the lock, allow VS Seeker to retrieve Ranger; test the repeated Budew attack on the next turn;
4. without an active attack-effect lock, do not burn Ranger/VS Seeker merely because they are in hand/discard;
5. include an ability-lock control (e.g. Vileplume/Garbotoxin) to ensure Supporter/Item distinctions remain correct.

If the current actor view lacks the needed public restriction state, that is a projection dependency and needs explicit scope; do not widen the patch by guessing. Keep the branch frozen until owner/Critic authorization. No fixture/game dispatch is authorized.

Full source census, exact card texts, candidate comparison, VS Seeker sequencing and policy analysis: [Agent2 report](../../results/aichi-2026/2026-11/agent2-lockbridge-budew-ranger-field-cost-20261125.md). The decision board has been updated.
