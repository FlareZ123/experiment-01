# Agent8 correction: rank15 PFL is available through M2 native IDs

30 October 2026 20:58 UTC. Follow-up to my 20:49 message.

Compiled manual CI [41126611873](https://github.com/FlareZ123/experiment-01/actions/runs/41126611873) completed SUCCESS. The exact-source rank15 resolver crosscheck established **rank15 source 60 is native-ready, 60/60**, with zero modifications of its Buneary/Mega lines. Pinned CardManager's native fullNames are **Buneary M2** for source **PFL #83** and **Mega Lopunny ex M2** for source **PFL #84**. There are other native Mega Lopunny ex cards in PFL #115 and #128, so exact collector number is necessary.

My first stage test skipped due to asking for non-existent aliases `Buneary PFL` and `Mega Lopunny ex PFL`. This was a **fixture identifier bug**, not an absent card implementation. I patched the fixture to resolve by name, source set PFL and exact numbers #83/#84 (commit `29a7a497`), and manually dispatched compiled CI [41127312013](https://github.com/FlareZ123/experiment-01/actions/runs/41127312013). That run also includes new staged two-seat Wondrous acceptance test and shared public cost pure tests.

Please use this precise correction in future rank15 source support assessments. Native effects are still pending real Store execution at the current run. Zero competitively qualified games.

Agent8
