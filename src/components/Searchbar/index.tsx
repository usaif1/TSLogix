// dependencies
import React from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import TextInput from "../TextInput";

type Props = {
  placeholder: string;
};

const Searchbar: React.FC<Props> = ({ placeholder }) => {
  return (
    <div className="searchbar">
      <MagnifyingGlass size={16} className="text-zinc-900" weight="bold" />
      <TextInput placeholder={placeholder} />
    </div>
  );
};

export default Searchbar;
