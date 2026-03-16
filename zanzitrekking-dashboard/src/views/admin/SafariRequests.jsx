// FIXED SAFARI REQUESTS COMPONENT - Properly calculates analytics from all data
import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaUsers,
  FaClipboardList,
  FaFileInvoice,
  FaChartLine,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaCheck,
  FaTimes,
  FaEye,
  FaFilter,
  FaSync,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
} from "react-icons/fa";
import {
  fetchClients,
  fetchClientById,
  createClient,
  updateClient,
  deleteClient,
  fetchRequests,
  fetchRequestById,
  updateRequest,
  bookRequest,
  markRequestNotBooked,
  deleteRequest,
  fetchQuotes,
  fetchQuoteById,
  fetchQuotesForRequest,
  deleteQuote,
  fetchAnalytics,
  setClientSearch,
  setRequestStatus,
  setRequestSearch,
  setQuoteStatus,
  clearSelectedClient,
  clearSelectedRequest,
  clearSelectedQuote,
} from "../../store/Reducers/safariOfficeReducer";

const SafariRequests = () => {
  const dispatch = useDispatch();

  const {
    clients,
    selectedClient,
    clientsLoading,
    clientDetailsLoading,
    clientsError,
    clientsPagination,
    requests,
    selectedRequest,
    requestsLoading,
    requestDetailsLoading,
    requestsError,
    requestsPagination,
    quotes,
    selectedQuote,
    quotesLoading,
    quoteDetailsLoading,
    quotesError,
    quotesPagination,
    analytics,
    analyticsLoading,
    analyticsError,
    filters,
  } = useSelector((state) => state.safariOffice);

  const [activeTab, setActiveTab] = useState("clients");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [formData, setFormData] = useState({});
  
  // Local state for computed statistics - fetched separately for analytics
  const [computedStats, setComputedStats] = useState({
    totalRequests: 0,
    completedRequests: 0,
    bookedRequests: 0,
    notBookedRequests: 0,
    pendingRequests: 0,
    newRequests: 0,
    workingRequests: 0,
    openRequests: 0,
    prebookedRequests: 0,
    totalClients: 0,
    totalQuotes: 0,
    conversionRate: 0,
    totalPersonsCompleted: 0,
  });

  // Separate state for analytics loading
  const [statsLoading, setStatsLoading] = useState(false);
  // Track rate limit status to prevent unnecessary calls
  const [rateLimited, setRateLimited] = useState(false);


  // Refs for scrolling to details
  const clientDetailsRef = useRef(null);
  const requestDetailsRef = useRef(null);
  const quoteDetailsRef = useRef(null);

// ✅ OPTIMIZED SOLUTION - Fetches data once and computes travelers count in frontend
const fetchAllRequestsStatsForAnalytics = useCallback(async () => {
  setStatsLoading(true);
  try {
    // Use the server-side summary endpoint for status counts (makes minimal API calls)
    // Use environment variable for backend URL
    const backendUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
    const summaryUrl = `${backendUrl}/api/safari-analytics/summary`;
    const summaryResponse = await fetch(summaryUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    let counts = {};
    if (summaryResponse.ok) {
      // If successful, reset rate limit flag
      setRateLimited(prev => {
        if (prev) {
          return false;
        }
        return prev;
      });
      
      const summaryData = await summaryResponse.json();
      
      if (summaryData.success && summaryData.data?.status_counts) {
        counts = summaryData.data.status_counts;
      } else {
        counts = {};
      }
    } else if (summaryResponse.status === 429) {
      setRateLimited(true);
      counts = {};
    } else {
      const errorText = await summaryResponse.text();
      counts = {};
    }
    
    // 🆕 COMPUTE TRAVELERS COUNT IN FRONTEND - Fetch pages with limit to avoid too many calls
    // Initialize totalPersons BEFORE the async operations
    let totalPersons = 0;
    
    if (counts.completed && counts.completed > 0) {
      try {
        // Limit: Only fetch if completed requests are reasonable (max 500 = 5 API calls)
        // If more than 500, we'll estimate or skip to avoid rate limits
        const MAX_REQUESTS_TO_FETCH = 500;
        const perPage = 100; // Maximum per page to minimize API calls
        const totalPages = Math.ceil(counts.completed / perPage);
        const maxPagesToFetch = Math.min(totalPages, Math.ceil(MAX_REQUESTS_TO_FETCH / perPage));
        
        if (counts.completed > MAX_REQUESTS_TO_FETCH) {
          totalPersons = 0;
        } else {
          
          let allCompletedRequests = [];
          
          // Fetch pages sequentially with delays to avoid rate limits
          for (let page = 1; page <= maxPagesToFetch; page++) {
            try {
              const pageResponse = await dispatch(fetchRequests({ 
                status: 'completed',
                limit: perPage,
                page: page
              })).unwrap();
              
              if (pageResponse?.result?.data) {
                allCompletedRequests.push(...pageResponse.result.data);
              }
              
              // Small delay between pages to avoid rate limits (except for last page)
              if (page < maxPagesToFetch) {
                await new Promise(resolve => setTimeout(resolve, 200)); // Increased to 200ms
              }
            } catch (pageError) {
              // If rate limit hit, stop fetching more pages
              if (pageError?.error_code === 3003 || pageError?.error_msg?.includes("Rate limit") || pageError?.response?.status === 429) {
                setRateLimited(true);
                break;
              }
            }
          }
        
        // Check if travelers data is available in list response
        if (allCompletedRequests.length > 0) {
          const firstRequest = allCompletedRequests[0];
          
          // Check if travelers array exists (even if empty) - this means the field is present
          const hasTravelersField = firstRequest?.travelers !== undefined;
          const travelersInList = hasTravelersField && Array.isArray(firstRequest.travelers);
          
          if (travelersInList) {
            // ✅ TRAVELERS ARE IN LIST RESPONSE - Count from ALL requests (no extra API calls!)
            let requestsWithTravelers = 0;
            let requestsWithZeroTravelers = 0;
            let requestsWithMissingTravelers = 0;
            
            allCompletedRequests.forEach((request, index) => {
              if (request?.travelers !== undefined && Array.isArray(request.travelers)) {
                const travelerCount = request.travelers.length;
                totalPersons += travelerCount;
                if (travelerCount > 0) {
                  requestsWithTravelers++;
                } else {
                  requestsWithZeroTravelers++;
                }
              } else {
                requestsWithMissingTravelers++;
              }
            });
          } else {
            // Travelers NOT in list response - need to fetch ALL individual requests for accurate count
            
            let fetchedCount = 0;
            let requestsWithTravelers = 0;
            let requestsWithZeroTravelers = 0;
            
            // Fetch ALL requests in parallel batches to speed up
            const batchSize = 10; // Fetch 10 at a time for faster processing
            const totalBatches = Math.ceil(allCompletedRequests.length / batchSize);
            
            for (let batchStart = 0; batchStart < allCompletedRequests.length; batchStart += batchSize) {
              const batchEnd = Math.min(batchStart + batchSize, allCompletedRequests.length);
              const batchNumber = Math.floor(batchStart / batchSize) + 1;
              const batchPromises = [];
              
              for (let i = batchStart; i < batchEnd; i++) {
                const request = allCompletedRequests[i];
                const requestId = request?.request_id || request?._id || request?.id;
                
                if (!requestId) {
                  continue;
                }
                
                batchPromises.push(
                  dispatch(fetchRequestById(requestId))
                    .unwrap()
                    .then(individualResponse => {
                      const requestData = individualResponse?.result?.data || individualResponse?.result || individualResponse;
                      if (requestData?.travelers && Array.isArray(requestData.travelers)) {
                        const count = requestData.travelers.length;
                        totalPersons += count;
                        fetchedCount++;
                        if (count > 0) {
                          requestsWithTravelers++;
                        } else {
                          requestsWithZeroTravelers++;
                        }
                        return count;
                      }
                      fetchedCount++;
                      requestsWithZeroTravelers++;
                      return 0;
                    })
                    .catch(err => {
                      if (err?.error_code === 3003 || err?.error_msg?.includes("Rate limit") || err?.response?.status === 429) {
                        setRateLimited(true);
                        throw err; // Stop processing
                      }
                      return 0;
                    })
                );
              }
              
              try {
                await Promise.all(batchPromises);
                
                // Small delay between batches to avoid rate limits
                if (batchEnd < allCompletedRequests.length) {
                  await new Promise(resolve => setTimeout(resolve, 300));
                }
              } catch (err) {
                if (err?.error_code === 3003 || err?.error_msg?.includes("Rate limit")) {
                  break;
                }
              }
            }
          }
        } else {
          totalPersons = 0;
        }
        }
        
      } catch (error) {
        // If we hit rate limit, don't try to fetch more
        if (error?.error_code === 3003 || error?.error_msg?.includes("Rate limit") || error?.response?.status === 429) {
          setRateLimited(true);
        }
        totalPersons = 0;
      }
    }
    
    // Calculate final stats AFTER all async operations complete
    
    const stats = {
      totalRequests: counts.total || 0,
      completedRequests: counts.completed || 0,
      bookedRequests: counts.booked || 0,
      notBookedRequests: counts.notbooked || 0,
      newRequests: counts.new || 0,
      workingRequests: counts.working || 0,
      openRequests: counts.open || 0,
      prebookedRequests: counts.prebooked || 0,
      pendingRequests: (counts.new || 0) + (counts.working || 0) + (counts.open || 0) + (counts.prebooked || 0),
      totalClients: clientsPagination.total || 0,
      totalQuotes: quotesPagination.total || 0,
      totalPersonsCompleted: totalPersons, // This should now have the correct count
    };
    
    stats.conversionRate = stats.totalRequests > 0 
      ? ((stats.bookedRequests / stats.totalRequests) * 100).toFixed(2)
      : 0;
    
    setComputedStats(stats);
    
  } catch (error) {
  } finally {
    setStatsLoading(false);
  }
}, [dispatch, clientsPagination.total, quotesPagination.total]);

/*
✅ OPTIMIZED SOLUTION!

Benefits:
- Fast: Server-side aggregation means ONE API call instead of 301
- No rate limiting: Server handles all the individual requests
- Cacheable: Can add caching on the server for even faster subsequent loads
- Progress: Server logs show progress in your backend logs

IMPORTANT: Make sure to:
1. Update the URL if your backend is different: 'https://api.zanzisafaris.com'
2. Add the new route to your server.js (see next file)
*/




  // Scroll to details when they're loaded
  useEffect(() => {
    if (selectedClient && clientDetailsRef.current) {
      clientDetailsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedClient]);

  useEffect(() => {
    if (selectedRequest && requestDetailsRef.current) {
      requestDetailsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedRequest]);

  useEffect(() => {
    if (selectedQuote && quoteDetailsRef.current) {
      quoteDetailsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedQuote]);

  // Load initial data on mount (only essential data)
  useEffect(() => {
    // Always load clients and requests for the main tabs
    // If rate limited, try anyway - API might be back
    dispatch(fetchClients())
      .then(() => {
        // If successful, reset rate limit flag
        if (rateLimited) {
          setRateLimited(false);
        }
      })
      .catch(err => {
        if (err?.error_code === 3003 || err?.error_msg?.includes("Rate limit") || err?.response?.status === 429) {
          setRateLimited(true);
        }
      });
    dispatch(fetchRequests())
      .then(() => {
        // If successful, reset rate limit flag
        if (rateLimited) {
          setRateLimited(false);
        }
      })
      .catch(err => {
        if (err?.error_code === 3003 || err?.error_msg?.includes("Rate limit") || err?.response?.status === 429) {
          setRateLimited(true);
        }
      });
  }, [dispatch]);

  // Load quotes when switching to quotes tab
  useEffect(() => {
    if (activeTab === "quotes" && !rateLimited) {
      dispatch(fetchQuotes()).catch(err => {
        if (err?.error_code === 3003 || err?.error_msg?.includes("Rate limit")) {
          setRateLimited(true);
        }
      });
    }
  }, [activeTab, dispatch, rateLimited]);

  // Load analytics data when switching to analytics tab (to avoid rate limits)
  useEffect(() => {
    if (activeTab === "analytics") {
      // Try to fetch even if rateLimited - API might be back
      dispatch(fetchAnalytics())
        .then(() => {
          // If successful, reset rate limit flag
          setRateLimited(prev => {
            if (prev) {
              return false;
            }
            return prev;
          });
        })
        .catch(err => {
          if (err?.error_code === 3003 || err?.error_msg?.includes("Rate limit") || err?.response?.status === 429) {
            setRateLimited(true);
          }
        });
      fetchAllRequestsStatsForAnalytics();
    }
  }, [activeTab, dispatch, fetchAllRequestsStatsForAnalytics]);

  // ============ HANDLERS ============

  const handleRefresh = () => {
    if (activeTab === "clients") {
      dispatch(fetchClients({ search: filters.clientSearch }));
    } else if (activeTab === "requests") {
      dispatch(
        fetchRequests({
          status: filters.requestStatus,
          search: filters.requestSearch,
        }),
      );
    } else if (activeTab === "quotes") {
      dispatch(fetchQuotes({ status: filters.quoteStatus }));
    } else if (activeTab === "analytics") {
      // Only refresh analytics-specific data
      dispatch(fetchAnalytics());
      fetchAllRequestsStatsForAnalytics();
    }
  };

  const openModal = (type, data = {}) => {
    setModalType(type);
    setFormData(data);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType("");
    setFormData({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      switch (modalType) {
        case "createClient":
          await dispatch(createClient(formData)).unwrap();
          dispatch(fetchClients());
          break;
        case "updateClient":
          await dispatch(
            updateClient({
              clientId: formData.client_id,
              clientData: formData,
            }),
          ).unwrap();
          dispatch(fetchClients());
          break;
        case "updateRequest":
          await dispatch(
            updateRequest({
              requestId: formData.request_id,
              requestData: formData,
            }),
          ).unwrap();
          dispatch(fetchRequests());
          fetchAllRequestsStatsForAnalytics(); // Refresh analytics data
          break;
        case "bookRequest":
          await dispatch(
            bookRequest({
              requestId: formData.requestId,
              bookingData: formData,
            }),
          ).unwrap();
          dispatch(fetchRequests());
          fetchAllRequestsStatsForAnalytics(); // Refresh analytics data
          break;
        case "notBookedRequest":
          await dispatch(
            markRequestNotBooked({
              requestId: formData.requestId,
              reason: formData.reason,
            }),
          ).unwrap();
          dispatch(fetchRequests());
          fetchAllRequestsStatsForAnalytics(); // Refresh analytics data
          break;
        default:
          break;
      }
      closeModal();
    } catch (error) {
      // Error handled by Redux
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      switch (type) {
        case "client":
          await dispatch(deleteClient(id)).unwrap();
          dispatch(fetchClients());
          break;
        case "request":
          await dispatch(deleteRequest(id)).unwrap();
          dispatch(fetchRequests());
          fetchAllRequestsStatsForAnalytics(); // Refresh analytics data
          break;
        case "quote":
          await dispatch(deleteQuote(id)).unwrap();
          dispatch(fetchQuotes());
          break;
        default:
          break;
      }
    } catch (error) {
      // Error handled by Redux
    }
  };

  const handleViewDetails = async (type, id) => {
    try {
      switch (type) {
        case "client":
          await dispatch(fetchClientById(id)).unwrap();
          break;
        case "request":
          await dispatch(fetchRequestById(id)).unwrap();
          await dispatch(fetchQuotesForRequest(id)).unwrap();
          break;
        case "quote":
          await dispatch(fetchQuoteById(id)).unwrap();
          break;
        default:
          break;
      }
    } catch (error) {
      // Error handled by Redux
    }
  };

  // ============ RENDER FUNCTIONS ============

  const renderStatusBadge = (status) => {
    const statusColors = {
      new: "bg-blue-100 text-blue-800",
      working: "bg-yellow-100 text-yellow-800",
      open: "bg-green-100 text-green-800",
      prebooked: "bg-purple-100 text-purple-800",
      booked: "bg-success-100 text-success-800",
      completed: "bg-gray-100 text-gray-800",
      notbooked: "bg-red-100 text-red-800",
      draft: "bg-neutral-100 text-neutral-800",
      sent: "bg-secondary-100 text-secondary-800",
      archived: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          statusColors[status] || "bg-neutral-100 text-neutral-800"
        }`}
      >
        {status}
      </span>
    );
  };

  // StatCard component for analytics
  const StatCard = ({ icon: Icon, label, value, color, subValue }) => (
    <div className="rounded-xl bg-white p-6 shadow-nature-soft transition-transform hover:scale-105">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-light">{label}</p>
          <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
          {subValue && (
            <p className="mt-1 text-xs text-text-light">{subValue}</p>
          )}
        </div>
        <div className={`rounded-full p-3 ${color.replace('text-', 'bg-').replace('-800', '-100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const renderClientsTab = () => (
    <div className="space-y-4">
      {/* Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
            <input
              type="text"
              placeholder="Search clients..."
              value={filters.clientSearch}
              onChange={(e) => dispatch(setClientSearch(e.target.value))}
              onKeyPress={(e) =>
                e.key === "Enter" &&
                dispatch(fetchClients({ search: filters.clientSearch }))
              }
              className="w-full rounded-xl border border-primary-200 py-2 pl-10 pr-4 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 sm:text-base"
            />
          </div>
          <button
            onClick={() =>
              dispatch(fetchClients({ search: filters.clientSearch }))
            }
            className="w-full rounded-xl bg-primary-600 px-4 py-2 text-sm text-white transition-colors hover:bg-primary-700 sm:w-auto"
          >
            Search
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-200 px-4 py-2 text-sm font-medium text-text-dark transition-colors hover:bg-neutral-300 sm:flex-initial"
          >
            <FaSync /> <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => openModal("createClient")}
            className="shadow-coral-medium hover:shadow-coral-large flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105 sm:flex-initial"
          >
            <FaPlus /> <span className="hidden sm:inline">New Client</span>
          </button>
        </div>
      </div>

      {/* Clients Table */}
      {clientsLoading && clients.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-secondary border-t-transparent"></div>
        </div>
      ) : clientsError ? (
        <div className="rounded-xl bg-red-50 p-4 text-center text-red-600">
          Error: {clientsError.error_msg || "Failed to load clients"}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-nature-soft">
          {clientsLoading && (
            <div className="bg-blue-50 px-4 py-2 text-center text-sm text-blue-600">
              Refreshing...
            </div>
          )}
          <div className="bg-amber-50 px-3 py-2 text-center text-xs text-amber-700 sm:hidden">
            ← Swipe to see more columns →
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-primary-50">
                <tr>
                  <th className="sticky left-0 z-10 bg-primary-50 px-3 py-3 text-left text-xs font-semibold text-primary-800 sm:px-6 sm:py-4 sm:text-sm">
                    ID
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-primary-800 sm:px-6 sm:py-4 sm:text-sm">
                    Name
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-primary-800 sm:px-6 sm:py-4 sm:text-sm">
                    Email
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-primary-800 sm:px-6 sm:py-4 sm:text-sm">
                    Phone
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-primary-800 sm:px-6 sm:py-4 sm:text-sm">
                    Country
                  </th>
                  <th className="sticky right-0 z-10 bg-primary-50 px-3 py-3 text-right text-xs font-semibold text-primary-800 sm:px-6 sm:py-4 sm:text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100">
                {clients.map((client) => (
                  <tr
                    key={client.client_id}
                    className="transition-colors hover:bg-primary-50/50"
                  >
                    <td className="sticky left-0 z-10 bg-white px-3 py-3 text-xs text-text-dark sm:px-6 sm:py-4 sm:text-sm">
                      {client.client_id}
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4">
                      <div className="text-xs font-medium text-primary-800 sm:text-sm">
                        {client.salutation} {client.firstname} {client.lastname}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-text-dark sm:px-6 sm:py-4 sm:text-sm">
                      <div className="max-w-[150px] truncate sm:max-w-none">
                        {client.email}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-text-dark sm:px-6 sm:py-4 sm:text-sm">
                      {client.phone || "-"}
                    </td>
                    <td className="px-3 py-3 text-xs text-text-dark sm:px-6 sm:py-4 sm:text-sm">
                      {client.country || "-"}
                    </td>
                    <td className="sticky right-0 z-10 bg-white px-3 py-3 sm:px-6 sm:py-4">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <button
                          onClick={() =>
                            handleViewDetails("client", client.client_id)
                          }
                          className="rounded-lg bg-blue-100 p-1.5 text-blue-600 transition-colors hover:bg-blue-200 sm:p-2"
                          title="View Details"
                        >
                          <FaEye className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <button
                          onClick={() => openModal("updateClient", client)}
                          className="rounded-lg bg-yellow-100 p-1.5 text-yellow-600 transition-colors hover:bg-yellow-200 sm:p-2"
                          title="Edit"
                        >
                          <FaEdit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete("client", client.client_id)
                          }
                          className="rounded-lg bg-red-100 p-1.5 text-red-600 transition-colors hover:bg-red-200 sm:p-2"
                          title="Delete"
                        >
                          <FaTrash className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {clients.length === 0 && (
            <div className="py-12 text-center text-text-light">
              No clients found
            </div>
          )}
        </div>
      )}

      {/* Selected Client Details */}
      {(selectedClient || clientDetailsLoading) && (
        <div
          ref={clientDetailsRef}
          className="rounded-xl border-2 border-secondary bg-gradient-to-br from-blue-50 to-white p-6 shadow-lg"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-primary-800">
              👤 Client Details
            </h3>
            <button
              onClick={() => dispatch(clearSelectedClient())}
              className="text-text-light hover:text-accent"
            >
              <FaTimes />
            </button>
          </div>
          {clientDetailsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent"></div>
            </div>
          ) : selectedClient ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-text-light sm:text-sm">
                  ID
                </label>
                <p className="text-sm text-text-dark sm:text-base">
                  {selectedClient.client_id}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-text-light sm:text-sm">
                  Full Name
                </label>
                <p className="text-sm text-text-dark sm:text-base">
                  {selectedClient.salutation} {selectedClient.firstname}{" "}
                  {selectedClient.lastname}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-text-light sm:text-sm">
                  Email
                </label>
                <p className="break-all text-sm text-text-dark sm:text-base">
                  {selectedClient.email}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-text-light sm:text-sm">
                  Phone
                </label>
                <p className="text-sm text-text-dark sm:text-base">
                  {selectedClient.phone || "-"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-text-light sm:text-sm">
                  Country
                </label>
                <p className="text-sm text-text-dark sm:text-base">
                  {selectedClient.country || "-"}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Pagination */}
      {clientsPagination.total > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center text-xs text-text-light sm:text-left sm:text-sm">
            Showing {clients.length} of {clientsPagination.total} clients
          </div>
          <div className="flex justify-center gap-2">
            <button
              onClick={() =>
                dispatch(
                  fetchClients({
                    page: clientsPagination.page - 1,
                    search: filters.clientSearch,
                  }),
                )
              }
              disabled={clientsPagination.page === 1}
              className="rounded-lg bg-primary-100 px-3 py-2 text-xs font-medium text-primary-800 transition-colors hover:bg-primary-200 disabled:opacity-50 sm:px-4 sm:text-sm"
            >
              Previous
            </button>
            <span className="flex items-center px-3 py-2 text-xs text-text-dark sm:px-4 sm:text-sm">
              Page {clientsPagination.page}
            </span>
            <button
              onClick={() =>
                dispatch(
                  fetchClients({
                    page: clientsPagination.page + 1,
                    search: filters.clientSearch,
                  }),
                )
              }
              disabled={
                clientsPagination.page * clientsPagination.limit >=
                clientsPagination.total
              }
              className="rounded-lg bg-primary-100 px-3 py-2 text-xs font-medium text-primary-800 transition-colors hover:bg-primary-200 disabled:opacity-50 sm:px-4 sm:text-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderRequestsTab = () => (
    <div className="space-y-4">
      {/* Header & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <select
            value={filters.requestStatus}
            onChange={(e) => dispatch(setRequestStatus(e.target.value))}
            className="rounded-xl border border-primary-200 px-4 py-2 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="working">Working</option>
            <option value="open">Open</option>
            <option value="prebooked">Pre-booked</option>
            <option value="booked">Booked</option>
            <option value="completed">Completed</option>
            <option value="notbooked">Not Booked</option>
          </select>
          <div className="relative max-w-md flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
            <input
              type="text"
              placeholder="Search requests..."
              value={filters.requestSearch}
              onChange={(e) => dispatch(setRequestSearch(e.target.value))}
              onKeyPress={(e) =>
                e.key === "Enter" &&
                dispatch(
                  fetchRequests({
                    status: filters.requestStatus,
                    search: filters.requestSearch,
                  }),
                )
              }
              className="w-full rounded-xl border border-primary-200 py-2 pl-10 pr-4 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
            />
          </div>
          <button
            onClick={() =>
              dispatch(
                fetchRequests({
                  status: filters.requestStatus,
                  search: filters.requestSearch,
                }),
              )
            }
            className="rounded-xl bg-primary-600 px-4 py-2 text-white transition-colors hover:bg-primary-700"
          >
            <FaFilter />
          </button>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 rounded-xl bg-neutral-200 px-4 py-2 font-medium text-text-dark transition-colors hover:bg-neutral-300"
        >
          <FaSync /> Refresh
        </button>
      </div>

      {/* Requests Table */}
      {requestsLoading && requests.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-secondary border-t-transparent"></div>
        </div>
      ) : requestsError ? (
        <div className="rounded-xl bg-red-50 p-4 text-center text-red-600">
          Error: {requestsError.error_msg || "Failed to load requests"}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-nature-soft">
          {requestsLoading && (
            <div className="bg-blue-50 px-4 py-2 text-center text-sm text-blue-600">
              Refreshing...
            </div>
          )}
          <div className="bg-amber-50 px-3 py-2 text-center text-xs text-amber-700 sm:hidden">
            ← Swipe to see more columns →
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-primary-50">
                <tr>
                  <th className="sticky left-0 z-10 bg-primary-50 px-3 py-3 text-left text-xs font-semibold text-primary-800 sm:px-6 sm:py-4 sm:text-sm">
                    ID
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-primary-800 sm:px-6 sm:py-4 sm:text-sm">
                    Reference
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-primary-800 sm:px-6 sm:py-4 sm:text-sm">
                    Client
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-primary-800 sm:px-6 sm:py-4 sm:text-sm">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-primary-800 sm:px-6 sm:py-4 sm:text-sm">
                    Source
                  </th>
                  <th className="sticky right-0 z-10 bg-primary-50 px-3 py-3 text-right text-xs font-semibold text-primary-800 sm:px-6 sm:py-4 sm:text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100">
                {requests.map((request) => (
                  <tr
                    key={request.request_id}
                    className="transition-colors hover:bg-primary-50/50"
                  >
                    <td className="sticky left-0 z-10 bg-white px-3 py-3 text-xs text-text-dark sm:px-6 sm:py-4 sm:text-sm">
                      {request.request_id}
                    </td>
                    <td className="px-3 py-3 text-xs font-medium text-primary-800 sm:px-6 sm:py-4 sm:text-sm">
                      {request.reference}
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4">
                      <div className="text-xs text-text-dark sm:text-sm">
                        {request.client?.full_name || "-"}
                      </div>
                      <div className="text-[10px] text-text-light sm:text-xs">
                        {request.client?.email || ""}
                      </div>
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4">
                      {renderStatusBadge(request.status)}
                    </td>
                    <td className="px-3 py-3 text-xs text-text-dark sm:px-6 sm:py-4 sm:text-sm">
                      {request.source || "-"}
                    </td>
                    <td className="sticky right-0 z-10 bg-white px-3 py-3 sm:px-6 sm:py-4">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <button
                          onClick={() =>
                            handleViewDetails("request", request.request_id)
                          }
                          className="rounded-lg bg-blue-100 p-1.5 text-blue-600 transition-colors hover:bg-blue-200 sm:p-2"
                          title="View Details"
                        >
                          <FaEye className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <button
                          onClick={() => openModal("updateRequest", request)}
                          className="rounded-lg bg-yellow-100 p-1.5 text-yellow-600 transition-colors hover:bg-yellow-200 sm:p-2"
                          title="Edit"
                        >
                          <FaEdit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <button
                          onClick={() =>
                            openModal("bookRequest", {
                              requestId: request.request_id,
                            })
                          }
                          className="rounded-lg bg-green-100 p-1.5 text-green-600 transition-colors hover:bg-green-200 sm:p-2"
                          title="Book"
                        >
                          <FaCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <button
                          onClick={() =>
                            openModal("notBookedRequest", {
                              requestId: request.request_id,
                            })
                          }
                          className="hidden rounded-lg bg-orange-100 p-1.5 text-orange-600 transition-colors hover:bg-orange-200 sm:inline-block sm:p-2"
                          title="Mark Not Booked"
                        >
                          <FaTimes className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete("request", request.request_id)
                          }
                          className="rounded-lg bg-red-100 p-1.5 text-red-600 transition-colors hover:bg-red-200 sm:p-2"
                          title="Delete"
                        >
                          <FaTrash className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {requests.length === 0 && (
            <div className="py-12 text-center text-text-light">
              No requests found
            </div>
          )}
        </div>
      )}

      {/* Selected Request Details */}
      {(selectedRequest || requestDetailsLoading) && (
        <div
          ref={requestDetailsRef}
          className="rounded-xl border-2 border-secondary bg-gradient-to-br from-green-50 to-white p-6 shadow-lg"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-primary-800">
              📋 Request Details
            </h3>
            <button
              onClick={() => dispatch(clearSelectedRequest())}
              className="text-text-light hover:text-accent"
            >
              <FaTimes />
            </button>
          </div>
          {requestDetailsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent"></div>
            </div>
          ) : selectedRequest ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-light">
                    ID
                  </label>
                  <p className="text-text-dark">{selectedRequest.request_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-light">
                    Reference
                  </label>
                  <p className="text-text-dark">{selectedRequest.reference}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-light">
                    Status
                  </label>
                  <p>{renderStatusBadge(selectedRequest.status)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-light">
                    Client
                  </label>
                  <p className="text-text-dark">
                    {selectedRequest.client?.full_name || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-light">
                    Source
                  </label>
                  <p className="text-text-dark">
                    {selectedRequest.source || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-light">
                    Handled By
                  </label>
                  <p className="text-text-dark">
                    {selectedRequest.handled_by || "-"}
                  </p>
                </div>
                {selectedRequest.status === "booked" && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-text-light">
                        Booked Value
                      </label>
                      <p className="text-text-dark">
                        {selectedRequest.booked_value}{" "}
                        {selectedRequest.booked_currency}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-light">
                        Start Date
                      </label>
                      <p className="text-text-dark">
                        {selectedRequest.start_date
                          ? new Date(
                              selectedRequest.start_date,
                            ).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                  </>
                )}
                {selectedRequest.status === "notbooked" &&
                  selectedRequest.notbooked_reason && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-text-light">
                        Not Booked Reason
                      </label>
                      <p className="text-text-dark">
                        {selectedRequest.notbooked_reason}
                      </p>
                    </div>
                  )}
              </div>

              {/* Associated Quotes */}
              {quotes.length > 0 && (
                <div className="mt-6">
                  <h4 className="mb-3 font-semibold text-primary-800">
                    Associated Quotes
                  </h4>
                  <div className="space-y-2">
                    {quotes.map((quote) => (
                      <div
                        key={quote.quote_id}
                        className="flex items-center justify-between rounded-lg border border-primary-200 p-3"
                      >
                        <div>
                          <span className="font-medium text-text-dark">
                            Quote #{quote.quote_id}
                          </span>
                          <span className="ml-3">
                            {renderStatusBadge(quote.status)}
                          </span>
                          {quote.value && (
                            <span className="ml-3 text-sm text-text-light">
                              {quote.value} {quote.value_currency}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            handleViewDetails("quote", quote.quote_id)
                          }
                          className="rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-600 transition-colors hover:bg-blue-200"
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* Pagination */}
      {requestsPagination.total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-light">
            Showing {requests.length} of {requestsPagination.total} requests
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                dispatch(
                  fetchRequests({
                    page: requestsPagination.page - 1,
                    status: filters.requestStatus,
                    search: filters.requestSearch,
                  }),
                )
              }
              disabled={requestsPagination.page === 1}
              className="rounded-lg bg-primary-100 px-4 py-2 text-sm font-medium text-primary-800 transition-colors hover:bg-primary-200 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="flex items-center px-4 py-2 text-sm text-text-dark">
              Page {requestsPagination.page}
            </span>
            <button
              onClick={() =>
                dispatch(
                  fetchRequests({
                    page: requestsPagination.page + 1,
                    status: filters.requestStatus,
                    search: filters.requestSearch,
                  }),
                )
              }
              disabled={
                requestsPagination.page * requestsPagination.limit >=
                requestsPagination.total
              }
              className="rounded-lg bg-primary-100 px-4 py-2 text-sm font-medium text-primary-800 transition-colors hover:bg-primary-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderQuotesTab = () => (
    <div className="space-y-4">
      {/* Header & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <select
          value={filters.quoteStatus}
          onChange={(e) => dispatch(setQuoteStatus(e.target.value))}
          className="rounded-xl border border-primary-200 px-4 py-2 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="archived">Archived</option>
        </select>
        <button
          onClick={() => dispatch(fetchQuotes({ status: filters.quoteStatus }))}
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-white transition-colors hover:bg-primary-700"
        >
          <FaFilter /> Filter
        </button>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 rounded-xl bg-neutral-200 px-4 py-2 font-medium text-text-dark transition-colors hover:bg-neutral-300"
        >
          <FaSync /> Refresh
        </button>
      </div>

      {/* Quotes Table */}
      {quotesLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-secondary border-t-transparent"></div>
        </div>
      ) : quotesError ? (
        <div className="rounded-xl bg-red-50 p-4 text-center text-red-600">
          Error: {quotesError.error_msg || "Failed to load quotes"}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-nature-soft">
          <table className="w-full">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary-800">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary-800">
                  Version
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary-800">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary-800">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary-800">
                  Value
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-primary-800">
                  Sent Date
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-primary-800">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-100">
              {quotes.map((quote) => (
                <tr
                  key={quote.quote_id}
                  className="transition-colors hover:bg-primary-50/50"
                >
                  <td className="px-6 py-4 text-sm text-text-dark">
                    {quote.quote_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-dark">
                    {quote.version}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-text-dark">
                      {quote.client?.full_name || "-"}
                    </div>
                    <div className="text-xs text-text-light">
                      {quote.client?.email || ""}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {renderStatusBadge(quote.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-dark">
                    {quote.value
                      ? `${quote.value} ${quote.value_currency}`
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-dark">
                    {quote.sent
                      ? new Date(quote.sent).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          handleViewDetails("quote", quote.quote_id)
                        }
                        className="rounded-lg bg-blue-100 p-2 text-blue-600 transition-colors hover:bg-blue-200"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      {quote.pdf_url && (
                        <a
                          href={quote.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-purple-100 p-2 text-purple-600 transition-colors hover:bg-purple-200"
                          title="View PDF"
                        >
                          <FaFileInvoice />
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete("quote", quote.quote_id)}
                        className="rounded-lg bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-200"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {quotes.length === 0 && (
            <div className="py-12 text-center text-text-light">
              No quotes found
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {quotesPagination.total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-light">
            Showing {quotes.length} of {quotesPagination.total} quotes
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                dispatch(
                  fetchQuotes({
                    page: quotesPagination.page - 1,
                    status: filters.quoteStatus,
                  }),
                )
              }
              disabled={quotesPagination.page === 1}
              className="rounded-lg bg-primary-100 px-4 py-2 text-sm font-medium text-primary-800 transition-colors hover:bg-primary-200 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="flex items-center px-4 py-2 text-sm text-text-dark">
              Page {quotesPagination.page}
            </span>
            <button
              onClick={() =>
                dispatch(
                  fetchQuotes({
                    page: quotesPagination.page + 1,
                    status: filters.quoteStatus,
                  }),
                )
              }
              disabled={
                quotesPagination.page * quotesPagination.limit >=
                quotesPagination.total
              }
              className="rounded-lg bg-primary-100 px-4 py-2 text-sm font-medium text-primary-800 transition-colors hover:bg-primary-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Selected Quote Details */}
      {selectedQuote && (
        <div className="rounded-xl bg-white p-6 shadow-nature-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-primary-800">
              Quote Details
            </h3>
            <button
              onClick={() => dispatch(clearSelectedQuote())}
              className="text-text-light hover:text-accent"
            >
              <FaTimes />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text-light">ID</label>
              <p className="text-text-dark">{selectedQuote.quote_id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-light">
                Version
              </label>
              <p className="text-text-dark">{selectedQuote.version}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-light">
                Status
              </label>
              <p>{renderStatusBadge(selectedQuote.status)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-light">
                Value
              </label>
              <p className="text-text-dark">
                {selectedQuote.value
                  ? `${selectedQuote.value} ${selectedQuote.value_currency}`
                  : "-"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-light">
                Client
              </label>
              <p className="text-text-dark">
                {selectedQuote.client?.full_name || "-"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-light">
                Sent Date
              </label>
              <p className="text-text-dark">
                {selectedQuote.sent
                  ? new Date(selectedQuote.sent).toLocaleString()
                  : "-"}
              </p>
            </div>
            {selectedQuote.pdf_url && (
              <div className="col-span-2">
                <label className="text-sm font-medium text-text-light">
                  PDF URL
                </label>
                <p className="text-text-dark">
                  <a
                    href={selectedQuote.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:underline"
                  >
                    View PDF
                  </a>
                </p>
              </div>
            )}
            {selectedQuote.digital_url && (
              <div className="col-span-2">
                <label className="text-sm font-medium text-text-light">
                  Digital URL
                </label>
                <p className="text-text-dark">
                  <a
                    href={selectedQuote.digital_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:underline"
                  >
                    View Online
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary-800">Analytics Dashboard</h2>
        <div className="flex gap-2">
          {rateLimited && (
            <button
              onClick={() => {
                setRateLimited(false);
                if (activeTab === "analytics") {
                  dispatch(fetchAnalytics());
                  fetchAllRequestsStatsForAnalytics();
                }
              }}
              className="flex items-center gap-2 rounded-xl bg-green-200 px-4 py-2 font-medium text-green-800 transition-colors hover:bg-green-300"
            >
              Try Again
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={statsLoading}
            className="flex items-center gap-2 rounded-xl bg-neutral-200 px-4 py-2 font-medium text-text-dark transition-colors hover:bg-neutral-300 disabled:opacity-50"
          >
            <FaSync className={(analyticsLoading || statsLoading) ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Rate Limit Warning */}
      {rateLimited && (
        <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4">
          <div className="flex items-start gap-3">
            <FaTimesCircle className="text-red-600 text-xl mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">Rate Limit Exceeded</h3>
              <p className="text-sm text-red-700">
                You&apos;ve exceeded the API rate limit (1000 requests per hour). Please wait approximately 1 hour before trying again.
              </p>
              <p className="text-xs text-red-600 mt-2">
                The dashboard will automatically resume fetching data once the rate limit resets.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* BUSINESS STATISTICS - Always visible */}
      {statsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-secondary border-t-transparent"></div>
          <p className="ml-4 text-text-light">Loading analytics data...</p>
        </div>
      ) : (
        <>
        <div>
  <h3 className="mb-4 text-lg font-semibold text-primary-800">📊 Business Overview</h3>
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <StatCard
      icon={FaClipboardList}
      label="Total Requests"
      value={computedStats.totalRequests}
      color="text-blue-800"
    />
    <StatCard
      icon={FaCheckCircle}
      label="Completed Requests"
      value={computedStats.completedRequests}
      color="text-green-800"
      subValue={`${computedStats.totalRequests > 0 ? ((computedStats.completedRequests / computedStats.totalRequests) * 100).toFixed(1) : 0}% of total`}
    />
    <StatCard
      icon={FaCheck}
      label="Booked Requests"
      value={computedStats.bookedRequests}
      color="text-success-800"
      subValue={`${computedStats.conversionRate}% conversion rate`}
    />
    <StatCard
      icon={FaTimesCircle}
      label="Not Booked"
      value={computedStats.notBookedRequests}
      color="text-red-800"
    />
  </div>
</div>

{/* 🆕 NEW ROW - Add this below the first grid */}
<div className="grid gap-4 md:grid-cols-4">
  <StatCard
    icon={FaHourglassHalf}
    label="Pending Requests"
    value={computedStats.pendingRequests}
    color="text-yellow-800"
    subValue="New, Working, Open, Pre-booked"
  />
  <StatCard
    icon={FaUsers}
    label="Total Clients"
    value={computedStats.totalClients}
    color="text-purple-800"
  />
  <StatCard
    icon={FaFileInvoice}
    label="Total Quotes"
    value={computedStats.totalQuotes}
    color="text-indigo-800"
  />
  {/* 🆕 NEW STAT CARD - Total Persons in Completed Trips */}
  <StatCard
    icon={FaUsers}
    label="Persons Served"
    value={computedStats.totalPersonsCompleted}
    color="text-teal-800"
    subValue={`From ${computedStats.completedRequests} completed trips`}
  />
</div>

          {/* Request Status Breakdown */}
          <div className="rounded-xl bg-white p-6 shadow-nature-soft">
            <h3 className="mb-4 text-lg font-semibold text-primary-800">📈 Request Status Distribution</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { status: 'new', label: 'New', count: computedStats.newRequests, color: 'bg-blue-100 text-blue-800' },
                { status: 'working', label: 'Working', count: computedStats.workingRequests, color: 'bg-yellow-100 text-yellow-800' },
                { status: 'open', label: 'Open', count: computedStats.openRequests, color: 'bg-green-100 text-green-800' },
                { status: 'prebooked', label: 'Pre-booked', count: computedStats.prebookedRequests, color: 'bg-purple-100 text-purple-800' },
                { status: 'booked', label: 'Booked', count: computedStats.bookedRequests, color: 'bg-success-100 text-success-800' },
                { status: 'completed', label: 'Completed', count: computedStats.completedRequests, color: 'bg-gray-100 text-gray-800' },
                { status: 'notbooked', label: 'Not Booked', count: computedStats.notBookedRequests, color: 'bg-red-100 text-red-800' },
              ].map(({ status, label, count, color }) => {
                const percentage = computedStats.totalRequests > 0 
                  ? ((count / computedStats.totalRequests) * 100).toFixed(1)
                  : 0;
                
                return (
                  <div key={status} className={`rounded-lg p-4 ${color}`}>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm font-medium">{label}</div>
                    <div className="mt-1 text-xs opacity-75">{percentage}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* API ANALYTICS */}
      {analyticsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-secondary border-t-transparent"></div>
        </div>
      ) : analyticsError ? (
        <div className="rounded-xl bg-yellow-50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-yellow-800">
            API Analytics Unavailable
          </h3>
          <p className="text-sm text-yellow-700">
            {typeof analyticsError === "string"
              ? analyticsError
              : analyticsError?.error_msg || "Unable to load API analytics data."}
          </p>
          <p className="mt-2 text-xs text-yellow-600">
            Business statistics above are still available and accurate.
          </p>
        </div>
      ) : analytics ? (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-primary-800">🔌 API Analytics</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Usage Stats */}
            <div className="rounded-xl bg-white p-6 shadow-nature-soft">
              <h3 className="mb-4 text-lg font-semibold text-primary-800">
                API Usage (Last 7 Days)
              </h3>
              {analytics.usage ? (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-text-light">Total Requests</span>
                      <span className="font-semibold text-text-dark">
                        {analytics.usage.summary?.total_requests || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-light">Avg Daily Requests</span>
                      <span className="font-semibold text-primary-800">
                        {analytics.usage.summary?.average_daily_requests?.toFixed(2) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-light">Avg Response Time</span>
                      <span className="font-semibold text-secondary">
                        {analytics.usage.summary?.average_response_time_ms?.toFixed(0) || 0}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-light">Total Errors</span>
                      <span className="font-semibold text-red-600">
                        {analytics.usage.summary?.total_errors || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-light">Error Rate</span>
                      <span className="font-semibold text-red-600">
                        {analytics.usage.summary?.error_rate?.toFixed(2) || 0}%
                      </span>
                    </div>
                  </div>

                  {analytics.usage.period && (
                    <div className="mt-4 rounded-lg bg-primary-50 p-3">
                      <p className="text-sm text-text-light">
                        Period: {analytics.usage.period.from} to {analytics.usage.period.to}
                      </p>
                    </div>
                  )}

                  {analytics.usage.summary?.top_endpoints && (
                    <div className="mt-4">
                      <h4 className="mb-2 text-sm font-semibold text-primary-800">
                        Top Endpoints
                      </h4>
                      <div className="space-y-1">
                        {Object.entries(analytics.usage.summary.top_endpoints)
                          .slice(0, 5)
                          .map(([endpoint, count]) => (
                            <div key={endpoint} className="flex justify-between text-sm">
                              <span className="truncate text-text-light" title={endpoint}>
                                {endpoint}
                              </span>
                              <span className="ml-2 font-medium text-text-dark">{count}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-text-light">Usage data not available</p>
              )}
            </div>

            {/* Rate Limit */}
            <div className="rounded-xl bg-white p-6 shadow-nature-soft">
              <h3 className="mb-4 text-lg font-semibold text-primary-800">
                Rate Limit Status
              </h3>
              {analytics.rateLimit ? (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-text-light">Hourly Limit</span>
                      <span className="font-semibold text-text-dark">
                        {analytics.rateLimit.rate_limit || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-light">Used</span>
                      <span className="font-semibold text-warning">
                        {analytics.rateLimit.used || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-light">Remaining</span>
                      <span className="font-semibold text-success">
                        {analytics.rateLimit.remaining || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-light">Reset At</span>
                      <span className="font-semibold text-text-dark">
                        {analytics.rateLimit.reset_at
                          ? new Date(analytics.rateLimit.reset_at).toLocaleTimeString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-light">Resets In</span>
                      <span className="font-semibold text-secondary">
                        {analytics.rateLimit.reset_in_seconds
                          ? `${Math.floor(analytics.rateLimit.reset_in_seconds / 60)}m ${analytics.rateLimit.reset_in_seconds % 60}s`
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  {analytics.rateLimit.rate_limit && (
                    <div className="mt-4">
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-text-light">Usage</span>
                        <span className="font-medium text-text-dark">
                          {((analytics.rateLimit.used / analytics.rateLimit.rate_limit) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-primary-100">
                        <div
                          className={`h-full transition-all ${
                            analytics.rateLimit.used / analytics.rateLimit.rate_limit > 0.8
                              ? "bg-red-500"
                              : analytics.rateLimit.used / analytics.rateLimit.rate_limit > 0.5
                                ? "bg-warning"
                                : "bg-success"
                          }`}
                          style={{
                            width: `${(analytics.rateLimit.used / analytics.rateLimit.rate_limit) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {analytics.rateLimit.window && (
                    <div className="mt-4 rounded-lg bg-blue-50 p-3">
                      <p className="text-sm text-text-light">
                        Current Window: {new Date(analytics.rateLimit.window.start).toLocaleTimeString()} - {new Date(analytics.rateLimit.window.end).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-text-light">Rate limit data not available</p>
              )}
            </div>
          </div>

          {/* Methods Distribution */}
          {analytics.usage?.summary?.methods_distribution && (
            <div className="rounded-xl bg-white p-6 shadow-nature-soft">
              <h3 className="mb-4 text-lg font-semibold text-primary-800">
                HTTP Methods Distribution
              </h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {Object.entries(analytics.usage.summary.methods_distribution).map(([method, count]) => (
                  <div key={method} className="rounded-lg bg-primary-50 p-4 text-center">
                    <div className="text-2xl font-bold text-primary-800">{count}</div>
                    <div className="mt-1 text-sm text-text-light">{method}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Breakdown */}
          {analytics.usage?.daily_breakdown && analytics.usage.daily_breakdown.length > 0 && (
            <div className="rounded-xl bg-white p-6 shadow-nature-soft">
              <h3 className="mb-4 text-lg font-semibold text-primary-800">Daily Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-primary-200">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-primary-800">Date</th>
                      <th className="px-4 py-2 text-right font-semibold text-primary-800">Requests</th>
                      <th className="px-4 py-2 text-right font-semibold text-primary-800">Avg Response</th>
                      <th className="px-4 py-2 text-right font-semibold text-primary-800">Errors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-100">
                    {analytics.usage.daily_breakdown.map((day) => (
                      <tr key={day.date} className="hover:bg-primary-50/50">
                        <td className="px-4 py-2 text-text-dark">{day.date}</td>
                        <td className="px-4 py-2 text-right font-medium text-text-dark">
                          {day.total_requests}
                        </td>
                        <td className="px-4 py-2 text-right text-text-dark">
                          {day.avg_response_time ? `${parseFloat(day.avg_response_time).toFixed(0)}ms` : "-"}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <span className={day.error_count > 0 ? "font-medium text-red-600" : "text-text-light"}>
                            {day.error_count}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-yellow-50 p-6 text-center">
          <h3 className="mb-2 text-lg font-semibold text-yellow-800">No API Analytics Data</h3>
          <p className="text-yellow-700">
            API analytics data is not currently available. Try refreshing or check back later.
          </p>
        </div>
      )}
    </div>
  );

  // ============ MODAL RENDER ============
  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/20 p-4 backdrop-blur-sm">
        <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-6">
          <button
            onClick={closeModal}
            className="absolute right-3 top-3 text-text-light transition-colors hover:text-accent sm:right-4 sm:top-4"
          >
            <FaTimes className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <h2 className="mb-4 pr-8 text-xl font-bold text-primary-800 sm:mb-6 sm:text-2xl">
            {modalType === "createClient" && "Create New Client"}
            {modalType === "updateClient" && "Update Client"}
            {modalType === "updateRequest" && "Update Request"}
            {modalType === "bookRequest" && "Book Request"}
            {modalType === "notBookedRequest" && "Mark Request Not Booked"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {(modalType === "createClient" || modalType === "updateClient") && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-dark sm:text-sm">
                    Salutation
                  </label>
                  <input
                    type="text"
                    value={formData.salutation || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, salutation: e.target.value })
                    }
                    className="w-full rounded-xl border border-primary-200 px-3 py-2 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 sm:px-4 sm:text-base"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-dark sm:text-sm">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstname || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, firstname: e.target.value })
                    }
                    className="w-full rounded-xl border border-primary-200 px-3 py-2 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 sm:px-4 sm:text-base"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-dark sm:text-sm">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastname || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, lastname: e.target.value })
                    }
                    className="w-full rounded-xl border border-primary-200 px-3 py-2 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 sm:px-4 sm:text-base"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-dark sm:text-sm">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-xl border border-primary-200 px-3 py-2 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 sm:px-4 sm:text-base"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-dark sm:text-sm">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full rounded-xl border border-primary-200 px-3 py-2 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 sm:px-4 sm:text-base"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-dark sm:text-sm">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="w-full rounded-xl border border-primary-200 px-3 py-2 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 sm:px-4 sm:text-base"
                  />
                </div>
              </>
            )}

            {modalType === "updateRequest" && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-dark">
                    Lead Source
                  </label>
                  <input
                    type="text"
                    value={formData.lead_source || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, lead_source: e.target.value })
                    }
                    className="w-full rounded-xl border border-primary-200 px-4 py-2 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-dark">
                    Reference ID
                  </label>
                  <input
                    type="text"
                    value={formData.reference_id || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, reference_id: e.target.value })
                    }
                    className="w-full rounded-xl border border-primary-200 px-4 py-2 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
              </>
            )}

            {modalType === "bookRequest" && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-dark">
                    Quote IDs (comma-separated) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="1,2,3"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quote_ids: e.target.value
                          .split(",")
                          .map((id) => parseInt(id.trim())),
                      })
                    }
                    className="w-full rounded-xl border border-primary-200 px-4 py-2 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-dark">
                    Booking Value *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.booking_value || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        booking_value: parseFloat(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-primary-200 px-4 py-2 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-dark">
                    Booking Currency *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="USD"
                    value={formData.booking_currency || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        booking_currency: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-primary-200 px-4 py-2 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-dark">
                    Booking Confirmation Date *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.booking_confirmation_date || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        booking_confirmation_date: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-primary-200 px-4 py-2 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-dark">
                    Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.start_date || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    className="w-full rounded-xl border border-primary-200 px-4 py-2 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>
              </>
            )}

            {modalType === "notBookedRequest" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-text-dark">
                  Reason (optional)
                </label>
                <textarea
                  value={formData.reason || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  rows={4}
                  className="w-full rounded-xl border border-primary-200 px-4 py-2 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                />
              </div>
            )}

            <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="w-full rounded-xl bg-neutral-200 px-4 py-2.5 text-sm font-medium text-text-dark transition-colors hover:bg-neutral-300 sm:w-auto sm:px-6"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="shadow-coral-medium hover:shadow-coral-large w-full rounded-xl bg-gradient-to-r from-secondary to-sunshine-400 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 sm:w-auto sm:px-6"
              >
                {modalType === "createClient" && "Create Client"}
                {modalType === "updateClient" && "Update Client"}
                {modalType === "updateRequest" && "Update Request"}
                {modalType === "bookRequest" && "Book Request"}
                {modalType === "notBookedRequest" && "Mark Not Booked"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ============ MAIN RENDER ============
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-3 sm:p-4 lg:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-primary-800 sm:text-3xl lg:text-4xl">
            SafariOffice Management
          </h1>
          <p className="text-sm text-text-light sm:text-base">
            Manage clients, requests, quotes, and view analytics
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex min-w-max gap-2">
            <button
              onClick={() => setActiveTab("clients")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all sm:px-6 sm:py-3 sm:text-base ${
                activeTab === "clients"
                  ? "shadow-coral-medium bg-gradient-to-r from-secondary to-sunshine-400 text-white"
                  : "bg-white text-text-dark hover:bg-primary-50"
              }`}
            >
              <FaUsers /> <span className="whitespace-nowrap">Clients</span>
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all sm:px-6 sm:py-3 sm:text-base ${
                activeTab === "requests"
                  ? "shadow-coral-medium bg-gradient-to-r from-secondary to-sunshine-400 text-white"
                  : "bg-white text-text-dark hover:bg-primary-50"
              }`}
            >
              <FaClipboardList /> <span className="whitespace-nowrap">Requests</span>
            </button>
            <button
              onClick={() => setActiveTab("quotes")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all sm:px-6 sm:py-3 sm:text-base ${
                activeTab === "quotes"
                  ? "shadow-coral-medium bg-gradient-to-r from-secondary to-sunshine-400 text-white"
                  : "bg-white text-text-dark hover:bg-primary-50"
              }`}
            >
              <FaFileInvoice /> <span className="whitespace-nowrap">Quotes</span>
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all sm:px-6 sm:py-3 sm:text-base ${
                activeTab === "analytics"
                  ? "shadow-coral-medium bg-gradient-to-r from-secondary to-sunshine-400 text-white"
                  : "bg-white text-text-dark hover:bg-primary-50"
              }`}
            >
              <FaChartLine /> <span className="whitespace-nowrap">Analytics</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "clients" && renderClientsTab()}
          {activeTab === "requests" && renderRequestsTab()}
          {activeTab === "quotes" && renderQuotesTab()}
          {activeTab === "analytics" && renderAnalyticsTab()}
        </div>
      </div>

      {/* Modal */}
      {renderModal()}
    </div>
  );
};

export default SafariRequests;