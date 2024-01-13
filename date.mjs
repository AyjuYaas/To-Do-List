function getDate() {
  const options = { weekday: "long", month: "short", day: "numeric", year: "numeric" };

  const d = new Date();

  const dayToday = d.toLocaleDateString("en-us", options);

  return dayToday;
}

export { getDate };
