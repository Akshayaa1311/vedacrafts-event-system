import AdminSidebar from "../Components/AdminSidebar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";


function AdminDashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
const [registrations, setRegistrations] = useState([]);

useEffect(() => {
  fetchEvents();
  fetchRegistrations();
}, []);

const fetchEvents = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5000/events?t=" + Date.now()
    );

    setEvents(res.data);
  } catch (err) {
    console.log(err);
  }
};

const fetchRegistrations = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5000/registrations"
    );

    setRegistrations(res.data.slice(1));
  } catch (err) {
    console.log(err);
  }
};

const totalEvents = events.length;

const totalRegistrations =
  registrations.length;

const activeEvents = useMemo(() => {

  return events.filter(
    (event) =>
      event[15] === "published"
  ).length;

}, [events]);

const districtsCovered = useMemo(() => {

  const districts = new Set();

  events.forEach((event) => {
    if (event[9]) {
      districts.add(event[9]);
    }
  });

  return districts.size;

}, [events]);

return ( <div className="flex flex-col md:flex-row bg-[#f8f5ef] min-h-screen">


  <AdminSidebar />

  <div className="flex-1 p-4 md:p-8">

    {/* Header */}

    <div className="flex justify-between items-center">

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1f4f1c]">
          Welcome Back 👋
        </h1>

        <p className="text-gray-600 mt-1">
          Here's what's happening with your events.
        </p>
      </div>


    </div>

    {/* Stats Cards */}

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mt-8">

      <div className="bg-gradient-to-r from-[#245c1f] to-[#3b7a2a] text-white rounded-2xl p-4 md:p-6 shadow-lg">
        <p className="text-sm opacity-80">
          Total Events
        </p>

        <h2 className="text-2xl md:text-3xl font-bold mt-2">
          {totalEvents}
        </h2>
      </div>

      <div className="bg-gradient-to-r from-[#d89a07] to-[#f4b400] text-white rounded-2xl p-4 md:p-6 shadow-lg">
        <p className="text-sm opacity-80">
          Registrations
        </p>

        <h2 className="text-2xl md:text-3xl font-bold mt-2">
          {totalRegistrations}
        </h2>
      </div>

      <div className="bg-gradient-to-r from-[#0f766e] to-[#14b8a6] text-white rounded-2xl p-4 md:p-6 shadow-lg">
        <p className="text-sm opacity-80">
          Active Events
        </p>

        <h2 className="text-2xl md:text-3xl font-bold mt-2">
          {activeEvents}
        </h2>
      </div>

      <div className="bg-gradient-to-r from-[#92400e] to-[#f59e0b] text-white rounded-2xl p-4 md:p-6 shadow-lg">
        <p className="text-sm opacity-80">
          Districts Covered
        </p>

        <h2 className="text-2xl md:text-3xl font-bold mt-2">
          {districtsCovered}
        </h2>
      </div>

    </div>

    {/* Quick Actions */}

    <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">

      <button
  onClick={() => navigate("/create-event")}
  className="w-full sm:w-auto bg-[#1f4f1c] text-white px-5 py-3 rounded-xl hover:scale-105 transition"
>
  + Create Event
</button>

      <button
  onClick={() => navigate("/registrations")}
  className="w-full sm:w-auto bg-[#ffbe2a] text-black px-5 py-3 rounded-xl hover:scale-105 transition"
>
  View Registrations
</button>

    </div>

    {/* Recent Events */}

<div className="mt-10">

  <h2 className="text-xl md:text-2xl font-semibold text-[#1f4f1c] mb-5">
    Recent Events
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">

    {events
  .slice()
  .reverse()
  .slice(0, 3)
  .map((event) => (

    <div
      key={event[0]}
      className="bg-[#eef5ea] rounded-[30px] p-6 md:p-8 border border-[#dce8d5] hover:-translate-y-2 transition duration-300 shadow-sm"
    >

      <div className="flex items-start gap-5">

        <div className="w-16 h-16 rounded-full bg-[#d8e8cf] flex items-center justify-center text-3xl shrink-0">
          📅
        </div>

        <div>

          <h2 className="text-xl font-bold text-[#245c1f]">
            {event[1]}
          </h2>

          <p className="mt-3 text-[#7a5c47] text-base">
            {event[9]} • {event[4]}
          </p>

          <span
            className={`inline-block mt-4 px-3 py-1 rounded-full text-sm ${
              event[15] === "published"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {event[15]}
          </span>

          <button
            onClick={() =>
              navigate(`/edit-event/${event[0]}`)
            }
            className="mt-5 block bg-[#ffbe2a] px-5 py-2 rounded-xl font-medium hover:scale-105 transition"
          >
            Edit
          </button>

        </div>

      </div>

    </div>

))}
  </div>

</div>




  </div>

        </div>



);
}

export default AdminDashboard;