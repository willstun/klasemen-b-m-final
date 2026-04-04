"use client";
import { useState, useEffect, useCallback } from "react";
import { leaderboardApi } from "@/lib/api";
import { useSocket } from "./useSocket";

export function useLeaderboard(type) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ years: [], monthsByYear: {}, weeksByYearMonth: {} });
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);

  const fetchData = useCallback(async (params = {}) => {
    try {
      setData(await leaderboardApi.getData({ type, ...params }));
    } catch { setData(null); }
  }, [type]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [lb, f] = await Promise.all([
          leaderboardApi.getData({ type }).catch(() => null),
          leaderboardApi.getFilters(type).catch(() => ({ years: [], monthsByYear: {}, weeksByYearMonth: {} })),
        ]);
        setData(lb);
        setFilters(f);
      } catch {}
      setLoading(false);
    })();
  }, [type]);

  const handleRealTimeUpdate = useCallback(() => {
    const p = {};
    if (selectedYear) p.year = selectedYear;
    if (selectedMonth) p.month = selectedMonth;
    if (selectedWeek) p.week = selectedWeek;
    fetchData(p);
  }, [fetchData, selectedYear, selectedMonth, selectedWeek]);

  useSocket(type, handleRealTimeUpdate);

  const onYearChange = useCallback((year) => {
    setSelectedYear(year);
    setSelectedMonth(null);
    setSelectedWeek(null);
    if (type === "monthly") {
      const months = filters.monthsByYear[year] || [];
      if (months.length > 0) {
        const m = months[months.length - 1];
        setSelectedMonth(m);
        fetchData({ year, month: m });
        return;
      }
    }
    fetchData({ year });
  }, [type, filters, fetchData]);

  const onMonthChange = useCallback((month) => {
    setSelectedMonth(month);
    setSelectedWeek(null);
    if (type === "weekly") {
      const weeks = filters.weeksByYearMonth[`${selectedYear}-${month}`] || [];
      if (weeks.length > 0) {
        setSelectedWeek(weeks[0]);
        fetchData({ year: selectedYear, month, week: weeks[0] });
        return;
      }
    }
    fetchData({ year: selectedYear, month });
  }, [type, selectedYear, filters, fetchData]);

  const onWeekChange = useCallback((week) => {
    setSelectedWeek(week);
    fetchData({ year: selectedYear, month: selectedMonth, week });
  }, [selectedYear, selectedMonth, fetchData]);

  return { data, loading, filters, selectedYear, selectedMonth, selectedWeek, onYearChange, onMonthChange, onWeekChange };
}
