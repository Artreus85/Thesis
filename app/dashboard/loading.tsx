export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col justify-center items-center h-[70vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
      <p className="text-muted-foreground">Зарежда се...</p>
    </div>
  )
}
