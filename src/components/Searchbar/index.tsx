// dependencies
import React from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import TextInput from "../TextInput";

type Props = {
  value: string;
  placeholder: string;
};

const Searchbar: React.FC<Props> = ({ placeholder, value }) => {
  return (
    <div className="searchbar">
      <MagnifyingGlass size={16} className="text-zinc-900" weight="bold" />
      <TextInput value={value} placeholder={placeholder} />
    </div>
  );
};

export default Searchbar;
