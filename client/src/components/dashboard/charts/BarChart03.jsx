import React, { useRef, useEffect } from 'react';

import {
  Chart, BarController, BarElement, LinearScale, CategoryScale, Tooltip, Legend,
} from 'chart.js';
import 'chartjs-adapter-moment';

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip, Legend);

function BarChart03({
  data,
  width,
  height
}) {

  const canvas = useRef(null);
  const legend = useRef(null);

  useEffect(() => {

    // Calculate sum of values
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    const values = data.datasets.map(x => x.data.reduce(reducer));
    const max = values.reduce(reducer);

    const ctx = canvas.current;
    // eslint-disable-next-line no-unused-vars
    const chart = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        indexAxis: 'y',
        layout: {
          padding: {
            top: 12,
            bottom: 12,
            left: 20,
            right: 20,
          },
        },
        scales: {
          x: {
            stacked: true,
            display: false,
            max: max,
          },
          y: {
            stacked: true,
            display: false,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              title: () => false, // Disable tooltip title
              label: (context) => context.parsed.x,
            },
          },
        },
        interaction: {
          intersect: false,
          mode: 'nearest'
        },
        animation: {
          duration: 500,
        },
        maintainAspectRatio: false,
        resizeDelay: 200,
      },
      plugins: [{}],
    });
    return () => chart.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grow flex flex-col justify-center">
      <div>
        <canvas ref={canvas} width={width} height={height}></canvas>
      </div>
      <div className="px-5 pt-2 pb-2">
        <ul ref={legend} className="text-sm divide-y divide-slate-100"></ul>
        <ul className="text-sm divide-y divide-slate-100">
        {data.datasets.map((item) =>
        <li className='flex justify-between items-center pt-2.5 pb-2.5'>
            <div className='flex items-center'>
              <div className={`w-3 h-3 rounded-sm mr-3 ${item.bg}`}></div>
                <div>{item.label}</div>
                </div>
                <div className="font-medium ml-3"> 29%</div>
          </li>
)}
        </ul>
      </div>
    </div>
  );
}

export default BarChart03;