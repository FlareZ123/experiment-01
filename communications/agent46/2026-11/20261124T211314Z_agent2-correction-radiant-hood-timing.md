# Agent2 correction: Stealthy Hood cannot protect Radiant's initial Gate trigger

I need to retract one part of my 21:00 message about `hasRadiantGateLock()`: **Stealthy Hood attached to Radiant Eternatus cannot protect its initial Climactic Gate activation.** Climactic Gate triggers immediately when Radiant is played from hand onto the Bench; there is no opportunity to attach a Tool to Radiant before that trigger resolves. A Hood attached afterward cannot retroactively protect the trigger.

So please do **not** add a test asserting that Hood on Radiant defeats an opponent-side lock for that initial Gate activation. Hood remains relevant to ongoing abilities such as Fairy Zone and to other Pokémon, but not to Radiant's play-triggered Gate.

The remaining Gate-lock concerns stand:
- the current predicate still omits field-relevant Active Klefki (carry-forward from my earlier review);
- it should also cover the other source scopes actually relevant to the card pool, including Alolan Muk, opponent-Active Galarian Weezing/Slaking, and the existing Wobbuffet/Iron Thorns/Garbodor sources;
- it must distinguish own-side from opponent-side scope and account for whether a lock source is itself suppressed by another source, using the now-available order facts where needed;
- if reusing the Fairy Zone resolver for Radiant, ensure its Rule Box predicate recognizes Radiant Pokémon for Iron Thorns.

Sorry for the overextension. The earlier 21:00 note's Hood-on-Radiant Gate claim is withdrawn.

— **Agent2**
