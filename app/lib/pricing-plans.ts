import type { PlanKey } from "./pricing";

export type { PlanKey };

export const PLAN_DISPLAY = {
  standard: {
    name: "Standard",
    subtitle: "Kalme slaaproutine en emotionele basis",
    monthlyPriceLabel: "€4.99",
    yearlyPriceLabel: "€39.99",
    monthlySuffix: " / month",
    yearlySuffix: " / year",
    features: [
      "Rustige slaaproutine",
      "Veiligheids- en zelfvertrouwenboodschappen",
      "Rustgevende sound layers",
      "7 dagen gratis proberen",
    ],
  },
  premium: {
    name: "Premium",
    subtitle: "Extra modules en uitbreiding",
    monthlyPriceLabel: "€7.99",
    yearlyPriceLabel: "€69.99",
    monthlySuffix: " / month",
    yearlySuffix: " / year",
    features: [
      "Alles van Standard",
      "Meer thema-modules",
      "Voorbereid op naam-personalisatie",
      "7 dagen gratis proberen",
    ],
  },
} as const;
