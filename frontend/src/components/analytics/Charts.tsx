import {
  Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ComposedChart,
} from 'recharts';

import type { DashboardDay, WeightPoint, KcalPoint } from '../../types/dashboard-analytics';

export default function Charts({ kcalData, weightData, dashboard, onSelectDay, selectedDay }: { kcalData: KcalPoint[], weightData: WeightPoint[], dashboard: DashboardDay[], onSelectDay: (day: DashboardDay | null) => void, selectedDay: DashboardDay | null }) {
  return (
    <div className="flex flex-col gap-4">
      <div className= "bg-white rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition-shadow">
        <h3 className= " text-lg font-bold text-green-800 m-2">Calories / jour</h3>
        <ResponsiveContainer width="100%" height={250} >
          <ComposedChart data={kcalData} margin={{right: 10, top: 10}}>
            <CartesianGrid strokeDasharray="4 4" stroke="#d8f3dc" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#40916c', fontSize: 11 }} />
            <YAxis tick={{ fill: '#40916c', fontSize: 12 }}/>
            <Tooltip />
            <Bar dataKey="kcal" fill="#74c69d" barSize={20} radius={[8, 8, 0, 0]} cursor="pointer"
              onClick={(data) => {
                const day = dashboard.find(d => d.day.slice(5) === data.payload.date);
                onSelectDay(day || null);
              }} />
            <Line type="monotone" dataKey="objectif" stroke="#40916c" strokeDasharray="4 4" dot={false} activeDot={{ r: 5}} />
            <Legend />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div>
            {selectedDay && (
              <div className="p-3 bg-green-300 rounded-xl border border-green-500 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-green-800">Détail du {selectedDay.day}</h4>
                  <button onClick={() => onSelectDay(null)} className="text-green-900 hover:brightness-200 text-sm">X</button>
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

      <div className= "bg-white rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition-shadow">
        <h3 className= " text-lg font-bold text-green-800 m-2">Évolution du poids</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={weightData} margin={{ right: 10, top: 10}}>
            <CartesianGrid strokeDasharray="4 4" stroke="#d8f3dc" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#40916c', fontSize: 11 }} />
            <YAxis domain={['dataMin - 1' , 'dataMax + 1']}  tick={{ fill: '#40916c', fontSize: 12 }}/>
            <Tooltip />
            <Line type="monotone" dataKey="poids" stroke="#40916c" strokeWidth={3} dot={false} activeDot={{ r: 5}} />
            <Legend />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}