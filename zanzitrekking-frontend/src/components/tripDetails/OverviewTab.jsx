"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  ScaleControl,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import {
  Award,
  Camera,
  Compass,
  Flag,
  Info,
  MapPin,
  Palmtree,
  Route,
  Shield,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import L from "leaflet";

// Enhanced Animated Marker Component with jumping behavior
const AnimatedRouteMarker = ({ routePath }) => {
  const map = useMap();
  const [isVisible, setIsVisible] = useState(true);
  const animationRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!routePath || routePath.length < 2) {return;}

    const movingIcon = L.divIcon({
      className: "animated-route-marker",
      html: `
        <div class="jumping-marker" style="
          width: 20px;
          height: 20px;
          position: relative;
          filter: drop-shadow(0 2px 8px rgba(59, 130, 246, 0.5));
        ">
          <div style="
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            border-radius: 50%;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2), 0 0 16px rgba(59, 130, 246, 0.4);
            border: 2px solid white;
            animation: jumpPulse 0.6s ease-in-out infinite;
            position: relative;
          ">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 8px;
              height: 8px;
              background: white;
              border-radius: 50%;
              box-shadow: 0 0 6px rgba(255, 255, 255, 0.9);
            "></div>
          </div>
        </div>
        <style>
          @keyframes jumpPulse {
            0%, 100% { 
              transform: translateY(0) scale(1);
            }
            50% { 
              transform: translateY(-8px) scale(1.1);
            }
          }
          .jumping-marker {
            transition: opacity 0.3s ease;
          }
        </style>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const marker = L.marker(routePath[0], {
      icon: movingIcon,
      zIndexOffset: 2000,
    }).addTo(map);

    markerRef.current = marker;

    const totalDuration = 20000; // Slower for better visibility
    const pauseDuration = 800; // Pause at each destination
    let startTime = null;
    let pauseUntil = null;
    let currentSegmentIndex = 0;

    const interpolate = (start, end, progress) => {
      return [
        start[0] + (end[0] - start[0]) * progress,
        start[1] + (end[1] - start[1]) * progress,
      ];
    };

    const getSegmentLengths = () => {
      const lengths = [];
      for (let i = 0; i < routePath.length - 1; i++) {
        const lat1 = routePath[i][0];
        const lng1 = routePath[i][1];
        const lat2 = routePath[i + 1][0];
        const lng2 = routePath[i + 1][1];
        const dist = Math.sqrt(
          (lat2 - lat1)**2 + (lng2 - lng1)**2,
        );
        lengths.push(dist);
      }
      return lengths;
    };

    const segmentLengths = getSegmentLengths();
    const totalLength = segmentLengths.reduce((sum, len) => sum + len, 0);

    const isNearDestination = (pos, destPos, threshold = 0.001) => {
      const dist = Math.sqrt(
        (pos[0] - destPos[0])**2 + (pos[1] - destPos[1])**2,
      );
      return dist < threshold;
    };

    const animate = (timestamp) => {
      if (!startTime) {startTime = timestamp;}

      // Handle pausing at destinations
      if (pauseUntil) {
        if (timestamp < pauseUntil) {
          animationRef.current = requestAnimationFrame(animate);
          return;
        }
        pauseUntil = null;
        setIsVisible(true);
        if (markerRef.current) {
          const element = markerRef.current.getElement();
          if (element) {
            element.style.opacity = "1";
          }
        }
      }

      const elapsed = timestamp - startTime;
      const progress = (elapsed % totalDuration) / totalDuration;

      let targetDistance = progress * totalLength;
      let currentSegment = 0;
      let segmentProgress = 0;

      for (let i = 0; i < segmentLengths.length; i++) {
        if (targetDistance <= segmentLengths[i]) {
          currentSegment = i;
          segmentProgress = targetDistance / segmentLengths[i];
          break;
        }
        targetDistance -= segmentLengths[i];
      }

      const newPosition = interpolate(
        routePath[currentSegment],
        routePath[currentSegment + 1] || routePath[currentSegment],
        segmentProgress,
      );

      marker.setLatLng(newPosition);

      // Check if reaching a destination (except start)
      if (currentSegment !== currentSegmentIndex && currentSegment > 0) {
        const destinationPos = routePath[currentSegment];
        if (isNearDestination(newPosition, destinationPos, 0.01)) {
          currentSegmentIndex = currentSegment;
          pauseUntil = timestamp + pauseDuration;
          setIsVisible(false);
          if (markerRef.current) {
            const element = markerRef.current.getElement();
            if (element) {
              element.style.opacity = "0";
            }
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
    };
  }, [map, routePath]);

  return null;
};

const OverviewTab = ({
  overview,
  days = [],
  mainDestination,
  startPoint,
  endPoint,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);

  const formatLocationName = (name) => {
    if (!name || typeof name !== "string") {return name;}

    const parts = name
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length === 0) {return name;}

    const area = parts[0];
    const country = parts[parts.length - 1];

    if (!country || country.toLowerCase() === area.toLowerCase()) {
      return area;
    }

    return `${area}, ${country}`;
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const dayDestinations = days
    ?.map((day) => {
      if (
        day.mainDestination &&
        day.mainDestination.location &&
        typeof day.mainDestination.location.lat === "number" &&
        typeof day.mainDestination.location.lng === "number"
      ) {
        return {
          ...day,
          coordinates: [
            day.mainDestination.location.lat,
            day.mainDestination.location.lng,
          ],
        };
      }
      return null;
    })
    .filter((dest) => dest && dest.coordinates);

  const completeRoute = [];

  if (
    startPoint &&
    startPoint.location &&
    typeof startPoint.location.lat === "number" &&
    typeof startPoint.location.lng === "number" &&
    !isNaN(startPoint.location.lat) &&
    !isNaN(startPoint.location.lng)
  ) {
    completeRoute.push({
      name: startPoint.name,
      title: startPoint.title,
      coordinates: [startPoint.location.lat, startPoint.location.lng],
      type: "start",
      location: startPoint.location,
    });
  }

  if (dayDestinations && dayDestinations.length > 0) {
    completeRoute.push(
      ...dayDestinations.map((dest) => ({
        ...dest,
        type: "day",
      })),
    );
  }

  if (
    endPoint &&
    endPoint.location &&
    typeof endPoint.location.lat === "number" &&
    typeof endPoint.location.lng === "number" &&
    !isNaN(endPoint.location.lat) &&
    !isNaN(endPoint.location.lng)
  ) {
    completeRoute.push({
      name: endPoint.name,
      title: endPoint.title,
      coordinates: [endPoint.location.lat, endPoint.location.lng],
      type: "end",
      location: endPoint.location,
    });
  }

  const middleStops = dayDestinations || [];
  const groupedMiddleStops = middleStops.reduce((acc, stop, index) => {
    const key = `${stop.coordinates[0]},${stop.coordinates[1]}`;
    if (!acc[key]) {
      acc[key] = {
        coordinates: stop.coordinates,
        indices: [],
        destinations: [],
      };
    }
    acc[key].indices.push(index + 1);
    acc[key].destinations.push(stop);
    return acc;
  }, {});

  const uniqueMiddleStops = Object.values(groupedMiddleStops);

  const startMarker = completeRoute.find(
    (dest) =>
      dest.type === "start" &&
      dest.coordinates &&
      dest.coordinates.length === 2,
  );
  const endMarker = completeRoute.find(
    (dest) =>
      dest.type === "end" && dest.coordinates && dest.coordinates.length === 2,
  );

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const sameLocation =
    startMarker &&
    endMarker &&
    calculateDistance(
      startMarker.coordinates[0],
      startMarker.coordinates[1],
      endMarker.coordinates[0],
      endMarker.coordinates[1],
    ) < 5;

  const firstDestination = Array.isArray(mainDestination)
    ? mainDestination[0]
    : mainDestination;

  let center = [-3.3667, 36.6833];
  if (
    firstDestination &&
    firstDestination.location &&
    typeof firstDestination.location.lat === "number" &&
    typeof firstDestination.location.lng === "number"
  ) {
    center = [firstDestination.location.lat, firstDestination.location.lng];
  } else if (
    startPoint &&
    startPoint.location &&
    typeof startPoint.location.lat === "number" &&
    typeof startPoint.location.lng === "number"
  ) {
    center = [startPoint.location.lat, startPoint.location.lng];
  } else if (dayDestinations?.length) {
    center = dayDestinations[0].coordinates;
  }

  const routePath = completeRoute
    .filter((dest) => dest.coordinates && dest.coordinates.length === 2)
    .map((dest) => dest.coordinates);

  const createCustomMarker = (type, content) => {
    const markerStyles = {
      start: {
        bg: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        border: "#34d399",
        shadow: "0 4px 16px rgba(16, 185, 129, 0.3)",
        ring: "rgba(16, 185, 129, 0.15)",
      },
      end: {
        bg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        border: "#fbbf24",
        shadow: "0 4px 16px rgba(245, 158, 11, 0.3)",
        ring: "rgba(245, 158, 11, 0.15)",
      },
      "start-end": {
        bg: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
        border: "#22d3ee",
        shadow: "0 4px 16px rgba(8, 145, 178, 0.3)",
        ring: "rgba(8, 145, 178, 0.15)",
      },
      mid: {
        bg: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
        border: "#94a3b8",
        shadow: "0 3px 10px rgba(100, 116, 139, 0.2)",
        ring: "rgba(100, 116, 139, 0.1)",
      },
    };

    const zIndexOffset = {
      start: 1200,
      end: 1050,
      "start-end": 1300,
      mid: 800,
    };

    const getMarkerContent = () => {
      if (type === "start-end") {return "S/E";}
      if (type === "start") {return "S";}
      if (type === "end") {return "E";}
      return content;
    };

    const getMarkerSize = () => {
      if (type === "start-end") {return { width: 40, height: 40, fontSize: 11 };}
      if (type === "start" || type === "end")
        {return { width: 36, height: 36, fontSize: 13 };}
      return { width: 32, height: 32, fontSize: 12 };
    };

    const size = getMarkerSize();
    const style = markerStyles[type];

    return new L.DivIcon({
      className: "custom-safari-marker",
      html: `
        <div style="
          position: relative;
          width: ${size.width}px;
          height: ${size.height}px;
        ">
          <div style="
            background: ${style.bg};
            color: white;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            font-weight: 700;
            font-size: ${size.fontSize}px;
            box-shadow: ${style.shadow};
            border: 2.5px solid white;
            letter-spacing: -0.3px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          ">
            <span style="text-shadow: 0 1px 2px rgba(0,0,0,0.1);">${getMarkerContent()}</span>
          </div>
          ${
            type === "start" || type === "end" || type === "start-end"
              ? `
          <div style="
            position: absolute;
            top: -4px;
            left: -4px;
            right: -4px;
            bottom: -4px;
            border: 2px solid ${style.border};
            border-radius: 50%;
            opacity: 0.4;
            animation: gentlePulse 2.5s ease-in-out infinite;
          "></div>
          `
              : ""
          }
        </div>
        <style>
          @keyframes gentlePulse {
            0%, 100% {
              transform: scale(0.95);
              opacity: 0.4;
            }
            50% {
              transform: scale(1.15);
              opacity: 0;
            }
          }
          .custom-safari-marker:hover > div > div {
            transform: scale(1.1);
          }
        </style>
      `,
      iconSize: [size.width, size.height],
      iconAnchor: [size.width / 2, size.height],
      popupAnchor: [0, -size.height],
    });
  };

  if (!overview && (!completeRoute || completeRoute.length === 0)) {
    return (
      <div className="flex min-h-[500px] items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4 inline-flex rounded-full bg-slate-100 p-4">
            <Info className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-neutral-900">
            Loading Safari Details
          </h3>
          <p className="text-sm text-neutral-500">
            Your adventure information will appear here shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .safari-card {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .safari-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border-color: rgba(0, 0, 0, 0.1);
        }
        
        .feature-card {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.06);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .feature-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
          border-color: rgba(0, 0, 0, 0.12);
        }

        .gradient-text {
          background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .journey-line {
          position: relative;
        }

        .journey-line::before {
          content: '';
          position: absolute;
          left: 18px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(to bottom, 
            rgba(148, 163, 184, 0.3) 0%,
            rgba(148, 163, 184, 0.6) 50%,
            rgba(148, 163, 184, 0.3) 100%
          );
        }
      `}</style>

      <div className="grid gap-6 px-4 py-6 lg:grid-cols-2 lg:gap-6 lg:px-6 lg:py-6">
        {/* Left Column - Overview & Journey */}
        <div className="space-y-6">
          {overview && (
            <div className="safari-card overflow-hidden rounded-2xl">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 shadow-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">
                      Safari Overview
                    </h3>
                    <p className="text-xs text-neutral-600">
                      Your adventure awaits
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5">
                <div className="mb-5">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                    {overview}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      icon: Shield,
                      label: "Safety First",
                      value: "Expert guides",
                      gradient: "from-emerald-500 to-emerald-600",
                    },
                    {
                      icon: Camera,
                      label: "Photography",
                      value: "Capture moments",
                      gradient: "from-violet-500 to-purple-600",
                    },
                    {
                      icon: Users,
                      label: "Local Experts",
                      value: "Deep knowledge",
                      gradient: "from-sky-500 to-blue-600",
                    },
                    {
                      icon: Award,
                      label: "Premium",
                      value: "5-star rated",
                      gradient: "from-amber-500 to-orange-600",
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="feature-card rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${item.gradient} shadow-md`}
                        >
                          <item.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-neutral-800">
                            {item.label}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {completeRoute && completeRoute.length > 0 && (
            <div className="safari-card overflow-hidden rounded-2xl">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 shadow-lg">
                    <Route className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">
                      Your Journey
                    </h3>
                    <p className="text-xs text-neutral-600">
                      {completeRoute.length} stops along the way
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5">
                <ul className="journey-line space-y-3">
                  {completeRoute.map((destination, index) => {
                    const hasStartPoint = completeRoute.some(
                      (d) => d.type === "start",
                    );
                    const displayDayNumber =
                      destination.day || (hasStartPoint ? index : index + 1);

                    const isStartEnd =
                      sameLocation &&
                      (destination.type === "start" ||
                        destination.type === "end");

                    if (sameLocation && destination.type === "end") {
                      return null;
                    }

                    const getIconGradient = () => {
                      if (isStartEnd) {return "from-cyan-500 to-cyan-600";}
                      if (destination.type === "start")
                        {return "from-emerald-500 to-emerald-600";}
                      if (destination.type === "end")
                        {return "from-amber-500 to-orange-600";}
                      return selectedDestination === index
                        ? "from-slate-600 to-slate-700"
                        : "from-slate-500 to-slate-600";
                    };

                    const getBgColor = () => {
                      if (selectedDestination === index)
                        {return "bg-slate-50/80";}
                      return "bg-transparent";
                    };

                    return (
                      <li
                        key={index}
                        className={`group relative flex items-start gap-4 rounded-xl border border-transparent p-4 transition-all ${getBgColor()} hover:border-slate-200 hover:bg-slate-50/60`}
                        onMouseEnter={() => setSelectedDestination(index)}
                        onMouseLeave={() => setSelectedDestination(null)}
                      >
                        <div className="relative z-10 flex-shrink-0">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${getIconGradient()} shadow-md transition-all group-hover:scale-105 group-hover:shadow-lg`}
                          >
                            {isStartEnd ? (
                              <div className="flex items-center justify-center text-[10px] font-bold text-white">
                                S/E
                              </div>
                            ) : destination.type === "start" ? (
                              <Flag className="h-5 w-5 text-white" />
                            ) : destination.type === "end" ? (
                              <Target className="h-5 w-5 text-white" />
                            ) : (
                              <span className="text-sm font-bold text-white">
                                {displayDayNumber}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
                            {isStartEnd
                              ? "Start & End Point"
                              : destination.type === "start"
                                ? "Starting Point"
                                : destination.type === "end"
                                  ? "Final Destination"
                                  : `Day ${displayDayNumber}`}
                          </div>

                          <h4 className="mb-1 text-[15px] font-semibold text-neutral-900">
                            {formatLocationName(
                              destination.name ||
                                destination.mainDestination?.name,
                            )}
                          </h4>

                          {destination.title && (
                            <p className="text-sm text-neutral-600">
                              {destination.title}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Map & Highlights */}
        <div className="space-y-6">
          <div className="safari-card overflow-hidden rounded-2xl">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 shadow-lg">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">
                    Interactive Route Map
                  </h3>
                  <p className="text-xs text-neutral-600">
                    Track your safari path
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="overflow-hidden rounded-xl border border-neutral-200 shadow-lg">
                <style>{`
                  .safari-map .leaflet-container {
                    z-index: 0 !important;
                  }
                  .safari-map .leaflet-control-container {
                    z-index: 1 !important;
                  }
                  .safari-map .leaflet-popup {
                    z-index: 2 !important;
                  }
                  .safari-map .leaflet-marker-pane {
                    z-index: 600 !important;
                  }
                  .animated-route-marker {
                    z-index: 2000 !important;
                  }
                  .safari-map .leaflet-popup-content-wrapper {
                    border-radius: 12px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                    border: 1px solid rgba(0, 0, 0, 0.06);
                  }
                  .safari-map .leaflet-popup-tip {
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                  }
                `}</style>
                <div className="h-[420px] lg:h-[480px]">
                  {isClient && (
                    <MapContainer
                      bounds={routePath.length > 0 ? routePath : [center]}
                      style={{
                        height: "100%",
                        width: "100%",
                        position: "relative",
                        zIndex: 0,
                      }}
                      scrollWheelZoom={false}
                      className="safari-map"
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      <ScaleControl position="bottomleft" />

                      {routePath.length > 1 && (
                        <AnimatedRouteMarker routePath={routePath} />
                      )}

                      {uniqueMiddleStops.map((stop, idx) => (
                        <Marker
                          key={`mid-${idx}`}
                          position={stop.coordinates}
                          icon={createCustomMarker(
                            "mid",
                            stop.indices.join(","),
                          )}
                          zIndexOffset={800}
                        >
                          <Popup>
                            <div className="p-3 text-sm">
                              <div className="mb-3 flex items-center gap-2 border-b border-neutral-200 pb-2">
                                <span className="font-bold text-neutral-900">
                                  Day {stop.indices.join(", ")}
                                </span>
                              </div>
                              {stop.destinations.map((dest, destIdx) => (
                                <div
                                  key={destIdx}
                                  className={
                                    destIdx > 0
                                      ? "mt-3 border-t border-neutral-100 pt-3"
                                      : ""
                                  }
                                >
                                  <p className="font-semibold text-neutral-800">
                                    {formatLocationName(
                                      dest.mainDestination?.name,
                                    )}
                                  </p>
                                  {dest.title && (
                                    <p className="mt-1 text-xs text-neutral-600">
                                      {dest.title}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </Popup>
                        </Marker>
                      ))}

                      {sameLocation && startMarker ? (
                        <Marker
                          key="start-end-marker"
                          position={startMarker.coordinates}
                          icon={createCustomMarker("start-end", "S/E")}
                          zIndexOffset={1300}
                        >
                          <Popup>
                            <div className="p-3 text-sm">
                              <div className="mb-3 flex items-center gap-2 border-b border-neutral-200 pb-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 text-[10px] font-bold text-white shadow-md">
                                  S/E
                                </div>
                                <strong className="font-bold text-neutral-900">
                                  Start & End Point
                                </strong>
                              </div>
                              <p className="font-semibold text-neutral-800">
                                {startMarker.name}
                              </p>
                              <p className="mt-2 text-xs text-slate-600">
                                🔄 Circular safari route
                              </p>
                            </div>
                          </Popup>
                        </Marker>
                      ) : (
                        <>
                          {startMarker && (
                            <Marker
                              key="start-marker"
                              position={startMarker.coordinates}
                              icon={createCustomMarker("start", "S")}
                              zIndexOffset={1200}
                            >
                              <Popup>
                                <div className="p-3 text-sm">
                                  <div className="mb-3 flex items-center gap-2 border-b border-neutral-200 pb-2">
                                    <Flag className="h-5 w-5 text-emerald-600" />
                                    <strong className="font-bold text-neutral-900">
                                      Starting Point
                                    </strong>
                                  </div>
                                  <p className="font-semibold text-neutral-800">
                                    {startMarker.name}
                                  </p>
                                </div>
                              </Popup>
                            </Marker>
                          )}

                          {endMarker && (
                            <Marker
                              key="end-marker"
                              position={endMarker.coordinates}
                              icon={createCustomMarker("end", "E")}
                              zIndexOffset={1050}
                            >
                              <Popup>
                                <div className="p-3 text-sm">
                                  <div className="mb-3 flex items-center gap-2 border-b border-neutral-200 pb-2">
                                    <Target className="h-5 w-5 text-amber-600" />
                                    <strong className="font-bold text-neutral-900">
                                      Final Destination
                                    </strong>
                                  </div>
                                  <p className="font-semibold text-neutral-800">
                                    {endMarker.name}
                                  </p>
                                </div>
                              </Popup>
                            </Marker>
                          )}
                        </>
                      )}

                      {routePath.length > 1 && (
                        <>
                          <Polyline
                            positions={routePath}
                            color="#000000"
                            weight={7}
                            opacity={0.08}
                            lineCap="round"
                            lineJoin="round"
                          />
                          <Polyline
                            positions={routePath}
                            color="#475569"
                            weight={4}
                            opacity={0.5}
                            dashArray="12, 8"
                            lineCap="round"
                            lineJoin="round"
                          />
                          <Polyline
                            positions={routePath}
                            color="#64748b"
                            weight={2.5}
                            opacity={0.9}
                            lineCap="round"
                            lineJoin="round"
                          />
                        </>
                      )}
                    </MapContainer>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Map Legend */}
          <div className="safari-card rounded-xl px-5 py-4">
            <h4 className="mb-4 flex items-center gap-2 text-xs font-bold text-neutral-900">
              <Compass className="h-4 w-4 text-neutral-600" />
              Map Legend
            </h4>

            <div className="grid grid-cols-2 gap-3">
              {sameLocation ? (
                <div className="col-span-2 flex items-center gap-3 rounded-xl border border-cyan-200 bg-cyan-50 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 text-[11px] font-bold text-white shadow-md">
                    S/E
                  </div>
                  <span className="text-sm font-semibold text-neutral-800">
                    Start & End Point
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md">
                      <Flag className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-neutral-800">
                      Start
                    </span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-md">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-neutral-800">
                      End
                    </span>
                  </div>
                </>
              )}
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 text-xs font-bold text-white shadow-md">
                  {middleStops.length}
                </div>
                <span className="text-xs font-semibold text-neutral-800">
                  Stops
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
                <div className="relative flex h-8 w-8 items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg"></div>
                  <div className="absolute h-2 w-2 rounded-full bg-white"></div>
                </div>
                <span className="text-xs font-semibold text-neutral-800">
                  Route
                </span>
              </div>
            </div>
          </div>

          {/* Journey Highlights */}
          {(() => {
            const destinations = Array.isArray(mainDestination)
              ? mainDestination
              : mainDestination
                ? [mainDestination]
                : [];

            if (destinations.length === 0) {return null;}

            return (
              <div className="safari-card rounded-xl px-5 py-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md">
                    <Palmtree className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-neutral-900">
                    Journey Highlights
                  </h3>
                </div>

                <div className="grid gap-3">
                  {destinations.map((destination, index) => (
                    <div
                      key={index}
                      className="group flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 transition-all hover:border-slate-300 hover:shadow-md"
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 text-xs font-bold text-white shadow-md transition-transform group-hover:scale-105">
                        {index + 1}
                      </div>
                      <h4 className="text-xs font-semibold text-neutral-900">
                        {formatLocationName(
                          destination?.name || "Unknown Destination",
                        )}
                      </h4>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
