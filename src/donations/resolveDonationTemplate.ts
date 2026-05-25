import { donationTemplates } from "./donationTemplates";
import type { DonateTemplateConfig } from "./donationTemplateTypes";

export function resolveDonationTemplate(amount: number): DonateTemplateConfig {
  const sortedTemplates = [...donationTemplates].sort((a, b) => {
    if (a.minAmount === b.minAmount) return 0;

    return a.minAmount > b.minAmount ? 1 : -1;
  });

  let selected: DonateTemplateConfig | undefined;

  for (let i = 0; i < sortedTemplates.length; i++) {
    const min = sortedTemplates[i].minAmount;
    const max = sortedTemplates[i + 1] ? sortedTemplates[i + 1].minAmount : null;

    if (max === null) {
      if (amount >= min) selected = sortedTemplates[i];
    } else {
      if (amount >= min && amount <= max) selected = sortedTemplates[i];
    }
  }

  return selected ?? sortedTemplates[0];
}
