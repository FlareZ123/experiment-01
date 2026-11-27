// Agent46 exact restricted first-turn Lockbridge search, 2026-11-27.
// g++ -O3 -std=c++17 agent46-lockbridge-first-v-mist-gate-20261127.cpp -o search && ./search
#include <array>
#include <iostream>
#include <cstdint>
#include <algorithm>
using namespace std;
constexpr int N=12;
enum{V,VMAX,T,F,L,A,E,C,B,H,R,O};
using Arr=array<int,N>;
const Arr cap={4,4,1,1,1,1,11,4,5,1,1,26};
using U=uint64_t;
U ch[61][61]{};
Arr h,p,d;
U den=0,partitions=0,counts[16]{},mistNoFSS=0,gateNoFSS=0,gateFundedNoFSS=0,mistNoArven=0,ordinaryMist=0,ordinaryMistNoFSS=0;
struct State {int fog,ball,heavy,discard;bool fss;bool arven;};
// V, VMAX, Temple, Forest Seal Stone, Lele, Arven, Psychic, Fog,
// discard search (Mysterious Treasure/Quick Ball), Heavy, Radiant, Other.
// Arven has been allocated first; may fetch one item and one FSS from deck.
// Energy uses held card, fog, or FSS. Radiant uses held card, ball, Heavy if prized, or FSS.
// All searches deterministic given known full zone membership. Other is the only allowed discard fodder.
int eval(State s){
    bool en0=h[E]|| (s.fog && d[E]);
    bool en1=s.fss&&d[E];
    bool tm0=h[T],tm1=s.fss&&d[T];
    bool mist=(tm0&&(en0||en1))||(tm1&&en0);
    bool mist0=tm0&&en0;
    bool rad0=h[R]||(d[R]&&s.ball&&s.discard)||(!h[R]&&!d[R]&&s.heavy);
    bool rad1=s.fss&&d[R];
    bool gate=d[VMAX]>=2&&(rad0||rad1);
    bool gate0=d[VMAX]>=2&&rad0;
    bool gf=d[VMAX]>=2&&((rad0&&(en0||en1))||(rad1&&en0));
    bool gf0=d[VMAX]>=2&&rad0&&en0;
    return (mist?1:0)|(gate?2:0)|(gf?4:0)|(mist0?8:0)|(gate0?16:0)|(gf0?32:0)|((mist&&!s.arven)?64:0)|((en0||en1)?128:0)|(en0?256:0);
}
int afterArven(State s){
    s.fss=s.fss||d[F];s.arven=true;
    int m=eval(s);
    if(d[C]){auto t=s;t.fog++;m|=eval(t);}
    if(d[B]){auto t=s;t.ball++;m|=eval(t);}
    if(d[H]){auto t=s;t.heavy++;m|=eval(t);}
    return m;
}
int paths(){
    State s={h[C],h[B],h[H],h[O],bool(h[F]),false};
    int m=eval(s);
    if(h[A])return m|afterArven(s);
    if(!d[A])return m;
    if(h[L])return m|afterArven(s);
    if(d[L]){
        if(s.fog){auto t=s;t.fog--;m|=afterArven(t);}
        if(s.ball&&s.discard){auto t=s;t.ball--;t.discard--;m|=afterArven(t);}
    }else if(s.heavy){auto t=s;t.heavy--;m|=afterArven(t);}
    return m;
}
void prize(int i,int left,U w,U wh){
    if(i==N-1){if(left<0||left>cap[i]-h[i])return; p[i]=left; d[i]=cap[i]-h[i]-left; U wt=w*ch[cap[i]-h[i]][left]*wh;den+=wt;++partitions; int m=paths();counts[m&7]+=wt; if(m&8)mistNoFSS+=wt;if(m&16)gateNoFSS+=wt;if(m&32)gateFundedNoFSS+=wt;if(m&64)mistNoArven+=wt;if(m&128)ordinaryMist+=wt;if(m&256)ordinaryMistNoFSS+=wt;return;}
    int avail=cap[i]-h[i];for(int x=0;x<=min(avail,left);x++){p[i]=x;d[i]=avail-x;prize(i+1,left-x,w*ch[avail][x],wh);}
}
void hand(int i,int left,U w){
    if(i==N-1){if(left<0||left>cap[i])return;h[i]=left;if(!h[V])return;
        U wh=w*ch[cap[i]][left]*(h[V]==1?7:8);prize(0,6,1,wh);return;}
    for(int x=(i==V?1:0);x<=min(cap[i],left);x++){h[i]=x;hand(i+1,left-x,w*ch[cap[i]][x]);}
}
int main(){
    for(int n=0;n<=60;n++){ch[n][0]=ch[n][n]=1;for(int k=1;k<n;k++)ch[n][k]=ch[n-1][k-1]+ch[n-1][k];}
    int total=0;for(auto x:cap)total+=x;if(total!=60)return 2;
    hand(0,8,1);
    U expected=(ch[60][7]-ch[56][7])*53*ch[52][6];
    cout<<"partitions "<<partitions<<" denominator "<<den<<" expected "<<expected<<"\n";
    if(den!=expected)return 3;
    cout.precision(12);for(int i=0;i<8;i++)cout<<"mask "<<i<<" "<<counts[i]<<" "<<double(counts[i])/den<<"\n";
    cout<<"mistNoFSS "<<mistNoFSS<<" "<<double(mistNoFSS)/den<<"\n";
    cout<<"gateNoFSS "<<gateNoFSS<<" "<<double(gateNoFSS)/den<<"\n";
    cout<<"gateFundedNoFSS "<<gateFundedNoFSS<<" "<<double(gateFundedNoFSS)/den<<"\n";
    cout<<"mistNoArven "<<mistNoArven<<" "<<double(mistNoArven)/den<<"\n";
    cout<<"ordinaryMist "<<ordinaryMist<<" "<<double(ordinaryMist)/den<<"\n";
    cout<<"ordinaryMistNoFSS "<<ordinaryMistNoFSS<<" "<<double(ordinaryMistNoFSS)/den<<"\n";
}
