// dependencies
import React from "react";
import { useTranslation } from "react-i18next";

// components
import TSLogixLogoHigh from "@/assets/TSLogixLogoHigh.webp";
import { Divider, Text } from "@/components";
import { HomePageLink } from "./components";

const HomePage: React.FC = () => {
  const { t } = useTranslation(['home', 'common']);

  const links = [
    {
      title: t("home:entry_order"),
      route: "/processes/entry",
    },
    {
      title: t("home:departure_order"),
      route: "/processes/departure",
    },
    {
      title: t("home:suppliers"),
      route: "/maintenance/supplier",
    },
  ];

  return (
    <div className="home_container">
      <div className="flex flex-col items-center">
        <img src={TSLogixLogoHigh} alt={t("home:logo_alt")} />
        <Text additionalClass="italic text-[28px]" weight="font-bold">
          {t("home:welcome_message")}
        </Text>
      </div>
      <Divider height="md" />
      <div className="flex items-center gap-x-5">
        {links.map((link) => {
          return <HomePageLink key={link.title} item={link} />;
        })}
      </div>
    </div>
  );
};

export default HomePage;
