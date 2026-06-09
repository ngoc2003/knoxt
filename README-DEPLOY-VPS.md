# Deploy Qua GitHub Actions Và SSH VPS

Tài liệu này mô tả quy trình deployment hiện tại:

```text
GitHub Actions
    ↓
SSH VPS
    ↓
git pull --ff-only origin main
    ↓
docker compose up -d --build --remove-orphans --wait
```

Workflow được định nghĩa tại:

- `.github/workflows/ci.yml`
- `.github/workflows/deploy-vps.yml`

## Luồng Deployment

1. Code được merge hoặc push vào branch `main`.
2. Workflow `CI` chạy quality gates và build production Docker images.
3. Chỉ khi `CI` thành công, workflow `Deploy VPS` mới được kích hoạt.
4. GitHub Actions SSH vào VPS bằng deploy user.
5. VPS pull branch `main` bằng `git pull --ff-only`.
6. Workflow xác nhận VPS `HEAD` đúng Git SHA vừa pass CI.
7. Docker Compose build lại images và khởi động stack.
8. Workflow chờ services healthy và hiển thị `docker compose ps`.

## GitHub Environment

Tạo GitHub Environment tên:

```text
production
```

Khuyến nghị cấu hình required reviewers để manual approval trước deployment.

Thêm repository hoặc environment secrets:

| Secret | Mục đích |
| --- | --- |
| `VPS_SSH_HOST` | IP hoặc hostname của VPS |
| `VPS_SSH_USER` | Linux deploy user |
| `VPS_SSH_PRIVATE_KEY` | Private SSH key của deploy user |
| `VPS_SSH_FINGERPRINT` | Fingerprint của SSH host key |

Thêm repository hoặc environment variables:

| Variable | Ví dụ | Mục đích |
| --- | --- | --- |
| `VPS_APP_DIR` | `/srv/freelancer-notebook` | Thư mục repository trên VPS |
| `VPS_SSH_PORT` | `22` | SSH port |

Không lưu VPS private key, `.env` hoặc production secrets trong repository.

## Chuẩn Bị VPS

### 1. Tạo Deploy User

Deploy user cần:

- Đăng nhập bằng SSH key.
- Đọc repository.
- Chạy Docker Compose.
- Ghi vào thư mục application.

Không dùng `root` nếu không cần thiết.

Ví dụ tạo user:

```bash
sudo adduser deploy
sudo usermod -aG docker deploy
```

Đăng xuất và đăng nhập lại sau khi thêm user vào group `docker`.

### 2. Cài Dependencies Trên VPS

VPS cần:

```text
Git
Docker Engine
Docker Compose plugin
```

Kiểm tra:

```bash
git --version
docker --version
docker compose version
```

### 3. Clone Repository

Thực hiện một lần trên VPS:

```bash
sudo mkdir -p /srv/freelancer-notebook
sudo chown deploy:deploy /srv/freelancer-notebook

git clone https://github.com/ngoc2003/freelancer-notebook.git \
  /srv/freelancer-notebook

cd /srv/freelancer-notebook
git checkout main
```

Nếu repository private, cấu hình read-only deploy key cho VPS.

### 4. Tạo Production `.env`

Tạo `/srv/freelancer-notebook/.env` trực tiếp trên VPS:

```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=replace_with_a_strong_password
POSTGRES_DB=freelancer_notebook

JWT_SECRET=replace_with_a_strong_jwt_secret

API_PORT=3000
WEB_PORT=8080

VITE_API_URL=https://api.example.com
CORS_ORIGIN=https://example.com
WEB_URL=https://example.com
```

Giới hạn quyền đọc:

```bash
chmod 600 /srv/freelancer-notebook/.env
```

File `.env` đã được Git ignore và không được copy vào Docker images.

### 5. Tạo SSH Key Cho GitHub Actions

Tạo một key riêng cho deployment. Không tái sử dụng key cá nhân.

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy"
```

- Thêm public key vào `~deploy/.ssh/authorized_keys` trên VPS.
- Thêm private key vào GitHub secret `VPS_SSH_PRIVATE_KEY`.
- Thêm SSH host fingerprint vào `VPS_SSH_FINGERPRINT`.

Lấy fingerprint trên VPS:

```bash
ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
```

## Kiểm Tra Trước Deployment Đầu Tiên

Đăng nhập bằng deploy user và chạy:

```bash
cd /srv/freelancer-notebook
git pull --ff-only origin main
docker compose config --quiet
docker compose up -d --build --remove-orphans --wait
docker compose ps
```

Kiểm tra health endpoints:

```bash
curl -f http://localhost:3000/health/live
curl -f http://localhost:3000/health/ready
curl -f http://localhost:8080
```

## Hành Vi Khi Deployment Thất Bại

Workflow dừng nếu:

- CI không thành công.
- SSH authentication thất bại.
- SSH fingerprint không khớp.
- `VPS_APP_DIR` chưa được cấu hình.
- VPS repository có tracked hoặc untracked source changes.
- VPS `HEAD` không trùng với Git SHA vừa pass CI.
- Migration thất bại.
- Image build thất bại.
- Container không healthy.

Workflow từ chối deploy khi VPS repository có local source changes.
`git pull --ff-only` được dùng để VPS không tự tạo merge commit. Khi repository
không sạch, cần điều tra và xử lý thủ công thay vì tự động ghi đè.

Kiểm tra Git SHA ngăn một workflow cũ deploy nhầm commit mới hơn trên `main`
chưa hoàn tất CI. Khi kiểm tra này thất bại, chờ CI của commit mới hoàn thành.
