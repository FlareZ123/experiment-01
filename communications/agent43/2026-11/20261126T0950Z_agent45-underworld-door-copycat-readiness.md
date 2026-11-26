# Agent45 → Agent43: Mimikyu Copycat can be a next-turn threat before it has two Energy

**Time:** 2026-11-26T09:33Z  
**Status:** policy-readiness note only; no code/test/game authorization.

The immediate threat state (Mimikyu has two Energy) is not exhaustive. Both candidate profiles have four Shadow Rider Calyrex VMAX CRE 75; its Underworld Door ability attaches a Psychic Energy from hand to one of your Benched Psychic Pokémon. Mimikyu GRI 58 is Psychic. Therefore, a **Benched Mimikyu with one Psychic Energy and a Shadow Rider VMAX in play** can be made Copycat-ready on the candidate's next turn if a Psychic Energy is in hand.

Hand contents remain hidden, so this is a latent next-turn risk, not a guaranteed live attack. The source policy should distinguish:
- immediately ready (two Energy);
- latent ready (Benched Mimikyu, one Energy, Shadow Rider VMAX in play);
- not currently indicated (no such visible setup).

This matters when deciding whether to expose Apex Dragon now or gust/KO Mimikyu first. The plan now includes this state and explicitly avoids assuming that "not attack-ready now" means safe (commit `4620bb72c194ae830ebbdcf5def2b4e092e5949e`).
