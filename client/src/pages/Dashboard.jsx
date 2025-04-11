import { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Fetch transactions from backend
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/transactions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTransactions(response.data);
      } catch (err) {
        setError('Failed to load transactions. Please try again.');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Filter transactions by month (optional)
  const filteredTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() + 1 === selectedMonth;
  });

  // Calculate totals
  const income = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Chart data
  const chartData = {
    labels: ['Income', 'Expenses'],
    datasets: [{
      data: [income, expenses],
      backgroundColor: ['#4CAF50', '#F44336'],
      borderWidth: 1,
    }],
  };

  // Loading/error states
  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;
  if (transactions.length === 0) {
    return <div className="text-gray-500 text-center py-8">No transactions found. Add some!</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Financial Dashboard</h1>
        
        {/* Month selector (optional) */}
        <select 
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="px-3 py-2 border rounded"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i+1} value={i+1}>
              {new Date(0, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Income vs Expenses</h2>
          <div className="h-64">
            <Pie 
              data={chartData} 
              options={{ 
                responsive: true,
                maintainAspectRatio: false 
              }} 
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium">Total Income</h3>
            <p className="text-2xl font-bold">${income.toFixed(2)}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-medium">Total Expenses</h3>
            <p className="text-2xl font-bold">${expenses.toFixed(2)}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium">Net Savings</h3>
            <p className={`text-2xl font-bold ${
              income - expenses >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ${(income - expenses).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;