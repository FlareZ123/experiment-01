"""Paired original-roster opening audit of a fully paid first-turn Alolan Muk line.

This is a strict *sufficient* one-turn resource witness, not a match simulator:
owner begins with a non-Grimer Basic Active, ends turn one with Muk on Bench,
Regidrago V in play, Double Dragon Energy attached, and a second attack-cost-
compatible Energy plus Regidrago VSTAR retained in hand. One Dragon payload is
put in the discard through a genuinely funded required Pokémon search or a held
Battle Compressor. All Item searches spend separate cards in hand. No draw
Abilities/Supporters, opponent actions, second turn draw, or engine combat run.
"""
from __future__ import annotations

import json
import math
from collections import Counter
from pathlib import Path

import numpy as np

BASICS_BY_RANK = {
    1: 14, 2: 14, 3: 11, 4: 13, 5: 11, 6: 4, 7: 12, 8: 10, 9: 11,
    10: 15, 11: 11, 12: 15, 13: 11, 14: 14, 15: 14, 16: 11, 17: 13,
    18: 16, 19: 16, 20: 14, 21: 14, 22: 12, 24: 4, 26: 12, 27: 15,
    29: 4, 30: 16, 31: 15, 32: 13,
}
CANDIDATES = (
    'agent43-apex-alchemy-paper-expanded-v0.json',
    'agent2-apex-alchemy-shake4-quick2-v1.json',
)
GRIMER = 'Alolan Grimer'
MUK = 'Alolan Muk'
REGI = 'Regidrago V'
VSTAR = 'Regidrago VSTAR'
SHAKE = 'Boost Shake'
TREASURE = 'Mysterious Treasure'
QUICK = 'Quick Ball'
DDE = 'Double Dragon Energy'
COMPRESSOR = 'Battle Compressor Team Flare Gear'
ENERGIES = (DDE, 'Basic Grass Energy', 'Basic Fire Energy')
BASICS = {REGI, GRIMER, 'Budew', 'Koraidon ex', 'Tapu Lele-GX',
          'Latias ex', 'Dialga-GX', 'Kyurem'}
PAYLOAD = {'Dragapult ex', 'Dialga-GX', 'Hisuian Goodra VSTAR',
           'Noivern ex', 'Kyurem', 'Koraidon ex'}
METRICS = ('searchFundedMukRegi', 'energyVstarReady', 'payloadReady',
           'activeRegiApexTurn2')


def _partitions_for_search(h: Counter, needed: tuple[str, ...]):
    """Enumerate legal distinct held search Items for missing Basic targets."""
    if not needed:
        yield Counter()
    elif len(needed) == 1:
        for item in (QUICK, TREASURE):
            if h[item]:
                yield Counter({item: 1})
    else:
        for first in (QUICK, TREASURE):
            for second in (QUICK, TREASURE):
                uses = Counter((first, second))
                if all(h[k] >= v for k, v in uses.items()):
                    yield uses


def turn_one_witness(held: list[str], prized: list[str], initial: list[str],
                     all_counts: Counter) -> tuple[bool, bool, bool, bool]:
    """Return progressively stricter mechanical/resource-opportunity gates.

    Evidence is existential: at least one valid choice of initial Active,
    two searches, their mandatory discard donors, Energy and payload route.
    """
    h, p = Counter(held), Counter(prized)
    d = all_counts - h - p
    active_options = set(initial) & (BASICS - {GRIMER})
    if not (active_options and h[SHAKE] and d[MUK]):
        return False, False, False, False
    needed = tuple(x for x in (GRIMER, REGI) if h[x] == 0)
    if any(d[x] == 0 for x in needed):
        return False, False, False, False

    funded = False
    energy_vstar = False
    payload = False
    active_proof = False
    for active in active_options:
        for searches in _partitions_for_search(h, needed):
            reserved = Counter({SHAKE: 1}) + searches
            reserved[active] += 1
            for pokemon in (GRIMER, REGI):
                if h[pokemon]:
                    reserved[pokemon] = max(reserved[pokemon], 1)
            spare = h - reserved
            if any(h[k] < v for k, v in reserved.items()):
                continue
            if sum(spare.values()) < len(needed):
                continue
            funded = True
            if h[VSTAR] <= reserved[VSTAR] or h[DDE] <= reserved[DDE]:
                continue
            for second in ENERGIES:
                full_reserve = reserved.copy()
                full_reserve[VSTAR] += 1
                full_reserve[DDE] += 1
                full_reserve[second] += 1
                if any(h[k] < v for k, v in full_reserve.items()):
                    continue
                remaining = h - full_reserve
                if sum(remaining.values()) < len(needed):
                    continue
                energy_vstar = True
                # One Dragon in discard from a funded, required Basic search.
                paid_payload = len(needed) >= 1 and any(remaining[x] for x in PAYLOAD)
                # An optional surplus search may itself discard a Dragon payload.
                # This search is payable and can fetch an actually remaining target.
                # A failed-search line would be legal too, but is excluded here.
                if not needed and any(remaining[x] for x in PAYLOAD):
                    paid_payload = bool(
                        (remaining[QUICK] and any(d[x] for x in BASICS)) or
                        (remaining[TREASURE] and any(d[x] for x in PAYLOAD | {GRIMER, MUK, REGI, VSTAR, 'Tapu Lele-GX', 'Alolan Grimer'}))
                    )
                # Or from a held Item that removes a Dragon from the actual deck.
                compressor_payload = (remaining[COMPRESSOR] > 0
                                      and sum(remaining.values()) - 1 >= len(needed)
                                      and any(d[x] for x in PAYLOAD))
                if paid_payload or compressor_payload:
                    payload = True
                    if active == REGI:
                        active_proof = True
                        return True, True, True, True
    return funded, energy_vstar, payload, active_proof


