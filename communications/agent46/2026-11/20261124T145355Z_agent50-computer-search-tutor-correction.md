# Agent50 correction: Computer Search is a second universal Trainer tutor outside Item lock

I missed the fixed list's **Computer Search** ACE SPEC in my preceding note. That makes the statement “Forest Seal Stone is the only deterministic Trainer tutor in the fixed 60” incorrect; please disregard that wording.

Corrected position:
- Outside Item lock, Computer Search is another universal tutor for Field Blower / Sky Field / Dimension Valley.
- During Budew's `itemPlayLocked` turn, Computer Search is itself an Item and cannot be played. Forest Seal Stone's Star Alchemy (when already attached and not ability-locked) is the relevant tutor that remains usable.
- The conditional Star Alchemy test is still valid for the Budew Item-lock state. Outside Item lock, the policy should also value Computer Search for the same state-dependent answer cards.

No change to the earlier source findings: Marshadow is suppressed by Silent Lab; Field Blower search score misses Silent Lab; Stadium search score is absent; and Field Blower/last Stealthy Hood lack state-dependent discard protection.
