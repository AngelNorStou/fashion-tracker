export default function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#F7F3EC] px-6 py-16">
      <div className="mx-auto max-w-md">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-[#2B2620]">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-[#8A8172]">
            Log in to access your wardrobe.
          </p>
        </div>

        <div className="rounded-xl border border-[#E3DACB] bg-[#FFFDF9] p-6">

          <form className="space-y-5">

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#5C5344]"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-[#E3DACB] bg-[#FFFDF9] px-3 py-2.5 text-sm text-[#2B2620] outline-none placeholder:text-[#A69C8C] focus:border-[#C1592F]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#5C5344]"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-[#E3DACB] bg-[#FFFDF9] px-3 py-2.5 text-sm text-[#2B2620] outline-none placeholder:text-[#A69C8C] focus:border-[#C1592F]"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#C1592F] py-3 text-sm font-medium text-[#FFF7EE] transition hover:bg-[#9A4A25]"
            >
              Log in
            </button>

          </form>

          <p className="mt-6 text-center text-sm text-[#8A8172]">
            Don't have an account?{" "}
            <a
              href="/register"
              className="font-medium text-[#C1592F] hover:underline"
            >
              Register
            </a>
          </p>

        </div>
      </div>
    </main>
  );
}