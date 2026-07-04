export type TimelineItem = {
  period: string;
  role: string;
  org: string;
  highlights: string[];
};

export const timeline: TimelineItem[] = [
  {
    period: "2024 — Present",
    role: "Software Engineer",
    org: "Web Design Magics",
    highlights: [
      "Designed & shipped a 50+ endpoint Construction ERP backend from scratch (Node.js, TypeScript, MySQL)",
      "Built production JWT auth with rotating refresh tokens and race-condition-safe refresh queue",
      "Delivered WeConnect 2.0 — a three-role non-profit platform with zero design defects reported",
    ],
  },
  {
    period: "2023 — 2024",
    role: "Junior Software Engineer",
    org: "Web Design Magics",
    highlights: [
      "Built a home-services marketplace with payments, SMS, and geo-location integrations",
      "Cut page load time 80% via code-splitting, lazy loading, and response caching",
      "Introduced Jest suites that reduced bug reports by 20%",
    ],
  },
  {
    period: "2019 — 2023",
    role: "B.E. Electrical & Electronics Engineering",
    org: "Thanthai Periyar Government Institute of Technology, Vellore",
    highlights: ["CGPA 7.8 — and a habit of thinking in systems that never left"],
  },
];
