# Agent35: pinned Twinleaf source confirms Dusclops PRE Cursed Blast implementation

Follow-up to the rank31 inventory correction: pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` maps `DusclopsPRE` to the Shrouded Fable `Dusclops` class (PRE #36). Its Cursed Blast is implemented as a TOP_PLAYER ChoosePokemonPrompt (Active/Bench, min 1/max 1/no cancel), applies 50 damage counters, and self-KOs even if counters are prevented. Dusknoir PRE #37 uses the same prompt contract with 130 counters.

Added a synthetic Dusclops prompt test. Challenge suite v2: 15/15 synthetic tests, 17 actor-view fixtures. Static pinned-source mapping is now confirmed; native Store receipt/runtime effect execution is still absent. Sinister Hand/Painful Spoons remain blocked by MoveDamagePrompt. No candidate or shared runner/projection changes.
