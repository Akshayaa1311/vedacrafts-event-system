import AdminSidebar from "../Components/AdminSidebar";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";

import { API_URL } from "../config";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Analytics() {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);

  // ───── FETCH DATA ─────────────────────
  useEffect(() => {
    fetchRegistrations();
    fetchEvents();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await axios.get(`${API_URL}/registrations`);
      setRegistrations(res.data.slice(1));
    } catch (err) {
      console.log(err);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_URL}/events?t=${Date.now()}`);
      setEvents(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ───── TOTAL EVENTS ─────────────────────
  const totalEvents = useMemo(() => {
    return events.length;
  }, [events]);

  // ───── TOTAL REGISTRATIONS ─────────────
  const totalRegistrations = registrations.length;

  // ───── ACTIVE EVENTS ───────────────────
  const activeEvents = useMemo(() => {
    const active = new Set();

    events.forEach((row) => {
      const eventId = row[0];
      const status = row[15];

      if (status === "published") {
        active.add(eventId);
      }
    });

    return active.size;
  }, [events]);

  // ───── DISTRICT COUNT ──────────────────
  const districtCount = useMemo(() => {
    const count = {};

    registrations.forEach((row) => {
      const district = row[5];
      if (district) {
        count[district] = (count[district] || 0) + 1;
      }
    });

    return count;
  }, [registrations]);

  // ───── EVENT COUNT ─────────────────────
  const eventCount = useMemo(() => {
    const count = {};

    registrations.forEach((row) => {
      const event = row[1];
      if (event) {
        count[event] = (count[event] || 0) + 1;
      }
    });

    return count;
  }, [registrations]);

  // ───── MONTHLY GROWTH ──────────────────
  const monthlyGrowth = useMemo(() => {
  const months = {};

  events.forEach((row) => {
    const dateValue = row[4]; // event date column
    if (!dateValue) return;

    const date = new Date(dateValue);
    if (isNaN(date)) return;

    const month = date.toLocaleString("default", {
      month: "short",
    });

    months[month] = (months[month] || 0) + 1;
  });

  return months;
}, [events]);

  // ───── TOP DISTRICT ────────────────────
  const topDistrict = useMemo(() => {
    const keys = Object.keys(districtCount);
    if (!keys.length) return "N/A";

    return keys.reduce((a, b) =>
      districtCount[a] > districtCount[b] ? a : b
    );
  }, [districtCount]);

  // ───── CHART DATA ──────────────────────
  const districtChartData = Object.entries(districtCount).map(
    ([name, value]) => ({ name, value })
  );

  const monthlyChartData = Object.entries(monthlyGrowth).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <div className="flex flex-col md:flex-row bg-[#f8f5ef] min-h-screen">
      <AdminSidebar />

      <div className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#245c1f]">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Event performance overview (Live Google Sheets Data)
          </p>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">

          <div className="bg-white p-4 md:p-5 rounded-2xl shadow">
            <p className="text-gray-500 text-sm">Total Events</p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1f4f1c] mt-2">{totalEvents}</h2>
          </div>

          <div className="bg-white p-4 md:p-5 rounded-2xl shadow">
            <p className="text-gray-500 text-sm">Total Registrations</p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1f4f1c] mt-2">
              {totalRegistrations}
            </h2>
          </div>

          <div className="bg-white p-4 md:p-5 rounded-2xl shadow">
            <p className="text-gray-500 text-sm">Active Events</p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1f4f1c] mt-2">
              {activeEvents}
            </h2>
          </div>

          <div className="bg-white p-4 md:p-5 rounded-2xl shadow">
            <p className="text-gray-500 text-sm">Top District</p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1f4f1c] mt-2 truncate">
              {topDistrict}
            </h2>
          </div>
        </div>

        {/* EVENT PERFORMANCE TABLE */}

        <div className="bg-white rounded-2xl shadow p-4 md:p-6">
  <h2 className="text-lg md:text-xl font-bold text-[#245c1f] mb-6">
    Event Performance
  </h2>

  <div className="space-y-3">
    {Object.entries(eventCount)
      .sort((a, b) => b[1] - a[1])
      .map(([event, count], index) => (
        <div
          key={event}
          className="flex items-center justify-between gap-3 bg-[#f8f5ef] p-3 md:p-4 rounded-xl"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-8 h-8 flex items-center justify-center bg-[#245c1f] text-white rounded-full text-sm shrink-0">
              {index + 1}
            </span>

            <span className="font-medium truncate">{event}</span>
          </div>

          <span className="font-bold text-[#245c1f] shrink-0">
            {count} regs
          </span>
        </div>
      ))}
  </div>
</div>

        {/* MONTHLY CHART */}
        <div className="bg-white rounded-2xl shadow p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-[#245c1f] mb-4">
            Monthly Registration Growth
          </h2>

          <div style={{ width: "100%", height: 260 }} className="md:!h-[300px]">
            <ResponsiveContainer>
              <BarChart data={monthlyChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#4caf50" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

                {/* DISTRICT CARDS */}
        <div className="bg-white rounded-2xl shadow p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-[#245c1f] mb-4">
            District Summary
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(districtCount).map(
              ([district, count]) => (
                <div
                  key={district}
                  className="bg-[#f8f5ef] p-4 rounded-xl"
                >
                  <h3 className="font-semibold">{district}</h3>
                  <p className="text-gray-600">
                    {count} Registrations
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        {/* DISTRICT CHART */}
        <div className="bg-white rounded-2xl shadow p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-[#245c1f] mb-4">
            District Insights
          </h2>

          <div style={{ width: "100%", height: 260 }} className="md:!h-[300px]">
            <ResponsiveContainer>
              <BarChart data={districtChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#4caf50" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;