"""Exact theoretical first-turn Radiant Eternatus access via three Item routes."""
from fractions import Fraction
from itertools import product
from prize_opening_exact import choose


def item_routes(basics=13, vmax=4, treasure=4, quick=1, heavy=1):
    """Return disjoint probabilities given accepted opener, no extra draws/lock.

    Categories: Radiant, other Basic, target VMAX, Mysterious Treasure,
    Quick Ball, Hisuian Heavy Ball, other cards. Models 7 opening cards,
    one normal draw, and 6 prizes. Items' strategic discard costs omitted.
    """
    groups = (1, basics, vmax, treasure, quick, heavy)
    if any(x < 0 for x in groups) or sum(groups) > 60 or vmax < 2:
        raise ValueError('Invalid group counts')
    fillers = 60-sum(groups)
    valid = Fraction(choose(60, 7)-choose(59-basics, 7), choose(60, 7))
    outcome = dict.fromkeys(('direct', 'search', 'heavy'), Fraction(0))
    for r,b,v,m,q,h in product(range(2),range(1,basics+1),range(vmax+1),
                                range(treasure+1),range(quick+1),range(heavy+1)):
        o = 8-r-b-v-m-q-h
        numerator = (choose(fillers,o)*choose(basics,b)*choose(vmax,v)
                     *choose(treasure,m)*choose(quick,q)*choose(heavy,h))
        if numerator == 0:
            continue
        weight = Fraction(numerator,choose(60,8)) * (Fraction(7,8) if b==1 else 1)
        remaining_targets = vmax-v
        for prized_targets in range(remaining_targets-1):
            binomial = choose(remaining_targets,prized_targets)
            if r:
                outcome['direct'] += weight*Fraction(
                    binomial*choose(52-remaining_targets,6-prized_targets),choose(52,6))
            else:
                if m+q:
                    outcome['search'] += weight*Fraction(
                        binomial*choose(51-remaining_targets,6-prized_targets),choose(52,6))
                if h:
                    outcome['heavy'] += weight*Fraction(
                        binomial*choose(51-remaining_targets,5-prized_targets),choose(52,6))
    return {**{k: p/valid for k,p in outcome.items()},
            'total':sum(outcome.values(),Fraction(0))/valid}


if __name__=='__main__':
    print({k:float(v) for k,v in item_routes().items()})
