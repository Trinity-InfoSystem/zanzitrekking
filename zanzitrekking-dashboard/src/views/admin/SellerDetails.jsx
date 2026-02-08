import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  clearMessage,
  get_seller,
  seller_status_update,
} from "../../store/Reducers/sellerReducer";
import { toast } from "react-hot-toast";

const SellerDetails = () => {
  const { sellerId } = useParams();
  const dispatch = useDispatch();
  const [sellerStatus, setSellerStatus] = useState("");
  const { seller, errorMessage, successMessage } = useSelector(
    (state) => state.seller,
  );

  useEffect(() => {
    dispatch(get_seller(sellerId));
  }, [dispatch, sellerId]);

  useEffect(() => {
    if (seller) {
      setSellerStatus(seller.status);
    }
  }, [seller.status, seller]);

  const submit = (e) => {
    e.preventDefault();
    dispatch(seller_status_update({ sellerStatus, sellerId }));
  };
  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearMessage());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearMessage());
    }
  }, [errorMessage, successMessage, dispatch]);
  return (
    <div className="px-2 pt-5 lg:px-7">
      <h1 className="mb-3 pl-2 text-[20px] font-bold">Seller Details</h1>
      <div className="w-full rounded-md bg-[#6a5fdf] p-4 text-[#d0d2d6]">
        <div className="flex w-full flex-wrap">
          <div className="flex w-3/12 items-center justify-center py-3">
            <div>
              {seller?.image && (
                <img className="h-[230px] w-full" src={seller.image} alt="" />
              )}
            </div>
          </div>
          <div className="w-4/12">
            <div className="px-0 py-2 md:px-5">
              <div className="py-2 text-lg">
                <h2>Basic Info</h2>
              </div>
              <div className="flex flex-col justify-between gap-2 rounded-md bg-[#9e97e9] p-4 text-sm">
                <div className="flex gap-2 font-bold text-[#000000]">
                  <span>Name : </span>
                  <span> {seller.name} </span>
                </div>
                <div className="flex gap-2 font-bold text-[#000000]">
                  <span>Email : </span>
                  <span> {seller.email} </span>
                </div>
                <div className="flex gap-2 font-bold text-[#000000]">
                  <span>Role : </span>
                  <span> {seller.role} </span>
                </div>
                <div className="flex gap-2 font-bold text-[#000000]">
                  <span>Status : </span>
                  <span> {seller.status} </span>
                </div>
                <div className="flex gap-2 font-bold text-[#000000]">
                  <span>Payment Status : </span>
                  <span> {seller.status} </span>
                </div>
              </div>
            </div>
          </div>
          <div className="w-4/12">
            <div className="px-0 py-2 md:px-5">
              <div className="py-2 text-lg">
                <h2>Adress</h2>
              </div>
              <div className="flex flex-col justify-between gap-2 rounded-md bg-[#9e97e9] p-4 text-sm">
                <div className="flex gap-2 font-bold text-[#000000]">
                  <span>Shop Name : </span>
                  <span> {seller?.shopInfo?.shopName} </span>
                </div>
                <div className="flex gap-2 font-bold text-[#000000]">
                  <span>Division</span>
                  <span> {seller?.shopInfo?.division} </span>
                </div>
                <div className="flex gap-2 font-bold text-[#000000]">
                  <span>District : </span>
                  <span> {seller?.shopInfo?.district} </span>
                </div>
                <div className="flex gap-2 font-bold text-[#000000]">
                  <span>State : </span>
                  <span> {seller?.shopInfo?.sub_district} </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <form onSubmit={submit}>
            <div className="flex gap-4 py-3">
              <select
                className="rounded-md border border-slate-700 bg-[#6a5fdf] px-4 py-2 outline-none focus:border-indigo-500"
                name=""
                id=""
                required
                value={sellerStatus}
                onChange={(e) => setSellerStatus(e.target.value)}
              >
                <option value="">--Select Status--</option>
                <option value="active">Active</option>
                <option value="deactive">Deactive</option>
              </select>
              <button className="w-[170px] rounded-md bg-red-500 px-7 py-2 text-white hover:shadow-md hover:shadow-red-500/40">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellerDetails;
