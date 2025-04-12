import './DashBoard.css'; // 🆕 import the CSS file
import TransactionForm from '../components/TransactionForm';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/transactions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTransactions(response.data);
      } catch (err) {
        setError('Failed to load transactions.');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() + 1 === selectedMonth;
  });

  const income = filteredTransactions.filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = filteredTransactions.filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const chartData = {
    labels: ['Income', 'Expenses'],
    datasets: [{
      data: [income, expenses],
      backgroundColor: ['#8BC34A', '#E57373'],
      borderWidth: 1,
    }]
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>📊 Personal Finance Dashboard</h1>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i + 1}>
              {new Date(0, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>
      </header>

      <TransactionForm onTransactionAdded={() => window.location.reload()} />

      <section className="dashboard-content">
        <div className="chart-card">
          <h2>Income vs Expenses</h2>
          <div className="chart-container">
            <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="summary">
          <div className="summary-box income">
            <h3>Total Income</h3>
            <p>${income.toFixed(2)}</p>
          </div>
          <div className="summary-box expenses">
            <h3>Total Expenses</h3>
            <p>${expenses.toFixed(2)}</p>
          </div>
          <div className="summary-box savings">
            <h3>Net Savings</h3>
            <p className={income - expenses >= 0 ? 'positive' : 'negative'}>
              ${(income - expenses).toFixed(2)}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
