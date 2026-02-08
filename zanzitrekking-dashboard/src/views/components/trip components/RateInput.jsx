const RateInput = ({ season, rates, onRateChange, rateItem = 0.01 }) => {
  return (
    <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
      <h3 className="text-deepred mb-4 text-xl font-semibold">
        {season} Rates
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="text-deepred mb-2 block text-sm font-medium">
            1 Person
          </label>
          <input
            type="number"
            min="0"
            step={rateItem}
            value={rates.onePerson === 0 ? "" : rates.onePerson}
            onChange={(e) =>
              onRateChange("onePerson", e.target.value === "" ? 0 : e.target.value)
            }
            className="block w-full rounded-xl border border-gray-300 bg-transparent p-3 px-4 py-3.5 text-black placeholder-slate-400 focus:border-deepred focus:outline-none"
            placeholder="Rate for 1 person"
          />
        </div>
        <div>
          <label className="text-deepred mb-2 block text-sm font-medium">
            2 Persons
          </label>
          <input
            type="number"
            min="0"
            step={rateItem}
            value={rates.twoPerson === 0 ? "" : rates.twoPerson}
            onChange={(e) =>
              onRateChange("twoPerson", e.target.value === "" ? 0 : e.target.value)
            }
            className="block w-full rounded-xl border border-gray-300 bg-transparent p-3 px-4 py-3.5 text-black placeholder-slate-400 focus:border-deepred focus:outline-none"
            placeholder="Rate for 2 persons"
          />
        </div>
        <div>
          <label className="text-deepred mb-2 block text-sm font-medium">
            3 Persons
          </label>
          <input
            type="number"
            min="0"
            step={rateItem}
            value={rates.threePerson === 0 ? "" : rates.threePerson}
            onChange={(e) =>
              onRateChange("threePerson", e.target.value === "" ? 0 : e.target.value)
            }
            className="block w-full rounded-xl border border-gray-300 bg-transparent p-3 px-4 py-3.5 text-black placeholder-slate-400 focus:border-deepred focus:outline-none"
            placeholder="Rate for 3 persons"
          />
        </div>
        <div>
          <label className="text-deepred mb-2 block text-sm font-medium">
            4 Persons
          </label>
          <input
            type="number"
            min="0"
            step={rateItem}
            value={rates.fourPerson === 0 ? "" : rates.fourPerson}
            onChange={(e) =>
              onRateChange("fourPerson", e.target.value === "" ? 0 : e.target.value)
            }
            className="block w-full rounded-xl border border-gray-300 bg-transparent p-3 px-4 py-3.5 text-black placeholder-slate-400 focus:border-deepred focus:outline-none"
            placeholder="Rate for 4 persons"
          />
        </div>
        <div>
          <label className="text-deepred mb-2 block text-sm font-medium">
            5+ Persons
          </label>
          <input
            type="number"
            min="0"
            step={rateItem}
            value={rates.fiveOrMorePerson === 0 ? "" : rates.fiveOrMorePerson}
            onChange={(e) =>
              onRateChange("fiveOrMorePerson", e.target.value === "" ? 0 : e.target.value)
            }
            className="block w-full rounded-xl border border-gray-300 bg-transparent p-3 px-4 py-3.5 text-black placeholder-slate-400 focus:border-deepred focus:outline-none"
            placeholder="Rate for 5+ persons"
          />
        </div>
      </div>
    </div>
  );
};

export default RateInput;