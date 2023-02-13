import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { db } from "~/utils/db.server";
import { redirect } from "@remix-run/node";
import { Box, Button, TextField, Typography } from "@mui/material";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { getUserData } from "~/utils/auth.server";
export let loader: LoaderFunction = async ({ request }) => {
  const user = await getUserData(request);
  if (!user) {
    return redirect("/login");
  }
  const savedBoards = await db.savedBoards.findMany({});
  return savedBoards;
};

export let action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const fields = Object.fromEntries(form.entries());

  const data = await db.savedBoards.findMany({
    where: {
      OR: [
        {
          name: {
            contains: fields?.search as string,
          },
        },
        {
          id: {
            contains: fields?.search as string,
          },
        },
      ],
    },
  });
  return data;
};

export default function Saved() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  return (
    <Box>
      <Box
        sx={{
          paddingTop: 4,
          height: "10vh",
          width: 300,
          margin: "20px auto",
        }}
      >
        <Typography sx={{ marginBottom: "5px" }}>
          Search boards from saved
        </Typography>
        <Form method="post">
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 2,
            }}
          >
            <TextField
              label="search board"
              placeholder="search"
              name="search"
              type="text"
              variant="outlined"
              required
            />
            <Button
              sx={{
                height: "40px",
                m: "8px 0",
                width: "100px",
              }}
              type="submit"
              color="primary"
              variant="contained"
            >
              Search
            </Button>
          </Box>
        </Form>
      </Box>
      <Box>
        {actionData === undefined
          ? loaderData.map((data: any) => (
              <li key={data.id}>{(data.id, data.name)} </li>
            ))
          : actionData.map((data: any) => (
              <li key={data.id}>{(data.id, data.name)} </li>
            ))}
      </Box>
    </Box>
  );
}
