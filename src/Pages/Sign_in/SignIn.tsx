import {
  Box,
  Button,
  Checkbox,
  CssBaseline,
  FormControlLabel,
  FormLabel,
  FormControl,
  Link,
  TextField,
  Typography,
  Stack,
  Card as MuiCard,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../contexes/AuthContext.tsx";
import { useNavigate } from "react-router-dom";
import ForgotPassword from "./components/ForgotPassword.tsx";
import AppTheme from "../shared-theme/AppTheme.tsx";
import ColorModeSelect from "../shared-theme/ColorModeSelect.tsx";
// import { GoogleIcon } from "./components/CustomIcons.tsx";
import React from "react";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: { maxWidth: "450px" },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: { padding: theme.spacing(4) },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

// yup schema
const schema = yup.object().shape({
  email: yup.string().email("ایمیل نامعتبر است").required("ایمیل اجباری است"),
  password: yup
    .string()
    .min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد")
    .required("رمز عبور اجباری است"),
});

type SignInForm = {
  email: string;
  password: string;
  remember?: boolean;
};

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  const [open, setOpen] = React.useState(false); // برای ForgotPassword

  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<SignInForm>({
    resolver: yupResolver(schema),
    defaultValues: { email: "", password: "", remember: false },
  });

  // react-query mutation برای لاگین
  const mutation = useMutation({
    mutationFn: async (data: SignInForm) => {
      const res = await fetch("http://localhost:3000/api/v1/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Login failed");
      }
      return json.data;
    },
    onSuccess: (data) => {
      login(data.token, data.admin);
      navigate("/admin/dashboard"); // ریدایرکت به داشبورد
    },
    onError: (error: any) => {
      setError("password", { message: error.message || "خطا در ورود" });
    },
  });

  const onSubmit = (data: SignInForm) => {
    clearErrors();
    mutation.mutate(data);
  };

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer
        direction="column"
        justifyContent="center"
        alignItems="center"
      >
        <ColorModeSelect
          sx={{ position: "fixed", top: "1rem", right: "1rem" }}
        />
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            ورود به پنل
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="email">ایمیل</FormLabel>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    id="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    required
                    fullWidth
                    variant="outlined"
                  />
                )}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">رمز عبور</FormLabel>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    error={!!errors.password || !!mutation.error}
                    helperText={errors.password?.message}
                    name="password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    required
                    fullWidth
                    variant="outlined"
                  />
                )}
              />
            </FormControl>
            <Controller
              name="remember"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={!!field.value}
                      color="primary"
                    />
                  }
                  label="مرا به خاطر بسپار"
                />
              )}
            />
            <ForgotPassword open={open} handleClose={handleClose} />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "در حال ورود..." : "ورود"}
            </Button>
            <Link
              component="button"
              type="button"
              onClick={handleClickOpen}
              variant="body2"
              sx={{ alignSelf: "center" }}
            >
              رمز عبور را فراموش کرده‌اید؟
            </Link>
          </Box>
          {/* <Divider>یا</Divider>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => alert("ورود با گوگل")}
              startIcon={<GoogleIcon />}
            >
              ورود با گوگل
            </Button>
            <Typography sx={{ textAlign: "center" }}>
              حساب ندارید؟{" "}
              <Link href="/signup" variant="body2" sx={{ alignSelf: "center" }}>
                ثبت‌نام
              </Link>
            </Typography>
          </Box> */}
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}
