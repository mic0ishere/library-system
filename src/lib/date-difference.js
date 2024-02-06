export default function dateDifference(returned, due) {
  const difference = new Date(returned).setHours(1) - new Date(due).setHours(0);

  const daysDifference = Math.floor(difference / (1000 * 60 * 60 * 24));
  return daysDifference;
}
