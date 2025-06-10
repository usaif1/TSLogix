import React, { useMemo, useEffect, useCallback } from "react";
import { Plus } from "@phosphor-icons/react";
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
      <div className="w-1/2">
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
      <div className="sm:h-3/5 2xl:h-full rounded-md py-1.5 overflow-scroll max-w-[85%]">
        {loaders["processes/fetch-entry-orders"] ? (
          <>
            <Divider height="md" />
            <LoaderSync loaderText={t("process:fetching_entry_orders")} />
          </>
        ) : (
          <EntryRecordsTable />
        )}
      </div>
    </div>
  );
};

export default Entry;