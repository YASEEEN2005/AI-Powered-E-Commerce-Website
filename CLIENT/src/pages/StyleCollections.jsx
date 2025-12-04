import React from "react";

function StyleCollections() {
  return (
    <section className="w-full bg-white py-10">
      <div className="mx-auto max-w-[1400px] px-6 grid gap-6 lg:grid-cols-2">
        <div className="flex items-center justify-between rounded-3xl bg-[#ffe4d6] px-8 py-10">
          <div className="max-w-xs space-y-3">
            <p className="text-xs font-medium tracking-[0.25em] text-slate-700 uppercase">
              Top Collections
            </p>
            <h3 className="text-3xl font-semibold text-slate-900">
              Top Trends Style
            </h3>
            <button className="mt-4 text-sm font-medium text-slate-900 underline underline-offset-4">
              Shop Now
            </button>
          </div>

          <div className="hidden md:block">
            <img
              src="https://images.pexels.com/photos/2745939/pexels-photo-2745939.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Top Trends Style"
              className="h-64 w-auto object-contain drop-shadow-xl"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-3xl bg-[#f8ecd3] px-8 py-10">
          <div className="max-w-xs space-y-3">
            <p className="text-xs font-medium tracking-[0.25em] text-slate-700 uppercase">
              Premium Online Exclusive
            </p>
            <h3 className="text-3xl font-semibold text-slate-900">
              Here Your Style
            </h3>
            <button className="mt-4 text-sm font-medium text-slate-900 underline underline-offset-4">
              Shop Now
            </button>
          </div>

          <div className="hidden md:block">
            <img
              src="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Here Your Style"
              className="h-64 w-auto object-contain drop-shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default StyleCollections;
