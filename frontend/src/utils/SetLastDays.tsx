export default function setLastDays(
  days: number,
  setFrom: (date: string) => void,
  setTo: (date: string) => void,
) {
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(new Date().setDate(new Date().getDate() - (days - 1)))
    .toISOString()
    .slice(0, 10);

  setFrom(from);
  setTo(to);
}
