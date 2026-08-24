import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import { summarizeTransactions } from '../services/financeAnalyzer.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const [transactions, budget] = await Promise.all([
      Transaction.find({ userId: req.userId })
        .sort({ transactionDate: -1 }),

      Budget.findOne({ userId: req.userId })
    ]);

    const summary = summarizeTransactions(transactions, budget);

    const recentTransactions = transactions.slice(0, 5);

    res.json({
      success: true,
      data: {
        ...summary,
        recentTransactions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};