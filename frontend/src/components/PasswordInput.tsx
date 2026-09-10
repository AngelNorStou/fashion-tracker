"use client";

import { useState } from "react";

export default function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  required = false,
  minLength,
  autoComplete,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#E3DACB] bg-[#FFFDF9] px-3 py-2.5 pr-10 text-sm text-[#2B2620] outline-none placeholder:text-[#A69C8C] focus:border-[#C1592F]"
      />

      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8172] hover:text-[#5C5344]"
        tabIndex={-1}
        title={visible ? "Hide password" : "Show password"}
      >
        <i
          className={`fi ${visible ? "fi-rr-eye-crossed" : "fi-rr-eye"}`}
          aria-hidden="true"
        ></i>
      </button>
    </div>
  );
}