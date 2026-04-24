"use client";

import {
  SwapExperience,
  type SwapExperiencePreset,
} from "@/components/swap/SwapExperience";
import { useEffect, useState } from "react";

function getQueryValue(params: URLSearchParams, key: string) {
  return params.get(key)?.trim() || "";
}

function getPresetFromLocation() {
  const params = new URLSearchParams(window.location.search);
  const preset: Partial<SwapExperiencePreset> = {};
  const fromCoin = getQueryValue(params, "fromCoin");
  const fromNetwork = getQueryValue(params, "fromNetwork");
  const toCoin = getQueryValue(params, "toCoin");
  const toNetwork = getQueryValue(params, "toNetwork");

  if (fromCoin) {
    preset.fromCoin = fromCoin;
  }

  if (fromNetwork) {
    preset.fromNetwork = fromNetwork;
  }

  if (toCoin) {
    preset.toCoin = toCoin;
  }

  if (toNetwork) {
    preset.toNetwork = toNetwork;
  }

  return Object.keys(preset).length > 0 ? preset : undefined;
}

export function SwapPageExperience() {
  const [preset, setPreset] = useState<Partial<SwapExperiencePreset> | undefined>();

  useEffect(() => {
    setPreset(getPresetFromLocation());
  }, []);

  return <SwapExperience showThemeToggle={false} preset={preset} />;
}
