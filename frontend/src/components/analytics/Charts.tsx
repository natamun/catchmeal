import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type {
  DashboardDay,
  KcalPoint,
  WeightPoint,
} from '../../types/dashboard-analytics';

export default function Charts({
  kcalData,
  weightData,
  dashboard,
  onSelectDay,
  selectedDay,
}: {
  kcalData: KcalPoint[];
  weightData: WeightPoint[];
  dashboard: DashboardDay[];
  onSelectDay: (day: DashboardDay | null) => void;
  selectedDay: DashboardDay | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-green-100 bg-white shadow-sm transition-shadow hover:shadow-md">
        <h3 className="m-2 text-lg font-bold text-green-800">
          Calories / jour
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={kcalData} margin={{ right: 25, top: 10 }}>
            <CartesianGrid stroke="#d8f3dc" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#40916c', fontSize: 11 }} />
            <YAxis tick={{ fill: '#40916c', fontSize: 12 }} />
            <Tooltip />
            <Bar
              dataKey="kcal"
              fill="#74c69d"
              barSize={25}
              radius={[4, 4, 0, 0]}
              cursor="pointer"
              onClick={(data: { payload?: { date: string } }) => {
                const date = data?.payload?.date;
                if (!date) return;
                const day = dashboard.find((d) => d.day.slice(5) === date);
                onSelectDay(day || null);
              }}
            />
            <Line
              type="monotone"
              dataKey="objectif"
              stroke="#40916c"
              strokeDasharray="4 4"
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Legend />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div>
        {selectedDay && (
          <div className="rounded-xl border border-green-500 bg-green-300 p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-bold text-green-800">
                Détail du {selectedDay.day}
              </h4>
              <button
                onClick={() => onSelectDay(null)}
                className="text-sm text-green-900 hover:brightness-200"
              >
                X
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1 text-sm text-green-800">
              <p>Calories : {selectedDay.totalKcal ?? '—'} kcal</p>
              <p>Objectif : {selectedDay.goalKcal ?? '—'} kcal</p>
              <p>Protéines : {selectedDay.totalProtein ?? '—'} g</p>
              <p>Glucides : {selectedDay.totalCarbs ?? '—'} g</p>
              <p>Lipides : {selectedDay.totalFat ?? '—'} g</p>
              <p>Poids : {selectedDay.weight ?? '—'} kg</p>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-green-100 bg-white shadow-sm transition-shadow hover:shadow-md">
        <h3 className="m-2 text-lg font-bold text-green-800">
          Évolution du poids
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weightData} margin={{ right: 25, top: 10 }}>
            <CartesianGrid stroke="#d8f3dc" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#40916c', fontSize: 11 }} />
            <YAxis
              domain={['dataMin - 1', 'dataMax + 1']}
              tick={{ fill: '#40916c', fontSize: 12 }}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="poids"
              stroke="#40916c"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Legend />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
