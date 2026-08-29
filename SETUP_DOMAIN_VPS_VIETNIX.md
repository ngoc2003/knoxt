# Hướng dẫn setup Domain cho VPS và SSL (tiếng Việt)

## 1. Mục tiêu

- Trỏ domain về VPS bằng record DNS chính xác.
- Cài đặt Nginx trên VPS.
- Cấu hình reverse proxy nếu app chạy trên port nội bộ.
- Cài SSL với Certbot / Let's Encrypt.

## 2. DNS: trỏ domain về IP VPS

### 2.1. Loại record cần tạo

Nếu bạn dùng Vietnix DNS Manager, cần tạo:

- `Type`: A
- `Name`: để trống hoặc nhập trực tiếp `example.com` (không nhập `@` nếu Vietnix không hỗ trợ)
- `Content`: IP VPS của bạn, ví dụ `xx.xxx.xxx.xxx`

### 2.2. Nếu muốn dùng `www`

Tạo thêm record thứ hai:

- `Type`: A
- `Name`: www
- `Content`: `xx.xxx.xxx.xxx`

Hoặc dùng CNAME cho `www`:

- `Type`: CNAME
- `Name`: www
- `Content`: `example.com`

### 2.3. Lưu ý format record

Không thêm:

- `http://`
- `https://`
- `:8080`
- `/`
- `example.com.` (đừng để dấu chấm `.` cuối)

Nếu Vietnix báo: `This record must contain a valid hostname`, tức là trường `Name` không hỗ trợ `@` hoặc bạn đang chọn sai loại record.

### 2.4. Cách tạo A record đúng với Vietnix

- Cách 1: để trống `Name`, chọn `Type: A`, nhập IP vào `Content`.
- Cách 2: nhập `knoxt.io.vn` vào `Name`, `Type: A`, `Content: xx.xxx.xxx.xxx`.
- Cách 3: nếu panel yêu cầu phải có host, dùng `knoxt.io.vn` thay cho `@`.

### 2.5. Kiểm tra DNS đã hoạt động

Trên máy local chạy:

```bash
nslookup knoxt.io.vn
# hoặc
nslookup knoxt.io.vn 8.8.8.8

dig knoxt.io.vn
# hoặc
dig knoxt.io.vn @8.8.8.8
```

Kết quả đúng sẽ có:

```
ANSWER SECTION:
knoxt.io.vn. 600 IN A xx.xxx.xxx.xxx
```

Nếu chưa có A record, Let's Encrypt sẽ lỗi:

```
no valid A records found for knoxt.io.vn
```

---

## 3. Cài đặt Nginx trên VPS

### 3.1. Cập nhật package list

```bash
sudo apt update
```

### 3.2. Cài Nginx

```bash
sudo apt install nginx -y
```

Nếu gặp lỗi do mirror Vietnix bị lệch package index, nghĩa là file `.deb` không tồn tại trên mirror, thì cần:

```bash
sudo apt clean
sudo apt update
sudo apt install nginx -y
```

### 3.3. Đổi mirror nếu cần

Nếu vẫn lỗi do mirror Vietnix, mở file sources và đổi về mirror chính thức Ubuntu:

```bash
sudo cp /etc/apt/sources.list.d/ubuntu.sources /etc/apt/sources.list.d/ubuntu.sources.bak
sudo nano /etc/apt/sources.list.d/ubuntu.sources
```

Tìm dòng chứa:

```
URIs: https://mirror.vietnix.vn/ubuntu
```

Đổi thành:

```
URIs: http://archive.ubuntu.com/ubuntu
```

Hoặc:

```
URIs: http://vn.archive.ubuntu.com/ubuntu
```

Sau đó:

```bash
sudo apt clean
sudo apt update
sudo apt upgrade -y
sudo apt install nginx -y
```

### 3.4. Kiểm tra Nginx đã cài

```bash
nginx -v
sudo nginx -t
sudo systemctl status nginx --no-pager
```

---

## 4. Cấu hình Nginx cho domain

### 4.1. Tạo config Nginx

Nếu app của bạn chạy trên `localhost:8080`, tạo file config như sau:

```bash
sudo tee /etc/nginx/sites-available/knoxt > /dev/null << 'EOF'
server {
    listen 80;
    server_name knoxt.io.vn www.knoxt.io.vn;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
```

### 4.2. Kích hoạt site

```bash
sudo ln -s /etc/nginx/sites-available/knoxt /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4.3. Kiểm tra port 80

```bash
sudo ss -tulpn | grep :80
```

### 4.4. Kiểm tra firewall

```bash
sudo ufw status
```

Nếu thấy 80/tcp hoặc 443/tcp bị chặn thì mở:

```bash
sudo ufw allow 80
sudo ufw allow 443
```

---

## 5. Cài SSL với Certbot

### 5.1. Chạy Certbot

```bash
sudo certbot --nginx -d knoxt.io.vn -d www.knoxt.io.vn
```

### 5.2. Nếu Certbot báo lỗi validate DNS

Lỗi phổ biến:

```
Domain: knoxt.io.vn
Type: dns
Detail: During secondary validation: no valid A records found for knoxt.io.vn; no valid AAAA records found for knoxt.io.vn
```

Nghĩa là:

- DNS chưa trỏ về VPS.
- Record chưa được lưu hoặc chưa propagate.

### 5.3. Kiểm tra lại DNS và Nginx trước khi chạy lại Certbot

```bash
sudo nginx -t
sudo systemctl status nginx --no-pager
sudo ss -tulpn | grep :80
curl -I http://localhost:8080
```

Nếu Nginx đã hoạt động và app trên `localhost:8080` trả về, hãy thử lại Certbot.

---

## 6. Tổng hợp checklist

1. DNS zone có A record cho `knoxt.io.vn` trỏ tới `xx.xxx.xxx.xxx`.
2. DNS zone có A record hoặc CNAME cho `www.knoxt.io.vn`.
3. `dig knoxt.io.vn` trả về IP đúng.
4. Nginx cài và chạy ổn, `nginx -t` báo `syntax is ok`.
5. Port 80 có LISTEN.
6. Firewall cho phép 80 và 443.
7. `sudo certbot --nginx -d knoxt.io.vn -d www.knoxt.io.vn` chạy thành công.

---

## 7. Gợi ý khắc phục lỗi nhanh

- Nếu DNS không trả về IP: kiểm tra lại record trên Vietnix, không dùng `@` nếu panel không hỗ trợ.
- Nếu `apt install nginx` lỗi 404: đổi mirror Ubuntu hoặc dùng mirror chính thức.
- Nếu `nginx -t` lỗi: sửa cú pháp config, đặc biệt `server_name` và `proxy_pass`.
- Nếu Certbot lỗi DNS validate: chờ DNS propagate và kiểm tra record bằng `dig`.

---

## 8. Ví dụ cấu hình hoàn chỉnh

```nginx
server {
    listen 80;
    server_name knoxt.io.vn www.knoxt.io.vn;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> Thay `localhost:8080` bằng port ứng dụng thực tế nếu app của bạn không chạy trên port 8080.
