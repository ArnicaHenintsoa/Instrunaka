"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-content mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={visible ? "text" : "password"}
            className={`
              w-full px-3 py-2 pr-10 rounded-xl
              bg-white border text-content
              placeholder:text-content-secondary
              transition-colors
              ${error ? "border-danger" : "border-border"}
              focus:border-accent
              ${className}
            `}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-content-secondary hover:text-content transition-colors"
            aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            tabIndex={-1}
          >
            {visible ? "🙈" : "👁️"}
          </button>
        </div>
        {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;