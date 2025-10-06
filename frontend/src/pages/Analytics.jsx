import React, { useEffect, useState } from "react";
import API from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

export default function Analytics() {
  const [analytics, setAnalytics] = useState({
    totalImages: 0,
    labelCounts: {},
    dailyUploads: [],
  });
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await API.get("/analytics");
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const labelData = Object.entries(analytics.labelCounts).map(
    ([label, count]) => ({
      label,
      count,
    })
  );

  const darkAxis = { stroke: "#ccc", tick: { fill: "#ccc" } };

  return (
    <div className="p-6 min-h-screen bg-gray-700 text-gray-100">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Analytics</h1>

        {loading ? (
          <p className="text-gray-300">Loading...</p>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                Total Images Uploaded
              </h2>
              <p className="text-lg text-gray-200">{analytics.totalImages}</p>
            </div>

            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-2">Label Counts</h2>
              {labelData.length === 0 ? (
                <p className="text-gray-300">No label data</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={labelData}>
                    <CartesianGrid stroke="#555" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="label"
                      stroke="#ccc"
                      tick={{ fill: "#ccc" }}
                    />
                    <YAxis stroke="#ccc" tick={{ fill: "#ccc" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        borderRadius: "6px",
                        borderColor: "#374151",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-2">Daily Uploads</h2>
              {analytics.dailyUploads.length === 0 ? (
                <p className="text-gray-300">No uploads yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.dailyUploads}>
                    <CartesianGrid stroke="#555" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      stroke="#ccc"
                      tick={{ fill: "#ccc" }}
                    />
                    <YAxis stroke="#ccc" tick={{ fill: "#ccc" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        borderRadius: "6px",
                        borderColor: "#374151",
                        color: "#fff",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
