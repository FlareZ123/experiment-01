#!/usr/bin/env python3
"""Census of settled repeated Underworld Door roots in archived native games.

Use with GitHub Actions artifact 13656062292, run 42578010606,
'agent3-hood-vs-shadow-all29-native.zip' (not a new simulation).
Standard library only. This counts actual PlayCardAction and UseAbilityAction
root ledger events by PHYSICAL candidateSeat; errors without ledgers remain
in denominator of attempted games but are excluded from observed actions.
It never interprets game success as paper-expanded competitive qualification.

Usage:
    python scripts/2026-11/agent1-source-hood-multi-door-ledger-census.py path.zip
"""
import argparse
import collections
import json
import zipfile


def analyze(archive):
    with zipfile.ZipFile(archive) as zipped:
        names=[name for name in zipped.namelist() if name.endswith('.json')]
        if len(names)!=1:
            raise ValueError('Expected one JSON payload in archive')
        with zipped.open(names[0]) as stream:
            payload=json.load(stream)
    if not isinstance(payload.get('actualNativeRuns'),list):
        raise ValueError('Not a registered actualNativeRuns artifact')
    return analyze_payload(payload)


def analyze_payload(payload):
    output={'source':'run-42578010606/artifact-13656062292',
            'paperQualifiedGames':payload.get('competitivePaperQualifiedGames'),
            'arms':[]}
    for arm in payload['actualNativeRuns']:
        arm_id=arm['registeredCandidateIds'][0]
        rows=arm['rows']
        records=[]
        for row in rows:
            trial=row.get('trial') or {}
            if 'candidateSeat' not in row or not isinstance(row.get('rootActionLedger'),list):
                continue
            seat=row['candidateSeat']
            if seat not in (0,1):
                raise ValueError('Unexpected physical seat')
            roots=[a for a in row['rootActionLedger']
                   if a.get('playerSlot')==seat]
            vcount=sum(a.get('action')=='PlayCardAction' and
                       a.get('card')=='Shadow Rider Calyrex V' for a in roots)
            vmax_count=sum(a.get('action')=='PlayCardAction' and
                       a.get('card')=='Shadow Rider Calyrex VMAX' for a in roots)
            doors=[a for a in roots if a.get('action')=='UseAbilityAction'
                   and a.get('ability')=='Underworld Door']
            per_turn=collections.Counter(a['turnBefore'] for a in doors)
            multi=sorted(t for t,n in per_turn.items() if n>=2)
            records.append({
                'trialId':trial.get('id'),
                'rank':trial.get('rank'),
                'candidateSeat':seat,
                'vPlays':vcount,
                'vmaxPlays':vmax_count,
                'underworldDoorRoots':len(doors),
                'multiDoorTurns':multi,
                'multiDoorOrdinals':[
                    {'turn':t,'actionOrdinals':[
                        a['actionOrdinal'] for a in doors
                        if a['turnBefore']==t]}
                    for t in multi],
                'nativeTerminal':bool(row.get('finished')),
                'nativeWin':bool(row.get('finished') and row.get('winner')==seat),
                'paperQualified':row.get('qualifiesForCompetitiveInference')
            })
        output['arms'].append({
            'id':arm_id,
            'attempts':len(rows),
            'ledgerBearingAttempts':len(records),
            'nativeWinsAmongLedgers':sum(r['nativeWin'] for r in records),
            'atLeastTwoVmaxPlayed':sum(r['vmaxPlays']>=2 for r in records),
            'atLeastTwoDoorSameTurn':sum(bool(r['multiDoorTurns'])
                                         for r in records),
            'totalDoorRoots':sum(r['underworldDoorRoots'] for r in records),
            'totalMultiDoorTurns':sum(len(r['multiDoorTurns'])
                                      for r in records),
            'multiDoorWitnesses':[{
                'trialId':r['trialId'],'rank':r['rank'],
                'candidateSeat':r['candidateSeat'],
                'nativeWin':r['nativeWin'],
                'vmaxPlays':r['vmaxPlays'],
                'multiDoorOrdinals':r['multiDoorOrdinals']}
                for r in records if r['multiDoorTurns']]
        })
    return output


if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('archive',help='Original GitHub Actions native ZIP')
    args=p.parse_args()
    print(json.dumps(analyze(args.archive),sort_keys=True,indent=2))
