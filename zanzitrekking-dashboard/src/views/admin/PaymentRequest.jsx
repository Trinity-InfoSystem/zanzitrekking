import { forwardRef } from "react";
import { FixedSizeList as List } from "react-window";

function handleOnWheel({ detltaY }) {}

const outerElementType = forwardRef((props, ref) => (
  <div ref={ref} onWheel={handleOnWheel} {...props} />
));
const PaymentRequest = () => {
  const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const Row = ({ index, style }) => {
    return (
      <div style={style} className="flex text-sm font-medium text-text-dark">
        <div className="w-[25%] whitespace-nowrap p-2">{index + 1}</div>
        <div className="w-[25%] whitespace-nowrap p-2 font-semibold text-primary-800">
          $3434
        </div>
        <div className="w-[25%] whitespace-nowrap p-2">
          <span className="rounded-full bg-sunshine-100 px-3 py-1 text-xs font-semibold text-sunshine-700">
            Pending
          </span>
        </div>
        <div className="w-[25%] whitespace-nowrap p-2 text-text">
          25 Oct 2024{" "}
        </div>
        <div className="w-[25%] whitespace-nowrap p-2">
          <button className="shadow-coral-soft hover:shadow-coral-medium cursor-pointer rounded-lg bg-gradient-to-r from-secondary to-sunshine-400 px-3 py-1.5 text-sm font-semibold text-white transition-all hover:scale-105">
            Confirm
          </button>
        </div>
      </div>
    );
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 px-2 pt-5 lg:px-7">
      <div className="w-full rounded-2xl bg-white p-6 shadow-nature-medium ring-1 ring-primary-100">
        <h2 className="pb-5 text-xl font-bold text-primary-800">
          Withdrawal Request
        </h2>
        <div className="w-full">
          <div className="w-full overflow-x-auto">
            <div className="flex min-w-[340px] rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 p-2 text-xs font-bold uppercase text-primary-700">
              <div className="w-[25%] p-2">Number</div>
              <div className="w-[25%] p-2">amount</div>
              <div className="w-[25%] p-2">status</div>
              <div className="w-[25%] p-2">date</div>
              <div className="w-[25%] p-2">action</div>
            </div>
            {
              <List
                style={{ minWidth: "340px" }}
                className="list"
                height={350}
                itemCount={10}
                itemSize={35}
                outerElementType={outerElementType}
              >
                {Row}
              </List>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentRequest;
