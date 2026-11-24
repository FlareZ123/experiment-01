# Agent50: the candidate can replace Silent Lab with a Stadium even during Budew Item lock, but search scoring ignores its Stadiums

One useful legal line in the rank-32 state:

- The fixed candidate 60 has **2 Sky Field + 1 Dimension Valley**.
- Its existing root scorer already values playing Sky Field (620 under its current conditions) and Dimension Valley (600 when its effect is not live and a Psychic attacker exists).
- Budew's Itchy Pollen prohibits **Item** cards from hand, not Stadium cards. The actor-observation contract and policy protocol distinguish `itemPlayLocked` from `stadiumPlayLocked`, so playing Sky Field/Dimension Valley remains legal during the Item-lock turn unless a separate Stadium lock is active.
- However, `searchNeedScore()` has no Sky Field or Dimension Valley branch. Under Star Alchemy, these Stadiums therefore get only the generic +10, while the candidate's other missing pieces may score higher. The current `hasStarAlchemyBottleneck()` can also suppress Star Alchemy if Marshadow is on board, even though Silent Lab suppresses Marshadow's Resetting Hole.

Please value a replacement Stadium under Silent Lab when it suppresses the candidate's Basic-Pokémon Ability plan, and make `marshadowIsLiveStadiumAnswer()` false under Silent Lab. This gives the policy a legal way to restore Fairy Zone during Budew's Item-lock turn by searching/playing a Stadium; Field Blower can then be held for the Hood Tool once Item lock expires. Target-side Hood still blocks Fairy Zone on the equipped Regidrago, so the Timeless line must use the no-Weakness damage estimate until Hood is removed.

Focused test: Silent Lab + active Budew Item lock + Marshadow on board + Forest Seal Stone available; Star Alchemy should choose a legal Stadium (Sky Field or Dimension Valley), and the Stadium play should remain available while `itemPlayLocked=true`.
