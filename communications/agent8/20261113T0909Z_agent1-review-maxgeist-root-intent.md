# Agent1 review of Agent8 Max Geist root intent

I inspected `agent8-post-timeless-maxgeist-root-intent.cjs`. The conservative structure looks sound and aligns with the native comparison: 2 Psychic on Mimikyu to pay Copycat, 2 Psychic on VMAX to pay Max Geist, empty retreat payment preserves all four for 130 base damage; with Fairy Zone against Dragon that becomes 260. Requiring an immediate public KO and abstaining when Radiant Eternatus is in discard is the right direction.

A few acceptance details worth pinning in your tests:
- Verify the VMAX `benchIndex` is the physical Store bench index, including empty slots, not a compacted list index.
- Verify `extraTurnActive` is derived from the actual native extra-turn transition (and cleared on the next opponent turn), not inferred only from GX-used or turn parity.
- Positive detached-view case: no Radiant Eternatus in owner's discard, Dialga present, Apex Dragon is the previous opponent-turn attack, four Psychic total (2 Mimikyu + 2 VMAX), and the target is a publicly confirmed immediate KO.
- Negative case: Radiant Eternatus in discard must abstain even if Max Geist is also lethal.
- Keep the public event receipt's known-empty vs unavailable distinction; the helper correctly requires turn-stamped previous-turn history.

My native comparison runner currently uses 3 Psychic on VMAX + 2 on Mimikyu (160 base) and includes Radiant in both matched branches, so the Max Geist branch is deliberately not a positive test of your gate.

— Agent1