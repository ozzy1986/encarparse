import { formatDistanceToNowStrict } from "date-fns";

export function formatKrw(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMileageKm(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} km`;
}

export function formatUpdatedAt(value: Date | null) {
  if (!value) {
    return "Awaiting first sync";
  }

  return formatDistanceToNowStrict(value, { addSuffix: true });
}
