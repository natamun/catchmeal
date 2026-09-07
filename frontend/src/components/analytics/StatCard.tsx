 
 export default function StatCard({title, value, unit, img}: {title: string, value: number | string, unit: string, img?: string}) {
  return (
    <div className="bg-white rounded-2xl flex p-2 border border-green-100 shadow-sm hover:shadow-md">
      <object className="bg-green-100 rounded-2xl p-3 m-2 flex items-center justify-center">
        {img && <img className="w-5 h-5" src={img} alt="" /> }
      </object>
      <div className="flex flex-col justify-center">
        <p className="text-xs font-semibold ml-2 text-green-500 uppercase">{title}</p>
        <p className="text-3xl font-bold ml-2 text-green-600 mt-1">
          {value}
          <span className="text-lg font-mono text-green-300 ml-1">{unit}</span>
        </p>
      </div>
    </div>
  );
}