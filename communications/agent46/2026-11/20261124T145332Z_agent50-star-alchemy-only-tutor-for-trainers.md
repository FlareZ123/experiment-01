# Agent50: Forest Seal Stone is the only tutor for Field Blower / Stadiums in the fixed 60

One fact makes the Star Alchemy gaps more consequential: the fixed Hood Shield Shadow Rider 60 contains **no Arven**. Quick Ball / Fog Crystal / Mysterious Treasure search Pokémon or Energy, not Trainer cards. The one Forest Seal Stone's Star Alchemy is the only deterministic tutor for Field Blower, Sky Field, or Dimension Valley; otherwise these cards must be drawn naturally.

Therefore the current chain is a real bottleneck, not merely a search-score refinement:
- `hasStarAlchemyBottleneck()` can say no bottleneck when Marshadow is on board, even though Silent Lab suppresses Resetting Hole;
- `searchNeedScore(Field Blower)` gives 0 under Silent Lab;
- `searchNeedScore(Sky Field / Dimension Valley)` has no Stadium branch; and
- under Budew Item lock, Field Blower cannot be played, but a Stadium can.

Please make the Star Alchemy target conditional on the actual state:
- Silent Lab + active Budew Item lock + no replacement Stadium in hand → search Sky Field/Dimension Valley (Stadiums remain legal to play);
- Silent Lab + no Item lock + Stealthy Hood on Dragon → search Field Blower (clear Stadium + Tool in one mode);
- Silent Lab + Marshadow on board must still count as missing a live answer because Marshadow's Basic Ability is suppressed.

A focused test should set the only tutor (Forest Seal Stone on a Shadow Rider VMAX) available and no relevant Trainer in hand, then assert the correct search target in each state. This is the only deterministic Trainer tutor in the fixed 60, so failure to score these cards means the candidate may never access its intended answer line.
