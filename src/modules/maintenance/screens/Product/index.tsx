/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Divider, Text } from "@/components";
import ProductRegisterComponent from "./components/product";
// import OrderBtnGroup from "../../../process/components/OrderBtnGroup";
import { ProductService } from "../../api/maintenance.service";
import { MaintenanceStore } from "@/globalStore";

const Product: React.FC = () => {
  const { t } = useTranslation(['maintenance', 'common']);
  const { products } = MaintenanceStore();

  // const buttonGroup = useMemo(
  //   () => [
  //     {
  //       title: "Add",
  //       icon: Plus,
  //       route: "/maintenance/product/new",
  //     },
  //   ],
  //   []
  // );

  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        const filters: {
          name?: string;
        } = {};
        if (searchText) filters.name = searchText;
        await ProductService.fetchAllProducts(filters);
      } catch (error) {
        console.error("Error fetching filtered products:", error);
      }
    };

    fetchFilteredProducts();
  }, [searchText]);

  useEffect(() => {
    ProductService.fetchProductFormFields();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        {t('product')}
      </Text>
      <Divider />
      <ProductRegisterComponent
        products={products}
        searchText={searchText}
        setSearchText={setSearchText}
      />
      <Divider />
      {/* <OrderBtnGroup items={buttonGroup} /> */}
    </div>
  );
};

export default Product;
