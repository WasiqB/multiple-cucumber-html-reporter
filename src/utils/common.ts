import { DateTime, Duration } from "luxon";

export const formatDuration = (
  duration: number,
  durationInMs: boolean
): string =>
  durationInMs
    ? `${Duration.fromMillis(duration).toFormat("hh:mm:ss.SSS")}`
    : `${Duration.fromObject({ seconds: duration }).toFormat("hh:mm:ss.SSS")}`;

export const formatToLocalIso = (date: Date): string =>
  DateTime.fromJSDate(date).toFormat("yyyy/MM/dd HH:mm:ss");

export const calculatePercentage = (amount: number, total: number): number =>
  round((amount / total) * 100);

const round = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;
