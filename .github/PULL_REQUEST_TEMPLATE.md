# Task: <!-- Mã task trong Working Sheet, ví dụ: 2.1 -->

## Đã làm gì
<!-- 2-4 gạch đầu dòng, viết cho người review hiểu nhanh -->
-
-

## Cách kiểm thử
<!-- Người review làm theo đúng các bước này để verify -->
```bash
cd neo-messenger
npm install
npm run dev
```
1.
2.

## Checklist bắt buộc (tự tick trước khi xin review)
- [ ] `cd neo-messenger && npm run build` chạy không lỗi TypeScript
- [ ] `cd neo-messenger && npm run lint` không còn error
- [ ] Đã chạy `npm run format` trước khi commit
- [ ] Đã test với **RLS đang BẬT** (không dùng service_role key ở client)
- [ ] Đã kiểm tra trên **mobile 375px**, không có scroll ngang
- [ ] Ảnh có `alt`, nút icon có `aria-label`, focus state nhìn thấy được
- [ ] Realtime channel có `supabase.removeChannel()` trong cleanup của `useEffect`
- [ ] **Không commit `.env`** hoặc bất kỳ key nào (kiểm tra tab Files changed)
- [ ] Đã có empty state / error state cho phần UI mới (nếu có)
- [ ] Đã viết hoặc cập nhật test (nếu task yêu cầu)

## Screenshot / video
<!-- Bắt buộc nếu PR có thay đổi giao diện. Kéo thả ảnh vào đây. -->

## Ghi chú cho người review
<!-- Chỗ nào bạn không chắc, chỗ nào muốn được góp ý kỹ -->