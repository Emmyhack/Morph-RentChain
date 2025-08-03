import { FaDollarSign, FaRegBuilding } from "react-icons/fa";
import { IoCalendarOutline, IoStarOutline, IoWarningOutline } from "react-icons/io5";
import { useLocation } from "react-router-dom";
import { GoPeople } from "react-icons/go";
import { useContracts } from '../../../hooks/useContracts';
import { useWeb3 } from '../../../hooks/useWeb3';
import { useState, useEffect } from 'react';
import { Tooltip } from 'react-tooltip';

export default function DashboardShowCase() {
  const location = useLocation();
  const pathname = location.pathname;

  // Credit Score State (tenant only)
  const { account } = useWeb3();
  const {
    getCreditScore,
    getPaymentTimeliness,
    getComplaintResolutionRate,
    getAverageRating,
    getUserPayments,
    getProperty,
    getPayment,
  } = useContracts();
  const [score, setScore] = useState(null);
  const [rating, setRating] = useState('');
  const [loading, setLoading] = useState(true);
  const [factors, setFactors] = useState([]);
  const [activeLease, setActiveLease] = useState(null);
  const [nextPayment, setNextPayment] = useState(null);

  useEffect(() => {
    if (pathname !== "/dashboard/tenant-dashboard") return;
    async function fetchCreditScore() {
      setLoading(true);
      try {
        const [score, payment, complaints, avgRating] = await Promise.all([
          getCreditScore(account),
          getPaymentTimeliness(account),
          getComplaintResolutionRate(account),
          getAverageRating(account),
        ]);
        setScore(score);
        let ratingLabel = 'Unknown';
        if (score >= 800) ratingLabel = 'Excellent';
        else if (score >= 740) ratingLabel = 'Very Good';
        else if (score >= 670) ratingLabel = 'Good';
        else if (score >= 580) ratingLabel = 'Fair';
        else ratingLabel = 'Poor';
        setRating(ratingLabel);
        setFactors([
          { label: 'On-time Payments', value: payment, max: 100 },
          { label: 'Complaint Resolution', value: complaints, max: 100 },
          { label: 'Avg. Landlord Rating', value: avgRating, max: 5 },
        ]);
      } catch {
        setScore(null);
        setRating('Unavailable');
        setFactors([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCreditScore();
  }, [pathname, account, getCreditScore, getPaymentTimeliness, getComplaintResolutionRate, getAverageRating]);

  useEffect(() => {
    if (pathname !== "/dashboard/tenant-dashboard") return;
    async function fetchActiveLease() {
      try {
        const payments = await getUserPayments(account);
        if (payments && payments.length > 0) {
          // Assume the first payment is for the active property
          const payment = await getPayment(payments[0]);
          const property = await getProperty(payment.propertyId);
          setActiveLease(property);
        }
      } catch {
        setActiveLease(null);
      }
    }
    fetchActiveLease();
  }, [pathname, account, getUserPayments, getProperty, getPayment]);

  useEffect(() => {
    if (pathname !== "/dashboard/tenant-dashboard") return;
    async function fetchNextPayment() {
      try {
        const payments = await getUserPayments(account);
        let next = null;
        if (payments && payments.length > 0) {
          for (const paymentId of payments) {
            const payment = await getPayment(paymentId);
            // status 0 = unpaid, 1 = paid (adjust if your contract uses different codes)
            if (payment.status === 0) {
              next = payment;
              break;
            }
          }
        }
        setNextPayment(next);
      } catch {
        setNextPayment(null);
      }
    }
    fetchNextPayment();
  }, [pathname, account, getUserPayments, getPayment]);

  return (
    <div className="w-full section-page">
      {pathname == "/dashboard/landlord-dashboard" ? (
        <div className="grid justify-between w-full grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-4">
          <div className="w-full p-8 bg-white border border-gray-200 shadow-sm rounded-xl space-y-7">
            <div className="flex items-center justify-between">
              <h4 className="text-[1.7rem] font-medium text-secondary">total properties</h4>
              <FaRegBuilding className="text-3xl text-primary" />
            </div>
            <h3 className="text-6xl font-semibold">12</h3>
            <p className="text-2xl font-normal normal-case text-secondary">+2 this month</p>
          </div>

          <div className="w-full p-8 bg-white border border-gray-200 shadow-sm rounded-xl space-y-7">
            <div className="flex items-center justify-between">
              <h4 className="text-[1.7rem] font-medium text-secondary"> yearly revenue</h4>
              <FaDollarSign className="text-3xl text-green-500" />
            </div>
            <h3 className="text-6xl font-semibold">$24,500</h3>
            <p className="text-2xl font-normal normal-case text-secondary">+12% from last year</p>
          </div>
          <div className="w-full p-8 bg-white border border-gray-200 shadow-sm rounded-xl space-y-7">
            <div className="flex items-center justify-between">
              <h4 className="text-[1.7rem] font-medium text-secondary">active tenants</h4>
              <GoPeople className="text-3xl text-purple" />
            </div>
            <h3 className="text-6xl font-semibold">18</h3>
            <p className="text-2xl font-normal normal-case text-secondary">+3 new tenants </p>
          </div>
          <div className="w-full p-8 bg-white border border-gray-200 shadow-sm rounded-xl space-y-7">
            <div className="flex items-center justify-between">
              <h4 className="text-[1.7rem] font-medium text-secondary">pending issues</h4>
              <IoWarningOutline className="text-3xl text-red-500" />
            </div>
            <h3 className="text-6xl font-semibold">3</h3>
            <p className="text-2xl font-normal normal-case text-secondary">-2 from last week</p>
          </div>
        </div>
      ) : (
        <div className="grid justify-between w-full grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-4">
          <div className="w-full p-8 bg-white border border-gray-200 shadow-sm rounded-xl space-y-7">
            <div className="flex items-center justify-between">
              <h4 className="text-[1.7rem] font-medium text-secondary">current rent</h4>
              <FaDollarSign className="text-3xl text-green-500" />
            </div>
            <h3 className="text-6xl font-semibold">
              {nextPayment ? `$${Number(nextPayment.amount).toLocaleString()}` : '--'}
            </h3>
            <p className="text-2xl font-normal normal-case text-secondary">
              {nextPayment && nextPayment.dueDate ? `Due ${new Date(nextPayment.dueDate).toLocaleDateString()}` : 'No upcoming payment'}
            </p>
          </div>

          {/* Credit Score Widget */}
          <div className="w-full p-8 bg-white border border-gray-200 shadow-sm rounded-xl flex flex-col items-center justify-center relative">
            <div className="flex items-center justify-between w-full mb-2">
              <h4 className="text-[1.7rem] font-medium text-secondary">credit score</h4>
              <IoStarOutline className="text-3xl text-purple-500" />
            </div>
            <div className="relative flex flex-col items-center justify-center w-full mt-2">
              {/* Radial Progress Bar */}
              <svg width="100" height="100" className="mb-2">
                <circle cx="50" cy="50" r="44" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                <circle
                  cx="50" cy="50" r="44"
                  stroke="#a855f7"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={276.46}
                  strokeDashoffset={loading || score == null ? 276.46 : 276.46 - (score / 900) * 276.46}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s' }}
                />
                <text x="50" y="56" textAnchor="middle" fontSize="2.2rem" fontWeight="bold" fill="#a855f7">
                  {loading || score == null ? '--' : score}
                </text>
              </svg>
              <span className="text-xl font-semibold text-gray-700">{loading ? 'Loading...' : rating + ' rating'}</span>
              <span className="absolute top-2 right-2">
                <Tooltip id="credit-score-info" />
                <span data-tooltip-id="credit-score-info" data-tooltip-content="Your credit score is calculated from on-time payments, complaint resolution, and landlord ratings." className="text-gray-400 cursor-pointer text-lg">ℹ️</span>
              </span>
            </div>
            <div className="flex flex-col w-full mt-4 gap-2">
              {factors.map((factor, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{factor.label}</span>
                  <span className="font-semibold text-primary">
                    {factor.value}
                    {factor.max === 100 ? '%' : factor.max === 5 ? '/5' : ''}
                  </span>
                  <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${(factor.value / factor.max) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full p-8 bg-white border border-gray-200 shadow-sm rounded-xl space-y-7">
            <div className="flex items-center justify-between">
              <h4 className="text-[1.7rem] font-medium text-secondary">open requests</h4>
              <IoWarningOutline className="text-3xl text-red-500" />
            </div>
            <h3 className="text-6xl font-semibold">12</h3>
            <p className="text-2xl font-normal normal-case text-secondary">1 maintenance, 1 inquiry </p>
          </div>
          <div className="w-full p-8 bg-white border border-gray-200 shadow-sm rounded-xl space-y-7">
            <div className="flex items-center justify-between">
              <h4 className="text-[1.7rem] font-medium text-secondary">day left</h4>
              <IoCalendarOutline className="text-3xl text-primary" />
            </div>
            <h3 className="text-6xl font-semibold">5</h3>
            <p className="text-2xl font-normal normal-case text-secondary">Until next payment</p>
          </div>
          {/* Lease Agreement Quick Action */}
          {activeLease && activeLease.leaseAgreementIpfsHash && (
            <div className="w-full p-8 bg-white border border-green-200 shadow-sm rounded-xl flex flex-col items-center justify-center">
              <h4 className="text-[1.7rem] font-medium text-secondary mb-4">Lease Agreement</h4>
              <button
                className="px-6 py-3 bg-green-600 text-white rounded-full text-2xl font-semibold hover:bg-green-700 transition"
                onClick={() => window.open(`https://ipfs.io/ipfs/${activeLease.leaseAgreementIpfsHash}`, '_blank')}
              >
                View Lease Agreement
              </button>
              <p className="mt-4 text-lg text-gray-500 text-center">For: {activeLease.title}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
