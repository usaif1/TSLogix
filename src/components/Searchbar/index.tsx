import React, { useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import TextInput from "../TextInput";

type Props = {
  placeholder: string;
  onSearch: (searchValue: string) => void;
};

const Searchbar: React.FC<Props> = ({ placeholder, onSearch }) => {
  const [searchValue, setSearchValue] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  return (
    <form className="searchbar" onSubmit={handleSubmit}>
      <MagnifyingGlass size={16} className="text-zinc-900" weight="bold" />
      <TextInput 
        placeholder={placeholder} 
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
    </form>
  );
};

export default Searchbar;
