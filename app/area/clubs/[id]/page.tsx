"use client";

import { use } from "react";
import { ClubDetailScreen } from "@/components/area/ClubDetailScreen";

interface Props {
  params: Promise<{ id: string }>;
}

export default function AreaClubDetailPage({ params }: Props) {
  const { id } = use(params);
  return <ClubDetailScreen clubId={id} />;
}
