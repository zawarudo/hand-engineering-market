import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { parseISO } from "date-fns";
import format from "date-fns/format";
import Button from "~/components/Button";
import Grid from "~/components/Grid";
import RaffleItem, {
  RaffleDate,
  RaffleItemImage,
  RaffleStatus,
  RaffleTitle,
} from "~/components/RaffleItem";
import type { FullProduct } from "~/models/ecommerce-provider.server";
import type { Raffle } from "~/models/raffle.server";
import { getRaffles } from "~/models/raffle.server";
import type { RaffleEntry } from "~/models/raffleEntry.server";
import { getRaffleEntriesByUserId } from "~/models/raffleEntry.server";
import { authenticator } from "~/services/auth.server";
import commerce from "~/services/commerce.server";
import { getRaffleActivityStatus } from "~/utils/raffle";

type RaffleWithMatchingProducts = Raffle & { products: FullProduct[] };

type LoaderData = {
  rafflesWithMatchingProducts?: RaffleWithMatchingProducts[];
  raffleEntries?: RaffleEntry[];
  currentDateTime: string;
};

export let loader: LoaderFunction = async ({ request }) => {
  const raffles: Raffle[] = await getRaffles();

  let user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const rafflesWithMatchingProducts = await Promise.all(
    raffles.map(async (raffle) => {
      const matchingProducts = await Promise.all(
        raffle.productSlugs.map(async (productSlug) => {
          const product = await commerce.getProduct("en", productSlug);
          return product;
        })
      );

      return {
        ...raffle,
        products: matchingProducts,
      };
    })
  );

  let raffleEntries = await getRaffleEntriesByUserId(user.id);

  let currentDateTime = new Date().toISOString();

  return { raffleEntries, rafflesWithMatchingProducts, currentDateTime };
};

export default function Raffles() {
  const { raffleEntries, rafflesWithMatchingProducts, currentDateTime } =
    useLoaderData() as LoaderData;
  return (
    <>
      <h2>All Raffles</h2>
      <Grid layout={{ "@initial": "mobile", "@bp2": "desktop" }}>
        {rafflesWithMatchingProducts &&
          rafflesWithMatchingProducts.map((raffle) => {
            const raffleEntryExists = raffleEntries?.some(
              (raffleEntry) => raffleEntry.raffleId === raffle.id
            );

            const formattedStartDateTime = format(
              parseISO(raffle.startDateTime.toString()),
              "do MMMM yyyy"
            );

            const formattedEndDateTime = format(
              parseISO(raffle.endDateTime.toString()),
              "do MMMM yyyy"
            );

            return (
              <RaffleItem key={raffle.id}>
                <RaffleItemImage
                  src={raffle.products[0].image}
                  alt={raffle.name}
                />
                <RaffleTitle>{raffle.name}</RaffleTitle>

                <RaffleStatus
                  status={getRaffleActivityStatus(
                    raffle.startDateTime.toString(),
                    raffle.endDateTime.toString(),
                    currentDateTime
                  )}
                >
                  {getRaffleActivityStatus(
                    raffle.startDateTime.toString(),
                    raffle.endDateTime.toString(),
                    currentDateTime
                  )}
                </RaffleStatus>
                <RaffleDate>
                  {formattedStartDateTime}–{formattedEndDateTime}
                </RaffleDate>
                <br />
                <p>From {raffle.products[0].formattedPrice}</p>
                <Link to={raffle.id}>
                  <Button color="primary">View Details</Button>
                </Link>
                <RaffleDate>
                  {raffleEntryExists && `Raffle Entry Submitted`}
                </RaffleDate>
              </RaffleItem>
            );
          })}
      </Grid>
    </>
  );
}
