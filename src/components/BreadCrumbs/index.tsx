// dependencies
import React from "react";
import useBreadcrumbs from "use-react-router-breadcrumbs";
import { CaretRight } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { ClientStore } from "@/modules/client/store";

// Custom breadcrumb component for client detail page
const ClientDetailBreadcrumb: React.FC = () => {
  const currentClient = ClientStore.use.currentClient();
  
  const getClientDisplayName = (client: any): string => {
    if (!client) return "Client";
    
    if (client.client_type === "JURIDICO") {
      return client.company_name || "Unknown Company";
    } else {
      return `${client.first_names || ""} ${client.last_name || ""}`.trim() || "Unknown Individual";
    }
  };

  return <span>{getClientDisplayName(currentClient)}</span>;
};

// Custom routes configuration for breadcrumbs
const routes = [
  {
    path: "/maintenance/client/:clientId",
    breadcrumb: ClientDetailBreadcrumb,
  },
  // Add more custom breadcrumbs here for other entities if needed
  // Example:
  // {
  //   path: "/maintenance/supplier/:supplierId", 
  //   breadcrumb: SupplierDetailBreadcrumb
  // },
  // {
  //   path: "/maintenance/product/:productId",
  //   breadcrumb: ProductDetailBreadcrumb
  // },
];

const Breadcrumbs: React.FC = () => {
  const breadcrumbs = useBreadcrumbs(routes);
  const { t } = useTranslation(['common', 'process']);

  // Function to translate breadcrumb text
  const translateBreadcrumb = (breadcrumb: React.ReactNode): string => {
    // Extract text from breadcrumb (might be React element or string)
    let text = '';
    if (typeof breadcrumb === 'string') {
      text = breadcrumb;
    } else if (React.isValidElement(breadcrumb)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const element = breadcrumb as any;
      if (element.props?.children && typeof element.props.children === 'string') {
        text = element.props.children;
      }
    } else if (breadcrumb) {
      text = breadcrumb.toString();
    }
    
    const normalizedText = text.toLowerCase().trim();
    
    // Map common route names to translation keys
    const translationMap: { [key: string]: string } = {
      'home': t('common:home'),
      'dashboard': t('common:dashboard'),
      'processes': t('common:processes'),
      'inventory': t('common:inventory'),
      'maintenance': t('common:maintenance'),
      'warehouse': t('common:warehouse'),
      'admin': t('common:admin'),
      'reports': t('common:reports'),
      'entry': t('common:entry_order'),
      'departure': t('common:departure_order'),
      'products': t('common:product'),
      'product': t('common:product'),
      'settings': t('common:settings'),
      'profile': t('common:profile'),
      'allocate': t('common:allocate'),
      'supplier': t('common:supplier'),
      'suppliers': t('common:supplier'),
      'client': t('common:client'),
      'clients': t('common:client'),
      'new': t('common:new'),
      'warehouse-dispatch': t('process:warehouse_dispatch_center'),
      'warehouse dispatch': t('process:warehouse_dispatch_center'),
    };

    return translationMap[normalizedText] || text;
  };

  return (
    <div className="w-full flex items-center gap-x-2">
      {breadcrumbs.map(({ breadcrumb, key }, index) => (
        <div key={key} className="flex items-center gap-x-2">
          {index > 0 ? (
            <CaretRight
              className="text-breadcrumb-inactive"
              size={16}
              weight="bold"
            />
          ) : null}

          <span className="text-breadcrumb">
            {translateBreadcrumb(breadcrumb)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Breadcrumbs;
