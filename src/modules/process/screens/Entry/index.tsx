import React, { useMemo, useEffect, useCallback } from "react";
import { Plus, FileArrowUp } from "@phosphor-icons/react";
import debounce from "lodash.debounce";
import { useTranslation } from "react-i18next";

// components
import { OrderBtnGroup } from "../../components";
import { Divider, Text, Searchbar, LoaderSync } from "@/components";
import { EntryRecordsTable } from "./components";

// services
import { ProcessService } from "@/globalService";

// store
import { ProcessesStore } from "@/globalStore";

const Entry: React.FC = () => {
  const { t } = useTranslation(["process", "common"]);
  const { loaders } = ProcessesStore();

  const buttonGroup = useMemo(
    () => [
      {
        title: t("process:generate_order"),
        icon: Plus,
        route: "/processes/entry/new",
      },
      {
        title: "Bulk Upload",
        icon: FileArrowUp,
        route: "/processes/entry/bulk",
      },
    ],
    [t]
  );

  // Debounced search function
  const handleSearch = useCallback(
    debounce((searchValue: string) => {
      ProcessService.fetchEntryOrders({ orderNo: searchValue });
    }, 800),
    []
  );

  useEffect(() => {
    ProcessService.fetchEntryOrders();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <Text size="3xl" weight="font-bold">
        {t("process:entry_orders")}
      </Text>
      <Divider />
      <div className="w-full max-w-md">
        <Searchbar
          searchButton={true}
          iconHidden={true}
          placeholder={t("process:enter_order_number")}
          onSearch={handleSearch}
        />
      </div>
      <Divider />
      <OrderBtnGroup items={buttonGroup} />
      <Divider />
      <div className="flex-1 w-full min-h-0 overflow-hidden">
        {loaders["processes/fetch-entry-orders"] ? (
          <div className="flex justify-center items-center h-full">
            <LoaderSync loaderText={t("process:fetching_entry_orders")} />
          </div>
        ) : (
          <EntryRecordsTable />
        )}
      </div>
    </div>
  );
};

export default Entry;