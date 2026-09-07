
export default function DatePick({ from, to, setFrom, setTo }: {
    from: Date,
    to: Date,
    setFrom: (date: Date) => void,
    setTo: (date: Date) => void }) {
      const fromStr = from?.toISOString().split('T')[0];
      const toStr = to?.toISOString().split('T')[0];
      
    return (
        <div className="bg-white rounded-2xl grid-cols-2 shadow-sm p-1 border border-green-50">
            <h3 className="font-semibold text-center text-green-500 md:text-md md:text-left">Sélectionnez une date</h3>
            <div className="grid grid-cols-2 text-center gap-3 m-1">
              <label className="text-xs text-green-600 md:grid md:grid-cols-2">
                <p className="text-xs text-green-400 font-semibold p-0.5 md:text-md md:p-1">Début</p>
                <input
                  type="date"
                  value={fromStr}
                  onChange={(e) => setFrom(new Date(e.target.value))}
                  className="bg-[#ECF8F6] shadow-sm hover:shadow-md rounded-lg px-2 py-1"
                  required
                  max={toStr}
                  min={new Date(new Date().setDate(new Date().getDate() - 180)).toISOString().split('T')[0]}
                  />
              </label>
              <label className="text-xs text-green-600 md:grid md:grid-cols-2">
                <p className="text-xs text-green-400 font-semibold p-0.5 md:text-md">Fin</p>
                <input
                  type="date"
                  value={toStr}
                  onChange={(e) => setTo(new Date(e.target.value))}
                  className="bg-[#ECF8F6] shadow-sm hover:shadow-md rounded-lg px-2 py-1"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  min={fromStr}
                  />
              </label>
            </div>
        </div>
    );
}