// Public route group layout - bypasses auth
// Note: This still inherits from root layout, but marks routes as public

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
