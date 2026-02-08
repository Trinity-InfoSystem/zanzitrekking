import authReducer from "./reducers/authReducer";
import cardReducer from "./reducers/cardReducer";
import dashboardReducer from "./reducers/dashboardReducer";
import homeReducer from "./reducers/homeReducer";
import orderReducer from "./reducers/orderReducer";
import bannerReducer from "./reducers/bannerReducer";
import blogPostReducer from "./reducers/blogPostReducer";
import whoWeAreReducer from "./reducers/aboutUsReducer";
import tripReducer from "./reducers/tripReducer";
import chatReducer from "./reducers/chatReducer";
import pdfReducer from "./reducers/pdfReducer";
import newsletterReducer from "./reducers/newsletterReducer";
import partnerReducer from "./reducers/partnerReducer";
import reviewReducer from "./reducers/reviewReducer";
import jobReducer from "./reducers/jobReducer";
import jobApplicationReducer from "./reducers/jobApplicationReducer";
import urgentBookingRequestReducer from "./reducers/urgentBookingRequestReducer";

export const rootReducer = {
  home: homeReducer,
  auth: authReducer,
  card: cardReducer,
  order: orderReducer,
  dashboard: dashboardReducer,
  banner: bannerReducer,
  blog: blogPostReducer,
  aboutUs: whoWeAreReducer,
  trip: tripReducer,
  chat: chatReducer,
  pdf: pdfReducer,
  newsletter: newsletterReducer,
  partner: partnerReducer,
  review: reviewReducer,
  job: jobReducer,
  jobApplication: jobApplicationReducer,
  urgentBookingRequest: urgentBookingRequestReducer,
};
