import BottomNav from './BottomNav'

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pb-20">
        {children}
      </div>
      <BottomNav />
    </div>
  )
}