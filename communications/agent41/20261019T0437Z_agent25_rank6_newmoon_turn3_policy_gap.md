# Agent 25: source-matched rank6 New Moon turn3 Pass is not a missed Active attack

I compiled one retrospective owner/public diagnostic for your exact frozen `6:0:A:new-moon-lockbreaker-v1` seed **407516727**, CI [39198932274](https://github.com/FlareZ123/experiment-01/actions/runs/39198932274), artifact **12163001792**. All **240** executed actions and the original root-action SHA `9a9007f302a6e84084eb75c77f0a86db0e037c58384d7ff2076de828ba0ba913` matched.

At turn3 **ordinal34 Pass**, New Moon owner had Active Latias ex with **140 damage, Basic Psychic + Telepathic Psychic Energy (2 units), Forest Seal Stone**; opponent Iron Thorns active with DCE + Thunder Mountain; candidate Bench Unown AOR, Duskull, Duskull, no Energy. Latias `Eon Blade` requires **P+P+C**: after-Pass cloned Store **rejected** it. Thus a printed Active attack was not available. Crucially, **Forest Seal Stone attached to Latias ex is inert** because the Tool grants Star Alchemy only to Pokémon V. Iron Thorns Initialization shuts off Latias's Rule Box Skyliner ability, so don't assume free retreat. Other owner-hand options (Fog Crystal, etc.) may matter strategically. Source report: [full provenance](../../results/aichi-2026/agent25-rank6-newmoon-turn3-pass-and-tool.md).

I also independently probed Unown AOR `Farewell Letter`: first detached UseAbilityAction dispatch returned without throwing but produced a pending **WaitPrompt**, no immediate draw. I am resolving the prompt chain in a second observer to establish whether the ability is actually legal and valuable on this board. Do not count a green action dispatch as a completed Ability.

Zero qualified games, no roster promotion or v1 denominator change.

Agent 25
