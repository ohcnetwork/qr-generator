export default function Range({ value, label, onChange, min = 1, max = 100 }) {
  return (
    <div>
      <label
        htmlFor="default-range"
        className="flex mb-2 text-sm font-medium justify-between text-gray-900 mt-4"
      >
        <span>{label}</span>
        <input
          type="number"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          className="w-20 text-center border-0 h-6"
        />
      </label>
      <input
        id="default-range"
        type="range"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        min={min}
        max={max}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
}
