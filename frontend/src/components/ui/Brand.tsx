import logo from '../../assets/logo.svg';

interface Props {
  size?: 'md' | 'lg';
}

/** The logo with the app name, in two sizes. */
export function Brand({ size = 'md' }: Props) {
  const large = size === 'lg';

  return (
    <span className={`flex items-center ${large ? 'gap-3' : 'gap-2'}`}>
      <img src={logo} alt="" className={`w-auto ${large ? 'h-12' : 'h-8'}`} />
      <span
        className={`font-bold tracking-tight text-green-700 ${large ? 'text-3xl' : 'text-lg'}`}
      >
        CatCHMeal
      </span>
    </span>
  );
}
