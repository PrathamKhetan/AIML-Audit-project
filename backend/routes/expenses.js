/**
 * AuditAI - Expense Routes & API Endpoints
 * Provides full CRUD, analytics aggregations, and status workflow.
 * 
 * NOTE FOR COLLEGE PROJECT PRESENTATION:
 * The data is stored in an in-memory array initialized from seed.js.
 * To connect a database (e.g. PostgreSQL, MongoDB, or SQLite),
 * you only need to swap the in-memory array operations with DB queries.
 */

const express = require('express');
const router = express.Router();
const { evaluateRisk } = require('../services/riskEngine');
const { initializeSeedData } = require('../data/seed');

// In-Memory Expense Store
let expenses = initializeSeedData();

/**
 * GET /api/expenses
 * Query parameters:
 *  - category: Filter by category (e.g. "Travel", "Meals & Entertainment")
 *  - risk: Filter by risk level ("Low", "Medium", "High")
 *  - search: Search in employee, description, department, category, or ID
 */
router.get('/expenses', (req, res) => {
  try {
    let result = [...expenses];
    const { category, risk, search } = req.query;

    // Filter by Category
    if (category && category !== 'all') {
      result = result.filter(e => (e.category || '').toLowerCase() === category.toLowerCase());
    }

    // Filter by Risk Level
    if (risk && risk !== 'all') {
      result = result.filter(e => (e.riskLevel || '').toLowerCase() === risk.toLowerCase());
    }

    // Free text search
    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      result = result.filter(e =>
        (e.employee || '').toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q) ||
        (e.department || '').toLowerCase().includes(q) ||
        (e.category || '').toLowerCase().includes(q) ||
        (e.id || '').toLowerCase().includes(q)
      );
    }

    // Sort: newest date first, then highest ID
    result.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0) || b.id.localeCompare(a.id));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
});

/**
 * POST /api/expenses
 * Submit new expense. Evaluates fraud risk in real-time.
 */
