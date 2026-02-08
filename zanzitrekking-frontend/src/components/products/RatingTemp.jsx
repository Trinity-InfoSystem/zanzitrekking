import { CiStar } from "react-icons/ci";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";

const RatingTemp = ({ rating }) => {
  if (rating === 5) {
    return (
      <>
        <span className="text-[#Edbb02]">
          <FaStar />
        </span>
        <span className="text-[#Edbb02]">
          <FaStar />
        </span>
        <span className="text-[#Edbb02]">
          <FaStar />
        </span>
        <span className="text-[#Edbb02]">
          <FaStar />
        </span>
        <span className="text-[#Edbb02]">
          <FaStar />
        </span>
      </>
    );
  }
  if (rating === 4) {
    return (
      <>
        <span className="text-[#Edbb02]">
          <FaStar />
        </span>
        <span className="text-[#Edbb02]">
          <FaStar />
        </span>
        <span className="text-[#Edbb02]">
          <FaStar />
        </span>
        <span className="text-[#Edbb02]">
          <FaStar />
        </span>
        <span className="text-[#Edbb02]">
          <CiStar />
        </span>
      </>
    );
  }
  if (rating === 3) {
    return (
      <>
        <span className="text-[#Edbb02]">
          <FaStar />
        </span>
        <span className="text-[#Edbb02]">
          <FaStar />
        </span>
        <span className="text-[#Edbb02]">
          <FaStar />
        </span>
        <span className="text-[#Edbb02]">
          <CiStar />
        </span>
        <span className="text-[#Edbb02]">
          <CiStar />
        </span>
      </>
    );
  }
  if (rating === 2) {
    return (
      <>
        <span className="text-[#Edbb02]">
          <FaStar />
        </span>
        <span className="text-[#Edbb02]">
          <FaStar />
        </span>
        <span className="text-[#Edbb02]">
          <CiStar />
        </span>
        <span className="text-[#Edbb02]">
          <CiStar />
        </span>
        <span className="text-[#Edbb02]">
          <CiStar />
        </span>
      </>
    );
  }
  if (rating === 1) {
    return (
      <>
        <span className="text-[#Edbb02]">
          <FaStar />
        </span>
        <span className="text-[#Edbb02]">
          <CiStar />
        </span>
        <span className="text-[#Edbb02]">
          <CiStar />
        </span>
        <span className="text-[#Edbb02]">
          <CiStar />
        </span>
        <span className="text-[#Edbb02]">
          <CiStar />
        </span>
      </>
    );
  }
  if (rating === 0) {
    return (
      <>
        <span className="text-[#Edbb02]">
          <CiStar />
        </span>
        <span className="text-[#Edbb02]">
          <CiStar />
        </span>
        <span className="text-[#Edbb02]">
          <CiStar />
        </span>
        <span className="text-[#Edbb02]">
          <CiStar />
        </span>
        <span className="text-[#Edbb02]">
          <CiStar />
        </span>
      </>
    );
  }
};

export default RatingTemp;
