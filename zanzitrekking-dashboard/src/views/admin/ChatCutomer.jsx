import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FaList } from "react-icons/fa";
const ChatCustomer = () => {
  const [show, setShow] = useState(false);
  const sellerId = 65;

  return (
    <div className="px-2 py-5 lg:px-7">
      <div className="h-[calc(100vh-140px)] w-full rounded-md bg-[#6a5fdf] px-4 py-4">
        <div className="relative flex h-full w-full">
          <div
            className={`absolute z-10 h-full w-[280px] ${show ? "-left-[16px]" : "-left-[336px]"} transition-all md:relative md:left-0`}
          >
            <div className="h-[calc(100vh-177px)] w-full overflow-y-auto bg-[#9e97e9] md:bg-transparent">
              <div className="flex items-center justify-between p-4 text-white md:p-0 md:px-3 md:pb-3">
                <h2>Sellers</h2>
                <span
                  onClick={() => setShow(false)}
                  className="block cursor-pointer md:hidden"
                >
                  <IoMdClose />
                </span>
              </div>
              <div
                className={`flex h-[60px] cursor-pointer items-center justify-start gap-2 rounded-md bg-[#8288ed] px-2 py-2 text-white`}
              >
                <div className="relative">
                  <img
                    className="h-[38px] w-[38px] max-w-[38px] rounded-full border-2 border-white p-[2px]"
                    src="/images/admin.jpg"
                    alt=""
                  />
                  <div className="absolute bottom-0 right-0 h-[10px] w-[10px] rounded-full bg-green-500"></div>
                </div>
                <div className="flex w-full flex-col items-start justify-center">
                  <div className="item-center flex w-full justify-between">
                    <h2 className="text-base font-semibold">Assala Aoua</h2>
                  </div>
                </div>
              </div>
              <div
                className={`flex h-[60px] cursor-pointer items-center justify-start gap-2 rounded-sm px-2 py-2 text-white`}
              >
                <div className="relative">
                  <img
                    className="h-[38px] w-[38px] max-w-[38px] rounded-full border-2 border-white p-[2px]"
                    src="/images/admin.jpg"
                    alt=""
                  />
                  <div className="absolute bottom-0 right-0 h-[10px] w-[10px] rounded-full bg-green-500"></div>
                </div>
                <div className="flex w-full flex-col items-start justify-center">
                  <div className="item-center flex w-full justify-between">
                    <h2 className="text-base font-semibold">Ali Aoua</h2>
                  </div>
                </div>
              </div>
              <div
                className={`flex h-[60px] cursor-pointer items-center justify-start gap-2 rounded-sm px-2 py-2 text-white`}
              >
                <div className="relative">
                  <img
                    className="h-[38px] w-[38px] max-w-[38px] rounded-full border-2 border-white p-[2px]"
                    src="/images/admin.jpg"
                    alt=""
                  />
                  <div className="absolute bottom-0 right-0 h-[10px] w-[10px] rounded-full bg-green-500"></div>
                </div>
                <div className="flex w-full flex-col items-start justify-center">
                  <div className="item-center flex w-full justify-between">
                    <h2 className="text-base font-semibold">Najoua Aoua</h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-[calc(100%-200px)] md:pl-4">
            <div className="flex items-center justify-between">
              {sellerId && (
                <div className="flex items-center justify-start gap-3">
                  <div className="relative">
                    <img
                      className="h-[45px] w-[45px] max-w-[45px] rounded-full border-2 border-green-500 p-[2px]"
                      src="/images/demo.jpg"
                      alt=""
                    />
                    <div className="absolute bottom-0 right-0 h-[10px] w-[10px] rounded-full bg-green-500"></div>
                  </div>
                </div>
              )}
              <div
                onClick={() => setShow((pre) => !pre)}
                className="flex h-[35px] w-[35px] cursor-pointer items-center justify-center rounded-sm bg-blue-500 text-white shadow-lg hover:shadow-blue-500/50 md:hidden"
              >
                <span>
                  <FaList />
                </span>
              </div>
            </div>

            <div className="py-4">
              <div className="h-[calc(100vh-290px)] overflow-y-auto rounded-md bg-[#475569] p-3">
                <div className="flex w-full items-center justify-start">
                  <div className="flex max-w-full items-start justify-start gap-2 py-2 md:px-3 lg:max-w-[85%]">
                    <div className="">
                      <img
                        src="/images/demo.jpg"
                        alt=""
                        className="w-[35px] max-w-[38px] rounded-full border-2 border-white p-[3px]"
                      />
                    </div>
                    <div className="flex w-full flex-col items-start justify-center rounded-sm bg-blue-500 px-2 py-1 text-white shadow-lg shadow-blue-500/50">
                      <span>How are you ?</span>
                    </div>
                  </div>
                </div>
                <div className="flex w-full items-center justify-end">
                  <div className="flex max-w-full items-start justify-start gap-2 py-2 md:px-3 lg:max-w-[85%]">
                    <div className="flex w-full flex-col items-start justify-center rounded-sm bg-red-500 px-2 py-1 text-white shadow-lg shadow-red-500/50">
                      <span>How are you ?</span>
                    </div>
                    <div className="">
                      <img
                        src="/images/admin.jpg"
                        alt=""
                        className="w-[35px] max-w-[38px] rounded-full border-2 border-white p-[3px]"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex w-full items-center justify-start">
                  <div className="flex max-w-full items-start justify-start gap-2 py-2 md:px-3 lg:max-w-[85%]">
                    <div className="">
                      <img
                        src="/images/demo.jpg"
                        alt=""
                        className="w-[35px] max-w-[38px] rounded-full border-2 border-white p-[3px]"
                      />
                    </div>
                    <div className="flex w-full flex-col items-start justify-center rounded-sm bg-blue-500 px-2 py-1 text-white shadow-lg shadow-blue-500/50">
                      <span>I need some help</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <form className="flex gap-3">
              <input
                className="flex w-full items-center justify-between rounded-md border border-slate-700 bg-transparent px-2 py-[5px] text-[#d0d2d6] outline-none focus:border-blue-500"
                type="text"
                name=""
                id=""
                placeholder="Input Your Message"
              />
              <button className="flex h-[35px] w-[75px] items-center justify-center rounded-md bg-[#06b6d4] font-semibold text-white shadow-lg hover:shadow-cyan-500/50">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatCustomer;
