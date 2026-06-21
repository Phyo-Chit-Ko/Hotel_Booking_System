export default function Navbar() {
  return (
    <div className="h-20 bg-white shadow-sm flex items-center justify-between px-8">
      <div>
        <h2 className="text-2xl font-bold">
          Dashboard
        </h2>

        <p className="text-gray-500">
          Hotel Overview
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
          A
        </div>

        <div>
          <p className="font-semibold">
            System Admin
          </p>

          <p className="text-sm text-gray-500">
            Administrator
          </p>
        </div>
      </div>
    </div>
  );
}