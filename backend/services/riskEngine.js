/**
 * AuditAI - Risk Engine (Rule-based Fraud & Anomaly Detection)
 * Evaluates expense submissions against corporate fraud and policy risk rules.
 * 
 * Rules & Point Weights:
 * 1. Amount > 10,000                     -> +50 points
 * 2. Duplicate submission                -> +30 points
 * 3. Submitted on weekend / 11pm - 5am   -> +20 points
 * 4. Suspicious round-number amount      -> +10 points
 * 5. Amount > 3x category average        -> +25 points
 * 
 * Score Range: 0 - 100
 * Risk Levels: Low (0-29), Medium (30-59), High (60+)
 */

function evaluateRisk(expense, existingExpenses = []) {
  const reasons = [];
  let score = 0;

  const amount = parseFloat(expense.amount) || 0;
  const employee = (expense.employee || '').trim();
  const category = (expense.category || '').trim();

  // 1. High Amount Check (> 10,000)
  if (amount > 10000) {
    score += 50;
    reasons.push(`High transaction amount ($${amount.toLocaleString()}) exceeds the $10,000 corporate review threshold (+50)`);
  }

  // 2. Duplicate Detection (same employee, same category, same amount)
  const isDuplicate = existingExpenses.some(prev => {
    // Exclude self if updating
    if (expense.id && prev.id === expense.id) return false;

    const sameEmployee = (prev.employee || '').trim().toLowerCase() === employee.toLowerCase();
    const sameCategory = (prev.category || '').trim().toLowerCase() === category.toLowerCase();
    const sameAmount = Math.abs((parseFloat(prev.amount) || 0) - amount) < 0.01;

    return sameEmployee && sameCategory && sameAmount;
  });

  if (isDuplicate) {
    score += 30;
    reasons.push(`Duplicate expense detected: exact match on employee, category, and amount ($${amount.toLocaleString()}) (+30)`);
  }

  // 3. Timing Anomaly (Weekend or late night between 11 PM and 5 AM)
  let isWeekend = false;
  let isLateNight = false;

  try {
    let dateObj;
    if (expense.date && expense.time) {
      dateObj = new Date(`${expense.date}T${expense.time}:00`);
    } else if (expense.date) {
      dateObj = new Date(expense.date);
    } else {
      dateObj = new Date();
    }

    if (!isNaN(dateObj.getTime())) {
      const day = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
      isWeekend = (day === 0 || day === 6);

      // Check hour if time is provided or embedded
      if (expense.time) {
        const hour = parseInt(expense.time.split(':')[0], 10);
        isLateNight = (hour >= 23 || hour < 5);
      }
    }
  } catch (err) {
    // If parsing fails, skip timing check gracefully
  }

  if (isWeekend || isLateNight) {
    score += 20;
    const timingDetail = isWeekend && isLateNight
      ? 'weekend during non-business hours (11 PM - 5 AM)'
      : isWeekend
      ? 'weekend submission'
      : 'late night submission (11 PM - 5 AM)';
    reasons.push(`Irregular submission timing: filed on a ${timingDetail} (+20)`);
  }

  // 4. Round-Number Anomaly (e.g., 5000, 1000, 2500 exactly with no cents)
  const isRoundNumber = Number.isInteger(amount) && amount >= 500 && (amount % 100 === 0);
  if (isRoundNumber) {
    score += 10;
    reasons.push(`Suspicious round-number amount ($${amount.toLocaleString()}) without itemized breakdown (+10)`);
  }

  // 5. Category Outlier (> 3x category average)
  const categoryExpenses = existingExpenses.filter(
    e => (e.category || '').trim().toLowerCase() === category.toLowerCase() && (parseFloat(e.amount) || 0) > 0
  );

  if (categoryExpenses.length > 0) {
    const totalCatAmount = categoryExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const categoryAvg = totalCatAmount / categoryExpenses.length;

    if (amount > 3 * categoryAvg) {
      score += 25;
      reasons.push(
        `Amount ($${amount.toLocaleString()}) is more than 3x the ${category} historical average ($${Math.round(categoryAvg).toLocaleString()}) (+25)`
      );
    }
  }

  // Cap score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, score));

  // Determine Risk Level: Low (0-29), Medium (30-59), High (60+)
  let level = 'Low';
  if (finalScore >= 60) {
    level = 'High';
  } else if (finalScore >= 30) {
    level = 'Medium';
  }

  // Default clean reason if no flags triggered
  if (reasons.length === 0) {
    reasons.push('Verified: Transaction is within standard corporate policy thresholds.');
  }

  return {
    score: finalScore,
    level,
    reasons
  };
}

module.exports = {
  evaluateRisk
};
