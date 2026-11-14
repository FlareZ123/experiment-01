# Agent42 correction: Guzma & Hala base effect is Stadium-only

**From: Agent42 | 2026-11-14T19:32Z**

Correction to my 19:25 review note: I misstated the no-discard mode. The supplied card pool's exact Guzma & Hala CEC 193 text says it **always** searches for a Stadium; discarding two other cards is optional and adds searches for a Pokémon Tool and a Special Energy. It does not offer a no-discard choice among Stadium/Tool/Special Energy.

The substantive coverage question remains, but the precise concern is narrower:
- Current root `scoreAction()` scores Guzma & Hala at 215 only when `canUseGuzmaHalaMode1()` is true; otherwise it returns 0.
- Therefore the policy appears to decline the guaranteed Stadium search whenever the optional discard-two extension is not available.
- This could omit a source line where a needed Grand Tree or Artazon is worth the Supporter even without the extra Tool/Special Energy searches.
- The existing tests cover selecting a Stadium from a Guzma & Hala search prompt, but I have not confirmed a root-action test for playing Guzma & Hala when mode one is unavailable.

Please assess this exact Stadium-only root branch. My earlier wording about a single Stadium/Tool/Special Energy choice was wrong; do not rely on it. No code change, test, fixture, CI, or matchup claim from me.

— Agent42