router.post('/expenses', (req, res) => {
  try {
    const { employee, department, category, amount, description, date, time } = req.body;

    // Validation
    if (!employee || typeof employee !== 'string' || employee.trim() === '') {
      return res.status(400).json({ error: 'Validation Error', message: 'Employee name is required.' });
    }
    if (amount === undefined || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Validation Error', message: 'A valid positive expense amount is required.' });
    }
    if (!category || typeof category !== 'string' || category.trim() === '') {
      return res.status(400).json({ error: 'Validation Error', message: 'Category is required.' });
    }
    if (!description || typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({ error: 'Validation Error', message: 'Expense description is required.' });
    }

    // Generate unique ID
    const newId = `EXP-${1000 + expenses.length + 1}`;

    // Format Date & Time defaults
    const now = new Date();
    const formattedDate = date || now.toISOString().split('T')[0];
    const formattedTime = time || now.toTimeString().split(' ')[0].substring(0, 5);

    const expenseCandidate = {
      id: newId,
      employee: employee.trim(),
      department: department ? department.trim() : 'General',
      category: category.trim(),
      amount: parseFloat(amount),
      description: description.trim(),
      date: formattedDate,
      time: formattedTime
    };

    // Run Rule-Based AI Risk Engine
    const riskAnalysis = evaluateRisk(expenseCandidate, expenses);

    // Initial status based on risk level
    let initialStatus = 'pending';
    if (riskAnalysis.level === 'High') {
      initialStatus = 'flagged';
    } else if (riskAnalysis.level === 'Low') {
      initialStatus = 'approved';
    }

    const savedExpense = {
      ...expenseCandidate,
      status: initialStatus,
      riskScore: riskAnalysis.score,
      riskLevel: riskAnalysis.level,
      reasons: riskAnalysis.reasons,
      createdAt: new Date().toISOString()
    };

    // Store in-memory
    expenses.unshift(savedExpense);

    return res.status(201).json(savedExpense);
  } catch (error) {
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
});

/**
 * GET /api/stats
 * Aggregate dashboard metrics:
 *  - totalExpenses: Total count of expenses
 *  - totalAmount: Total monetary value audited
 *  - flaggedCount: Total high-risk or flagged expenses
 *  - avgRiskScore: Average fraud risk score
 *  - moneySaved: Total monetary value prevented from fraud/rejections
 */
router.get('/stats', (req, res) => {
  try {
    const totalExpenses = expenses.length;
    const totalAmount = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    const flaggedExpenses = expenses.filter(
      e => e.status === 'flagged' || e.riskLevel === 'High'
    );
    const flaggedCount = flaggedExpenses.length;

    const totalScore = expenses.reduce((sum, e) => sum + (e.riskScore || 0), 0);
    const avgRiskScore = totalExpenses > 0 ? parseFloat((totalScore / totalExpenses).toFixed(1)) : 0;

    // Money saved: Total of rejected items + flagged high-risk items prevented
    const rejectedAmount = expenses
      .filter(e => e.status === 'rejected')
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    const flaggedHighRiskAmount = expenses
      .filter(e => e.status === 'flagged' && e.riskLevel === 'High')
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    const moneySaved = rejectedAmount + flaggedHighRiskAmount;

    res.json({
      totalExpenses,
      totalAmount: Math.round(totalAmount),
      flaggedCount,
      avgRiskScore,
      moneySaved: Math.round(moneySaved)
    });
  } catch (error) {
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
});

/**
 * GET /api/stats/monthly
 * Aggregate expenses by month for line charts
 */
router.get('/stats/monthly', (req, res) => {
  try {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = {};

    // Group expenses by Year-Month
    expenses.forEach(e => {
      if (!e.date) return;
      const d = new Date(e.date);
      if (isNaN(d.getTime())) return;

      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyMap[key]) {
        monthlyMap[key] = {
          month: key,
          sortKey,
          total: 0,
          flagged: 0,
          count: 0
        };
      }

      const amt = parseFloat(e.amount) || 0;
      monthlyMap[key].total += amt;
      monthlyMap[key].count += 1;
      if (e.riskLevel === 'High' || e.status === 'flagged' || e.status === 'rejected') {
        monthlyMap[key].flagged += amt;
      }
    });

    // Sort chronologically
    const sortedData = Object.values(monthlyMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));

    res.json({
      labels: sortedData.map(d => d.month),
      totals: sortedData.map(d => Math.round(d.total)),
      flagged: sortedData.map(d => Math.round(d.flagged)),
      counts: sortedData.map(d => d.count),
      items: sortedData
    });
  } catch (error) {
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
});

/**
 * GET /api/stats/categories
 * Aggregate expense totals by category for doughnut / bar charts
 */
router.get('/stats/categories', (req, res) => {
  try {
    const categoryMap = {};

    expenses.forEach(e => {
      const cat = e.category || 'Other';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { total: 0, count: 0, flaggedCount: 0 };
      }
      categoryMap[cat].total += parseFloat(e.amount) || 0;
      categoryMap[cat].count += 1;
      if (e.riskLevel === 'High' || e.status === 'flagged') {
        categoryMap[cat].flaggedCount += 1;
      }
    });

    const labels = Object.keys(categoryMap);
    const totals = labels.map(l => Math.round(categoryMap[l].total));
    const counts = labels.map(l => categoryMap[l].count);
    const flaggedCounts = labels.map(l => categoryMap[l].flaggedCount);

    res.json({
      labels,
      totals,
      counts,
      flaggedCounts
    });
  } catch (error) {
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
});

/**
 * GET /api/alerts
 * Returns high-risk or flagged transactions requiring immediate review
 */
router.get('/alerts', (req, res) => {
  try {
    const highRiskAlerts = expenses
      .filter(e => e.riskLevel === 'High' || e.status === 'flagged')
      .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0) || new Date(b.date) - new Date(a.date));

    res.json(highRiskAlerts);
  } catch (error) {
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
});

/**
 * PATCH /api/expenses/:id/status
 * Approve or reject a flagged expense
 */
router.patch('/expenses/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['approved', 'rejected', 'flagged', 'pending'];
    if (!status || !allowedStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        error: 'Validation Error',
        message: `Status must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const expense = expenses.find(e => e.id.toLowerCase() === id.toLowerCase());
    if (!expense) {
      return res.status(404).json({ error: 'Not Found', message: `Expense with ID ${id} was not found.` });
    }

    expense.status = status.toLowerCase();
    expense.updatedAt = new Date().toISOString();

    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
});

module.exports = router;
