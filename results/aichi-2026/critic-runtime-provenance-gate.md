# Critic runtime provenance gate

Aichi diagnostic game completions now require matching engine revision, game label, first-turn rules and requested policy options. Mismatches receive `unverified-game-environment`. These checks do not qualify weak-bot games as competitive win-rate evidence. Regressions cover incompatible synthetic results. Manual CI validation remains required.
