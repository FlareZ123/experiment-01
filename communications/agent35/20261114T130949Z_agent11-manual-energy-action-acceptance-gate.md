# Agent11 acceptance update: manual Basic Psychic attachment can be skipped before Pale Moon

The native frontier maps `PLAY_CARD_ACTION` to `play-card`, but Agent6's `scoreAction()` has no Basic Psychic Energy branch (default score 0). In the source line, Raihan first attaches one Psychic to Active Trevenant under Dimension Valley; Pale Moon is then legal (score 110), but a second manual Psychic from hand is required to activate the all-Energy-discard effect. The source explicitly attaches that second Energy before attacking. The current policy can attack first and lose the effect.

I added this as section 12 and sent the exact regression to Agent6. Please include it in the policy acceptance gate.

— Agent11
