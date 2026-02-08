import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { get_trips, get_trip } from "../../../store/Reducers/tripReducer";
import api from "../../../api/api";

const CopyDaysModal = ({ onClose, onCopy }) => {
  const dispatch = useDispatch();
  const [selectedTripId, setSelectedTripId] = useState("");
  const [selectedDayIndex, setSelectedDayIndex] = useState("all");
  const [loading, setLoading] = useState(false);

  // You may need to implement get_trips in your tripReducer if not present
  const { trips } = useSelector((state) => state.trip);
  const [modalTrip, setModalTrip] = useState(null);

  useEffect(() => {
    dispatch(
      get_trips({
        parPage: 100,
        currentPage: 1,
        searchValue: "",
        allTrips: "true",
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    if (selectedTripId) {
      setLoading(true);
      api
        .get(`/trip-get/${selectedTripId}`)
        .then((res) => setModalTrip(res.data.trip))
        .finally(() => setLoading(false));
    } else {
      setModalTrip(null);
    }
  }, [selectedTripId]);

  const handleCopy = () => {
    if (!modalTrip || !modalTrip.days) return;
    let daysToCopy = [];
    if (selectedDayIndex === "all") {
      daysToCopy = modalTrip.days.map((day) => ({
        title: day.title || "",
        overview: day.overview || "",
        image: day.image || "",
        imagePreview: day.image || null,
        mainDestination: day.mainDestination || {
          name: "",
          location: { lat: null, lng: null },
        },
        accommodation: day.accommodation || [],
        meals: day.meals || [],
        hotel: day.hotel || null,
      }));
    } else {
      const day = modalTrip.days[selectedDayIndex];
      if (day) {
        daysToCopy = [
          {
            title: day.title || "",
            overview: day.overview || "",
            image: day.image || "",
            imagePreview: day.image || null,
            mainDestination: day.mainDestination || {
              name: "",
              location: { lat: null, lng: null },
            },
            accommodation: day.accommodation || [],
            meals: day.meals || [],
            hotel: day.hotel || null,
          },
        ];
      }
    }
    onCopy(daysToCopy, true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/20 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-primary-100">
        <h2 className="mb-4 text-xl font-bold text-primary-800">
          Copy Days from Another Trip
        </h2>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold text-primary-800">
            Select Trip
          </label>
          <select
            className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
            value={selectedTripId}
            onChange={(e) => {
              setSelectedTripId(e.target.value);
              setSelectedDayIndex("all");
            }}
          >
            <option value="">-- Select a trip --</option>
            {trips &&
              trips.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.mainTitle}
                </option>
              ))}
          </select>
        </div>
        {loading && <div className="mb-4 text-text-light">Loading days...</div>}
        {modalTrip &&
          modalTrip.days &&
          modalTrip.days.length > 0 &&
          !loading && (
            <div className="mb-4">
              <label className="mb-2 block text-sm font-bold text-primary-800">
                Select Day(s)
              </label>
              <select
                className="w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3 text-text-dark focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                value={selectedDayIndex}
                onChange={(e) => setSelectedDayIndex(e.target.value)}
              >
                <option value="all">All Days</option>
                {modalTrip.days.map((day, idx) => (
                  <option key={idx} value={idx}>
                    Day {idx + 1}: {day.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        <div className="flex justify-end gap-3 pt-2">
          <button
            className="rounded-xl bg-neutral-200 px-6 py-2.5 font-medium text-text-dark transition-colors hover:bg-neutral-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="shadow-coral-medium hover:shadow-coral-large rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-6 py-2.5 font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
            onClick={handleCopy}
            disabled={!selectedTripId || loading}
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
};

export default CopyDaysModal;
