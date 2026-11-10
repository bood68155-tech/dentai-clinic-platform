/** Public-facing practice details used by the marketing site. */
export const CLINIC_PROFILE = {
  name: "Dentai",
  tagline: "Dentistry that feels unhurried.",
  phone: "+1 (212) 555-0184",
  phoneHref: "tel:+12125550184",
  email: "hello@dentaiclinic.com",
  address: ["118 Greene Street, Suite 4", "New York, NY 10012"],
  hours: [
    { days: "Monday – Wednesday", time: "09:00 – 18:00" },
    { days: "Thursday", time: "09:00 – 19:00" },
    { days: "Friday", time: "09:00 – 16:00" },
    { days: "Saturday", time: "09:00 – 13:00" },
    { days: "Sunday", time: "Closed" },
  ],
  /**
   * Same opening hours as the displayed list, keyed by weekday (0 = Sunday) for the
   * online scheduler. Closed days are null.
   */
  schedule: {
    0: null,
    1: ["09:00", "18:00"],
    2: ["09:00", "18:00"],
    3: ["09:00", "18:00"],
    4: ["09:00", "19:00"],
    5: ["09:00", "16:00"],
    6: ["09:00", "13:00"],
  } as Record<number, [string, string] | null>,
  services: [
    {
      code: "01",
      title: "Preventive & hygiene",
      body: "Six-month recalls, guided cleaning and fluoride work that keeps small things small.",
    },
    {
      code: "02",
      title: "Restorative dentistry",
      body: "Tooth-coloured composites, inlays and crowns milled in-house for single-visit repairs.",
    },
    {
      code: "03",
      title: "Endodontics",
      body: "Microscope-assisted root canal therapy with a clear, staged plan for the tooth afterwards.",
    },
    {
      code: "04",
      title: "Implants & surgery",
      body: "Guided placement, extractions and grafting, coordinated with your medical history.",
    },
    {
      code: "05",
      title: "Cosmetic care",
      body: "Whitening, bonding and veneers designed around your face rather than a template.",
    },
    {
      code: "06",
      title: "Children & families",
      body: "First visits from age three, sealants and a chairside manner built for nervous patients.",
    },
  ],
} as const;
