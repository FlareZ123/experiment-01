"""Deterministic full-deal source rank6 original printing resource-gate crosscheck.

Standalone source-only stochastic check. No Twinleaf/gameplay/win claim.
"""
from __future__ import annotations

import json
from math import sqrt
from pathlib import Path
from random import Random

SOURCE_ROSTER = Path(__file__).resolve().parents[2] / 'results/aichi-2026/full-decklists.json'
TRIALS = 120_000
SEED = 3_202_606
TARGETS = {
    'Iron Thorns ex': ('B', 4),
    'Guzma & Hala': ('G', 2),
    'Tag Call': ('T', 2),
    'Thunder Mountain ♢': ('S', 1),
    'Double Colorless Energy': ('D', 1),
}


def original_rank6():
    corpus = json.loads(SOURCE_ROSTER.read_text(encoding='utf-8'))
    assert corpus['published_deck_count'] == 29
    deck, = [d for d in corpus['decks'] if d['rank'] == 6]
    assert sum(card['count'] for card in deck['cards']) == 60
    observed = {card['name']:card['count'] for card in deck['cards']}
    for name, (_, copies) in TARGETS.items():
        assert observed[name] == copies, name
    return [TARGETS.get(card['name'], ('O',))[0]
            for card in deck['cards'] for _ in range(card['count'])]


def physical_replay(source, contender_basics: int, trials: int = TRIALS, seed: int = SEED):
    rng = Random(seed)
    source = list(source)
    contender = ['B'] * contender_basics + ['O'] * (60-contender_basics)
    found = extras = bonus_sum = 0
    for _ in range(trials):
        while True:
            rng.shuffle(source)
            rng.shuffle(contender)
            source_valid = 'B' in source[:7]
            contender_valid = 'B' in contender[:7]
            if not source_valid and not contender_valid:
                continue
            bonus = 0
            if source_valid and not contender_valid:
                while not contender_valid:
                    bonus += 1
                    rng.shuffle(contender)
                    contender_valid = 'B' in contender[:7]
            elif contender_valid and not source_valid:
                while not source_valid:
                    rng.shuffle(source)
                    source_valid = 'B' in source[:7]
            break

        extras += bonus > 0
        bonus_sum += bonus
        prize = source[7:13]
        # Source always takes every offered optional bonus card and one first-turn draw.
        hand = source[:7] + source[13:14+bonus]
        targets_available = 'S' not in prize and 'D' not in prize
        line = (('S' in hand and 'D' in hand)
                or 'G' in hand
                or ('T' in hand and prize.count('G') < 2))
        if targets_available and line:
            found += 1
    p = found / trials
    return {
        'contenderBasics':contender_basics,'trials':trials,'seed':seed,
        'found':found,'proportion':p,'standardError':sqrt(p*(1-p)/trials),
        'bonusPositiveProportion':extras/trials,'meanBonusDraws':bonus_sum/trials,
        'competitiveGamesQualified':0,
    }


def main():
    original = original_rank6()
    rows = [physical_replay(original, basics) for basics in (7,14)]
    # Coarse independent stochastic regression against the deterministic exact sum.
    assert abs(rows[0]['proportion'] - 0.3506178820357) < 0.006
    assert abs(rows[1]['proportion'] - 0.3404617487813) < 0.006
    print(json.dumps({'version':'agent32-rank6-thunder-dce-physical-replay-v1',
                      'sourceRank':6,'rows':rows},indent=2))


if __name__ == '__main__':
    main()
