"use client";

import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PropagateLoader } from "react-spinners";
import { Autocomplete, Checkbox, TextField } from "@mui/material";
import { CheckBoxOutlineBlank, CheckBox } from "@mui/icons-material";
import { toast } from "react-hot-toast";
import { Link, useLocation, useParams } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";
import debounce from "lodash.debounce";

import {
  get_category,
  categoryAdd,
} from "../../store/Reducers/categoryReducer";
import {
  get_inclusions,
  inclusionAdd,
} from "../../store/Reducers/inclusionReducer";
import {
  get_exclusions,
  exclusionAdd,
} from "../../store/Reducers/exclusionReducer";
import { get_meals, mealAdd } from "../../store/Reducers/mealReducer";
import {
  accommodationAdd,
  get_accommodations,
} from "../../store/Reducers/accommodationReducer";
import {
  clearMessage,
  clearTrip,
  get_trip,
  tripAdd,
  update_trip,
} from "../../store/Reducers/tripReducer";
import ImageUpload from "../components/trip components/ImageUpload";

// VideoUpload component
const VideoUpload = ({ id, preview, onChange, label }) => (
  <div className="space-y-3">
    <label className="text-sm font-bold text-primary-800">{label}</label>
    <div className="relative">
      <input
        id={id}
        type="file"
        accept="video/*"
        onChange={onChange}
        className="absolute inset-0 w-full cursor-pointer opacity-0"
      />
      <div className="flex h-32 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-primary-300 bg-primary-50/30 transition-all hover:border-secondary hover:bg-secondary-50/30">
        {preview ? (
          <div className="flex flex-col items-center space-y-2">
            <video
              src={preview}
              className="h-20 w-32 rounded-lg object-cover ring-2 ring-primary-200"
              controls
            />
            <span className="text-xs text-text-light">
              Click to change video
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <svg
              className="h-8 w-8 text-text-light"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm font-medium text-text-dark">
              Upload Video
            </span>
            <span className="text-xs text-text-light">
              MP4, MOV, AVI up to 50MB
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
);
import HeaderText from "./HeaderText";
import AddQuickModal from "../components/trip components/AddQuickModal";
import PricingModal from "../components/trip components/PricingModal";
import InclusionsExclusionsModal from "../components/trip components/InclusionsExclusionsModal";
import ItineraryModal from "../components/trip components/ItineraryModal";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { tripBasicSchema } from "../../utils/validationSchemas";
import SeoManager from "../../components/SeoManager";

// Helper for Nominatim search
const fetchNominatim = async (query) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  return res.json();
};

// Helper to check if a draft is empty
const isDraftEmpty = (draft) => {
  if (!draft) return true;

  // Helper function to check if pricing object has any values
  const hasPricingValues = (pricingObj) => {
    if (!pricingObj) return false;
    return Object.values(pricingObj).some(
      (value) =>
        value !== "" && value !== null && value !== undefined && value !== 0,
    );
  };

  // Helper function to check if regular prices have any values
  const hasRegularPrices = (regularPrices) => {
    if (!regularPrices) return false;
    return (
      hasPricingValues(regularPrices.budget) ||
      hasPricingValues(regularPrices.midRange) ||
      hasPricingValues(regularPrices.luxury)
    );
  };

  // Helper function to check if seasons have any values
  const hasSeasonValues = (seasons) => {
    if (!Array.isArray(seasons) || seasons.length === 0) return false;
    return seasons.some(
      (season) =>
        season.name ||
        season.startDate ||
        season.endDate ||
        (season.rates && hasRegularPrices(season.rates)),
    );
  };

  // Check main fields
  if (
    draft.mainTitle ||
    draft.overview ||
    draft.description ||
    (draft.mainImage && draft.mainImage !== null) ||
    (draft.mainImagePreview && draft.mainImagePreview !== null) ||
    (draft.mainVideo && draft.mainVideo !== null) ||
    (draft.mainVideoPreview && draft.mainVideoPreview !== null) ||
    (draft.mainDestinations &&
      Array.isArray(draft.mainDestinations) &&
      draft.mainDestinations.length > 0 &&
      draft.mainDestinations.some((d) => d && d.name)) ||
    (draft.mainDestination && draft.mainDestination.name) || // Legacy support
    draft.category ||
    (draft.selectedInclusions &&
      (draft.selectedInclusions.budget?.length > 0 ||
        draft.selectedInclusions.midRange?.length > 0 ||
        draft.selectedInclusions.luxury?.length > 0)) ||
    (draft.selectedExclusions &&
      (draft.selectedExclusions.budget?.length > 0 ||
        draft.selectedExclusions.midRange?.length > 0 ||
        draft.selectedExclusions.luxury?.length > 0)) ||
    (Array.isArray(draft.days) &&
      draft.days.length > 0 &&
      draft.days.some(
        (day) =>
          day.title ||
          day.overview ||
          (day.image && day.image !== null) ||
          (day.imagePreview && day.imagePreview !== null) ||
          (day.mainDestination && day.mainDestination.name) ||
          (Array.isArray(day.accommodation) && day.accommodation.length > 0) ||
          (Array.isArray(day.meals) && day.meals.length > 0),
      )) ||
    (draft.discount && draft.discount !== 0) ||
    (draft.pricingType && draft.pricingType !== "yearRound") ||
    (draft.pricingType === "yearRound" &&
      hasRegularPrices(draft.regularPrices)) ||
    (draft.pricingType === "seasonal" && hasSeasonValues(draft.seasons)) ||
    (draft.seo && (
      (draft.seo.allowSearch && draft.seo.allowSearch !== "yes") || 
      ["general", "openGraph", "twitter"].some(tab => 
        draft.seo[tab]?.title || 
        draft.seo[tab]?.description || 
        draft.seo[tab]?.image
      )
    ))
  ) {
    return false;
  }
  return true;
};

// ResumeDraftModal component
const ResumeDraftModal = ({ onResume, onDiscard }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/20 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-primary-100">
      <h2 className="mb-4 text-xl font-bold text-primary-800">
        Resume Previous Draft?
      </h2>
      <p className="mb-6 text-text-dark">
        You have an unsaved draft for this trip. Would you like to resume where
        you left off or start fresh?
      </p>
      <div className="flex justify-end gap-2">
        <button
          className="rounded-xl bg-neutral-200 px-4 py-2 font-medium text-text-dark hover:bg-neutral-300"
          onClick={onDiscard}
        >
          Start Fresh
        </button>
        <button
          className="shadow-coral-medium hover:shadow-coral-large rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-4 py-2 font-semibold text-white transition-all hover:scale-105"
          onClick={onResume}
        >
          Resume
        </button>
      </div>
    </div>
  </div>
);

// Main AddTrip Component
const AddTrip = () => {
  const { tripId } = useParams();
  const dispatch = useDispatch();
  const [searchParams] = useState({
    currentPage: 1,
    parPage: 5,
    searchValue: "",
  });
  const location = useLocation();
  const [showResumeDraft, setShowResumeDraft] = useState(false);
  const [draftToResume, setDraftToResume] = useState(null);

  // Modal states
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showInclusionsExclusionsModal, setShowInclusionsExclusionsModal] =
    useState(false);
  const [showItineraryModal, setShowItineraryModal] = useState(false);

  // Multiple destination search states - using array of objects
  const [destinationQueries, setDestinationQueries] = useState([""]);
  const [destinationResults, setDestinationResults] = useState([[]]);
  const [destinationLoading, setDestinationLoading] = useState([false]);
  const destinationInputRefs = useRef([]);

  // Start point search state
  const [startPointQuery, setStartPointQuery] = useState("");
  const [startPointResults, setStartPointResults] = useState([]);
  const [startPointLoading, setStartPointLoading] = useState(false);
  const startPointInputRef = useRef();

  // End point search state
  const [endPointQuery, setEndPointQuery] = useState("");
  const [endPointResults, setEndPointResults] = useState([]);
  const [endPointLoading, setEndPointLoading] = useState(false);
  const endPointInputRef = useRef();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: yupResolver(tripBasicSchema),
    defaultValues: {
      mainTitle: "",
      overview: "",
      description: "",
      category: "",
      mainImage: null,
      seo: {
        allowSearch: "yes",
        general: { title: "", description: "", image: null },
        openGraph: { title: "", description: "", image: null },
        twitter: { title: "", description: "", image: null },
      },
    },
    mode: "onChange",
  });

  const [formData, setFormData] = useState({
    mainImagePreview: null,
    mainVideo: null,
    mainVideoPreview: null,
    mainDestinations: [{ name: "", location: { lat: null, lng: null } }],
    startPoint: { name: "", location: { lat: null, lng: null } },
    endPoint: { name: "", location: { lat: null, lng: null } },
    selectedInclusions: {
      budget: [],
      midRange: [],
      luxury: [],
    },
    selectedExclusions: {
      budget: [],
      midRange: [],
      luxury: [],
    },
    daysCount: 0,
    days: [],
    discount: 0,
    pricingType: "yearRound", // Default to year-round pricing
    regularPrices: {
      budget: {
        onePerson: "",
        twoPerson: "",
        threePerson: "",
        fourPerson: "",
        fiveOrMorePerson: "",
      },
      midRange: {
        onePerson: "",
        twoPerson: "",
        threePerson: "",
        fourPerson: "",
        fiveOrMorePerson: "",
      },
      luxury: {
        onePerson: "",
        twoPerson: "",
        threePerson: "",
        fourPerson: "",
        fiveOrMorePerson: "",
      },
    },
    seasons: [],
     seo: {
        allowSearch: "yes",
        general: { title: "", description: "", image: null },
        openGraph: { title: "", description: "", image: null },
        twitter: { title: "", description: "", image: null },
      },
  });

  // Sync form values with react-hook-form
  const mainTitle = watch("mainTitle");
  const overview = watch("overview");
  const description = watch("description");
  const category = watch("category");
  const mainImage = watch("mainImage");

  const { categories } = useSelector((state) => state.category);
  const { inclusions } = useSelector((state) => state.inclusion);
  const { exclusions } = useSelector((state) => state.exclusion);
  const { accommodations } = useSelector((state) => state.accommodation);
  const { meals } = useSelector((state) => state.meal);
  const { trip, successMessage, errorMessage, loader } = useSelector(
    (state) => state.trip,
  );
  
  const draftKey = tripId ? `tripDraft-${tripId}` : "tripDraft-new";

  // On mount, check for draft
  useEffect(() => {
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      const parsedDraft = JSON.parse(draft);
      if (!isDraftEmpty(parsedDraft)) {
        setDraftToResume(parsedDraft);
        setShowResumeDraft(true);
      }
    }
  }, [draftKey]);

  // Save draft on formData change
  useEffect(() => {
    // Don't save if resuming from draft and haven't confirmed yet
    if (showResumeDraft) return;

    // Debug: Log when pricing data changes
    if (
      formData.regularPrices &&
      Object.values(formData.regularPrices).some((category) =>
        Object.values(category).some(
          (value) => value !== "" && value !== null && value !== undefined,
        ),
      )
    ) {
      // Saving draft with pricing data
    }

    localStorage.setItem(draftKey, JSON.stringify(formData));
  }, [formData, draftKey, showResumeDraft]);

  // Reset form function
  const resetForm = () => {
    setFormData({
      mainTitle: "",
      overview: "",
      description: "",
      mainImage: null,
      mainImagePreview: null,
      mainVideo: null,
      mainVideoPreview: null,
      mainDestinations: [{ name: "", location: { lat: null, lng: null } }],
      startPoint: { name: "", location: { lat: null, lng: null } },
      endPoint: { name: "", location: { lat: null, lng: null } },
      category: "",
      selectedInclusions: {
        budget: [],
        midRange: [],
        luxury: [],
      },
      selectedExclusions: {
        budget: [],
        midRange: [],
        luxury: [],
      },
      daysCount: 0,
      days: [],
      discount: 0,
      pricingType: "yearRound",
      regularPrices: {
        budget: {
          onePerson: "",
          twoPerson: "",
          threePerson: "",
          fourPerson: "",
          fiveOrMorePerson: "",
        },
        midRange: {
          onePerson: "",
          twoPerson: "",
          threePerson: "",
          fourPerson: "",
          fiveOrMorePerson: "",
        },
        luxury: {
          onePerson: "",
          twoPerson: "",
          threePerson: "",
          fourPerson: "",
          fiveOrMorePerson: "",
        },
      },
      seasons: [],
      seo: {
        allowSearch: "yes",
        general: { title: "", description: "", image: null },
        openGraph: { title: "", description: "", image: null },
        twitter: { title: "", description: "", image: null },
      },
    });

    // Reset destination search state
    setDestinationQueries([""]);
    setDestinationResults([[]]);
    setDestinationLoading([false]);
    setStartPointQuery("");
    setStartPointResults([]);
    setEndPointQuery("");
    setEndPointResults([]);
  };

  // On successful submit, clear draft and reset form
  useEffect(() => {
    if (successMessage) {

      // Clear draft for both new trips and updates
      localStorage.removeItem(draftKey);

      // Only reset form for new trips, not when editing
      if (!tripId) {
        // Add a small delay to ensure the success message is shown
        setTimeout(() => {
          resetForm();
          // Clear the success message after form reset
          dispatch(clearMessage());
        }, 1500);
      } else {
        // For editing, just clear the message after a delay
        setTimeout(() => {
          dispatch(clearMessage());
        }, 1500);
      }
    }
  }, [successMessage, draftKey, tripId, dispatch]);

  // Resume draft handler
  const handleResumeDraft = () => {
    // Safeguard: If accommodations or meals have changed, map days to valid values
    const validAccommodations = accommodations.map((a) => a._id);
    const validMeals = meals.map((m) => m.name);
    const validInclusions = inclusions.map((i) => i.name);
    const validExclusions = exclusions.map((e) => e.name);
    const safeDraft = { ...draftToResume };

    // Handle days - ensure proper structure
    if (safeDraft.days && Array.isArray(safeDraft.days)) {
      safeDraft.days = safeDraft.days.map((day) => ({
        title: day.title || "",
        overview: day.overview || "",
        image: day.image || "",
        imagePreview: day.imagePreview || null,
        mainDestination: day.mainDestination || {
          name: "",
          location: { lat: null, lng: null },
        },
        accommodation: Array.isArray(day.accommodation)
          ? day.accommodation.filter((item) => {
              // Handle both ID strings and accommodation objects
              const accommodationId =
                typeof item === "string" ? item : item._id || item.id;
              return validAccommodations.includes(accommodationId);
            })
          : [],
        meals: Array.isArray(day.meals)
          ? day.meals.filter((name) => validMeals.includes(name))
          : [],
      }));
    } else {
      safeDraft.days = [];
    }

    // Ensure daysCount matches days length
    safeDraft.daysCount = safeDraft.days.length;

    // Handle inclusions and exclusions - ensure they have the new structure
    if (
      !safeDraft.selectedInclusions ||
      (typeof safeDraft.selectedInclusions === "object" &&
        !safeDraft.selectedInclusions.budget)
    ) {
      safeDraft.selectedInclusions = {
        budget: Array.isArray(safeDraft.selectedInclusions)
          ? safeDraft.selectedInclusions.filter((name) =>
              validInclusions.includes(name),
            )
          : [],
        midRange: safeDraft.selectedInclusions?.midRange || [],
        luxury: safeDraft.selectedInclusions?.luxury || [],
      };
    }

    if (
      !safeDraft.selectedExclusions ||
      (typeof safeDraft.selectedExclusions === "object" &&
        !safeDraft.selectedExclusions.standard)
    ) {
      safeDraft.selectedExclusions = {
        standard: Array.isArray(safeDraft.selectedExclusions)
          ? safeDraft.selectedExclusions.filter((name) =>
              validExclusions.includes(name),
            )
          : [],
        midRange: safeDraft.selectedExclusions?.midRange || [],
        luxury: safeDraft.selectedExclusions?.luxury || [],
      };
    }

    // Ensure main destinations have proper structure - convert legacy single destination to array
    if (
      !safeDraft.mainDestinations ||
      !Array.isArray(safeDraft.mainDestinations)
    ) {
      // Check if it's a legacy single destination object
      if (
        safeDraft.mainDestination &&
        typeof safeDraft.mainDestination === "object" &&
        safeDraft.mainDestination.name
      ) {
        safeDraft.mainDestinations = [safeDraft.mainDestination];
      } else {
        safeDraft.mainDestinations = [
          { name: "", location: { lat: null, lng: null } },
        ];
      }
    } else if (safeDraft.mainDestinations.length === 0) {
      safeDraft.mainDestinations = [
        { name: "", location: { lat: null, lng: null } },
      ];
    }

    // Ensure start point has proper structure
    if (!safeDraft.startPoint || typeof safeDraft.startPoint !== "object") {
      safeDraft.startPoint = {
        name: "",
        location: { lat: null, lng: null },
      };
    }

    // Ensure end point has proper structure
    if (!safeDraft.endPoint || typeof safeDraft.endPoint !== "object") {
      safeDraft.endPoint = {
        name: "",
        location: { lat: null, lng: null },
      };
    }

    // Ensure pricing structure is correct
    if (!safeDraft.regularPrices) {
      safeDraft.regularPrices = {
        budget: {
          onePerson: "",
          twoPerson: "",
          threePerson: "",
          fourPerson: "",
          fiveOrMorePerson: "",
        },
        midRange: {
          onePerson: "",
          twoPerson: "",
          threePerson: "",
          fourPerson: "",
          fiveOrMorePerson: "",
        },
        luxury: {
          onePerson: "",
          twoPerson: "",
          threePerson: "",
          fourPerson: "",
          fiveOrMorePerson: "",
        },
      };
    } else {
      // Ensure each pricing category has the correct structure
      ["standard", "midRange", "luxury"].forEach((category) => {
        if (!safeDraft.regularPrices[category]) {
          safeDraft.regularPrices[category] = {
            onePerson: "",
            twoPerson: "",
            threePerson: "",
            fourPerson: "",
            fiveOrMorePerson: "",
          };
        } else {
          // Ensure all pricing fields exist
          [
            "onePerson",
            "twoPerson",
            "threePerson",
            "fourPerson",
            "fiveOrMorePerson",
          ].forEach((field) => {
            if (
              safeDraft.regularPrices[category][field] === undefined ||
              safeDraft.regularPrices[category][field] === null
            ) {
              safeDraft.regularPrices[category][field] = "";
            }
          });
        }
      });
    }

    // Ensure pricing type exists
    if (!safeDraft.pricingType) {
      safeDraft.pricingType = "yearRound";
    }

    // Ensure discount exists
    if (safeDraft.discount === undefined || safeDraft.discount === null) {
      safeDraft.discount = 0;
    }

    // Ensure seasons array exists and has proper structure
    if (!Array.isArray(safeDraft.seasons)) {
      safeDraft.seasons = [];
    } else {
      // Ensure each season has proper structure
      safeDraft.seasons = safeDraft.seasons.map((season) => ({
        name: season.name || "",
        startDate: season.startDate || "",
        endDate: season.endDate || "",
        rates: season.rates || {
          budget: {
            onePerson: "",
            twoPerson: "",
            threePerson: "",
            fourPerson: "",
            fiveOrMorePerson: "",
          },
          midRange: {
            onePerson: "",
            twoPerson: "",
            threePerson: "",
            fourPerson: "",
            fiveOrMorePerson: "",
          },
          luxury: {
            onePerson: "",
            twoPerson: "",
            threePerson: "",
            fourPerson: "",
            fiveOrMorePerson: "",
          },
        },
      }));
    }

    if (!safeDraft.seo) {
      safeDraft.seo = {
        allowSearch: "yes",
        general: { title: "", description: "", image: null },
        openGraph: { title: "", description: "", image: null },
        twitter: { title: "", description: "", image: null },
      };
    } else {
      if (!safeDraft.seo.allowSearch) safeDraft.seo.allowSearch = "yes";

      ["general", "openGraph", "twitter"].forEach((tab) => {
        if (!safeDraft.seo[tab]) {
          safeDraft.seo[tab] = { title: "", description: "", image: null };
        } else {
          safeDraft.seo[tab].title = safeDraft.seo[tab].title || "";
          safeDraft.seo[tab].description = safeDraft.seo[tab].description || "";
          safeDraft.seo[tab].image = safeDraft.seo[tab].image || null;
        }
      });
    }

    setFormData(safeDraft);
    setShowResumeDraft(false);
  };
  // Discard draft handler
  const handleDiscardDraft = () => {
    localStorage.removeItem(draftKey);
    setShowResumeDraft(false);
  };

  // Fetch initial data
  useEffect(() => {
    const { currentPage, parPage, searchValue } = searchParams;
    dispatch(
      get_inclusions({
        parPage,
        currentPage,
        searchValue,
        allInclusions: "true",
      }),
    );
    dispatch(
      get_exclusions({
        parPage,
        currentPage,
        searchValue,
        allExclusions: "true",
      }),
    );
    dispatch(
      get_accommodations({
        parPage,
        currentPage,
        searchValue,
        allAccommodations: "true",
      }),
    );
    dispatch(
      get_category({
        parPage,
        currentPage,
        searchValue,
        allCategories: "true",
      }),
    );
    dispatch(
      get_meals({ parPage, currentPage, searchValue, allMeals: "true" }),
    );

    if (tripId) {
      dispatch(get_trip(tripId));
    }

    return () => {
      dispatch(clearTrip());
      // Clear destination search state when component unmounts
      setDestinationQueries([""]);
      setDestinationResults([[]]);
      setDestinationLoading([false]);
      setStartPointQuery("");
      setStartPointResults([]);
      setEndPointQuery("");
      setEndPointResults([]);
    };
  }, [dispatch, tripId, searchParams]);

  // Handle notifications
  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      // Don't clear message here, let the form reset effect handle it
    }
  }, [successMessage, errorMessage, dispatch]);

  // Populate form with trip data
  useEffect(() => {
    if (trip) {
      const tripDays =
        trip.days?.map((day) => ({
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
        })) || [];

      // Convert mainDestination to array if needed
      const mainDestinations = Array.isArray(trip.mainDestination)
        ? trip.mainDestination
        : trip.mainDestination
          ? [trip.mainDestination]
          : [{ name: "", location: { lat: null, lng: null } }];

      const safeSeoTab = (tabData) => ({
        title: tabData?.title || "",
        description: tabData?.description || "",
        image: tabData?.image || null,
      });

      // Initialize destination search states
      setDestinationQueries(mainDestinations.map((d) => d?.name || ""));
      setDestinationResults(mainDestinations.map(() => []));
      setDestinationLoading(mainDestinations.map(() => false));

      // Set react-hook-form values
      reset({
        mainTitle: trip.mainTitle || "",
        overview: trip.overview || "",
        description: trip.description || "",
        category: trip.category?._id || trip.category || "",
        mainImage: null, // File input - keep as null, use preview for display
        seo: {
          allowSearch: trip.seo?.allowSearch || "yes",
          general: safeSeoTab(trip.seo?.general),
          openGraph: safeSeoTab(trip.seo?.openGraph),
          twitter: safeSeoTab(trip.seo?.twitter),
        },
      });

      setFormData({
        mainImagePreview: trip.mainImage || null,
        mainVideo: null,
        mainVideoPreview: trip.mainVideo || null,
        mainDestinations: mainDestinations,
        startPoint: trip.startPoint || {
          name: "",
          location: { lat: null, lng: null },
        },
        endPoint: trip.endPoint || {
          name: "",
          location: { lat: null, lng: null },
        },
        selectedInclusions: trip.inclusions || {
          budget: [],
          midRange: [],
          luxury: [],
        },
        selectedExclusions: trip.exclusions || {
          budget: [],
          midRange: [],
          luxury: [],
        },
        daysCount: tripDays.length,
        days: tripDays,
        discount: trip.discount || "",
        pricingType: trip.pricingType || "yearRound",
        regularPrices: trip.regularPrices || {
          budget: {
            onePerson: "",
            twoPerson: "",
            threePerson: "",
            fourPerson: "",
            fiveOrMorePerson: "",
          },
          midRange: {
            onePerson: "",
            twoPerson: "",
            threePerson: "",
            fourPerson: "",
            fiveOrMorePerson: "",
          },
          luxury: {
            onePerson: "",
            twoPerson: "",
            threePerson: "",
            fourPerson: "",
            fiveOrMorePerson: "",
          },
        },
        seasons: trip.seasons || [],
        seo: trip.seo || {}
      });
    }
  }, [trip, reset]);

  const onSubmit = async (data) => {
    // Validate basic fields first
    const isValid = await trigger();
    if (!isValid) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    const submitData = new FormData();

    // Basic fields from react-hook-form
    submitData.append("mainTitle", data.mainTitle);
    submitData.append("overview", data.overview);
    submitData.append("description", data.description);
    submitData.append(
      "mainDestination",
      JSON.stringify(formData.mainDestinations),
    );
    submitData.append("startPoint", JSON.stringify(formData.startPoint));
    submitData.append("endPoint", JSON.stringify(formData.endPoint));
    submitData.append("category", data.category);
    submitData.append("pricingType", formData.pricingType);

    // Handle inclusions and exclusions
    submitData.append(
      "inclusions",
      JSON.stringify(formData.selectedInclusions),
    );
    submitData.append(
      "exclusions",
      JSON.stringify(formData.selectedExclusions),
    );

    // Handle pricing based on type
    submitData.append("discount", formData.discount.toString());

    if (formData.pricingType === "yearRound") {
      submitData.append(
        "regularPrices",
        JSON.stringify(formData.regularPrices),
      );
    } else if (formData.pricingType === "seasonal") {
      submitData.append("seasons", JSON.stringify(formData.seasons));
    }

    // Handle main image
    if (data.mainImage instanceof File) {
      submitData.append("mainImage", data.mainImage);
    } else if (formData.mainImagePreview && !formData.mainImagePreview.startsWith("blob:")) {
      // Existing image URL - handled by backend
    }

    // Handle main video
    if (formData.mainVideo instanceof File) {
      submitData.append("mainVideo", formData.mainVideo);
    }

    // Handle days
    submitData.append(
      "daysData",
      JSON.stringify(
        formData.days.map((day) => ({
          title: day.title,
          overview: day.overview,
          mainDestination: day.mainDestination,
          accommodation: day.accommodation,
          meals: day.meals,
        })),
      ),
    );

    // Handle day images separately
    formData.days.forEach((day, index) => {
      if (day.image instanceof File) {
        submitData.append(`dayImage_${index}`, day.image);
      }
    });

    submitData.append("daysCount", formData.days.length.toString());

    // Handle SEO
    submitData.append("seo", JSON.stringify(formData.seo));

    // Map through the tabs to attach files if they exist
    ["general", "openGraph", "twitter"].forEach((tab) => {
      const tabImage = formData.seo?.[tab]?.image;
      
      if (tabImage instanceof File) {
        submitData.append(`seo_${tab}_image`, tabImage);
      }
    });
    

    let result;
    if (tripId) {
      result = await dispatch(update_trip({ tripId, formData: submitData }));
    } else {
      result = await dispatch(tripAdd(submitData));
    }

    // Check if the action was successful
    if (result.meta.requestStatus === "fulfilled" && !tripId) {
      // Clear draft
      localStorage.removeItem(draftKey);
      // Reset form after a short delay
      setTimeout(() => {
        resetForm();
      }, 1000);
    }
  };

  const handleDaysCountChange = (e) => {
    const newCount = Number.parseInt(e.target.value, 10) || 0;
    if (newCount > formData.days.length) {
      const newDays = Array.from(
        { length: newCount - formData.days.length },
        () => ({
          title: "",
          overview: "",
          image: "",
          imagePreview: null,
          mainDestination: { name: "", location: { lat: null, lng: null } },
          accommodation: [],
          meals: [],
          hotel: null,
        }),
      );
      setFormData((prev) => ({
        ...prev,
        daysCount: newCount,
        days: [...prev.days, ...newDays],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        daysCount: newCount,
        days: prev.days.slice(0, newCount),
      }));
    }
  };

  const handleDayChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.map((day, i) =>
        i === index ? { ...day, [field]: value } : day,
      ),
    }));
  };

  const handleDayImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        days: prev.days.map((day, i) =>
          i === index
            ? {
                ...day,
                image: file,
                imagePreview: URL.createObjectURL(file),
              }
            : day,
        ),
      }));
    }
  };

  const handleRegularPriceChange = (seasonIndex, category, type, value) => {
    const numericValue = Number.parseFloat(value) || 0;
    setFormData((prev) => ({
      ...prev,
      regularPrices: {
        ...prev.regularPrices,
        [category]: {
          ...prev.regularPrices[category],
          [type]: numericValue,
        },
      },
    }));
  };

  const handleSeasonChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      seasons: prev.seasons.map((season, i) =>
        i === index ? { ...season, [field]: value } : season,
      ),
    }));
  };

  const handleSeasonRateChange = (seasonIndex, category, type, value) => {
    const numericValue = Number.parseFloat(value) || 0;
    setFormData((prev) => ({
      ...prev,
      seasons: prev.seasons.map((season, i) =>
        i === seasonIndex
          ? {
              ...season,
              rates: {
                ...season.rates,
                [category]: {
                  ...season.rates[category],
                  [type]: numericValue,
                },
              },
            }
          : season,
      ),
    }));
  };

  const addSeason = () => {
    setFormData((prev) => ({
      ...prev,
      seasons: [
        ...prev.seasons,
        {
          name: "",
          startDate: "",
          endDate: "",
          rates: {
            budget: {
              onePerson: "",
              twoPerson: "",
              threePerson: "",
              fourPerson: "",
              fiveOrMorePerson: "",
            },
            midRange: {
              onePerson: "",
              twoPerson: "",
              threePerson: "",
              fourPerson: "",
              fiveOrMorePerson: "",
            },
            luxury: {
              onePerson: "",
              twoPerson: "",
              threePerson: "",
              fourPerson: "",
              fiveOrMorePerson: "",
            },
          },
        },
      ],
    }));
  };

  const removeSeason = (index) => {
    setFormData((prev) => ({
      ...prev,
      seasons: prev.seasons.filter((_, i) => i !== index),
    }));
  };

  const handleHotelChange = (index, hotel) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.map((day, i) => (i === index ? { ...day, hotel } : day)),
    }));
  };

  const handleInclusionChange = (category, newValue) => {
    setFormData((prev) => {
      // Auto-populate mid-range and luxury based on standard
      if (category === "standard") {
        return {
          ...prev,
          selectedInclusions: {
            standard: newValue,
            // Auto-populate midRange: add new standard items, keep existing midRange-specific items
            midRange: [
              ...newValue,
              ...prev.selectedInclusions.midRange.filter(
                (item) => !newValue.includes(item),
              ),
            ],
            // Auto-populate luxury: add new standard items, keep existing luxury-specific items
            luxury: [
              ...newValue,
              ...prev.selectedInclusions.luxury.filter(
                (item) => !newValue.includes(item),
              ),
            ],
          },
        };
      }

      // For midRange and luxury, just update that category
      return {
        ...prev,
        selectedInclusions: {
          ...prev.selectedInclusions,
          [category]: newValue,
        },
      };
    });
  };

  const handleExclusionChange = (category, newValue) => {
    setFormData((prev) => {
      // Auto-populate mid-range and luxury based on standard
      if (category === "standard") {
        return {
          ...prev,
          selectedExclusions: {
            standard: newValue,
            // Auto-populate midRange: add new standard items, keep existing midRange-specific items
            midRange: [
              ...newValue,
              ...prev.selectedExclusions.midRange.filter(
                (item) => !newValue.includes(item),
              ),
            ],
            // Auto-populate luxury: add new standard items, keep existing luxury-specific items
            luxury: [
              ...newValue,
              ...prev.selectedExclusions.luxury.filter(
                (item) => !newValue.includes(item),
              ),
            ],
          },
        };
      }

      // For midRange and luxury, just update that category
      return {
        ...prev,
        selectedExclusions: {
          ...prev.selectedExclusions,
          [category]: newValue,
        },
      };
    });
  };

  // Debounced search for Nominatim - handles multiple destinations
  const debouncedSearch = useRef(
    debounce(async (query, index) => {
      if (!query || query.length < 3) {
        setDestinationResults((prev) => {
          const newResults = [...prev];
          newResults[index] = [];
          return newResults;
        });
        return;
      }
      setDestinationLoading((prev) => {
        const newLoading = [...prev];
        newLoading[index] = true;
        return newLoading;
      });
      try {
        const results = await fetchNominatim(query);
        setDestinationResults((prev) => {
          const newResults = [...prev];
          newResults[index] = results;
          return newResults;
        });
      } finally {
        setDestinationLoading((prev) => {
          const newLoading = [...prev];
          newLoading[index] = false;
          return newLoading;
        });
      }
    }, 400),
  ).current;

  // Add a new destination
  const addDestination = () => {
    setFormData((prev) => ({
      ...prev,
      mainDestinations: [
        ...prev.mainDestinations,
        { name: "", location: { lat: null, lng: null } },
      ],
    }));
    setDestinationQueries((prev) => [...prev, ""]);
    setDestinationResults((prev) => [...prev, []]);
    setDestinationLoading((prev) => [...prev, false]);
  };

  // Remove a destination
  const removeDestination = (index) => {
    if (formData.mainDestinations.length <= 1) return; // Keep at least one
    setFormData((prev) => ({
      ...prev,
      mainDestinations: prev.mainDestinations.filter((_, i) => i !== index),
    }));
    setDestinationQueries((prev) => prev.filter((_, i) => i !== index));
    setDestinationResults((prev) => prev.filter((_, i) => i !== index));
    setDestinationLoading((prev) => prev.filter((_, i) => i !== index));
  };

  // Update a specific destination
  const updateDestination = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      mainDestinations: prev.mainDestinations.map((dest, i) =>
        i === index ? { ...dest, [field]: value } : dest,
      ),
    }));
  };

  // Debounced search for start point
  const debouncedStartPointSearch = useRef(
    debounce(async (query) => {
      if (!query || query.length < 3) {
        setStartPointResults([]);
        return;
      }
      setStartPointLoading(true);
      try {
        const results = await fetchNominatim(query);
        setStartPointResults(results);
      } finally {
        setStartPointLoading(false);
      }
    }, 400),
  ).current;

  // Debounced search for end point
  const debouncedEndPointSearch = useRef(
    debounce(async (query) => {
      if (!query || query.length < 3) {
        setEndPointResults([]);
        return;
      }
      setEndPointLoading(true);
      try {
        const results = await fetchNominatim(query);
        setEndPointResults(results);
      } finally {
        setEndPointLoading(false);
      }
    }, 400),
  ).current;

  // Modal state for quick add
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showAddInclusion, setShowAddInclusion] = useState(false);
  const [showAddExclusion, setShowAddExclusion] = useState(false);
  const [showAddAccommodation, setShowAddAccommodation] = useState(false);
  const [quickAddLoading, setQuickAddLoading] = useState(false);
  const [quickAddError, setQuickAddError] = useState("");

  // Quick add handlers
  const handleQuickAdd = async (type, values) => {
    setQuickAddLoading(true);
    setQuickAddError("");
    try {
      let result;
      if (type === "category") {
        result = await dispatch(categoryAdd(values));
        if (result.meta.requestStatus === "fulfilled") {
          // Refresh categories list
          dispatch(
            get_category({
              parPage: 100,
              currentPage: 1,
              searchValue: "",
              allCategories: "true",
            }),
          );
          // Set the new category as selected
          setFormData((prev) => ({
            ...prev,
            category: result.payload.category._id,
          }));
          setShowAddCategory(false);
          toast.success("Category added successfully");
        } else {
          setQuickAddError(
            result.payload?.errorMessage || "Failed to add category",
          );
        }
      } else if (type === "meal") {
        result = await dispatch(mealAdd({ name: values.name }));
        if (result.meta.requestStatus === "fulfilled") {
          // Refresh meals list
          dispatch(
            get_meals({
              parPage: 100,
              currentPage: 1,
              searchValue: "",
              allMeals: "true",
            }),
          );
          setShowAddMeal(false);
          toast.success("Meal added successfully");
        } else {
          setQuickAddError(
            result.payload?.errorMessage || "Failed to add meal",
          );
        }
      } else if (type === "inclusion") {
        result = await dispatch(inclusionAdd({ name: values.name }));
        if (result.meta.requestStatus === "fulfilled") {
          // Refresh inclusions list
          dispatch(
            get_inclusions({
              parPage: 100,
              currentPage: 1,
              searchValue: "",
              allInclusions: "true",
            }),
          );
          setShowAddInclusion(false);
          toast.success("Inclusion added successfully");
        } else {
          setQuickAddError(
            result.payload?.errorMessage || "Failed to add inclusion",
          );
        }
      } else if (type === "exclusion") {
        result = await dispatch(exclusionAdd({ name: values.name }));
        if (result.meta.requestStatus === "fulfilled") {
          // Refresh exclusions list
          dispatch(
            get_exclusions({
              parPage: 100,
              currentPage: 1,
              searchValue: "",
              allExclusions: "true",
            }),
          );
          setShowAddExclusion(false);
          toast.success("Exclusion added successfully");
        } else {
          setQuickAddError(
            result.payload?.errorMessage || "Failed to add exclusion",
          );
        }
      } else if (type === "accommodation") {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("description", values.description);
        formData.append("type", values.type);
        formData.append("price", values.price);
        formData.append("category", values.category);
        formData.append("location", values.location);
        formData.append("isActive", true);
        formData.append(
          "contact",
          JSON.stringify({
            phone: values.phone || "",
            email: values.email || "",
            website: values.website || "",
          }),
        );
        if (values.image) formData.append("images", values.image);
        result = await dispatch(accommodationAdd(formData));
        if (result.meta.requestStatus === "fulfilled") {
          // Refresh accommodations list
          dispatch(
            get_accommodations({
              parPage: 100,
              currentPage: 1,
              searchValue: "",
            }),
          );
          setShowAddAccommodation(false);
          toast.success("Accommodation added successfully");
        } else {
          setQuickAddError(
            result.payload?.errorMessage || "Failed to add accommodation",
          );
        }
      }
    } finally {
      setQuickAddLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 p-4 md:p-5">
      {showResumeDraft && !tripId && (
        <ResumeDraftModal
          onResume={handleResumeDraft}
          onDiscard={handleDiscardDraft}
        />
      )}

      {/* Modals */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        pricingType={formData.pricingType}
        regularPrices={formData.regularPrices}
        seasons={formData.seasons}
        discount={formData.discount}
        onPricingTypeChange={(value) =>
          setFormData((prev) => ({ ...prev, pricingType: value }))
        }
        onRegularPriceChange={handleRegularPriceChange}
        onSeasonChange={handleSeasonChange}
        onSeasonRateChange={handleSeasonRateChange}
        onDiscountChange={(value) =>
          setFormData((prev) => ({ ...prev, discount: value }))
        }
        onAddSeason={addSeason}
        onRemoveSeason={removeSeason}
      />

      <InclusionsExclusionsModal
        isOpen={showInclusionsExclusionsModal}
        onClose={() => setShowInclusionsExclusionsModal(false)}
        inclusions={[...(inclusions || [])].sort((a, b) =>
          (a.name || "").localeCompare(b.name || "", "en", {
            sensitivity: "base",
          }),
        )}
        exclusions={[...(exclusions || [])].sort((a, b) =>
          (a.name || "").localeCompare(b.name || "", "en", {
            sensitivity: "base",
          }),
        )}
        selectedInclusions={formData.selectedInclusions}
        selectedExclusions={formData.selectedExclusions}
        onInclusionChange={handleInclusionChange}
        onExclusionChange={handleExclusionChange}
        onAddInclusion={() => setShowAddInclusion(true)}
        onAddExclusion={() => setShowAddExclusion(true)}
      />

      <ItineraryModal
        isOpen={showItineraryModal}
        onClose={() => setShowItineraryModal(false)}
        days={formData.days}
        daysCount={formData.daysCount}
        accommodations={[...(accommodations || [])].sort((a, b) =>
          (a.name || "").localeCompare(b.name || "", "en", {
            sensitivity: "base",
          }),
        )}
        meals={[...(meals || [])].sort((a, b) =>
          (a.name || "").localeCompare(b.name || "", "en", {
            sensitivity: "base",
          }),
        )}
        onDaysCountChange={handleDaysCountChange}
        onDayChange={handleDayChange}
        onDayImageChange={handleDayImageChange}
        onHotelChange={handleHotelChange}
        onRemoveDay={(index) => {
          setFormData((prev) => {
            const newDays = prev.days.filter((_, i) => i !== index);
            return {
              ...prev,
              days: newDays,
              daysCount: newDays.length,
            };
          });
        }}
        onAddMeal={() => setShowAddMeal(true)}
        onAddAccommodation={() => setShowAddAccommodation(true)}
        onCopyDays={(daysToCopy, append) => {
          setFormData((prev) => {
            if (append) {
              const newDays = [...prev.days, ...daysToCopy];
              return {
                ...prev,
                days: newDays,
                daysCount: newDays.length,
              };
            } else {
              return {
                ...prev,
                days: daysToCopy,
                daysCount: daysToCopy.length,
              };
            }
          });
        }}
      />

      {/* Quick Add Modals */}
      <AddQuickModal
        open={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        onSubmit={(values) => handleQuickAdd("category", values)}
        title="Add New Category"
        fields={[
          {
            name: "name",
            label: "Category Name",
            type: "text",
            required: true,
          },
          {
            name: "image",
            label: "Category Image",
            type: "file",
            required: true,
            accept: "image/*",
          },
        ]}
        loading={quickAddLoading}
        error={quickAddError}
      />
      <AddQuickModal
        open={showAddMeal}
        onClose={() => setShowAddMeal(false)}
        onSubmit={(values) => handleQuickAdd("meal", values)}
        title="Add New Meal"
        fields={[
          { name: "name", label: "Meal Name", type: "text", required: true },
        ]}
        loading={quickAddLoading}
        error={quickAddError}
      />
      <AddQuickModal
        open={showAddInclusion}
        onClose={() => setShowAddInclusion(false)}
        onSubmit={(values) => handleQuickAdd("inclusion", values)}
        title="Add New Inclusion"
        fields={[
          {
            name: "name",
            label: "Inclusion Name",
            type: "text",
            required: true,
          },
        ]}
        loading={quickAddLoading}
        error={quickAddError}
      />
      <AddQuickModal
        open={showAddExclusion}
        onClose={() => setShowAddExclusion(false)}
        onSubmit={(values) => handleQuickAdd("exclusion", values)}
        title="Add New Exclusion"
        fields={[
          {
            name: "name",
            label: "Exclusion Name",
            type: "text",
            required: true,
          },
        ]}
        loading={quickAddLoading}
        error={quickAddError}
      />
      <AddQuickModal
        open={showAddAccommodation}
        size="lg"
        onClose={() => setShowAddAccommodation(false)}
        onSubmit={(values) => handleQuickAdd("accommodation", values)}
        title="Add New Accommodation"
        fields={[
          {
            name: "name",
            label: "Accommodation Name",
            type: "text",
            required: true,
          },
          {
            name: "description",
            label: "Description",
            type: "text",
            required: false,
          },
          {
            name: "type",
            label: "Type",
            type: "select",
            required: false,
            options: [
              { label: "Camp", value: "camp" },
              { label: "Hotel", value: "hotel" },
              { label: "Lodge", value: "lodge" },
              { label: "Resort", value: "resort" },
            ],
          },
          { name: "price", label: "Price", type: "number", required: false },
          {
            name: "category",
            label: "Category",
            type: "select",
            required: true,
            options: [
              { label: "Budget", value: "Budget" },
              { label: "Luxury", value: "Luxury" },
              { label: "Mid-range", value: "Mid-range" },
              { label: "Ultra Luxury", value: "Ultra Luxury" },
            ],
          },
          {
            name: "location",
            label: "Location",
            type: "text",
            required: false,
          },
          { name: "phone", label: "Phone", type: "text", required: false },
          { name: "email", label: "Email", type: "text", required: false },
          { name: "website", label: "Website", type: "text", required: false },
          {
            name: "image",
            label: "Image",
            type: "file",
            required: true,
            accept: "image/*",
            multiple: true,
          },
        ]}
        loading={quickAddLoading}
        error={quickAddError}
      />

      <div className="mx-auto max-w-7xl">
        <HeaderText title={tripId ? "Edit Trip" : "Add Trip"} />

        {/* Compact Form Layout */}
        <div className="space-y-6">
          {/* Basic Information Card */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-nature-medium ring-1 ring-primary-100">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-primary-800">
                    Basic Information
                  </h2>
                  <p className="text-text-light">
                    Essential details about your trip
                  </p>
                </div>
                {location.pathname.includes("/admin/dashboard/edit-trip/") && (
                  <Link
                    to="/admin/dashboard/trips"
                    className="flex items-center rounded-md bg-neutral-200 px-4 py-2 text-sm font-medium text-text-dark transition-colors hover:bg-neutral-300"
                  >
                    <svg
                      className="mr-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Back to Trips
                  </Link>
                )}
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-primary-800">
                    Main Title *
                  </label>
                  <input
                    type="text"
                    {...register("mainTitle")}
                    className={`block w-full rounded-xl border-2 bg-white px-4 py-3.5 text-text-dark placeholder:text-text-light focus:outline-none focus:ring-2 ${
                      errors.mainTitle
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-primary-200 focus:border-secondary focus:ring-secondary-200"
                    }`}
                    placeholder="Enter an exciting trip title"
                  />
                  {errors.mainTitle && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.mainTitle.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-primary-800">
                      Main Destinations
                    </label>
                    <button
                      type="button"
                      onClick={addDestination}
                      className="flex items-center gap-1 rounded-lg bg-primary-100 px-3 py-1.5 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-200"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Destination
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.mainDestinations.map((destination, index) => (
                      <div key={index} className="relative">
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-text-light" />
                          <input
                            ref={(el) => {
                              if (el) destinationInputRefs.current[index] = el;
                            }}
                            type="text"
                            value={destination.name}
                            onChange={(e) => {
                              const newQueries = [...destinationQueries];
                              newQueries[index] = e.target.value;
                              setDestinationQueries(newQueries);
                              updateDestination(index, "name", e.target.value);
                              updateDestination(index, "location", {
                                lat: null,
                                lng: null,
                              });
                              debouncedSearch(e.target.value, index);
                            }}
                            className="block w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3.5 pl-10 pr-12 text-text-dark placeholder:text-text-light focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                            placeholder={`Destination ${index + 1} - Search for a location...`}
                            autoComplete="off"
                          />
                          {formData.mainDestinations.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDestination(index)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-red-100 p-1.5 text-red-600 transition-colors hover:bg-red-200"
                              title="Remove destination"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                        {destinationLoading[index] && (
                          <div className="absolute right-14 top-1/2 -translate-y-1/2 text-xs text-text-light">
                            Loading...
                          </div>
                        )}
                        {destinationResults[index]?.length > 0 && (
                          <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-primary-200 bg-white text-text-dark shadow-lg">
                            {destinationResults[index].map((result) => (
                              <li
                                key={result.place_id}
                                className="cursor-pointer px-4 py-2 hover:bg-primary-50 hover:text-secondary"
                                onClick={() => {
                                  updateDestination(
                                    index,
                                    "name",
                                    result.display_name,
                                  );
                                  updateDestination(index, "location", {
                                    lat: parseFloat(result.lat),
                                    lng: parseFloat(result.lon),
                                  });
                                  const newResults = [...destinationResults];
                                  newResults[index] = [];
                                  setDestinationResults(newResults);
                                  const newQueries = [...destinationQueries];
                                  newQueries[index] = result.display_name;
                                  setDestinationQueries(newQueries);
                                }}
                              >
                                {result.display_name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-primary-800">
                    Start Point
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                    <input
                      ref={startPointInputRef}
                      type="text"
                      value={formData.startPoint.name}
                      onChange={(e) => {
                        setStartPointQuery(e.target.value);
                        setFormData((prev) => ({
                          ...prev,
                          startPoint: {
                            name: e.target.value,
                            location: { lat: null, lng: null },
                          },
                        }));
                        debouncedStartPointSearch(e.target.value);
                      }}
                      className="block w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3.5 pl-10 pr-4 text-text-dark placeholder:text-text-light focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                      placeholder="Search for start point location..."
                      autoComplete="off"
                    />
                    {startPointLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-light">
                        Loading...
                      </div>
                    )}
                    {startPointResults.length > 0 && (
                      <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-primary-200 bg-white text-text-dark shadow-lg">
                        {startPointResults.map((result) => (
                          <li
                            key={result.place_id}
                            className="cursor-pointer px-4 py-2 hover:bg-primary-50 hover:text-secondary"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                startPoint: {
                                  name: result.display_name,
                                  location: {
                                    lat: parseFloat(result.lat),
                                    lng: parseFloat(result.lon),
                                  },
                                },
                              }));
                              setStartPointResults([]);
                            }}
                          >
                            {result.display_name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-primary-800">
                    End Point
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                    <input
                      ref={endPointInputRef}
                      type="text"
                      value={formData.endPoint.name}
                      onChange={(e) => {
                        setEndPointQuery(e.target.value);
                        setFormData((prev) => ({
                          ...prev,
                          endPoint: {
                            name: e.target.value,
                            location: { lat: null, lng: null },
                          },
                        }));
                        debouncedEndPointSearch(e.target.value);
                      }}
                      className="block w-full rounded-xl border-2 border-primary-200 bg-white px-4 py-3.5 pl-10 pr-4 text-text-dark placeholder:text-text-light focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary-200"
                      placeholder="Search for end point location..."
                      autoComplete="off"
                    />
                    {endPointLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-light">
                        Loading...
                      </div>
                    )}
                    {endPointResults.length > 0 && (
                      <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-primary-200 bg-white text-text-dark shadow-lg">
                        {endPointResults.map((result) => (
                          <li
                            key={result.place_id}
                            className="cursor-pointer px-4 py-2 hover:bg-primary-50 hover:text-secondary"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                endPoint: {
                                  name: result.display_name,
                                  location: {
                                    lat: parseFloat(result.lat),
                                    lng: parseFloat(result.lon),
                                  },
                                },
                              }));
                              setEndPointResults([]);
                            }}
                          >
                            {result.display_name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="space-y-3 sm:col-span-2">
                  <label className="text-sm font-bold text-primary-800">
                    Category *
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      {...register("category")}
                      className={`block w-full rounded-xl border-2 bg-white px-4 py-3.5 text-text-dark focus:outline-none focus:ring-2 ${
                        errors.category
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : "border-primary-200 focus:border-secondary focus:ring-secondary-200"
                      }`}
                    >
                      <option value="">Select a category</option>
                      {[...(categories || [])]
                        .sort((a, b) =>
                          (a.name || "").localeCompare(b.name || "", "en", {
                            sensitivity: "base",
                          }),
                        )
                        .map((cat) => (
                          <option
                            key={cat._id || cat.id}
                            value={cat._id || cat.id}
                          >
                            {cat.name}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      className="rounded bg-neutral-200 px-2 py-1 text-xs text-text-dark hover:bg-neutral-300"
                      onClick={() => setShowAddCategory(true)}
                    >
                      + Add New
                    </button>
                  </div>
                  {errors.category && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3 sm:col-span-2">
                  <label className="text-sm font-bold text-primary-800">
                    Overview *
                  </label>
                  <textarea
                    {...register("overview")}
                    className={`block w-full rounded-xl border-2 bg-white px-4 py-3.5 text-text-dark placeholder:text-text-light focus:outline-none focus:ring-2 ${
                      errors.overview
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-primary-200 focus:border-secondary focus:ring-secondary-200"
                    }`}
                    rows="6"
                    placeholder="Describe your amazing trip experience..."
                  />
                  {errors.overview && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.overview.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3 sm:col-span-2">
                  <label className="text-sm font-bold text-primary-800">
                    Short Description *
                  </label>
                  <textarea
                    {...register("description")}
                    className={`block w-full rounded-xl border-2 bg-white px-4 py-3.5 text-text-dark placeholder:text-text-light focus:outline-none focus:ring-2 ${
                      errors.description
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-primary-200 focus:border-secondary focus:ring-secondary-200"
                    }`}
                    rows="3"
                    placeholder="Brief description for trip cards (2-3 sentences)..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-primary-800">
                    Main Trip Image *
                  </label>
                  <Controller
                    name="mainImage"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <ImageUpload
                        id="main-image"
                        preview={formData.mainImagePreview}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            onChange(file);
                            setFormData((prev) => ({
                              ...prev,
                              mainImagePreview: URL.createObjectURL(file),
                            }));
                          }
                        }}
                        label="Main Trip Image"
                      />
                    )}
                  />
                  {errors.mainImage && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.mainImage.message}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <VideoUpload
                    id="main-video"
                    preview={formData.mainVideoPreview}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormData((prev) => ({
                          ...prev,
                          mainVideo: file,
                          mainVideoPreview: URL.createObjectURL(file),
                        }));
                      }
                    }}
                    label="Main Trip Video"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <SeoManager watch={watch} setValue={setValue}/>
                </div>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Inclusions & Exclusions Card */}
            <div className="rounded-2xl border border-primary-200 bg-white p-6 shadow-nature-soft transition-shadow hover:shadow-nature-medium">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
                  <svg
                    className="h-8 w-8 text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-1 text-lg font-semibold text-primary-800">
                  Inclusions & Exclusions
                </h3>
                <p className="mb-4 text-sm text-text-light">
                  Manage what's included and excluded
                </p>
                <button
                  onClick={() => setShowInclusionsExclusionsModal(true)}
                  className="shadow-coral-medium hover:shadow-coral-large w-full rounded-lg bg-gradient-to-r from-secondary to-sunshine-400 px-4 py-2 font-semibold text-white transition-all hover:scale-105"
                >
                  Manage Inclusions & Exclusions
                </button>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="rounded-2xl border border-primary-200 bg-white p-6 shadow-nature-soft transition-shadow hover:shadow-nature-medium">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                  <svg
                    className="h-8 w-8 text-success"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-primary-800">
                  Trip Pricing
                </h3>
                <p className="mb-4 text-sm text-text-light">
                  Set pricing for different seasons and group sizes
                </p>
                <button
                  onClick={() => setShowPricingModal(true)}
                  className="w-full rounded-lg bg-gradient-to-r from-success to-success-600 px-4 py-2 font-semibold text-white shadow-medium transition-all hover:scale-105 hover:shadow-lg"
                >
                  Manage Pricing
                </button>
              </div>
            </div>

            {/* Itinerary Card */}
            <div className="rounded-2xl border border-primary-200 bg-white p-6 shadow-nature-soft transition-shadow hover:shadow-nature-medium">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-info/10">
                  <svg
                    className="h-8 w-8 text-info"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="mb-1 text-lg font-semibold text-primary-800">
                  Trip Itinerary
                </h3>
                <p className="mb-4 text-sm text-text-light">
                  Plan the daily activities for your trip ({formData.daysCount}{" "}
                  days)
                </p>
                <button
                  onClick={() => setShowItineraryModal(true)}
                  className="w-full rounded-lg bg-gradient-to-r from-primary to-primary-600 px-4 py-2 font-semibold text-white shadow-nature-medium transition-all hover:scale-105 hover:shadow-nature-large"
                >
                  Manage Itinerary
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-6">
            {!tripId && (
              <button
                onClick={resetForm}
                className="rounded-2xl border-2 border-neutral-300 bg-white px-8 py-5 text-lg font-bold text-text-dark shadow-soft transition-all duration-300 hover:scale-[1.02] hover:border-neutral-400 hover:bg-neutral-50 focus:outline-none"
                disabled={loader}
              >
                Reset Form
              </button>
            )}
            <button
              onClick={handleSubmit(onSubmit)}
              className="shadow-coral-medium hover:shadow-coral-large min-h-14 rounded-2xl bg-gradient-to-r from-secondary to-sunshine-400 px-12 py-5 text-lg font-bold text-white transition-all duration-300 hover:scale-[1.02] focus:outline-none disabled:opacity-50"
              disabled={loader}
            >
              {loader ? (
                <PropagateLoader color="#ffffff" size={12} />
              ) : tripId ? (
                "Update Trip Package"
              ) : (
                "Create Trip Package"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTrip;
