# Lockbridge vs rank 9: a sufficient endgame resource cut

Development-only analysis of the exact unchanged Lockbridge 60 against exact original rank 9. Not a game, not a full-policy claim, not a proof of reachability or field win rate. Tested pure certificate: 16 assertions.

## Mechanism

Temple of Sinnoh makes all Special Energy Colorless and removes other effects. Rank 9 has four Prism, one Telepathic Psychic, and precisely two basic Darkness. Once both basic Darkness are publicly in the Lost Zone, neither Mega Absol ex attack (DC / DDC), Sableye V attack (D / DD), Gengar & Mimikyu-GX (P / PP), Dedenne-GX, Voltorb, Electrode-GX nor Toedscruel's colored attacks can be paid. This is stronger than merely removing one Darkness: one still funds Sableye's Lode Search and can return a spent Stadium from discard. Two are needed for the persistent lock.

Rank 9's four Stadium copies are 2 Silent Lab, 1 Path to the Peak, 1 PokéStop. When all four are visibly in discard or Lost Zone and Temple is live, no remaining Rank 9 effect recovers a Stadium to hand except the now-unpayable Lode Search. VS Seeker recovers Supporters only; Rescue Carrier/Stretcher recover Pokémon; Heavy Ball selects Basic Pokémon. No hidden-hand assumption is needed once all four copies are publicly exhausted. No claim that this state is common or easy to reach. Girafarig's Get Lost can Lost Zone two **discarded** Darkness Energy, never remove attached/hidden ones. Before the cut, preserving even one Stadium out or basic Darkness access defeats the permanent-lock claim.

The remaining colorless-payable attacks are Unown Hidden Power (10), Toedscool Kick (20), Squawkabilly ex Motivate (20); one Muscle Band can add 20. No Darkness weakness applies to these attackers. Extra Energy Bomb remains possible if live but only attaches Colorless energy and gives candidate two Prizes. Horror House and paralysis attacks are unpayable. No Rank 9 listed defense prevents Max Geist damage.

## Sufficient candidate state (own post-draw decision)

- All own in-play Pokémon are Shadow Rider Calyrex VMAX, with an Active VMAX and no low-Prize Bench liability; each has no special condition or public attack restriction. Temple live, both opponent basic Darkness Lost Zoned, all four opponent Stadium copies visibly spent.
- At most N=3 candidate Prizes remaining. N=1/2/3 requires >=9/10/11 attached basic Psychic total respectively and >=3/4/5 on **each** VMAX (maximum N-1 Plumeria removals can focus on any gust target), remaining HP of each >40(N-1), and own deck >=0/2/5 cards respectively. The deck budget pessimistically allows opponent Iono after each KO then normal turn draw, even while also budgeting Plumeria despite one Supporter/turn. No need to assume any future attach, draw engine, hidden hand, or favorable gust.
- Every opposing listed Pokémon has <=280 HP and no Psychic resistance affecting this calculation; no unmodeled opposing Tool. Repeated Max Geist (10+30×Psychic Energy in play) gives at least 280 even after worst budgeted Plumeria, so each attack takes >=1 Prize or ends the game earlier. Opponent may force a switch but every VMAX remains funded, cannot use colored attackers, restore a Stadium, or inflict more than 40 per intervening attack under these conditions.

The certificate is deliberately conservative and sufficient, not necessary; the exact actor action frontier must still authorize Max Geist. No claim of a paper-rules proof for unmodeled prior-turn effects or a source other than exact Rank 9. N=3 with all 11 physical Psychic attached (one VMAX or two at 6+5) is a late, difficult state, not a recommended opening. It is a deterministic finish condition and a tactical test for candidate policy. Candidate should prioritize a direct win over spending a turn on Get Lost; Temple should not be wasted early while multiple opposing Stadium outs remain. The actual rank-9 pilot should preserve Darkness and Stadium outs when facing visible Girafarig/Temple, and not feed both Darkness to an accessible Get Lost in one turn.

## Evidence

Exact source list and card texts from provided card database. Pure JS function and tests in same branch, no native Store, CI or game. Candidate source: results/aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json. Rank-9 source unchanged full-decklists.json. This result does not alter either frozen candidate list or release scope.
