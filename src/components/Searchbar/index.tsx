import React, { useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import TextInput from "../TextInput";
import { Button } from "@/components";

type Props = {
  placeholder: string;
  onSearch?: (searchValue: string) => void;
  iconHidden?: boolean;
  searchButton?: boolean;
};

const Searchbar: React.FC<Props> = ({
  placeholder,
  onSearch,
  iconHidden,
  searchButton,
}) => {
  const [searchValue, setSearchValue] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchValue);
    }
  };

  return (
    <form className="searchbar" onSubmit={handleSubmit}>
      {!iconHidden && (
        <MagnifyingGlass size={16} className="text-zinc-900" weight="bold" />
      )}
      <TextInput
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
      {searchButton && (
        <Button type="submit" additionalClass="w-12 h-8 mr-1" variant="action">
          <MagnifyingGlass size={16} className="text-center" weight="bold" />
        </Button>
      )}
    </form>
  );
};

export default Searchbar;
