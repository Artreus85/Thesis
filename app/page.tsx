export const dynamic = "force-dynamic"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to CarMarket</h1>
        <p className="text-lg mb-6">Your trusted marketplace for buying and selling cars</p>
        <p className="text-sm text-muted-foreground">
          We're currently experiencing some technical difficulties. Please check back soon.
        </p>
      </div>
    </div>
  )
}
