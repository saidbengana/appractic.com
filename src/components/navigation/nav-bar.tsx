import { useAppContext } from '@/hooks/use-app-context'
import { MenuIcon } from '@/components/icons'

export function NavBar() {
  const { showAside, setShowAside } = useAppContext()

  const toggleAside = () => {
    setShowAside(!showAside)
  }

  return (
    <nav className="flex items-center justify-between xl:hidden row-px bg-white border-b border-gray-200 shadow-mix h-12 p-2">
      <button onClick={toggleAside} className="outline-none">
        <MenuIcon className="w-6 h-6" />
      </button>
      <div id="navRightButton" className="flex items-center" />
    </nav>
  )
}
