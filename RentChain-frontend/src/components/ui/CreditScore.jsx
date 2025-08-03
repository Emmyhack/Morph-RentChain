import { useState, useEffect } from "react";
import { IoStarOutline, IoTrendingUpOutline, IoRefreshOutline, IoArrowBackSharp, IoTimeOutline, IoShieldCheckmarkOutline, IoWalletOutline } from "react-icons/io5";
import { useContracts } from '../../hooks/useContracts';
import { useWeb3 } from '../../hooks/useWeb3';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function CreditScore() {
  const { account, formatAddress } = useWeb3();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    getCreditScore,
    getPaymentTimeliness,
    getComplaintResolutionRate,
    getAverageRating,
  } = useContracts();

  const [score, setScore] = useState(null);
  const [rating, setRating] = useState('');
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [trends, setTrends] = useState({});

  // Mock real-time data generation
  const generateMockData = () => {
    const baseScore = 720 + Math.floor(Math.random() * 80); // 720-800 range
    const paymentTimeliness = 85 + Math.floor(Math.random() * 15); // 85-100%
    const complaintResolution = 80 + Math.floor(Math.random() * 20); // 80-100%
    const avgRating = 4.0 + (Math.random() * 1); // 4.0-5.0

    return {
      score: baseScore,
      paymentTimeliness,
      complaintResolution,
      avgRating: parseFloat(avgRating.toFixed(1))
    };
  };

  // Determine rating and color based on score
  const getRatingInfo = (score) => {
    if (score >= 800) return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100', progressColor: 'bg-green-500' };
    else if (score >= 740) return { label: 'Very Good', color: 'text-blue-600', bgColor: 'bg-blue-100', progressColor: 'bg-blue-500' };
    else if (score >= 670) return { label: 'Good', color: 'text-indigo-600', bgColor: 'bg-indigo-100', progressColor: 'bg-indigo-500' };
    else if (score >= 580) return { label: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100', progressColor: 'bg-yellow-500' };
    else return { label: 'Poor', color: 'text-red-600', bgColor: 'bg-red-100', progressColor: 'bg-red-500' };
  };

  const fetchCreditScore = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Use mock data for demo purposes
      const data = generateMockData();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, isRefresh ? 1000 : 2000));

      setScore(data.score);
      
      const ratingInfo = getRatingInfo(data.score);
      setRating(ratingInfo.label);

      // Calculate trends (mock)
      const previousScore = score || data.score - 10;
      const scoreTrend = data.score - previousScore;
      
      setTrends({
        score: scoreTrend,
        payments: Math.floor(Math.random() * 6) - 3, // -3 to +3
        complaints: Math.floor(Math.random() * 10) - 5, // -5 to +5
        rating: (Math.random() * 0.4) - 0.2 // -0.2 to +0.2
      });

      setFactors([
        {
          label: t('ontime_payments') || 'On-time Rent Payments',
          value: data.paymentTimeliness,
          max: 100,
          description: t('payment_description') || `You paid ${data.paymentTimeliness}% of your rent on time.`,
          trend: trends.payments || 0,
          icon: IoTimeOutline,
          color: data.paymentTimeliness >= 90 ? 'text-green-600' : data.paymentTimeliness >= 75 ? 'text-yellow-600' : 'text-red-600'
        },
        {
          label: t('complaint_resolution') || 'Complaint Resolution Rate',
          value: data.complaintResolution,
          max: 100,
          description: t('complaint_description') || `You resolved ${data.complaintResolution}% of complaints promptly.`,
          trend: trends.complaints || 0,
          icon: IoShieldCheckmarkOutline,
          color: data.complaintResolution >= 90 ? 'text-green-600' : data.complaintResolution >= 75 ? 'text-yellow-600' : 'text-red-600'
        },
        {
          label: t('landlord_rating') || 'Average Landlord Rating',
          value: data.avgRating,
          max: 5,
          description: t('rating_description') || `Your average landlord rating is ${data.avgRating}/5.`,
          trend: trends.rating || 0,
          icon: IoStarOutline,
          color: data.avgRating >= 4.5 ? 'text-green-600' : data.avgRating >= 3.5 ? 'text-yellow-600' : 'text-red-600'
        }
      ]);

      // Update score history (mock)
      setScoreHistory(prev => {
        const newHistory = [...prev, { date: new Date(), score: data.score }];
        return newHistory.slice(-30); // Keep last 30 entries
      });

      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      setError(t('fetch_error') || 'Failed to fetch credit score data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (account) {
      fetchCreditScore();
      
      // Set up real-time updates every 30 seconds
      const interval = setInterval(() => {
        fetchCreditScore(true);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [account]);

  const handleRefresh = () => {
    fetchCreditScore(true);
  };

  if (loading) {
    return (
      <div className="w-full section-page !py-52">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-2xl text-gray-600">{t('loading_score') || 'Loading credit score...'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full section-page !py-52">
        <div className="text-center">
          <p className="text-2xl text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchCreditScore()}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            {t('try_again') || 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  const ratingInfo = getRatingInfo(score);

  return (
    <div className="w-full section-page !py-52">
      <div className="relative w-full pt-20">
        <div
          onClick={() => navigate(-1)}
          className="absolute top-0 left-0 flex items-center cursor-pointer gap-x-6 hover:scale-95 hover:text-primary"
        >
          <IoArrowBackSharp className="text-4xl" />
          <span className="text-3xl font-medium">{t('back') || 'Back'}</span>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">{t('trust_score') || 'Trust Score'}</h1>
            <p className="text-2xl text-gray-600">{t('score_description') || 'Your blockchain-verified rental creditworthiness'}</p>
            <div className="mt-4 flex items-center justify-center gap-4 text-lg text-gray-500">
              <IoWalletOutline className="text-xl" />
              <span>{formatAddress(account)}</span>
              <span>•</span>
              <span>{t('last_updated') || 'Last updated'}: {lastUpdated}</span>
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="ml-4 p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                <IoRefreshOutline className={`text-xl ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Main Score Card */}
          <div className="bg-white rounded-3xl shadow-xl p-12 mb-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              {/* Score Display */}
              <div className="text-center lg:text-left">
                <div className="flex items-center gap-6 mb-6">
                  <div className={`flex items-center justify-center w-20 h-20 text-4xl ${ratingInfo.color} ${ratingInfo.bgColor} rounded-full`}>
                    <IoStarOutline />
                  </div>
                  <div>
                    <div className="text-7xl font-bold mb-2">{score}</div>
                    <div className={`text-3xl font-semibold ${ratingInfo.color}`}>{rating}</div>
                  </div>
                </div>
                
                {/* Score Range Visual */}
                <div className="relative mt-8">
                  <div className="w-80 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${ratingInfo.progressColor} transition-all duration-1000 ease-out`}
                      style={{ width: `${(score / 850) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span>300</span>
                    <span>850</span>
                  </div>
                  <div className="text-center mt-2 text-lg font-medium text-gray-700">
                    {t('credit_range') || 'Credit Score Range'}
                  </div>
                </div>
              </div>

              {/* Score Trend */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-4">
                  <IoTrendingUpOutline className="text-3xl text-blue-600" />
                  <h3 className="text-2xl font-semibold text-gray-800">{t('score_trend') || 'Score Trend'}</h3>
                </div>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {trends.score > 0 ? '+' : ''}{trends.score || 0}
                </div>
                <p className="text-gray-600">{t('trend_description') || 'Points from last month'}</p>
                <div className="mt-4 text-sm text-gray-500">
                  {trends.score > 0 ? (
                    <span className="text-green-600">↗ {t('improving') || 'Improving'}</span>
                  ) : trends.score < 0 ? (
                    <span className="text-red-600">↘ {t('declining') || 'Declining'}</span>
                  ) : (
                    <span className="text-gray-600">→ {t('stable') || 'Stable'}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Factors Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {factors.map((factor, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 ${factor.color} bg-opacity-10 rounded-xl`}>
                    <factor.icon className={`text-2xl ${factor.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{factor.label}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${factor.color}`}>
                        {factor.value}
                        {factor.max === 100 ? '%' : factor.max === 5 ? '/5' : ''}
                      </span>
                      {factor.trend && (
                        <span className={`text-sm ${factor.trend > 0 ? 'text-green-600' : factor.trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {factor.trend > 0 ? '↗' : factor.trend < 0 ? '↘' : '→'} {Math.abs(factor.trend)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="relative mb-4">
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ease-out ${factor.color.replace('text-', 'bg-')}`}
                      style={{ width: `${(factor.value / factor.max) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">{factor.description}</p>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">{t('score_benefits') || 'Benefits of Good Credit Score'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">🏠</div>
                <h4 className="font-semibold text-gray-700">{t('better_properties') || 'Better Properties'}</h4>
                <p className="text-sm text-gray-600">{t('access_premium') || 'Access to premium listings'}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">💳</div>
                <h4 className="font-semibold text-gray-700">{t('lower_deposits') || 'Lower Deposits'}</h4>
                <p className="text-sm text-gray-600">{t('reduced_security') || 'Reduced security deposits'}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">⚡</div>
                <h4 className="font-semibold text-gray-700">{t('faster_approval') || 'Faster Approval'}</h4>
                <p className="text-sm text-gray-600">{t('quick_processing') || 'Quick application processing'}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🌟</div>
                <h4 className="font-semibold text-gray-700">{t('priority_status') || 'Priority Status'}</h4>
                <p className="text-sm text-gray-600">{t('preferred_tenant') || 'Preferred tenant status'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 