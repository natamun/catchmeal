import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type {
  DashboardDay,
  DataGraph,
  Grain,
} from '../../types/dashboard-analytics';
import buildDataGraph from '../../utils/buildDataGraph';

const grainPrintFR = (type: Grain): string => {
  if (type === 'day') return 'Jour';
  else if (type === 'week') return 'Semaine';
  else return 'Bimensuel';
};

const PX_PER_POINT = 33;

function grainForWidth(w: number, dataLength: number): Grain {
  const maxPoints = Math.floor(w - 40) / PX_PER_POINT;
  if (dataLength <= maxPoints) return 'day';
  if (Math.ceil(dataLength / 7) <= maxPoints) return 'week';
  return 'biWeek';
}

export default function Charts({ dashboard }: { dashboard: DashboardDay[] }) {
  const [width, setWidth] = useState<number>(530);

  const dataLength = dashboard.length;

  const grain = useMemo<Grain>(
    () => grainForWidth(width, dataLength),
    [width, dataLength],
  );

  const data = useMemo<DataGraph[]>(
    () => buildDataGraph(dashboard, grain),
    [dashboard, grain],
  );

  const printGrain = grainPrintFR(grain);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-green-200 bg-white shadow-sm transition-shadow hover:shadow-md">
        <h3 className="m-2 text-lg font-semibold">
          Calories et objectif / {printGrain}
        </h3>
        <ResponsiveContainer
          width="100%"
          height={250}
          onResize={(w: number) => {
            setWidth(w);
          }}
        >
          <ComposedChart data={data} margin={{ right: 25, top: 10 }}>
            <CartesianGrid stroke="#d8f3dc" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={40} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar
              dataKey="kcal"
              name="Kilocalorie"
              fill="#74c69d"
              barSize={25}
              radius={[4, 4, 0, 0]}
              cursor="pointer"
            />
            <Line
              type="monotone"
              dataKey="objective"
              name="objectif"
              stroke="#081c15"
              strokeDasharray="5 3"
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Legend />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border border-green-200 bg-white shadow-sm transition-shadow hover:shadow-md">
        <h3 className="m-2 text-lg font-semibold">
          Évolution du poids / {printGrain}
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data} margin={{ right: 25, top: 10 }}>
            <defs>
              <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#40916c" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#40916c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#d8f3dc" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis
              domain={['dataMin - 1', 'dataMax + 1']}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="weight"
              name="Poids"
              stroke="#40916c"
              strokeWidth={3}
              fill="url(#weightFill)"
              dot={false}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
