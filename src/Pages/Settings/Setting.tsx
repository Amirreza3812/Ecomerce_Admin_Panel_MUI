import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSettings,
  updateSettings,
  type LoyaltyReward,
  type LoyaltySettings,
  type OnlineOfferSettings,
  type GeneralSettings,
} from "../../services/settingsService";
import {
  getStaff,
  createStaff,
  deactivateStaff,
  type CreateStaffData,
  type StaffRole,
} from "../../services/staffService";
import { useLicense } from "../../contexes/LicenseContext";

function TabPanel({
  value,
  index,
  children,
}: {
  value: number;
  index: number;
  children: React.ReactNode;
}) {
  if (value !== index) return null;
  return <Box sx={{ pt: 2 }}>{children}</Box>;
}

const emptyReward = (): LoyaltyReward => ({
  at_stamp: 3,
  type: "percent",
  value: 30,
  title: "۳۰٪ تخفیف",
});

const STAFF_ROLES: { value: StaffRole; label: string }[] = [
  { value: "manager", label: "مدیر" },
  { value: "barista", label: "باریستا" },
  { value: "cashier", label: "صندوقدار" },
  { value: "accountant", label: "حسابدار" },
  { value: "custom", label: "سفارشی" },
];

export default function Settings() {
  const queryClient = useQueryClient();
  const { license, canCreateAdmins } = useLicense();
  const [tab, setTab] = useState(0);

  const [loyalty, setLoyalty] = useState<LoyaltySettings | null>(null);
  const [onlineOffer, setOnlineOffer] = useState<OnlineOfferSettings | null>(
    null
  );
  const [general, setGeneral] = useState<GeneralSettings | null>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Staff dialog
  const [staffOpen, setStaffOpen] = useState(false);
  const [staffForm, setStaffForm] = useState<CreateStaffData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    staff_role: "barista",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  useEffect(() => {
    if (data) {
      setLoyalty(data.loyalty);
      setOnlineOffer(data.online_offer);
      setGeneral(data.general);
    }
  }, [data]);

  const saveMut = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setSnackbar({
        open: true,
        message: "تنظیمات ذخیره شد",
        severity: "success",
      });
    },
    onError: (err: any) =>
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "خطا در ذخیره",
        severity: "error",
      }),
  });

  const staffQuery = useQuery({
    queryKey: ["staff"],
    queryFn: () => getStaff({ limit: 50 }),
    enabled: canCreateAdmins && tab === 3,
  });

  const createStaffMut = useMutation({
    mutationFn: createStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setStaffOpen(false);
      setStaffForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        staff_role: "barista",
      });
      setSnackbar({ open: true, message: "مدیر ایجاد شد", severity: "success" });
    },
    onError: (err: any) =>
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "خطا",
        severity: "error",
      }),
  });

  const deactivateMut = useMutation({
    mutationFn: deactivateStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setSnackbar({ open: true, message: "غیرفعال شد", severity: "success" });
    },
    onError: (err: any) =>
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "خطا",
        severity: "error",
      }),
  });

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !loyalty || !onlineOffer || !general) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        خطا در بارگذاری تنظیمات
      </Alert>
    );
  }

  const updateReward = (index: number, patch: Partial<LoyaltyReward>) => {
    setLoyalty((prev) => {
      if (!prev) return prev;
      const rewards = [...prev.rewards];
      rewards[index] = { ...rewards[index], ...patch };
      return { ...prev, rewards };
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 960, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        تنظیمات
      </Typography>

      {/* License summary */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            لایسنس
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label={`پلن: ${license.plan === "pro" ? "پرو" : "پایه"}`}
              color={license.plan === "pro" ? "primary" : "default"}
              size="small"
            />
            <Chip
              label={
                license.expired
                  ? "منقضی شده"
                  : `${license.days_left} روز مانده`
              }
              color={
                license.expired
                  ? "error"
                  : license.days_left <= 14
                  ? "warning"
                  : "success"
              }
              size="small"
            />
            <Chip
              label={
                canCreateAdmins
                  ? "امکان ساخت مدیر: بله"
                  : "امکان ساخت مدیر: خیر"
              }
              size="small"
            />
          </Box>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            انقضا: {license.expires_at}
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="باشگاه مشتریان" />
            <Tab label="پیشنهاد آنلاین" />
            <Tab label="عمومی" />
            <Tab label="مدیران" disabled={!canCreateAdmins} />
          </Tabs>

          {/* —— Loyalty —— */}
          <TabPanel value={tab} index={0}>
            <FormControlLabel
              control={
                <Switch
                  checked={loyalty.enabled}
                  onChange={(e) =>
                    setLoyalty({ ...loyalty, enabled: e.target.checked })
                  }
                />
              }
              label="فعال‌سازی کارت وفاداری"
            />
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="تعداد مهر (slots)"
                  value={loyalty.slots}
                  onChange={(e) =>
                    setLoyalty({
                      ...loyalty,
                      slots: Math.max(1, Number(e.target.value) || 1),
                    })
                  }
                  inputProps={{ min: 1, max: 50 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>ثبت مهر هنگام</InputLabel>
                  <Select
                    label="ثبت مهر هنگام"
                    value={loyalty.stamp_on}
                    onChange={(e) =>
                      setLoyalty({
                        ...loyalty,
                        stamp_on: e.target.value as "paid" | "completed",
                      })
                    }
                  >
                    <MenuItem value="paid">پرداخت سفارش</MenuItem>
                    <MenuItem value="completed">تکمیل سفارش</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={loyalty.reset_on_reward}
                      onChange={(e) =>
                        setLoyalty({
                          ...loyalty,
                          reset_on_reward: e.target.checked,
                        })
                      }
                    />
                  }
                  label="ریست مهر بعد از استفاده جایزه"
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              جوایز
            </Typography>
            {loyalty.rewards.map((r, i) => (
              <Grid
                container
                spacing={1}
                key={i}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Grid size={{ xs: 6, sm: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="مهر"
                    value={r.at_stamp}
                    onChange={(e) =>
                      updateReward(i, {
                        at_stamp: Number(e.target.value) || 1,
                      })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 2 }}>
                  <FormControl fullWidth size="small">
                    <Select
                      value={r.type}
                      onChange={(e) =>
                        updateReward(i, {
                          type: e.target.value as LoyaltyReward["type"],
                        })
                      }
                    >
                      <MenuItem value="percent">درصد</MenuItem>
                      <MenuItem value="fixed">مبلغ ثابت</MenuItem>
                      <MenuItem value="free_item">آیتم رایگان</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, sm: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="مقدار"
                    value={r.value}
                    onChange={(e) =>
                      updateReward(i, { value: Number(e.target.value) || 0 })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 10, sm: 5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="عنوان"
                    value={r.title}
                    onChange={(e) => updateReward(i, { title: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 2, sm: 1 }}>
                  <IconButton
                    color="error"
                    onClick={() =>
                      setLoyalty({
                        ...loyalty,
                        rewards: loyalty.rewards.filter((_, j) => j !== i),
                      })
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={() =>
                setLoyalty({
                  ...loyalty,
                  rewards: [...loyalty.rewards, emptyReward()],
                })
              }
              sx={{ mt: 1 }}
            >
              افزودن جایزه
            </Button>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={saveMut.isPending}
                onClick={() => saveMut.mutate({ loyalty })}
              >
                ذخیره باشگاه مشتریان
              </Button>
            </Box>
          </TabPanel>

          {/* —— Online offer —— */}
          <TabPanel value={tab} index={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={onlineOffer.enabled}
                  onChange={(e) =>
                    setOnlineOffer({
                      ...onlineOffer,
                      enabled: e.target.checked,
                    })
                  }
                />
              }
              label="فعال‌سازی تخفیف پرداخت آنلاین"
            />
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="عنوان"
                  value={onlineOffer.title}
                  onChange={(e) =>
                    setOnlineOffer({ ...onlineOffer, title: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>نوع</InputLabel>
                  <Select
                    label="نوع"
                    value={onlineOffer.type}
                    onChange={(e) =>
                      setOnlineOffer({
                        ...onlineOffer,
                        type: e.target.value as "percent" | "fixed",
                      })
                    }
                  >
                    <MenuItem value="percent">درصد</MenuItem>
                    <MenuItem value="fixed">مبلغ ثابت</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="مقدار"
                  value={onlineOffer.value}
                  onChange={(e) =>
                    setOnlineOffer({
                      ...onlineOffer,
                      value: Number(e.target.value) || 0,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="حداقل مبلغ سفارش"
                  value={onlineOffer.min_order_amount}
                  onChange={(e) =>
                    setOnlineOffer({
                      ...onlineOffer,
                      min_order_amount: Number(e.target.value) || 0,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="از تاریخ"
                  InputLabelProps={{ shrink: true }}
                  value={onlineOffer.starts_at || ""}
                  onChange={(e) =>
                    setOnlineOffer({
                      ...onlineOffer,
                      starts_at: e.target.value || null,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="تا تاریخ"
                  InputLabelProps={{ shrink: true }}
                  value={onlineOffer.ends_at || ""}
                  onChange={(e) =>
                    setOnlineOffer({
                      ...onlineOffer,
                      ends_at: e.target.value || null,
                    })
                  }
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={saveMut.isPending}
                onClick={() => saveMut.mutate({ online_offer: onlineOffer })}
              >
                ذخیره پیشنهاد آنلاین
              </Button>
            </Box>
          </TabPanel>

          {/* —— General —— */}
          <TabPanel value={tab} index={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={general.online_payment_enabled}
                  onChange={(e) =>
                    setGeneral({
                      ...general,
                      online_payment_enabled: e.target.checked,
                    })
                  }
                />
              }
              label="نمایش گزینه پرداخت آنلاین (بدون درگاه واقعی فعلاً)"
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              نام و توضیحات کافه را بعداً در همین بخش اضافه می‌کنیم.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={saveMut.isPending}
                onClick={() => saveMut.mutate({ general })}
              >
                ذخیره عمومی
              </Button>
            </Box>
          </TabPanel>

          {/* —— Staff —— */}
          <TabPanel value={tab} index={3}>
            {!canCreateAdmins ? (
              <Alert severity="info">
                ساخت مدیر فقط در اشتراک پرو فعال است.
              </Alert>
            ) : (
              <>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle1">مدیران فروشگاه</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setStaffOpen(true)}
                  >
                    مدیر جدید
                  </Button>
                </Box>
                {staffQuery.isLoading ? (
                  <CircularProgress size={28} />
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>نام</TableCell>
                        <TableCell>ایمیل</TableCell>
                        <TableCell>نقش</TableCell>
                        <TableCell>وضعیت</TableCell>
                        <TableCell align="left">عملیات</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(staffQuery.data?.staff || []).map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>{s.name}</TableCell>
                          <TableCell>{s.email}</TableCell>
                          <TableCell>{s.staff_role}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                s.status === "active" ? "فعال" : "غیرفعال"
                              }
                              color={
                                s.status === "active" ? "success" : "default"
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {s.status === "active" && (
                              <Button
                                size="small"
                                color="error"
                                onClick={() => {
                                  if (window.confirm("غیرفعال شود؟")) {
                                    deactivateMut.mutate(s.id);
                                  }
                                }}
                              >
                                غیرفعال
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(staffQuery.data?.staff || []).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5}>
                            هنوز مدیری ثبت نشده است.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </>
            )}
          </TabPanel>
        </CardContent>
      </Card>

      <Dialog
        open={staffOpen}
        onClose={() => setStaffOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>ایجاد مدیر</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="نام"
                value={staffForm.name}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, name: e.target.value })
                }
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="ایمیل"
                type="email"
                value={staffForm.email}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, email: e.target.value })
                }
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="رمز عبور"
                type="password"
                value={staffForm.password}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, password: e.target.value })
                }
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="تلفن"
                value={staffForm.phone}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, phone: e.target.value })
                }
              />
            </Grid>
            <Grid size={12}>
              <FormControl fullWidth>
                <InputLabel>نقش</InputLabel>
                <Select
                  label="نقش"
                  value={staffForm.staff_role}
                  onChange={(e) =>
                    setStaffForm({
                      ...staffForm,
                      staff_role: e.target.value as StaffRole,
                    })
                  }
                >
                  {STAFF_ROLES.map((r) => (
                    <MenuItem key={r.value} value={r.value}>
                      {r.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStaffOpen(false)}>انصراف</Button>
          <Button
            variant="contained"
            disabled={createStaffMut.isPending}
            onClick={() => createStaffMut.mutate(staffForm)}
          >
            ایجاد
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}