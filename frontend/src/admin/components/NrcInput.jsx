import NRC_Data from "../../NRC_Data.json";

const inp = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all placeholder-slate-400 bg-slate-50/50 hover:bg-yellow-50/40 hover:border-yellow-300 focus:bg-white";
const sel = inp + " appearance-none pr-10 bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat";

export default function NrcInput({ region, township, citizenType, number, onChange, disabled }) {
  const townshipOptions = NRC_Data.nrcTownships.filter((t) => t.stateCode === region);

  return (
    <div className="grid grid-cols-4 gap-2">
      <select
        className={sel}
        value={region}
        disabled={disabled}
        onChange={(e) => onChange({ nrcRegionCode: e.target.value, nrcTownship: "" })}
      >
        <option value="">Region</option>
        {NRC_Data.nrcStates.map((s) => (
          <option key={s.id} value={s.number.en}>{s.number.en} - {s.name.en}</option>
        ))}
      </select>

      <select
        className={sel}
        value={township}
        disabled={disabled || !region}
        onChange={(e) => onChange({ nrcTownship: e.target.value })}
      >
        <option value="">{region ? "Township" : "Select region first"}</option>
        {townshipOptions.map((t) => (
          <option key={t.id} value={t.short.en}>{t.short.en} - {t.name.en}</option>
        ))}
      </select>

      <select
        className={sel}
        value={citizenType}
        disabled={disabled}
        onChange={(e) => onChange({ nrcCitizenType: e.target.value })}
      >
        {NRC_Data.nrcTypes.map((t) => (
          <option key={t.id} value={t.name.en}>{t.name.en}</option>
        ))}
      </select>

      <input
        className={inp}
        placeholder="6 digits"
        maxLength={6}
        value={number}
        disabled={disabled}
        onChange={(e) => onChange({ nrcNumber: e.target.value.replace(/\D/g, "").slice(0, 6) })}
      />
    </div>
  );
}
