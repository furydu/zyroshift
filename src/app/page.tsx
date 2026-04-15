import { HomePage } from "@/components/home/HomePage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZyroShift | Non-Custodial Crypto Swap with Live Routes",
  description:
    "Swap across supported tokens and networks with non-custodial variable-rate and fixed-quote flows, then track each shift on a dedicated status page.",
};

export default function Home() {
  return <HomePage />;
}
