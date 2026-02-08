import { Clock, Mail, MapPin, Phone } from "lucide-react";
import ContactItem from "./ContactItem";
import { get_conpany_info } from "../../store/reducers/authReducer";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

const FooterContactInfo = () => {
  const dispatch = useDispatch();
  const { companyInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(get_conpany_info());
  }, [dispatch]);

  return (
    <div className="lg:col-span-1">
      <div className="mb-6 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-secondary-100 to-secondary-200">
          <Phone className="h-4.5 w-4.5 text-secondary-600" />
        </div>
        <h3 className="text-base font-semibold text-text-dark">Get In Touch</h3>
      </div>

      <div className="space-y-2.5">
        {companyInfo?.companyEmail && (
          <ContactItem
            icon={<Mail className="h-4.5 w-4.5" />}
            text={companyInfo.companyEmail}
            href={`mailto:${companyInfo.companyEmail}`}
            label="Email us"
          />
        )}
        {companyInfo?.companyPhoneNumber && (
          <ContactItem
            icon={<Phone className="h-4.5 w-4.5" />}
            text={companyInfo.companyPhoneNumber}
            href={`tel:${companyInfo.companyPhoneNumber}`}
            label="Call us"
          />
        )}
        {companyInfo?.companyAddress && (
          <ContactItem
            icon={<MapPin className="h-4.5 w-4.5" />}
            text={companyInfo.companyAddress}
            href={`https://maps.google.com/?q=${companyInfo.companyAddress.replace(" ", "+")}`}
            label="Visit us"
          />
        )}
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-text-dark">
          <Clock className="h-4 w-4 text-primary-600" />
          <span className="text-sm font-semibold">Office Hours</span>
        </div>
        <div className="space-y-2 text-xs text-text-light">
          <div className="flex items-center justify-between">
            <span>Monday - Friday</span>
            <span className="font-medium text-text-dark">
              8:00 AM - 6:00 PM
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Saturday</span>
            <span className="font-medium text-text-dark">
              9:00 AM - 4:00 PM
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Sunday</span>
            <span className="font-medium text-neutral-400">Closed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterContactInfo;
