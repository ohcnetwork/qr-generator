import { ChangeEvent } from "react"

type InputProps = {
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  label: string
  placeholder?: string
}

export default function Input({
  value,
  onChange,
  label,
  placeholder,
}: InputProps) {
  return (
    <div className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600">
      <label
        htmlFor={label}
        className="block text-xs font-medium text-gray-900"
      >
        {label}
      </label>
      <input
        type="text"
        name={label.toLowerCase()}
        id={label.toLowerCase()}
        className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  )
}
