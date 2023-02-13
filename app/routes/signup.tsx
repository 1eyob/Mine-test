import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Grid from "@mui/material/Grid";
import { Paper } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { createUserSession, signUp } from "~/utils/auth.server";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { z } from "zod";

const LoginFields = z.object({
  phone: z.string().min(1, "required"),
  password: z.string().min(1, "required"),
  email: z.string().min(1, "required"),
  name: z.string().min(1, "required"),
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

  const data = await signUp(fields);
  if (data.status == 400) {
    return json(data);
  }
  return createUserSession(data, "/otp");
};

export default function SignUp() {
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
          <h2>Sign Up</h2>
        </Grid>

        <Form method="post">
          <TextField
            label="Name"
            placeholder="your Name"
            name="name"
            type="text"
            variant="outlined"
            fullWidth
            required
          />
          <div style={{ color: "red", marginBottom: "6px" }}>
            {data?.errors?.fieldErrors.name}
          </div>
          <TextField
            label="Email"
            placeholder="Your Email"
            name="email"
            type="email"
            variant="outlined"
            fullWidth
            required
          />
          <div style={{ color: "red", marginBottom: "3px" }}>
            {data?.errors?.fieldErrors.email}
          </div>
          <TextField
            label="Phone Number"
            placeholder="Phone Number"
            name="phone"
            type="text"
            variant="outlined"
            fullWidth
            required
          />
          <div style={{ color: "red", marginBottom: "6px" }}>
            {data?.errors?.fieldErrors.phone}
          </div>
          <TextField
            label="Password"
            name="password"
            placeholder="Enter password"
            type="password"
            variant="outlined"
            fullWidth
            required
          />
          <div style={{ color: "red", marginBottom: "3px" }}>
            {data?.errors?.fieldErrors.password}
          </div>
          <FormControlLabel
            control={<Checkbox name="checkedB" color="primary" />}
            label="Remember me"
          />
          <Button
            type="submit"
            name="method"
            value="signup"
            color="primary"
            variant="contained"
            style={btnstyle}
            fullWidth
          >
            Sign Up
          </Button>
        </Form>
        <Box
          sx={{
            marginTop: "2px",
          }}
        >
          {data ? (
            <Box>
              {data.status == 400 ? (
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
