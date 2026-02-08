import accommodationReducer from "./Reducers/accommodationReducer";
import authReducer from "./Reducers/authReducer";
import bannerReducer from "./Reducers/bannerReducer";
import blogReducer from "./Reducers/blogPostReducer";
import categoryReducer from "./Reducers/categoryReducer";
import chatReducer from "./Reducers/chatReducer";
import adminToAdminReducer from "./Reducers/adminToAdminReducer";
import exclusionReducer from "./Reducers/exclusionReducer";
import inclusionReducer from "./Reducers/inclusionReducer";
import mealReducer from "./Reducers/mealReducer";
import pdfReducer from "./Reducers/pdfReducer";
import productReducer from "./Reducers/productReducer";
import sellerReducer from "./Reducers/sellerReducer";
import tripReducer from "./Reducers/tripReducer";
import whoWeAreReducer from "./Reducers/whoWeAreReducer";
import newsletterReducer from "./Reducers/newsletterReducer";
import customerReducer from "./Reducers/customerReducer";
import orderReducer from "./Reducers/orderReducer";
import partnerReducer from "./Reducers/partnerReducer";
import dashboardReducer from "./Reducers/dashboardReducer";
import safariOfficeReducer from "./Reducers/safariOfficeReducer";
import jobReducer from "./Reducers/jobReducer";
import jobApplicationReducer from "./Reducers/jobApplicationReducer";
import achievementReducer from "./Reducers/achievementReducer";
import impactStatReducer from "./Reducers/impactStatReducer";
import clientReducer from "./Reducers/clientReducer";
import urgentBookingRequestReducer from "./Reducers/urgentBookingRequestReducer";

const rootReducer = {
  auth: authReducer,
  category: categoryReducer,
  product: productReducer,
  seller: sellerReducer,
  inclusion: inclusionReducer,
  trip: tripReducer,
  exclusion: exclusionReducer,
  accommodation: accommodationReducer,
  meal: mealReducer,
  banner: bannerReducer,
  blog: blogReducer,
  whoWeAre: whoWeAreReducer,
  newsletter: newsletterReducer,
  chat: chatReducer,
  adminToAdmin: adminToAdminReducer,
  pdf: pdfReducer,
  customer: customerReducer,
  order: orderReducer,
  partner: partnerReducer,
  dashboard: dashboardReducer,
  safariOffice: safariOfficeReducer,
  job: jobReducer,
  jobApplication: jobApplicationReducer,
  achievement: achievementReducer,
  impactStat: impactStatReducer,
  client: clientReducer,
  urgentBookingRequest: urgentBookingRequestReducer,
};
export default rootReducer;
