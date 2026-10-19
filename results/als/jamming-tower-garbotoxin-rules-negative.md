# Jamming Tower does not turn off Garbotoxin

**Agent 1, 19 October 2026. Evidence: printed card text and Japanese official FAQ; no Store test or win rate.**

Jamming Tower makes attached Pokémon Tools have no *effect*, while leaving the Tool card attached. Garbodor BKP 57's Garbotoxin needs **a Pokémon Tool attached**, independent of that Tool's text. Consequently Jamming Tower by itself does not break established Garbotoxin. This is a rules-level counterexample to any proposed tech that conflates attached-card existence with active Tool text.

Sources: [Pokémon official Jamming Tower wording](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/sv06/153), [Japanese official FAQ confirming cards still count as Tool-attached under Jamming Tower](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%B8%E3%83%A3%E3%83%9F%E3%83%B3%E3%82%B0%E3%82%BF%E3%83%AF%E3%83%BC&regulation_faq_main_item1=all), and the provided Advanced Player's Rulebook D-13.

Jamming Tower can negate Stealthy Hood's protective text. It also suppresses our own Powerglass/Forest Seal Stone text. Its net value against the published rank8/11/16/22 Garbodor and rank2/15 Vileplume matchups needs separately tested sequences, and should not be credited as Tool removal.


## Pinned live Store regression (19 October 2026)

[Manual cross-lock CI run 39201724596](https://github.com/FlareZ123/experiment-01/actions/runs/39201724596), source head `dcb22a5684407633c820e50d2064554752461a03`, **passed** the new `Jamming Tower against Tool-attached Garbotoxin` step and the existing cross-lock workflow. The isolated [eight-case action fixture](../../simulation/twinleaf/jamming-tower-garbotoxin-action.cjs) exercises both engine player seats, with and without a Float Stone physically attached to Garbodor BKP, and with or without an actual `PlayCardAction` placing Jamming Tower TWM. Every case asserts:

- The actual Tower play is accepted and appears in the Stadium zone when requested.
- The Float Stone remains physically attached whenever the case provided one.
- Shadow Rider Calyrex VMAX's *Underworld Door* is visible when Garbodor has no Tool and suppressed when Garbodor has one, regardless of Tower.

All **8/8** scenarios completed without an assertion failure. This validates the targeted interaction in pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, consistent with the official Japanese attachment ruling. It is a **synthetically staged midgame board** and reports zero competitively qualified games, no actual source setup or opponent policy, and no deck strength.

The preceding [run 39201546703](https://github.com/FlareZ123/experiment-01/actions/runs/39201546703) failed before reaching the interaction because the pinned simulator did not resolve an incidental `Mega Absol ex MEG` fixture printing. The reproducible passing case uses supported neutral Active `Bunnelby PRC`. That initial error is not evidence about Tower/Garbotoxin semantics.

**Deck-selection implication:** Jamming Tower alone fails the essential counter-lock test against equipped Garbodor. Counter-Tools, the retained enemy Tool's Float Stone effect, potential Hood disruption and Stadium contention still warrant separate, state-specific valuation. This fixture supports rejecting a claimed standalone Garbotoxin-breaking rationale; it does not rank whole-deck candidate techs.
