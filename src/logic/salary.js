export function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

export function currencyUSD(n) {
  const v = Number(n) || 0;
  return v.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export function toHourlyRate({ salaryValue, period, hoursPerDay, daysPerWeek }) {
  const s = Number(salaryValue) || 0;
  const hpw = Math.max((Number(hoursPerDay) || 0) * (Number(daysPerWeek) || 0), 1);

  switch (period) {
    case "Hourly":
      return s;
    case "Weekly":
      return s / hpw;
    case "Biweekly":
      return s / (hpw * 2);
    case "Monthly":
      return s / (hpw * (52 / 12));
    case "Yearly":
      return s / (hpw * 52);
    default:
      return s;
  }
}

export function computeSalary({
  salaryValue,
  period,
  hoursPerDay,
  daysPerWeek,
  otHoursPerWeek,
  otMultiplier,
  taxRate,
}) {
  const hpw = Math.max((Number(hoursPerDay) || 0) * (Number(daysPerWeek) || 0), 1);

  const hourly = toHourlyRate({ salaryValue, period, hoursPerDay, daysPerWeek });
  const overtimeHourly = hourly * (Number(otMultiplier) || 1);

  // Base yearly
  let yearlyBase = 0;
  const s = Number(salaryValue) || 0;

  switch (period) {
    case "Hourly":
      yearlyBase = s * hpw * 52;
      break;
    case "Weekly":
      yearlyBase = s * 52;
      break;
    case "Biweekly":
      yearlyBase = s * 26;
      break;
    case "Monthly":
      yearlyBase = s * 12;
      break;
    case "Yearly":
      yearlyBase = s;
      break;
    default:
      yearlyBase = s * 12;
  }

  const otYearly = overtimeHourly * (Number(otHoursPerWeek) || 0) * 52;

  const grossYearly = yearlyBase + otYearly;
  const netYearly = grossYearly * (1 - (Number(taxRate) || 0) / 100);

  return {
    hpw,
    hourly: round2(hourly),
    overtimeHourly: round2(overtimeHourly),
    grossYearly: round2(grossYearly),
    netYearly: round2(netYearly),
  };
}
