import logo from '../../assets/logo.svg';

export function Brand() {
  return (
    <span className="flex items-center gap-2">
      <img src={logo} alt="" className="h-8 w-auto" />
      <span className="text-lg font-bold tracking-tight text-green-700">
        CatCHMeal
      </span>
    </span>
  );
}
