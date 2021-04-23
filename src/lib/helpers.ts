import { BigDecimal, BigInt, Bytes, ByteArray, log } from '@graphprotocol/graph-ts';

import { LatestRate } from '../../generated/subgraphs/synthetix-rates/schema';

export let ZERO = BigInt.fromI32(0);
export let ONE = BigInt.fromI32(1);

export function toDecimal(value: BigInt, decimals: u32 = 18): BigDecimal {
  let precision = BigInt.fromI32(10)
    .pow(<u8>decimals)
    .toBigDecimal();

  return value.divDecimal(precision);
}

// Extrapolated from ByteArray.fromUTF8
export function strToBytes(string: string, length: i32 = 32): Bytes {
  let utf8 = string.toUTF8();
  let bytes = new ByteArray(length);
  let strLen = string.lengthUTF8 - 1;
  for (let i: i32 = 0; i < strLen; i++) {
    bytes[i] = load<u8>(utf8 + i);
  }
  return bytes as Bytes;
}

export let sUSD32 = strToBytes('sUSD', 32);

export function getTimeID(timestampI32: i32, num: i32): string {
  let id = timestampI32 / num;
  return id.toString();
}

export let etherUnits = new BigDecimal(BigInt.fromI32(10).pow(18));

export function getUSDAmountFromAssetAmount(amount: BigInt, rate: BigInt): BigDecimal {
  let decimalAmount = new BigDecimal(amount);
  let formattedDecimalAmount = decimalAmount.div(etherUnits);
  let decimalRate = new BigDecimal(rate);
  let formattedDecimalRate = decimalRate.div(etherUnits);
  return formattedDecimalRate.times(formattedDecimalAmount);
}

export function getLatestRate(synth: string, txHash: string): BigInt {
  let latestRate = LatestRate.load(synth);
  if (latestRate == null) {
    log.error('latest rate missing for synth: {}, in tx hash: {}', [synth, txHash]);
    return null;
  }
  return latestRate.rate;
}
