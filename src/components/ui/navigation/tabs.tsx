interface TabsProps {
  children: React.ReactNode
}

export function Tabs({ children }: TabsProps) {
  return (
    <div className="flex flex-wrap items-end" role="tablist">
      {children}
    </div>
  )
}
