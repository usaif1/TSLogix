import React, { useEffect } from "react";
// components
import { Divider, Text } from "@/components";
import AddProductComponent from "./components/AddProductComponent";
import { ProductService } from "../../api/maintenance.service";

const NewProduct: React.FC = () => {
  useEffect(() => {
    ProductService.fetchProductFormFields();
  }, []);
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
