import Image from "next/image";
import { ChainCardProps } from "../types";

export const ChainCard = (props: ChainCardProps) => {
  return (
    <div className="flex items-center justify-center w-full space-x-2 overflow-hidden">
      <Image src={(props as any).icon || ""} className="w-8 h-8" alt="" />
      <p className="text-xl font-semibold">{props.prettyName}</p>
    </div>
  );
};
