import { DateTime, Duration } from "luxon";

export const formatDuration = (
  duration: number,
  durationInMs: boolean
): string =>
  durationInMs
    ? `${Duration.fromMillis(duration).toFormat("hh:mm:ss.SSS")}`
    : `${Duration.fromObject({ seconds: duration }).toFormat("hh:mm:ss.SSS")}`;

export const formatToLocalIso = (date: Date | string | undefined): string => {
  if (!date) return "";
  return typeof date === "string"
    ? DateTime.fromISO(date).toFormat("yyyy/MM/dd HH:mm:ss")
    : DateTime.fromJSDate(date).toFormat("yyyy/MM/dd HH:mm:ss");
};

export const calculatePercentage = (amount: number, total: number): number =>
  total === 0 ? 0 : (amount / total) * 100;
