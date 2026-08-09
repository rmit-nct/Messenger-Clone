## 0. Cấu trúc repo — ĐỌC TRƯỚC TIÊN

```
Messenger-Clone/            ← GỐC repo
├── .github/                ← PR template (phải ở đây, không phải trong neo-messenger)
├── docs/                   ← tài liệu, báo cáo tuần
├── supabase/migrations/    ← file SQL (task 0.2, 0.3)
├── screenshots/            ← deliverable bắt buộc của đề bài
├── .gitignore              ← ở GỐC, chứa rule .env
├── README.md               ← README chính để nộp bài
└── neo-messenger/          ← ỨNG DỤNG React nằm ở đây
```

**Ba điều phải nhớ:**
1. Mọi lệnh `npm` phải `cd neo-messenger` trước
2. Vercel phải đặt **Root Directory = `neo-messenger`**
3. File `.env` tạo trong `neo-messenger/`, đã được `.gitignore` ở gốc bắt

---

## 1. Mô hình nhánh

Dùng **Gitflow rút gọn** — bỏ `release/*` và `hotfix/*` vì dự án 5 tuần không có bản phát hành song song.

```
main          ← code đã review, luôn deploy được. KHÔNG AI push thẳng.
 └─ dev       ← nhánh tích hợp. Mọi feature merge vào đây trước.
     ├─ feat/1.1-auth-service
     ├─ feat/1.3-app-shell
     └─ fix/2.1-duplicate-messages
```

| Nhánh | Ai được ghi | Merge vào |
|---|---|---|
| `main` | Không ai (chỉ qua PR từ `dev`) | — |
| `dev` | Không ai (chỉ qua PR từ feature branch) | `main` (cuối mỗi sprint) |
| `feat/*`, `fix/*` | Người nhận task | `dev` |

---

## 2. Đặt tên nhánh

```
<loại>/<mã-task>-<mô-tả-ngắn-không-dấu>
```

| Loại | Dùng khi | Ví dụ |
|---|---|---|
| `feat/` | Task mới trong Working Sheet | `feat/3.2-story-composer` |
| `fix/` | Sửa bug | `fix/2.1-duplicate-messages` |
| `chore/` | Cấu hình, dependency, dọn dẹp | `chore/0.4-pr-template` |
| `docs/` | Tài liệu, README | `docs/6.4-readme-setup` |

**Bắt buộc có mã task trong tên nhánh.** Chạy `git branch -a` là đối chiếu thẳng được với cột PIC trong Working Sheet.

---

## 3. Quy ước commit (Conventional Commits)

```
<loại>(<phạm vi>): <mô tả tiếng Việt, viết thường, không chấm cuối câu>
```

**Đúng:**
```
feat(chat): thêm realtime subscription cho conversation
fix(story): sửa progress bar không reset khi chuyển story
chore(db): thêm index cho bảng messages
docs(readme): bổ sung hướng dẫn cấu hình supabase
test(auth): thêm unit test cho zod schema đăng ký
```

**Sai:** `update`, `fix bug`, `aaa`, `final version 2`

Loại dùng: `feat` `fix` `refactor` `chore` `docs` `test` `style`

> Đề bài chấm mục *"meaningful commit messages"*. Cuối kỳ chạy
> `git log --oneline --author="Tên"` là có sẵn nội dung điền bảng phân công README.

---

## 4. Quy trình làm một task

```bash
# 1. Luôn xuất phát từ dev mới nhất
git checkout dev
git pull origin dev

# 2. Tạo nhánh theo mã task
git checkout -b feat/1.1-auth-service

# 3. Cài dependency (nếu cần) — NHỚ cd vào app
cd neo-messenger
npm install
npm run dev
cd ..

# 4. Commit nhiều lần theo ý nghĩa, không dồn 1 commit khổng lồ
git add .
git commit -m "feat(auth): thêm auth service kết nối supabase"
git commit -m "feat(auth): thêm protected route wrapper"

# 5. Đẩy lên
git push -u origin feat/1.1-auth-service
```

Vào GitHub → **Compare & pull request** → base là `dev` → điền PR template → gán Reviewer theo Working Sheet.

**Trước khi xin review, luôn đồng bộ lại với `dev`:**
```bash
git checkout dev && git pull origin dev
git checkout feat/1.1-auth-service
git merge dev        # xử lý conflict TẠI ĐÂY, không để người review gánh
git push
```

---

## 5. Merge bằng Squash

Luôn chọn **Squash and merge**. Mọi commit lẻ gộp thành 1 commit duy nhất trên `dev`, tiêu đề là tên PR.

Kết quả: lịch sử `dev` là đúng một dòng cho mỗi task — dễ đọc, dễ lập bảng phân công cuối kỳ.

Đặt tiêu đề khi squash đúng quy ước: `feat(auth): auth service và protected routes (task 1.1)`

---

## 6. Luật review

- **Reviewer bắt buộc khác người viết code.** Xoay vòng theo cột Reviewer trong Working Sheet.
- Reviewer phải **chạy thử code**, không chỉ đọc diff.
- PR không quá ~400 dòng thay đổi. Vượt quá thì chẻ task nhỏ ra.
- Phản hồi trong **24 giờ**. Quá hạn thì leader review thay.
- Cần ít nhất 1 approve mới được merge.

---

## 7. Xử lý xung đột `package-lock.json`

File gây conflict nhiều nhất khi 5 người cùng cài thư viện. **Đừng sửa tay:**

```bash
cd neo-messenger
git checkout --theirs package-lock.json
npm install
git add package-lock.json
```

Ai cài thư viện mới phải báo nhóm chat để mọi người `npm install` lại.

---

## 8. Không bao giờ commit

`.gitignore` ở gốc repo đã chặn sẵn `.env` và mọi biến thể `.env.*`.
**Chỉ commit `safe.env.example`** (không chứa giá trị thật).

Kiểm tra trước mỗi PR:
```bash
git status --porcelain | grep -i env
```
Nếu thấy `.env` xuất hiện → dừng lại, đừng commit.

> Nếu lỡ commit key thật: xoá file **không đủ**, key vẫn nằm trong lịch sử.
> Phải vào Supabase Dashboard **tạo lại (rotate) key** ngay.

---

## 9. Báo cáo tuần

Đề bài yêu cầu README có link OneDrive weekly report / project board.

- Hạn cố định: **20h Chủ nhật hằng tuần**
- Mỗi người 3 dòng: tuần này làm gì / vướng gì / tuần sau làm gì
- Leader tổng hợp và cập nhật Working Sheet cùng lúc