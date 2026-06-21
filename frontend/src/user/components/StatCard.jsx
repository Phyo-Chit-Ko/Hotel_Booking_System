export default function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500">
            {title}
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {value}
          </h2>
        </div>

        <div className="text-4xl text-amber-500">
          {icon}
        </div>
      </div>
    </div>
  );
}