import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { Paper } from "@mui/material";
import { login, createUserSession } from "~/utils/auth.server";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import type { ActionFunction } from "@remix-run/node";
import { LoaderFunction, redirect } from "@remix-run/node";
import { json } from "@remix-run/node";

import { Form, useActionData } from "@remix-run/react";
import { z } from "zod";

const LoginFields = z.object({
  phone: z.string().min(1, "required"),
  password: z.string().min(1, "required"),
});
type ActionData = {
  fields: any;
  errors?: any;
};
const badRequest = (data: ActionData) => json(data, { status: 400 });
export let action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const fields = Object.fromEntries(form.entries());
  const result = LoginFields.safeParse(fields);
  if (!result.success) {
    return badRequest({
      fields,
      errors: result.error.flatten(),
    });
  }
  const data = await login(fields);
  if (data.status == 404) {
    return json(data);
  }
  return createUserSession(data, "/otp");
};

export default function SignIn() {
  let data = useActionData();
  const paperStyle = {
    padding: 20,
    height: "70vh",
    width: 280,
    margin: "20px auto",
  };
  const avatarStyle = { backgroundColor: "#1bbd7e" };
  const btnstyle = { margin: "8px 0" };
  return (
    <Grid>
      <Paper elevation={10} style={paperStyle}>
        <Grid>
          <Avatar style={avatarStyle}>
            <LockOutlinedIcon />
          </Avatar>
          <h2>Sign In</h2>
        </Grid>

        <Form method="post">
          <TextField
            label="Phone Number"
            placeholder="Phone Number"
            name="phone"
            type="text"
            variant="outlined"
            fullWidth
            required
          />
          {data?.errors?.fieldErrors.phone}
          <TextField
            label="Password"
            name="password"
            placeholder="Enter password"
            type="password"
            variant="outlined"
            fullWidth
            required
          />
          {data?.errors?.fieldErrors.password}
          <FormControlLabel
            control={<Checkbox name="checkedB" color="primary" />}
            label="Remember me"
          />
          <Button
            type="submit"
            name="method"
            value="login"
            color="primary"
            variant="contained"
            style={btnstyle}
            fullWidth
          >
            Sign in
          </Button>
        </Form>

        <Typography>
          <Link href="#">Forgot password ?</Link>
        </Typography>
        <Typography>
          {" "}
          Do you have an account ?<Link href="/signup">Sign Up</Link>
        </Typography>
        <Box
          sx={{
            marginTop: "8px",
          }}
        >
          {data ? (
            <Box>
              {data.status == 404 ? (
                <Typography
                  sx={{
                    color: "error.main",
                  }}
                >
                  {data.message}
                </Typography>
              ) : null}
            </Box>
          ) : null}
        </Box>
      </Paper>
    </Grid>
  );
}
