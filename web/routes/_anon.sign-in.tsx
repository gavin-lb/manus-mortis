import { Button, Card, EmptyState, Page, Text } from '@shopify/polaris';
import { useLoaderData, useNavigate, useOutletContext } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { api } from "@/api";
import { useAction } from '@gadgetinc/react';
import { useEffect } from 'react';
import { RootOutletContext } from '@/root';
import darkLogoUrl from "@/images/full-logo-dark.png";
import lightLogoUrl from "@/images/full-logo-light.png";
import discordIconUrl from "@/images/discord-icon.svg";

const ERROR_MESSAGES = {
  'GGT_RECORD_NOT_FOUND': 'You do not have access to the Manus Mortis Web Portal',
  'ERR_BAD_REQUEST': 'Invalid login code - please try connecting with Discord again'
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const code = (new URL(request.url)).searchParams.get("code");

  return { code };
};

export default function () {
  const { theme } = useOutletContext<RootOutletContext>();
  const navigate = useNavigate();
  const { gadgetConfig } = useOutletContext<RootOutletContext>();
  const { code } = useLoaderData<typeof loader>();
  const [{ data, error, fetching }, signIn] = useAction(api.session.signIn);

  let errorMessage
  if (error) {
    const errorCode = (error.executionErrors[0] as any).code
    errorMessage = ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES] ?? error.message;
  }

  useEffect(() => {   
    if (!!code && !fetching && !data && !error) {
      signIn({ code });
    }

    if (data?.userId) {
      navigate(gadgetConfig!.authentication!.redirectOnSuccessfulSignInPath!)
    }
  }, [data]);

  return (
    <Page>
      <div className="h-200 flex justify-center items-center">
        <Card padding="2000">
          <EmptyState
            image={theme == "light" ? lightLogoUrl : darkLogoUrl}
            imageContained
          >
            <div className="p-5 pt-10">
              <Text as="p" tone={error ? "critical" : "base"}> 
                {error ? errorMessage ?? error.message : code ? "Logging in..." : "Login to access the Manus Mortis Web Portal" }
              </Text>
            </div>
            <Button 
              loading={!!code && !error}
              url="/auth" 
              size="large" 
              variant="primary" 
              icon={<img src={discordIconUrl} width="20px" className="m-1 mx-3" />}
            > 
              Connect with Discord 
            </Button>
          </EmptyState>
        </Card>
      </div>
    </Page>
  );
}
