export type Tab = 'home' | 'scan' | 'stats' | 'friends' | 'profile';

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

interface NavButtonProps {
  tab: { id: Tab; label: string; icon: React.ReactNode };
  isActive: boolean;
  variant: 'sidebar' | 'bottom';
  onClick: () => void;
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'home',
    label: 'Accueil',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m-4 0h4" />
      </svg>
    ),
  },
  {
    id: 'scan',
    label: 'Scanner',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2M8 12h8" />
      </svg>
    ),
  },
  {
    id: 'stats',
    label: 'Statistiques',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'friends',
    label: 'Amis',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4.13a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profil',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

function NavButton({ tab, isActive, variant, onClick }: NavButtonProps) {
  const baseClass = 'cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-green-400 focus-visible:outline-offset-2';

  if (variant === 'sidebar') {
    return (
      <button
        onClick={onClick}
        aria-current={isActive ? 'page' : undefined}
        className={`${baseClass} flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left ${
          isActive ? 'bg-green-100 text-green-300' : 'text-green-500 hover:text-green-800 hover:bg-green-100'
        }`}
      >
        <span aria-hidden="true">{tab.icon}</span>
        {tab.label}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      aria-label={tab.label}
      className={`${baseClass} w-full flex flex-col items-center gap-1 py-3 text-xs font-medium ${
        isActive ? 'text-green-300' : 'text-green-500 hover:text-green-600'
      }`}
    >
      <span aria-hidden="true">{tab.icon}</span>
      {tab.label === 'Statistiques' ? 'Stats' : tab.label}
    </button>
  );
}

export default function Nav({ active, onChange }: Props) {
  return (
    <>
      {/* Sidebar — desktop */}
      <aside aria-label="Navigation principale" className="hidden md:flex flex-col fixed top-0 left-0 h-full w-56 bg-white border-r border-green-200 py-6 z-10">
        <span className="text-lg font-bold text-green-300 tracking-tight px-6 mb-8">KcalApp</span>
        <nav>
          <ul className="flex flex-col gap-1 px-3">
            {TABS.map((tab) => (
              <li key={tab.id}>
                <NavButton tab={tab} isActive={tab.id === active} variant="sidebar" onClick={() => onChange(tab.id)} />
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Bottom bar — mobile */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-green-200 z-10">
        <nav aria-label="Navigation principale">
          <ul className="flex">
            {TABS.map((tab) => (
              <li key={tab.id} className="flex-1">
                <NavButton tab={tab} isActive={tab.id === active} variant="bottom" onClick={() => onChange(tab.id)} />
              </li>
            ))}
          </ul>
        </nav>
      </footer>
    </>
  );
}
