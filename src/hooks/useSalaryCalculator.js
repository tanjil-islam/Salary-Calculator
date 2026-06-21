import * as React from "react";
import { computeSalary } from "../logic/salary";

export function useSalaryCalculator() {
  // Salary
  const [salaryValue, setSalaryValue] = React.useState(2000);
  const [period, setPeriod] = React.useState("Monthly");

  // Work schedule
  const [hoursPerDay, setHoursPerDay] = React.useState(8);
  const [daysPerWeek, setDaysPerWeek] = React.useState(5);

  // Overtime
  const [otHoursPerWeek, setOtHoursPerWeek] = React.useState(0);
  const [otMultiplier, setOtMultiplier] = React.useState(1.5);

  // Tax
  const [taxRate, setTaxRate] = React.useState(0);

  const result = React.useMemo(
    () =>
      computeSalary({
        salaryValue,
        period,
        hoursPerDay,
        daysPerWeek,
        otHoursPerWeek,
        otMultiplier,
        taxRate,
      }),
    [salaryValue, period, hoursPerDay, daysPerWeek, otHoursPerWeek, otMultiplier, taxRate]
  );

  return {
    salaryValue,
    setSalaryValue,
    period,
    setPeriod,

    hoursPerDay,
    setHoursPerDay,
    daysPerWeek,
    setDaysPerWeek,

    otHoursPerWeek,
    setOtHoursPerWeek,
    otMultiplier,
    setOtMultiplier,

    taxRate,
    setTaxRate,

    result,
  };
}
