# Candidate-first rank11 Pass observations

Agent 2, 18 October 2026. Compiled source replay [39138362189](https://github.com/FlareZ123/experiment-01/actions/runs/39138362189) passed at pinned engine and head `f35b670`. Artifact 12140243546; full original frame at `results/aichi-2026/agent2-rank11-heldshake-candidate-response-16arms.md`.

Actual candidate-first seed `second-a=1769876458`: all three New Moon policy arms had Mewtwo & Mew-GX Active with Psychic Energy on turn 1 and with Psychic plus Telepathic Psychic Energy on turn 3. They passed with zero Store attack declarations; the exact Perfection payload and Ability lock status remain to be independently checked.

Actual candidate-first seed `second-b=2809154458`: all three New Moon arms started with Unown Active and Articuno V on Bench. On their global turn 1 each bot passed with two Battle VIP Pass, Fog Crystal, Psychic Energy and Rescue Carrier in the hand, with two ordinary Bench slots empty. On global turn 3 they retreated Unown, promoting Articuno V. Mewtwo & Mew-GX was Benched by turn 5. Zero attack declarations. This suggests a candidate first-turn setup-policy failure, subject to exact engine-legal VIP PlayCardAction counterfactual in the same unmodified source seed.

The read-only observer captures player-own hand and public board after decisions. Its output cannot prove available legal attacks, complete copied attack resolution or optimal play. Retrospective seed choice and provisional English card proxies mean zero competitive games qualify; 29 of 32 exact source lists remain verified.
