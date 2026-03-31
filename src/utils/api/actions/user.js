import { toast } from "sonner";
import { $authHost, $host } from "../http";
import { setLoadingCode } from "../../../store/slices/authSlice";
import { setUser, setUser_data } from "../../../store/slices/userSlice";
import { getPositionsList } from "./positions";
import { getDepartmentsList } from "./departments";
import { getIntegrationsList } from "./integrations";

export const signUp = (setLoading, navigate, data) => {
  return async () => {
    setLoading(true);
    await $host
      .post("/user/registration", data)
      .then((res) => {
        if (res.status === 200) {
          navigate("/code-verify");
          sessionStorage.setItem("success_registration", "true");
        }

        return res.data;
      })
      .catch((err) => {
        if (err.response) {
          console.error("signUp", err.response.data);
          if (err.response.status === 409) {
            const message = err.response.data?.message;

            if (message?.includes("email")) {
              toast.error(`User "${data.email}" already exists.`, {
                action: {
                  label: "Sign in",
                  onClick: () => navigate("/auth", { replace: true }),
                },
              });
            } else {
              toast.error(message || "A data conflict occurred");
            }
          }
        } else {
          if (err.request) {
            console.error(err.request);
          } else {
            console.error(err.message);
          }
        }
      })
      .finally(() => {
        if (setLoading) {
          setLoading(false);
        }
      });
  };
};

export const codeVerify = (navigate, data, setSuccess = null) => {
  return async (dispatch) => {
    dispatch(setLoadingCode(true));
    await $host
      .post("/user/code/verify", data)
      .then((res) => {
        if (res.status === 200) {
          setSuccess(true);
          toast.success("Email verified!", {
            action: {
              label: "Sign in",
              onClick: () => navigate("/auth", { replace: true }),
            },
          });
        }
      })
      .catch((err) => {
        setSuccess(false);
        if (err.response) {
          const message = err.response.data?.message;

          if (message?.includes("Invalid code")) {
            toast.error(
              `Invalid code!\nPlease try again or request a new one.`,
              {
                style: {
                  whiteSpace: "pre-line",
                },
              },
            );
          }
        } else {
          if (err.request) {
            console.error(err.request);
          } else {
            console.error(err.message);
          }
        }
      })
      .finally(() => {
        dispatch(setLoadingCode(false));
      });
  };
};

export const getNewCode = (data) => {
  return async (dispatch) => {
    dispatch(setLoadingCode(true));
    await $host
      .post("/user/code", data)
      .then((res) => {
        toast.success("A new code has been sent!");
        return res.data;
      })
      .catch((err) => {
        if (err.response) {
          console.error(err.response.data);
        } else {
          if (err.request) {
            console.error(err.request);
          } else {
            console.error(err.message);
          }
        }
      })
      .finally(() => {
        dispatch(setLoadingCode(false));
      });
  };
};

export const signIn = (setLoading, navigate, data) => {
  return async (dispatch) => {
    setLoading(true);
    await $host
      .post("/user/login", data)
      .then((res) => {
        dispatch(setUser(res.data));
        dispatch(setUser_data(res.data.user));
        localStorage.setItem("@storage_token", res.data.token);
        localStorage.removeItem("email");
        localStorage.removeItem("step");

        dispatch(getIntegrationsList(1, 1)).then((res) => {
          if (res.status === 200) {
            if (res.data.integrations === null) {
              localStorage.setItem("hasIntegrations", "no");
              navigate("/create-bot");
            }
          }
        });
        dispatch(getPositionsList(1, 10));
        dispatch(getDepartmentsList(1, 10));
        navigate("/", { replace: true });
        return res;
      })
      .catch((err) => {
        if (err.response) {
          toast.error("Something went wrong. Please try again.");

          const message = err.response.data?.message;

          if (
            err.response.status === 400 ||
            err.response.status === 404 ||
            err.response.status === 401
          ) {
            toast.error(message || "A data conflict occurred");
            return;
          }

          if (message === "Вы не подтвердили почту.") {
            const email = data.email;

            toast.error(`Your email is not verified.`, {
              action: {
                label: "Verify",
                onClick: () => {
                  dispatch(getNewCode({ email }));
                  navigate("/code-verify", { replace: true });
                },
              },
            });
          }

          if (message?.toLowerCase().includes("not found")) {
            toast.error("User does not exist!");
          }

          if (message?.toLowerCase().includes("not verified")) {
            const email = data.email;

            toast.error(`Your email is not verified.`, {
              action: {
                label: "Verify",
                onClick: () => {
                  dispatch(getNewCode({ email }));
                  navigate("/code-verify", { replace: true });
                },
              },
            });
          }
        } else {
          if (err.request) {
            toast.error("Something went wrong. Please try again.");
            console.error(err.request);
          } else {
            toast.error("Something went wrong. Please try again.");
            console.error(err.message);
          }
        }
      })
      .finally(() => {
        if (setLoading) {
          setLoading(false);
        }
      });
  };
};

export const updateUserName = (data, setLoading, setSuccess) => {
  return async (dispatch) => {
    setLoading(true);
    await $authHost
      .put("/user", data)
      .then((res) => {
        if (res.status === 200) {
          dispatch(setUser_data(res.data.user));
          setSuccess(true);
          toast.success("Name updated successfully");
        }
      })
      .catch((err) => {
        setSuccess(false);
        if (err.response) {
          toast.error(err.response.data.message);
        } else {
          if (err.request) {
            console.error(err.request);
          } else {
            console.error(err.message);
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
};

export const forgotPassword = (data) => {
  return async () => {
    await $host
      .post("/user/password/reset", data)
      .then((res) => {
        if (res.status === 200) {
          toast.success("A new password has been sent to your email!");
        }
      })
      .catch((err) => {
        if (err.response) {
          console.error("forgotPassword", err.response.data);
        } else {
          if (err.request) {
            console.error(err.request);
          } else {
            console.error(err.message);
          }
        }
      });
  };
};

export const changePassword = (data, setLoading, setSuccess) => {
  setLoading(true);
  return async () => {
    await $authHost
      .put("/user/password/change", data)
      .then((res) => {
        if (res.status === 200) {
          setSuccess(true);
          toast.success("Password changed successfully!");
        }
      })
      .catch((err) => {
        setSuccess(false);
        if (err.response) {
          toast.error(err.response.data.message);
          console.error(err.response.data);
        } else {
          if (err.request) {
            console.error(err.request);
          } else {
            console.error(err.message);
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
};
