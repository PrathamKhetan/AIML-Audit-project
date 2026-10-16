/**
 * AuditAI - Seed Data
 * Generates ~40 realistic mock corporate expenses spanning 6 months
 * Automatically evaluated through the risk engine.
 */

const { evaluateRisk } = require('../services/riskEngine');

const rawMockExpenses = [
  // High Risk / Anomaly Cases
  {
    employee: "Marcus Vance",
    department: "Executive",
    category: "Equipment",
    amount: 14500,
    description: "Executive high-end workstation & dual OLED monitors",
    date: "2026-10-12",
    time: "23:45",
    status: "flagged"
  },
  {
    employee: "Alex Rivera",
    department: "Sales",
    category: "Meals & Entertainment",
    amount: 3200,
    description: "VIP Client Dinner & Lounge reservation",
    date: "2026-10-10",
    time: "01:30",
    status: "flagged"
  },
  {
    employee: "Alex Rivera",
    department: "Sales",
    category: "Meals & Entertainment",
    amount: 3200,
    description: "Duplicate VIP Client Dinner & Lounge booking",
    date: "2026-10-11",
    time: "14:15",
    status: "rejected"
  },
  {
    employee: "David Chen",
    department: "Engineering",
    category: "Consulting",
    amount: 12000,
    description: "Quarterly architectural security audit retainer",
    date: "2026-10-04",
    time: "02:10",
    status: "flagged"
  },
  {
    employee: "Sophia Martinez",
    department: "Marketing",
    category: "Travel",
    amount: 11200,
    description: "First class transatlantic flights to Global Summit",
    date: "2026-09-28",
    time: "16:20",
    status: "flagged"
  },
  {
    employee: "Jordan Reed",
    department: "Sales",
    category: "Meals & Entertainment",
    amount: 5000,
    description: "Unitemized enterprise client banquet",
    date: "2026-09-27", // Sunday
    time: "23:15",
    status: "flagged"
  },
  {
    employee: "Liam Davis",
    department: "Finance",
    category: "Software & IT",
    amount: 10500,
    description: "Annual Enterprise Analytics Platform license renewal",
    date: "2026-09-15",
    time: "11:00",
    status: "approved"
  },
  {
    employee: "Emily Watson",
    department: "Operations",
    category: "Equipment",
    amount: 4000,
    description: "Unitemized warehouse barcode scanners bulk order",
    date: "2026-09-06", // Sunday
    time: "00:40",
    status: "flagged"
  },

  // Medium Risk Cases
  {
    employee: "Nathan Drake",
    department: "Marketing",
    category: "Meals & Entertainment",
    amount: 2500,
    description: "Product launch celebration dinner for 12 partners",
    date: "2026-09-19", // Saturday
    time: "22:15",
    status: "pending"
  },
  {
    employee: "Sarah Jenkins",
    department: "Engineering",
    category: "Software & IT",
    amount: 3000,
    description: "Team JetBrains & GitHub Copilot Enterprise seats",
    date: "2026-08-25",
    time: "15:40",
    status: "approved"
  },
  {
    employee: "Chloe Bennet",
    department: "Human Resources",
    category: "Consulting",
    amount: 4500,
    description: "Executive recruiting firm candidate search retainer",
    date: "2026-08-20",
    time: "11:25",
    status: "approved"
  },
  {
    employee: "Alex Rivera",
    department: "Sales",
    category: "Travel",
    amount: 2000,
    description: "Regional sales roadshow hotel suite accommodation",
    date: "2026-08-16", // Sunday
    time: "13:00",
    status: "approved"
  },
  {
    employee: "Michael Scott",
    department: "Sales",
    category: "Office Supplies",
    amount: 1800,
    description: "Bulk specialty paper & ergonomic executive chairs",
    date: "2026-08-08", // Saturday
    time: "10:30",
    status: "rejected"
  },
  {
    employee: "Robert Taylor",
    department: "Finance",
    category: "Consulting",
    amount: 5000,
    description: "Mid-year tax advisory & compliance consulting",
    date: "2026-07-29",
    time: "14:00",
    status: "approved"
  },
  {
    employee: "Jessica Taylor",
    department: "Marketing",
    category: "Meals & Entertainment",
    amount: 1500,
    description: "Media influencer dinner & sponsorship kickoff",
    date: "2026-07-18", // Saturday
    time: "21:30",
    status: "pending"
  },
  {
    employee: "David Chen",
    department: "Engineering",
    category: "Equipment",
    amount: 3500,
    description: "Specialized lab test server rack components",
    date: "2026-07-12",
    time: "16:45",
    status: "approved"
  },

  // Low Risk / Standard Verified Cases
  {
    employee: "Sarah Jenkins",
    department: "Engineering",
    category: "Software & IT",
    amount: 180,
    description: "Monthly AWS cloud sandbox test environments",
    date: "2026-10-14",
    time: "10:15",
    status: "approved"
  },
  {
    employee: "Emily Watson",
    department: "Operations",
    category: "Office Supplies",
    amount: 85,
    description: "Shipping labels, printer cartridges & packaging tape",
    date: "2026-10-13",
    time: "14:20",
    status: "approved"
  },
  {
    employee: "Alex Rivera",
    department: "Sales",
    category: "Travel",
    amount: 450,
    description: "Domestic flight - SFO to SEA for quarterly client pitch",
    date: "2026-10-09",
    time: "09:30",
    status: "approved"
  },
  {
    employee: "Sophia Martinez",
    department: "Marketing",
    category: "Meals & Entertainment",
    amount: 125,
    description: "Coffee and breakfast meeting with creative agency",
    date: "2026-10-07",
    time: "08:45",
    status: "approved"
  },
  {
    employee: "David Chen",
    department: "Engineering",
    category: "Software & IT",
    amount: 340,
    description: "Datadog monitoring & APM developer seat subscription",
    date: "2026-10-02",
    time: "11:10",
    status: "approved"
  },
  {
    employee: "Chloe Bennet",
    department: "Human Resources",
    category: "Meals & Entertainment",
    amount: 220,
    description: "New hire welcome team lunch",
    date: "2026-09-24",
    time: "12:30",
    status: "approved"
  },
  {
    employee: "Liam Davis",
    department: "Finance",
    category: "Office Supplies",
    amount: 65,
    description: "Desk organizers & ergonomic mouse pads",
    date: "2026-09-22",
    time: "15:10",
    status: "approved"
  },
  {
    employee: "Nathan Drake",
    department: "Marketing",
    category: "Travel",
    amount: 380,
    description: "High-speed rail ticket to Regional Expo",
    date: "2026-09-18",
    time: "08:20",
    status: "approved"
  },
  {
    employee: "Jessica Taylor",
    department: "Marketing",
    category: "Equipment",
    amount: 650,
    description: "Podcast microphone & portable lighting kit for PR",
    date: "2026-09-11",
    time: "13:40",
    status: "approved"
  },
  {
    employee: "Sarah Jenkins",
    department: "Engineering",
    category: "Meals & Entertainment",
    amount: 95,
    description: "Engineering sprint retrospective pizza and snacks",
    date: "2026-09-04",
    time: "17:30",
    status: "approved"
  },
  {
    employee: "Michael Scott",
    department: "Sales",
    category: "Travel",
    amount: 285,
    description: "Rental car and fuel for regional distributor visits",
    date: "2026-08-27",
    time: "16:00",
    status: "approved"
  },
  {
    employee: "Robert Taylor",
    department: "Finance",
    category: "Software & IT",
    amount: 150,
    description: "QuickBooks Online extra seat & payroll addon",
    date: "2026-08-22",
    time: "10:00",
    status: "approved"
  },
  {
    employee: "Emily Watson",
    department: "Operations",
    category: "Travel",
    amount: 520,
    description: "Hotel stay (2 nights) for annual supply chain workshop",
    date: "2026-08-14",
    time: "19:15",
    status: "approved"
  },
  {
    employee: "Chloe Bennet",
    department: "Human Resources",
    category: "Equipment",
    amount: 310,
    description: "Ergonomic standing desk converter for onboarding pod",
    date: "2026-08-04",
    time: "11:45",
    status: "approved"
  },
  {
    employee: "David Chen",
    department: "Engineering",
    category: "Office Supplies",
    amount: 45,
    description: "Whiteboard markers, sticky notes & team supplies",
    date: "2026-07-25",
    time: "14:15",
    status: "approved"
  },
  {
    employee: "Alex Rivera",
    department: "Sales",
    category: "Meals & Entertainment",
    amount: 140,
    description: "Client business lunch at bistrot",
    date: "2026-07-21",
    time: "13:00",
    status: "approved"
  },
  {
    employee: "Sophia Martinez",
    department: "Marketing",
    category: "Software & IT",
    amount: 420,
    description: "Figma Organization seat and Canva Pro team licenses",
    date: "2026-07-15",
    time: "09:50",
    status: "approved"
  },
  {
    employee: "Jordan Reed",
    department: "Sales",
    category: "Travel",
    amount: 320,
    description: "Interstate airport parking and toll reimbursement",
    date: "2026-07-08",
    time: "18:20",
    status: "approved"
  },
  {
    employee: "Marcus Vance",
    department: "Executive",
    category: "Meals & Entertainment",
    amount: 350,
    description: "Board meeting catering & refreshments",
    date: "2026-06-29",
    time: "12:15",
    status: "approved"
  },
  {
    employee: "Jessica Taylor",
    department: "Marketing",
    category: "Office Supplies",
    amount: 90,
    description: "Conference badge lanyards & printed flyers",
    date: "2026-06-22",
    time: "16:10",
    status: "approved"
  },
  {
    employee: "Nathan Drake",
    department: "Marketing",
    category: "Software & IT",
    amount: 290,
    description: "Mailchimp transactional email credits",
    date: "2026-06-15",
    time: "10:30",
    status: "approved"
  },
  {
    employee: "Sarah Jenkins",
    department: "Engineering",
    category: "Equipment",
    amount: 850,
    description: "Ultra-wide 4K monitor for code reviews",
    date: "2026-06-08",
    time: "14:00",
    status: "approved"
  },
  {
    employee: "Liam Davis",
    department: "Finance",
    category: "Consulting",
    amount: 1200,
    description: "Statutory balance sheet review & auditing assist",
    date: "2026-05-28",
    time: "15:20",
    status: "approved"
  },
  {
    employee: "Emily Watson",
    department: "Operations",
    category: "Office Supplies",
    amount: 110,
    description: "First aid restocking and pantry sanitation kits",
    date: "2026-05-18",
    time: "11:00",
    status: "approved"
  },
  {
    employee: "Robert Taylor",
    department: "Finance",
    category: "Travel",
    amount: 640,
    description: "Roundtrip flights to annual FinOps convention",
    date: "2026-05-10",
    time: "08:15",
    status: "approved"
  }
];

// Initialize and score seed expenses
function initializeSeedData() {
  const expenses = [];

  rawMockExpenses.forEach((item, index) => {
    const id = `EXP-${1001 + index}`;
    
    // Evaluate risk based on previously seeded items
    const evaluation = evaluateRisk({ ...item, id }, expenses);

    expenses.push({
      id,
      employee: item.employee,
      department: item.department,
      category: item.category,
      amount: parseFloat(item.amount),
      description: item.description,
      date: item.date,
      time: item.time,
      status: item.status || (evaluation.level === 'High' ? 'flagged' : 'approved'),
      riskScore: evaluation.score,
      riskLevel: evaluation.level,
      reasons: evaluation.reasons,
      createdAt: new Date(`${item.date}T${item.time}:00`).toISOString()
    });
  });

  return expenses;
}

module.exports = {
  initializeSeedData
};
