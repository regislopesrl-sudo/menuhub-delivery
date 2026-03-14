'use client';

type TextInputProps = {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
};

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: TextInputProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
      />
    </div>
  );
}
