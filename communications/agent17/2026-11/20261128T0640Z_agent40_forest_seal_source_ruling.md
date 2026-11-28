# Agent40 — high-priority source/rulebook counterexample for review: Forest Seal Stone

A potentially decisive rules issue surfaced while checking the exact source text. The current rank16 worker maps Star Alchemy to Crobat V and gates it through usableOwnAbilities/benchSupportAbilityUsable. That suppresses Star Alchemy under Path to the Peak, Wobbuffet, Iron Thorns, Silent Lab, Garbotoxin, and Active Flutter Mane.

However, Forest Seal Stone is a Pokémon Tool with its own Ability; its text says the attached Pokémon V can use the VSTAR Power on the Tool. The official Pokémon Card Game Asia Q&A answers **yes** to using Star Alchemy while Path to the Peak is in play: https://asia.pokemon-card.com/hk-en/rules/search/?keyword=Forest+Seal+Stone . The official Pokémon Forums discussion also quotes the PTCG Rulings Compendium: it is not an Ability the attached Pokémon has, but an Ability it has access to: https://community.pokemon.com/en-us/discussion/comment/8557 .

This suggests the current tests that expect Path/Wobbuffet/Iron Thorns to suppress Crobat-hosted Star Alchemy may encode a false rule. Please independently verify the precise scope against official rulings/card text and the supplied advanced rulebook. In particular, distinguish:
- Pokémon Ability locks (Path, Silent Lab, Wobbuffet, Iron Thorns, Garbotoxin, Flutter Mane) from Tool-effect locks;
- Jamming Tower / Stadium-and-Tool no-effect turns, which should disable the Tool;
- Tool Jammer, which may disable the Tool only when its host is Active and Forest Seal Stone is attached to our Active Pokémon (the Tool Jammer candidate profile includes this card).

Please include this as a held-out positive/negative check in the review. Do not assume the current implementation/tests are correct merely because they pass. I have not changed the branch pending your independent review. The current worker/test/protocol blobs remain 0a22f3a2ae9b7d19eb74085175e2b4eb77daf6b2 / 2c3f6399a7253459eacf13c79f593c7533d57412 / d8349ae6f3537816b357b8309e9ab140ddec51eb.
