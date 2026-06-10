src/
├── main.tsx
├── app/
│ ├── App.tsx
│ └── routes.tsx
│
├── modules/ ← Domain-driven
│ ├── auth/
│ │ ├── components/ ← Login.tsx, Register.tsx, ForgotPassword.tsx
│ │ ├── graphql/ ← auth.ts (queries/mutations)
│ │ └── context/ ← AuthContext.tsx
│ ├── customer/
│ │ ├── components/ ← Customer.tsx, CustomerDetail.tsx, CustomerModal.tsx, CustomerSelect.tsx
│ │ └── graphql/ ← customer.ts
│ ├── project/
│ │ ├── components/ ← ProjectListPage.tsx, ProjectDetailPage.tsx, ProjectCard.tsx, ProjectModal.tsx
│ │ └── graphql/ ← project.ts
│ ├── task/
│ │ ├── components/ ← KanbanBoard.tsx, TaskModal.tsx, TagSelect.tsx
│ │ └── graphql/ ← task.ts
│ ├── notes/
│ │ └── components/ ← Notes.tsx
│ ├── dashboard/
│ │ └── components/ ← Dashboard.tsx
│ └── settings/
│ └── components/ ← Settings.tsx
│
├── shared/
│ ├── ui/ ← shadcn primitives (giữ nguyên)
│ ├── components/ ← Logo\*.tsx, RouteGuards.tsx, DeleteConfirmDialog.tsx
│ └── lib/
│ └── apollo.ts
│
└── layout/
└── Layout.tsx
