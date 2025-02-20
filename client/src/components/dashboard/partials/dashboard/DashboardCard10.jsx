import React from "react";

function DashboardCard10(props) {
  let title = props.title;

  let customers = props.json;

  return (
    <div className="col-span-full rounded-sm border border-slate-200 bg-white shadow-lg dark:bg-gray-400 xl:col-span-6">
      <header className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-slate-800">{title}</h2>
      </header>
      <div className="p-3">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            {/* Table header */}
            <thead className="text-xs font-semibold uppercase text-black">
              <tr>
                <th className="whitespace-nowrap p-2">
                  <div className="text-left font-semibold">Name</div>
                </th>
                <th className="whitespace-nowrap p-2">
                  <div className="text-left font-semibold">Email</div>
                </th>
                <th className="whitespace-nowrap p-2">
                  <div className="text-left font-semibold">Revenue</div>
                </th>
                <th className="whitespace-nowrap p-2">
                  <div className="text-center font-semibold">Country</div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="divide-y divide-slate-100 text-sm">
              {customers.map((customer) => {
                return (
                  <tr key={customer.id}>
                    <td className="whitespace-nowrap p-2">
                      <div className="flex items-center">
                        <div className="font-medium text-slate-800">
                          {customer.name}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap p-2">
                      <div className="text-left">{customer.email}</div>
                    </td>
                    <td className="whitespace-nowrap p-2">
                      <div className="text-left font-medium text-violet-800">
                        {customer.spent}
                      </div>
                    </td>
                    <td className="whitespace-nowrap p-2">
                      <div className="text-center text-lg">
                        {customer.location}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardCard10;
