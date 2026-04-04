"use client";
import { useParams } from "next/navigation";
import CompetitionDetail from "@/components/CompetitionDetail";

export default function WeeklyDetailPage() {
  const { id } = useParams();
  return <CompetitionDetail id={id} backHref="/admin/weekly" />;
}
