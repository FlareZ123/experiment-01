'use strict';

const FIELD_SIZE=32;
const CELLS_PER_ROUND=64;
const ZERO_LOSS_WEIGHT=0.95;
const LAMBDAS=Object.freeze([0.05,0.1,0.25,0.5,1,2,4,8,16,32]);
