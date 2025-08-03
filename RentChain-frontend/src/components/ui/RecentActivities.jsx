import { LuClock } from "react-icons/lu";
import { useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useContracts } from "../../hooks/useContracts";
import { useWeb3 } from "../../context/Web3Context";

export default function RecentActivities() {
  const location = useLocation();
  const pathname = location.pathname;
  const { account } = useWeb3();
  const {
    getUserPayments,
    getUserComplaints,
    getUserMessages,
    getUnreadMessages,
    // Add more hooks as needed
  } = useContracts();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    let newActivities = [];
    try {
      // Payments
      const payments = await getUserPayments(account);
      if (payments && payments.length > 0) {
        newActivities.push({
          type: "payment",
          message: `You have made ${payments.length} payment(s)`,
          time: "recently",
          status: "success",
        });
      }
      // Complaints
      const complaints = await getUserComplaints(account);
      if (complaints && complaints.length > 0) {
        newActivities.push({
          type: "complaint",
          message: `You have ${complaints.length} complaint(s) filed`,
          time: "recently",
          status: "warning",
        });
      }
      // Messages
      const messages = await getUserMessages(account);
      if (messages && messages.length > 0) {
        newActivities.push({
          type: "message",
          message: `You have ${messages.length} message(s)`,
          time: "recently",
          status: "info",
        });
      }
      // Unread messages
      const unread = await getUnreadMessages(account);
      if (unread && unread.length > 0) {
        newActivities.push({
          type: "unread",
          message: `You have ${unread.length} unread message(s)`,
          time: "recently",
          status: "info",
        });
      }
      // Add more activity fetches as needed (reminders, etc)
    } catch (e) {
      // fallback to empty
    }
    setActivities(newActivities);
    setLoading(false);
  }, [account, getUserPayments, getUserComplaints, getUserMessages, getUnreadMessages]);

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchActivities]);

  return (
    <div className="w-full p-12 bg-white border border-gray-200 shadow-sm rounded-xl space-y-7">
      <div className="space-y-5">
        <div className="flex items-center gap-x-5">
          <LuClock className="text-5xl" />
          <span className="text-5xl font-semibold">recent activities</span>
        </div>
        {loading ? (
          <div className="text-3xl text-secondary mt-10">Loading activities...</div>
        ) : activities.length === 0 ? (
          <div className="text-3xl text-secondary mt-10">No recent activities found.</div>
        ) : (
          <div className="w-full !mt-16 space-y-8">
            {activities.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between w-full border border-gray-200 p-7 rounded-xl">
              <div className="flex items-center w-full gap-x-10">
                  <div className={`w-5 h-5 rounded-full ${activity.status === 'success' ? 'bg-green-500' : activity.status === 'warning' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                <div className="space-y-3">
                    <p className="text-3xl font-medium normal-case text-secondary">{activity.message}</p>
                    <h4 className="text-2xl font-normal normal-case text-secondary">{activity.time}</h4>
            </div>
                </div>
                <div className={`flex items-center px-5 py-2 text-2xl font-semibold text-center text-white rounded-full place-content-end ${activity.status === 'success' ? 'bg-blue-500' : activity.status === 'warning' ? 'bg-red-500' : 'bg-gray-300'}`}>{activity.status}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
