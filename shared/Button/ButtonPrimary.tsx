import Button, { ButtonProps } from "./Button";
import React from "react";

export interface ButtonPrimaryProps extends ButtonProps {}

const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
  className = "",
  ...args
}) => {
  return (
    <Button
      className={` disabled:bg-opacity-70 text-primary-shadow tracking-wide rounded-lg bg-primary-1000 hover:bg-primary-1010 text-gray-900 ${className}`}
      {...args}
    />
  );
};

export default ButtonPrimary;
