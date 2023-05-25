import Button, { ButtonProps } from "./Button";
import React from "react";

export interface ButtonSecondaryProps extends ButtonProps {}

const ButtonSecondary: React.FC<ButtonSecondaryProps> = ({
  className = " ",
  ...args
}) => {
  return (
    <Button
      className={`ttnc-ButtonSecondary border bg-white border-neutral-200 text-neutral-700 dark:bg-[#191818] dark:text-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 ${className}`}
      {...args}
    />
  );
};

export default ButtonSecondary;
