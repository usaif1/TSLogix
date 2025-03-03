import React from "react";
// components
import { Divider, Text } from "@/components";
import AddProductComponent from "./components/AddProductComponent";

const NewProduct: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        Add New Product
      </Text>
      <Divider height="lg" />
      <AddProductComponent />
    </div>
  );
};

export default NewProduct;
