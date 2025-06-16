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
  const { productLineOptions, groupOptions, products } = MaintenanceStore();

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

  const [selectedProductLine, setSelectedProductLine] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        const filters: {
          product_line_id?: string;
          group_id?: string;
          name?: string;
        } = {};
        if (selectedProductLine)
          filters.product_line_id = selectedProductLine.value;
        if (selectedGroup) filters.group_id = selectedGroup.value;
        if (searchText) filters.name = searchText;
        await ProductService.fetchAllProducts(filters);
      } catch (error) {
        console.error("Error fetching filtered products:", error);
      }
    };

    fetchFilteredProducts();
  }, [selectedProductLine, selectedGroup, searchText]);

  useEffect(() => {
    ProductService.fetchProductFormFields();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        {t('product_page')}
      </Text>
      <Divider />
      <ProductRegisterComponent
        productLineOptions={productLineOptions}
        groupOptions={groupOptions}
        products={products}
        selectedProductLine={selectedProductLine}
        setSelectedProductLine={setSelectedProductLine}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        searchText={searchText}
        setSearchText={setSearchText}
      />
      <Divider />
      {/* <OrderBtnGroup items={buttonGroup} /> */}
    </div>
  );
};

export default Product;
