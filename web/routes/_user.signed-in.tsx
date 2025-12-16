import { useOutletContext } from "@remix-run/react";
import type { AuthOutletContext } from "./_user";
import { Card, Divider, EmptyState, Page, Text } from "@shopify/polaris";
import darkLogoUrl from "@/images/mm-logo-dark.png";
import lightLogoUrl from "@/images/mm-logo-light.png";
import { ExitIcon } from '@shopify/polaris-icons';

export default function () {
  const { user, theme } = useOutletContext<AuthOutletContext>();

  return user ? (
    <Page 
      title="Home"
      subtitle="Web Portal landing page"
    >
      <Card padding="500">
        <EmptyState
          image={theme == "light" ? lightLogoUrl : darkLogoUrl}
          action={{ content: "Sign out", url: "/sign-out", icon: ExitIcon }}
          heading={`Welcome to the Web Portal, ${user.globalName}`}
        >
          <Divider />
          <Text variant="bodyMd" as="p">
            From here you can manage the Manus Mortis Discord Bot, configure its settings, and monitor its activity.
          </Text>
        </EmptyState>
      </Card>
    </Page>
  ) : null;
}
