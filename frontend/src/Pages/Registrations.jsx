import AdminSidebar from "../Components/AdminSidebar";
import { useEffect, useState } from "react";
import axios from "axios";

function Registrations() {
  const [registrations, setRegistrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await axios.get("http://localhost:5000/registrations");
      setRegistrations(res.data.slice(1));
    } catch (err) {
      console.log(err);
    }
  };

  const eventList = [...new Set(registrations.map((row) => row[1]))];

  const eventFilteredRegistrations = selectedEvent
    ? registrations.filter((row) => row[1] === selectedEvent)
    : registrations;

  const filteredRegistrations = eventFilteredRegistrations.filter((row) => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return true;
    return (
      String(row[2] || "").toLowerCase() === search ||
      String(row[3] || "").toLowerCase().includes(search) ||
      String(row[4] || "").toLowerCase().includes(search) ||
      String(row[5] || "").toLowerCase().includes(search) ||
      String(row[1] || "").toLowerCase().includes(search)
    );
  });

  const totalRegistrations = eventFilteredRegistrations.length;
  const totalSeats = 50;
  const seatsLeft = Math.max(0, totalSeats - totalRegistrations);
  const occupancy =
    totalRegistrations === 0
      ? 0
      : Math.round((totalRegistrations / totalSeats) * 100);

  return (
    <div className="flex flex-col md:flex-row bg-[#f8f5ef] min-h-screen">
      <AdminSidebar />

      <div className="flex-1 p-4 md:p-8">

        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#245c1f]">
            Registrations
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage participant registrations.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-2xl shadow p-4 md:p-6">
            <p className="text-gray-500 text-xs md:text-sm">👥 Total Registrations</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#245c1f] mt-2">
              {totalRegistrations}
            </h2>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 md:p-6">
            <p className="text-gray-500 text-xs md:text-sm">🪑 Seats Left</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#d89a07] mt-2">
              {seatsLeft}
            </h2>
          </div>
          <div className="bg-white rounded-2xl shadow p-4 md:p-6">
            <p className="text-gray-500 text-xs md:text-sm">📊 Occupancy</p>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-600 mt-2">
              {occupancy}%
            </h2>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search participant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-72 border rounded-xl px-4 py-3"
          />
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full sm:w-auto border rounded-xl px-4 py-3"
          >
            <option value="">All Events</option>
            {eventList.map((event) => (
              <option key={event} value={event}>
                {event}
              </option>
            ))}
          </select>
        </div>

        {/* Table — scrollable on mobile */}
        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead className="bg-[#245c1f] text-white">
              <tr>
                <th className="text-left p-3 md:p-4 text-sm">Name</th>
                <th className="text-left p-3 md:p-4 text-sm">Mobile</th>
                <th className="text-left p-3 md:p-4 text-sm hidden sm:table-cell">Email</th>
                <th className="text-left p-3 md:p-4 text-sm">District</th>
                <th className="text-left p-3 md:p-4 text-sm">Event</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map((row, index) => (
                <tr key={index} className="border-b">
                  <td className="p-3 md:p-4 text-sm">{row[2]}</td>
                  <td className="p-3 md:p-4 text-sm">{row[3]}</td>
                  <td className="p-3 md:p-4 text-sm hidden sm:table-cell">{row[4]}</td>
                  <td className="p-3 md:p-4 text-sm">{row[5]}</td>
                  <td className="p-3 md:p-4 text-sm">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default Registrations;