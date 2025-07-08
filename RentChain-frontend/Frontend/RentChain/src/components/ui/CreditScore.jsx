import { useState, useEffect } from "react";
import { IoStarOutline } from "react-icons/io5";
import { useContracts } from '../../hooks/useContracts';
import { useWeb3 } from '../../context/Web3Context';

export default function CreditScore() {
  const { account } = useWeb3();
  const {
    getCreditScore,
    getPaymentTimeliness,
    getComplaintResolutionRate,
    getAverageRating,
    // getRentalHistory, // For future use
  } = useContracts();

  const [score, setScore] = useState(null);
  const [rating, setRating] = useState('');
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    async function fetchCreditScore() {
      setLoading(true);
      setError(null);
      try {
        const [score, payment, complaints, avgRating] = await Promise.all([
          getCreditScore(account),
          getPaymentTimeliness(account),
          getComplaintResolutionRate(account),
          getAverageRating(account),
        ]);
        setScore(score);
        // Determine rating label
        let ratingLabel = 'Unknown';
        if (score >= 800) ratingLabel = 'Excellent';
        else if (score >= 740) ratingLabel = 'Very Good';
        else if (score >= 670) ratingLabel = 'Good';
        else if (score >= 580) ratingLabel = 'Fair';
        else ratingLabel = 'Poor';
        setRating(ratingLabel);
        setFactors([
          {
            label: 'On-time Rent Payments',
            value: payment,
            max: 100,
            description: `You paid ${payment}% of your rent on time.`,
          },
          {
            label: 'Complaint Resolution Rate',
            value: complaints,
            max: 100,
            description: `You resolved ${complaints}% of complaints.`,
          },
          {
            label: 'Average Landlord Rating',
            value: avgRating,
            max: 5,
            description: `Your average landlord rating is ${avgRating}/5.`,
          },
        ]);
        setLastUpdated(new Date().toLocaleString());
      } catch (err) {
        setError('Failed to fetch credit score data.');
      } finally {
        setLoading(false);
      }
    }
    if (account) fetchCreditScore();
  }, [account, getCreditScore, getPaymentTimeliness, getComplaintResolutionRate, getAverageRating]);

  if (loading) return <div className="p-10 text-3xl text-center">Loading credit score...</div>;
  if (error) return <div className="p-10 text-3xl text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto mt-16 bg-white rounded-2xl shadow-lg p-10">
      <div className="flex items-center gap-6 mb-8">
        <div className="flex items-center justify-center w-24 h-24 text-6xl text-yellow-500 bg-yellow-100 rounded-full">
          <IoStarOutline />
        </div>
        <div>
          <div className="text-5xl font-bold">{score}</div>
          <div className="text-2xl font-semibold text-gray-700">{rating} rating</div>
          <div className="text-sm text-gray-400">Last updated: {lastUpdated}</div>
        </div>
      </div>
      <div className="mt-8 space-y-6">
        {factors.map((factor, i) => (
          <div key={i} className="">
            <div className="flex justify-between mb-1">
              <span className="font-medium text-gray-700">{factor.label}</span>
              <span className="font-semibold text-primary">
                {factor.value}
                {factor.max === 100 ? '%' : factor.max === 5 ? '/5' : ''}
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full">
              <div
                className="h-3 rounded-full bg-primary"
                style={{ width: `${(factor.value / factor.max) * 100}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-500 mt-1">{factor.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 