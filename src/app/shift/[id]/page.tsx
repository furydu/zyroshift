import { ShiftExperience } from "@/components/shift/ShiftExperience";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shift | ZyroShift",
  description: "Track a live SideShift order with deposit instructions and status updates.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ShiftPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ShiftExperience orderId={id} />;
}
