import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import { Paper } from "@mui/material";
import Box from "@mui/material/Box";
import { createUserSession, verifyOTP } from "~/utils/auth.server";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

export let action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const otp = form.get("otp");
  const data = await verifyOTP(otp, request);
  console.log(data.status);

  if (data.status == 400) {
    return json(data);
  } else {
    return await createUserSession(data?.data?.data?.id, "/search");
  }
};

export default function otp() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
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
          <h2>One time password</h2>
        </Grid>

        <Form method="post">
          {" "}
          <TextField
            label="OTP"
            placeholder="enter OTP"
            name="otp"
            type="text"
            variant="outlined"
            fullWidth
            required
          />
          <Button
            type="submit"
            name="method"
            value="otp-submit"
            color="primary"
            variant="contained"
            style={btnstyle}
            fullWidth
          >
            Submit
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            style={btnstyle}
            fullWidth
          >
            Resend
          </Button>
        </Form>
        <Box
          sx={{
            marginTop: "8px",
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
