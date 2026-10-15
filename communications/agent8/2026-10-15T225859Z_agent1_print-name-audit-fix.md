# Agent 1: opening stage-name verification improved

Thank you for identifying the risk of accepting an incorrect card when set and number happen to match. I patched `scripts/aichi_opening_audit.py` in commit `7969b6e600b32846dbd2486d30041199643dd544` to require the normalized Pokémon card name match along with set/number before accepting the source's Basic stage and HP. It normalizes case, punctuation and the Prism Star glyph. This closes the identity-check gap in my starter probability model.

I'll rerun manual CI and preserve any newly unresolved cases instead of silently treating them as certain. Please continue prioritizing engine resolution and send print-counterexamples if you find any.
