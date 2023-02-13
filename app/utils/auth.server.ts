import { db } from "~/utils/db.server";
import bcrypt from "bcryptjs";
import { createCookieSessionStorage, redirect } from "@remix-run/node";

export const login = async (data: any) => {
  const { phone, password } = data;

  try {
    const user = await db.user.findFirst({
      where: {
        phone: phone,
      },
    });

    if (!user) {
      return {
        status: 404,
        message: "User not found. Try Again!",
      };
    }

    const isCorrectPassword = await bcrypt.compare(password, user?.password);

    if (!isCorrectPassword) {
      return {
        status: 404,
        message: "phone or password incorrect",
      };
    }

    let generatedOTP;
    while (true) {
      generatedOTP = Math.floor(100000 + Math.random() * 900000).toString(); // generates random 6 digit number

      const OTPExists = await db.otpTable.findFirst({
        where: {
          otpNumber: generatedOTP,
        },
      });

      if (OTPExists) {
        continue;
      } else {
        break;
      }
    }

    console.log(generatedOTP);

    await db.otpTable.upsert({
      where: {
        phoneNumber: phone,
      },
      create: {
        phoneNumber: phone,
        otpNumber: generatedOTP,
      },
      update: {
        otpNumber: generatedOTP,
      },
    });
    return {
      status: 200,
      data: user,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
      message: "something went wrong",
    };
  }
};

export const signUp = async (data: any) => {
  const { name, email, phone, password } = data;

  try {
    const user = await db.user.findUnique({
      where: {
        phone: phone,
      },
    });
    if (user) {
      return {
        status: 400,
        message: "user account exists",
      };
    }
    let generatedOTP;
    while (true) {
      generatedOTP = Math.floor(100000 + Math.random() * 900000).toString(); // generates random 6 digit number

      const OTPExists = await db.otpTable.findFirst({
        where: {
          otpNumber: generatedOTP,
        },
      });

      if (OTPExists) {
        continue;
      } else {
        break;
      }
    }

    console.log(generatedOTP);

    await db.otpTable.upsert({
      where: {
        phoneNumber: phone,
      },
      update: {
        otpNumber: generatedOTP,
      },
      create: {
        phoneNumber: phone,
        otpNumber: generatedOTP,
      },
    });

    return {
      status: 200,
      message: "new user",
      data: data,
    };
  } catch (e) {
    console.log(e);
    return {
      status: 400,
      message: "something went wrong",
    };
  }
};

export const verifyOTP = async (otp: string, request: Request) => {
  try {
    const data = await getUserData(request);

    const newUser = await db.otpTable.findFirst({
      where: {
        phoneNumber: data.data.phone,
      },
    });

    if (
      otp === newUser?.otpNumber &&
      data.data.phone === newUser?.phoneNumber
    ) {
      if (data.data.id) {
        return {
          status: 200,
          data: data,
        };
      } else {
        //create new User

        const passwordHash = await bcrypt.hash(data.data.password, 10);
        const user = await db.user.create({
          data: {
            name: data.data.name,
            email: data.data.email,
            phone: data.data.phone,
            password: passwordHash,
          },
        });
        //  console.log(user);
        return {
          status: 200,
          data: user,
        };
      }
    } else {
      return {
        status: 400,
        message: "wrong OTP. Try Again!",
      };
    }
  } catch (e) {
    console.log(e);
    return {
      status: 500,
      message: "something went wrong",
    };
  }
};
function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}
export async function getUserData(request: Request) {
  const session = await getUserSession(request);
  const userData = session.get("user");
  return userData;
}
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}
const storage = createCookieSessionStorage({
  cookie: {
    name: "otp_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export async function createUserSession(user: any, redirectTo: string) {
  const session = await storage.getSession();
  session.set("user", user);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}
export async function logout(request: Request, redirectTo: string) {
  const session = await getUserSession(request);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}
