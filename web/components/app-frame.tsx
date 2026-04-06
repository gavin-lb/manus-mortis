import DarkModeToggle from "@/components/dark-mode-toggle";
import darkLogoUrl from "@/images/small-logo-dark.png";
import lightLogoUrl from "@/images/small-logo-light.png";
import { AuthOutletContext } from "@/routes/_user";
import { Link, useMatches, useNavigation } from "@remix-run/react";
import { FooterHelp, Frame, Loading, Navigation, Text, TopBar } from "@shopify/polaris";
import {
  CashDollarFilledIcon,
  ContractIcon,
  EmailIcon,
  ExitIcon,
  HomeIcon,
  MoneyIcon,
  PersonIcon,
} from "@shopify/polaris-icons";
import { ThemeName } from "@shopify/polaris-tokens";
import { useCallback, useState } from "react";

type Props = {
  children: React.ReactNode;
  user?: AuthOutletContext["user"];
  theme: ThemeName;
};

const AppFrame = ({ children, user, theme }: Props) => {
  const [userMenuActive, setUserMenuActive] = useState(false);
  const [mobileNavigationActive, setMobileNavigationActive] = useState(false);
  const navigation = useNavigation();
  const matches = useMatches();
  const { pathname } = matches[matches.length - 1];
  const signedIn = !!user;

  const toggleUserMenuActive = useCallback(
    () => setUserMenuActive((userMenuActive) => !userMenuActive),
    [],
  );
  const toggleMobileNavigationActive = useCallback(
    () => setMobileNavigationActive((mobileNavigationActive) => !mobileNavigationActive),
    [],
  );

  const userMenuActions = [
    {
      items: [{ content: "Sign out", icon: ExitIcon, url: "/sign-out" }],
    },
  ];

  const userMenuMarkup = (
    <TopBar.UserMenu
      actions={userMenuActions}
      name={user?.globalName ?? ""}
      initials={user?.globalName?.charAt(0) ?? ""}
      detail={`(${user?.username})`}
      avatar={user?.avatar ?? undefined}
      open={userMenuActive}
      onToggle={toggleUserMenuActive}
    />
  );

  const logoMarkup = {
    width: 40,
    topBarSource: theme == "light" ? lightLogoUrl : darkLogoUrl,
    accessibilityLabel: "Manus Mortis",
    url: "/",
  };

  const logoSuffixMarkup = (
    <Link to="/">
      <Text as="span" variant="headingXl" fontWeight="medium" truncate>
        Manus Mortis Web Portal
      </Text>
    </Link>
  );

  const topBarMarkup = (
    <TopBar
      secondaryMenu={<DarkModeToggle />}
      logoSuffix={logoSuffixMarkup}
      {...(signedIn
        ? {
            showNavigationToggle: true,
            userMenu: userMenuMarkup,
            onNavigationToggle: toggleMobileNavigationActive,
          }
        : {})}
    />
  );

  const nav = [
    { label: "Home", url: "/signed-in", icon: HomeIcon },
    { label: "Manage Users", url: "/manage-users", icon: PersonIcon },
    { label: "Welcome Messages", url: "/welcome-messages", icon: EmailIcon },
    {
      label: "Tickets & Applications",
      url: "/tickets-applications",
      icon: ContractIcon,
    },
    { label: "Points", url: "/points", icon: MoneyIcon },
    {
      label: "Reaction Bounties",
      url: "/reaction-bounties",
      icon: CashDollarFilledIcon,
    },
  ];

  const navigationMarkup = (
    <Navigation location={pathname}>
      <Navigation.Section items={nav} />
    </Navigation>
  );

  const footerMarkup = (
    <FooterHelp>
      <Text as="span" variant="bodySm" tone="subdued" alignment="center">
        Made with 💜 by [MM] atom
      </Text>
    </FooterHelp>
  );

  return (
    <Frame
      logo={logoMarkup}
      topBar={topBarMarkup}
      globalRibbon={footerMarkup}
      {...(signedIn
        ? {
            navigation: navigationMarkup,
            showMobileNavigation: mobileNavigationActive,
            onNavigationDismiss: toggleMobileNavigationActive,
          }
        : {})}
    >
      {navigation.state !== "idle" ? <Loading /> : null}
      {children}
    </Frame>
  );
};

export default AppFrame;
