"use client";
import { useParams } from "next/navigation";
import CompetitionDetail from "@/components/CompetitionDetail";

export default function MonthlyDetailPage() {
  const { id } = useParams();
  return <CompetitionDetail id={id} backHref="/admin/monthly" />;
}