def input_decks(root: Path):
    paths = [root / 'results' / 'aichi-2026' / name for name in CANDIDATES]
    manifests = [json.loads(p.read_text(encoding='utf-8')) for p in paths]
    physical = []
    for manifest in manifests:
        counts = Counter({c['name']: c['count'] for c in manifest['cards']})
        if sum(counts.values()) != 60 or sum(counts[x] for x in BASICS) != 12:
            raise ValueError('Candidate inventory or Basic count changed')
        physical.append(counts)
    if physical[0] - physical[1] != Counter({QUICK: 1}):
        raise ValueError('v0 must have one more Quick Ball')
    if physical[1] - physical[0] != Counter({SHAKE: 1}):
        raise ValueError('v1 must have one more Boost Shake')
    if physical[0][MUK] != 2 or physical[0][GRIMER] != 2:
        raise ValueError('Registered Muk line changed')
    deck0 = sorted(name for name, n in physical[0].items() for _ in range(n))
    deck1 = deck0.copy()
    deck1[max(i for i, name in enumerate(deck1) if name == QUICK)] = SHAKE
    if Counter(deck1) != physical[1]:
        raise ValueError('Exact candidate paired-physical coupling failed')
    return manifests, (deck0, deck1), physical


def source_basics(root: Path) -> Counter:
    source = json.loads((root / 'results' / 'aichi-2026' / 'full-decklists.json').read_text(encoding='utf-8'))
    if {int(x['rank']) for x in source['decks']} != BASICS_BY_RANK.keys():
        raise ValueError('Authenticated original roster no longer matches frozen census')
    if any(sum(card['count'] for card in deck['cards']) != 60 for deck in source['decks']):
        raise ValueError('Malformed original 60')
    return Counter(BASICS_BY_RANK.values())


def opponent_bonus_probability(source_basic: int, candidate_basic: int = 12):
    a = math.comb(60-candidate_basic, 7) / math.comb(60, 7)
    b = math.comb(60-source_basic, 7) / math.comb(60, 7)
    return (1-a)*b / (1-a*b), 1-b


def run(root: Path, trials: int = 40000, seed: int = 20261103):
    """Equal-rank source-weighted, paired source-mulligan/physical-card study."""
    if trials < 2:
        raise ValueError('Need at least two paired setups per source Basic stratum')
    manifests, decks, counts = input_decks(root)
    strata = source_basics(root)
    if sum(strata.values()) != 29:
        raise ValueError('Expected 29 authenticated originals')
    field = {m: {'v0': 0., 'v1': 0., 'delta': 0., 'variance': 0.} for m in METRICS}
    rows = []
    for source_basic, rank_count in sorted(strata.items()):
        rng = np.random.default_rng(seed+source_basic)
        p_bonus, p_source_valid = opponent_bonus_probability(source_basic)
        successes = np.zeros((4, 2), dtype=np.int64)
        discordant = np.zeros((4, 2), dtype=np.int64)
        bonus_positive = 0
        for _ in range(trials):
            while True:
                order = rng.permutation(60)
                initial = [decks[0][i] for i in order[:7]]
                if any(x in BASICS for x in initial):
                    break
            extra = int(rng.geometric(p_source_valid)) if rng.random() < p_bonus else 0
            if extra:
                bonus_positive += 1
            extra = min(extra, 46)
            positions = list(order[:7]) + list(order[13:14+extra])
            prized_positions = order[7:13]
            observations = [turn_one_witness([deck[i] for i in positions],
                             [deck[i] for i in prized_positions],
                             [deck[i] for i in order[:7]], inventory)
                            for deck, inventory in zip(decks, counts)]
            for j in range(4):
                left, right = int(observations[0][j]), int(observations[1][j])
                successes[j, 0] += left
                successes[j, 1] += right
                if left != right:
                    discordant[j, right] += 1
        mrows = {}
        weight = rank_count / 29
        for j, metric in enumerate(METRICS):
            left, right = successes[j] / trials
            delta = right-left
            d2 = discordant[j].sum()/trials
            variance = max(0., (d2-delta*delta)/(trials-1))
            mrows[metric] = {'v0': float(left), 'v1': float(right),
                             'delta': float(delta),
                             'v0Only': int(discordant[j, 0]),
                             'v1Only': int(discordant[j, 1])}
            for k, value in (('v0', left), ('v1', right), ('delta', delta)):
                field[metric][k] += weight * value
            field[metric]['variance'] += weight**2 * variance
        rows.append({'sourceBasic': source_basic, 'rankCount': rank_count,
                     'bonusOfferProbability': p_bonus,
                     'bonusPositiveTrials': bonus_positive, 'metrics': mrows})
    z = 1.959963984540054
    for value in field.values():
        se = math.sqrt(value.pop('variance'))
        value['paired95CI'] = [value['delta']-z*se, value['delta']+z*se]
    return {'study': 'agent2-physical-paid-muk-t1-strict-no-draw-v1',
            'candidateV0Sha256': manifests[0]['deck_identity_sha256'],
            'candidateV1Sha256': manifests[1]['deck_identity_sha256'],
            'seed': seed, 'trialsPerBasicStratum': trials,
            'pairedSetups': len(strata)*trials, 'knownSourceRanks': 29,
            'omittedOriginalRanks': [23, 25, 28],
            'firstTurn': 'owner t1; no draw effects or opponent action',
            'strata': rows, 'equalRankField': field,
            'disclaimer': 'Strict sufficient resource witness only, not actual play or match wins.'}


if __name__ == '__main__':
    print(json.dumps(run(Path(__file__).resolve().parents[2]), indent=2))
