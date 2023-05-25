import React, { FC } from "react";

export interface RadioProps {
  className?: string;
  name: string;
  id: string;
  onChange?: (value: string) => void;
  defaultChecked?: boolean;
  disabled?: boolean;
  value?: any;

  label: string | number;
}

const Radio: FC<RadioProps> = ({
  className,
  name,
  id,
  onChange,
  label,
  defaultChecked,
  disabled = false,
  value = "none",
}) => {
  return (
    <div className={`flex items-center text-sm sm:text-base ${className}`}>
      <input
        id={id}
        name={name}
        type="radio"
        className="focus:ring-action-primary h-6 w-6 cursor-pointer text-primary-500 border-primary rounded-full border-neutral-500 bg-white dark:bg-neutral-700  dark:checked:bg-green-500 focus:ring-green-500"
        onChange={(e) => onChange && onChange(e.target.value)}
        defaultChecked={defaultChecked}
        value={value}
        disabled={disabled}
      />
      <label
        htmlFor={id}
        className="ml-2.5 sm:ml-3 block text-neutral-900 dark:text-neutral-100"
      >
        {label}
      </label>
    </div>
  );
};

export default Radio;
