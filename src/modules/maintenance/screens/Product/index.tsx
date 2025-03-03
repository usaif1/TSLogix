// dependencies
import React, { useMemo } from "react";

// components
import { Divider, Text} from "@/components";
import ProductRegisterComponent from "./components/product";
import { Plus, MagnifyingGlass } from "@phosphor-icons/react";
import OrderBtnGroup from "../../../process/components/OrderBtnGroup";

const Product: React.FC = () => {
  const buttonGroup = useMemo(() => {
    return [
      {
        title: "Look For",
        icon: MagnifyingGlass,
        route: "/maintenance/product",
      },
      {
        title: "Add",
        icon: Plus,
        route: "/maintenance/product/new",
      },
    ];
  }, []);

  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        Product Registry
      </Text>
      <Divider />
      <ProductRegisterComponent />
      <Divider />
      <OrderBtnGroup items={buttonGroup} />
    </div>
  );
};

export default Product;
