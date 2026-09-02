export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 text-gray-900">


      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-600">
            Your Personal Wardrobe
          </p>

          <h2 className="text-5xl font-bold leading-tight text-gray-950">
            Build outfits from the clothes you own.
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Keep track of your wardrobe, organize your clothing,
            and create outfits from your collection.
          </p>

          <div className="mt-10 flex gap-4">
            <a
              href="/wardrobe"
              className="rounded-lg bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
            >
              View Wardrobe
            </a>

            <a
              href="/outfits"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-900 transition hover:bg-gray-100"
            >
              View Outfits
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}