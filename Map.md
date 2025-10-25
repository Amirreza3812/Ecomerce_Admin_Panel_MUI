ADMIN-DASHBOARD/
│
├── node_modules/                    → وابستگی‌های پروژه
├── public/                          → فایل‌های استاتیک عمومی
│
├── src/                             → سورس کد اصلی برنامه
│   ├── assets/                      → تصاویر، آیکون‌ها و فایل‌های گرافیکی
│   │
│   ├── config/                      → فایل‌های تنظیمات پروژه
│   │   └── modules.ts
│   │
│   ├── contextes/                   → مدیریت state سراسری با Context API
│   │   ├── AuthContext.tsx
│   │   └── ModuleContext.tsx
│   │
│   ├── Pages/                       → صفحات اصلی داشبورد
│   │   ├── About/ 
│   │       ├── About.tsx(Not Complete yet)
│   │   ├── Banking/
│   │       ├── Banking.tsx(Not Complete yet(I dont create backend yet))
│   │   ├── Categories/
│   │       ├── Categories.tsx 
│   │   ├── Comment/
│   │       ├── Comments.tsx
│   │   ├── Customer/
│   │       ├── Customer.tsx(Not Complete yet)
│   │   ├── Dashboard/
│   │   │   ├── components/
│   │   │   │   ├── AppNavbar.tsx
│   │   │   │   ├── CardAlert.tsx
│   │   │   │   ├── ChartUserByCountry.tsx
│   │   │   │   ├── CustomDatePicker.tsx
│   │   │   │   ├── CustomizedDataGrid.tsx
│   │   │   │   ├── CustomizedTreeView.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── HighlightedCard.jsx
│   │   │   │   ├── HighlightedCard.tsx
│   │   │   │   ├── MainGrid.tsx
│   │   │   │   ├── MenuButton.tsx
│   │   │   │   ├── MenuContent.tsx
│   │   │   │   ├── NavbarBreadcrumbs.tsx
│   │   │   │   ├── OptionsMenu.tsx
│   │   │   │   ├── OrderStatusChart.tsx
│   │   │   │   ├── PageViewsBarChart.tsx
│   │   │   │   ├── Search.tsx
│   │   │   │   ├── SelectContent.tsx
│   │   │   │   ├── SessionsChart.tsx
│   │   │   │   ├── SideMenu.tsx
│   │   │   │   ├── SideMenuMobile.tsx
│   │   │   │   ├── StatCard.tsx
│   │   │   │   └── TopProductsChart.tsx
│   │   │   ├── internals/
│   │   │   │   ├── components/
│   │   │   │   │   ├── Copyright.tsx
│   │   │   │   │   ├── CustomIcons.tsx
│   │   │   │   ├── data/
│   │   │   │   │   ├── gridData.tsx
│   │   │   ├── theme/
│   │   │   │   │   ├── charts.jsx
│   │   │   │   │   ├── charts.ts
│   │   │   │   │   ├── dataGrid.jsx
│   │   │   │   │   ├── dataPickers.jsx
│   │   │   │   │   ├── dataPickers.ts
│   │   │   │   │   ├── index.jsx
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── treeView.jsx
│   │   │   │   │   ├── treeView.ts
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── Feedback/
│   │       ├── Feedback.tsx(Not Complete yet)
│   │   ├── MyAccount/
│   │       ├── MyAccount.tsx(Not Complete yet)
│   │   ├── Orders/
│   │       ├── Order.tsx(Complete but i dont test it yet with data(data base is empty yet))
│   │   ├── Personnel/
│   │       ├── Personnel(Not Complete yet(I dont create backend yet))
│   │   ├── Prices/
│   │       ├── Prices.tsx(Not Complete yet)
│   │   ├── Products/
│   │       ├── Products.tsx(Not Complete yet)
│   │   ├── Settings/
│   │       ├── Settings.tsx(Not Complete yet)
│   │   ├── shared-theme/(Default downloaded from MUI)
│   │
│   │   ├── Sign_in/
│   │       ├── components/
│   │   │       ├── CustomIcons.tsx
│   │   │       ├── ForgotPassword.tsx
│   │       ├── SignIn.tsx
│   │   ├── SubCategories/
│   │       ├── SubCategories.tsx
│   │
│   ├── routes/                      → مدیریت مسیرهای برنامه
│   │   ├── ProtectedRoute.tsx
│   │   └── RedirectIfAuth.tsx
│   │
│   ├── services/                    → ارتباط با API و سرویس‌ها
│   │   ├── api.ts
│   │   ├── categoryService.ts
│   │   ├── subcategoryService.ts
│   │   ├── dashboardService.ts
│   │   ├── productService.ts
│   │   ├── commentService.ts
│   │   ├── priceService.ts
│   │   ├── productService.ts
│   │   └── orderService.ts
│   │
│   ├── theme/                       → تنظیمات تم برنامه (MUI)
│   │   └── index.ts
│   │
│   ├── App.tsx                      → کامپوننت اصلی برنامه
│   ├── main.tsx                     → نقطه ورود React
│   ├── App.css
│   └── index.css
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
