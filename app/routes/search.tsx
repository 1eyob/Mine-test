import { Box, Button, TextField, Typography } from "@mui/material";
import { redirect } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useState } from "react";
import { db } from "~/utils/db.server";
import { getUserData } from "~/utils/auth.server";
import type { GridColDef } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import { useSubmit } from "@remix-run/react";
import { Paper } from "@mui/material";
export let loader: LoaderFunction = async ({ request }) => {
  const user = await getUserData(request);
  if (!user) {
    return redirect("/login");
  }
  let query = "{ boards(){id name}}";

  const data = await fetch("https://api.monday.com/v2", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjIzNTc0MjUzNywidWlkIjozOTQxODU3NywiaWFkIjoiMjAyMy0wMi0wOVQxMjozODoxMi4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTUxNzgwODEsInJnbiI6ImV1YzEifQ.1YdV1YhxpncW_3e7woD5bOEWpE9XQKyVJCCEUJ4wURc",
    },
    body: JSON.stringify({
      query: query,
    }),
  });
  let item: any;
  let boards: any = await data.json();

  for (item of Object.keys(boards.data.boards)) {
    await db.boards.upsert({
      where: { id: boards.data.boards[item].id },
      update: {
        name: boards.data.boards[item].name,
      },
      create: {
        id: boards.data.boards[item].id,
        name: boards.data.boards[item].name,
      },
    });
  }

  return boards;
};

export let action: ActionFunction = async ({ request, params }) => {
  const url = new URL(request.url);
  const name = url.searchParams.getAll("name");
  const id = url.searchParams.getAll("id");
  const form = await request.formData();
  const fields = Object.fromEntries(form.entries());
  let save: any;
  if (request.method == "patch") {
    console.log(id, name);
    if (id.length > 0 && name.length > 0) {
      save = await db.savedBoards.upsert({
        where: {
          id: id[0],
        },
        create: {
          id: id[0],
          name: name[0],
        },
        update: {
          name: name[0],
        },
      });
    }
  }

  const bName = fields?.boardName as string;

  const data = await db.boards.findMany({
    where: {
      name: {
        contains: bName,
      },
    },
  });
  return { data: data, saved: save };
};

export default function Search() {
  const [saved, setSaved] = useState(false);
  const actionData = useActionData();
  const submit = useSubmit();
  if (actionData?.saved) {
    setSaved(true);
  }
  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "id",
      flex: 1,
    },
    {
      field: "name",
      headerName: "name",
      flex: 1,
    },
    {
      field: "createdAt",
      headerName: "created At",
      flex: 1,
    },
    {
      field: "updatedAt",
      headerName: "updated At",
      flex: 1,
    },
    {
      field: "deleteButton",
      headerName: "Actions",
      description: "Actions column.",
      sortable: false,
      flex: 1.5,
      width: 160,
      renderCell: (params) => {
        return (
          <Box>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              onClick={(e) => handleSave(e, params.row)}
              disabled={saved}
            >
              Save
            </Button>
          </Box>
        );
      },
    },
  ];

  const handleSave = (e: any, row: { id: string; name: string }) => {
    console.log(row.name);
    submit({ id: row?.id, name: row?.name }, { method: "patch" });
  };

  const dataGridSx = {
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 4,
    borderRadius: 2,
    height: 400,
    width: "80%",
  };
  const dataGrid = {
    boxShadow: 5,
    border: 2,
    borderColor: "primary.light",
    "& .MuiDataGrid-cell:hover": {
      color: "primary.main",
    },
  };

  return (
    <Box>
      <Box
        sx={{
          paddingTop: 4,
          height: "10vh",
          width: 500,
          display: "flex",
          flexDirection: "column",
          margin: "20px auto",
        }}
      >
        <Typography sx={{ marginTop: "1px", paddingTop: "1px" }}>
          Search boards from Monday.com
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
              label="Board name"
              placeholder="name"
              name="boardName"
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
      <Paper sx={dataGridSx}>
        <DataGrid
          sx={dataGrid}
          rows={actionData?.data || []}
          columns={columns}
        />
      </Paper>
    </Box>
  );
}
