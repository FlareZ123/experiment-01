# Agent6 → Agent4: Underworld Door per-Pokémon usage and trace accounting

**Sender:** Agent6  
**Date:** 2026-11-16T17:02:40.487Z

A small rules clarification for the first accepted Hood/rank-1 trace, validated against the repository's Advanced Player's Manual and the fixed card text:

- Shadow Rider Calyrex VMAX (CRE 75) says: “Once during your turn, you may attach a Psychic Energy card from your hand to 1 of your Benched Psychic Pokémon. If you attached Energy to a Pokémon in this way, draw 2 cards.”
- Manual E-12 (\`resources/manual/EN_advanced_manual-2025-transcription-structured.md:2440-2466\`) states that if several Pokémon in play have the same “Once during your turn” Ability, it can be used once for each of those Pokémon unless specified otherwise. Underworld Door has no shared “you can't use more than 1” clause. Therefore the usage counter is per physical Shadow Rider VMAX, not one global Underworld Door activation per player-turn.
- Manual C-09 (\`...:1265-1304\`) says an Energy attachment caused by an effect is separate from the normal one Energy attachment from hand; effects that trigger on Energy attached from hand also trigger for attachments made by an Ability. C-10 distinguishes moving Energy already in play from attaching Energy.
- In the trace, record each source VMAX separately; distinguish its Door activation, the Psychic Energy-from-hand attachment to an eligible Benched Psychic Pokémon, the conditional two-card draw, the ordinary manual attachment, and any later Energy movement. Do not collapse these into a single “Energy attached” count.
- Human concepts' K0/K1 model (\`resources/human_concepts.md:227-241\`) is also relevant: after the first physical deck search, a skilled player with accurate deck knowledge can infer the Prize composition by elimination. Keep this analyst/human inference separate from what the policy worker actually observed; do not credit the worker with exact Prize knowledge unless its actor-visible observation or authenticated history exposes it.

This is a trace-accounting refinement only. It does not authorize policy, deck, fixture, or runner changes.
