# Manual Test Checklist — Follow-up Task Tracking

All `/tasks` routes require `Authorization: Bearer <token>`. Tasks past their
due date are swept to `Overdue` automatically when lists are fetched.

## API

- [ ] `POST /tasks` without `title` → `400` validation error.
- [ ] `POST /tasks` without `dueDate` → `400` validation error.
- [ ] `POST /tasks` valid → `201`; `status` defaults to `Pending`, `priority` to `Medium`.
- [ ] `GET /tasks/today` → tasks due today **and** leads whose `nextFollowUpDate` is today.
- [ ] `GET /tasks/overdue` → only past-due, non-completed tasks.
- [ ] `GET /tasks?status=Pending&priority=High&search=call` filters correctly.
- [ ] `PATCH /tasks/:id/complete` → `status: Completed`, `completedAt` populated; drops from active views.
- [ ] `DELETE /tasks/:id` as a non-creator regular user → `403`; as creator/admin → `200`.
- [ ] `GET /tasks` as a user → cannot see tasks created by another user.

## UI

- [ ] Today / Overdue / All tabs show count badges that match the lists.
- [ ] Creating a task uses a modal form with inline validation; closes on success with a toast.
- [ ] "Mark complete" shows per-row loading and removes the task from the active tab.
- [ ] Edit opens the modal pre-filled; saving updates the list.
- [ ] Delete shows a clear confirm dialog; modal closes on ESC and on backdrop click.
- [ ] A task dated yesterday appears under Overdue; one dated today appears under Today.
