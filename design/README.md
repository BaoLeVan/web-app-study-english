# Quản Lý Học Tiếng Anh — Design Index

**Stitch Project ID:** `13305312030109489024`  
**Design System:** Lumina Learn  
**Created:** 2026-06-22  

---

## Cấu trúc thư mục

```
design/
├── design.md                        # Design system spec (brand, colors, typography, components)
├── tokens/
│   └── tokens.json                  # Design tokens (colors, typography, spacing, elevation)
├── screens/
│   ├── desktop/
│   │   ├── dashboard.html           # Bảng điều khiển (Desktop)
│   │   ├── word-sets.html           # Bộ từ vựng (Desktop)
│   │   ├── statistics.html          # Thống kê & Tiến độ (Desktop)
│   │   └── profile.html             # Hồ sơ & Cài đặt (Desktop)
│   └── mobile/
│       ├── dashboard.html           # Bảng điều khiển (Mobile)
│       ├── word-sets.html           # Bộ từ vựng (Mobile)
│       ├── statistics.html          # Thống kê (Mobile)
│       └── profile.html             # Hồ sơ & Nâng cấp (Mobile)
└── screenshots/
    ├── desktop/
    │   ├── dashboard.png
    │   ├── word-sets.png
    │   ├── statistics.png
    │   └── profile.png
    └── mobile/
        ├── dashboard.png
        ├── word-sets.png
        ├── statistics.png
        └── profile.png
```

---

## Design System — Lumina Learn

| Token | Giá trị |
|-------|---------|
| Primary | `#8a70ff` (violet-purple) |
| Secondary | `#ff7db8` (warm pink) |
| Tertiary | `#4cc9f0` (sky blue) |
| Background | `#fcf8ff` |
| On-Surface | `#1a1a27` |
| Font | Plus Jakarta Sans |
| Roundness | Full pill (`border-radius: 9999px`) |
| Spacing unit | 8px |
| Color mode | Light |
| Style | Glassmorphism + Soft-3D |

→ Chi tiết đầy đủ: [`design.md`](design.md)  
→ Tokens JSON: [`tokens/tokens.json`](tokens/tokens.json)

---

## Screens

### 📱 Mobile (390px)

| Screen | File HTML | Screenshot | Screen ID |
|--------|-----------|------------|-----------|
| Bảng điều khiển (Dashboard) | [dashboard.html](screens/mobile/dashboard.html) | [dashboard.png](screenshots/mobile/dashboard.png) | `277d3ce655f44e2aa4fcecc76ea40324` |
| Thống kê (Statistics) | [statistics.html](screens/mobile/statistics.html) | [statistics.png](screenshots/mobile/statistics.png) | `2c006dfe93974dfcad78a732b16ce396` |
| Bộ từ vựng (Word Sets) | [word-sets.html](screens/mobile/word-sets.html) | [word-sets.png](screenshots/mobile/word-sets.png) | `4e0ab7decd1a4b488f89d44aa6398da7` |
| Hồ sơ & Nâng cấp (Profile) | [profile.html](screens/mobile/profile.html) | [profile.png](screenshots/mobile/profile.png) | `ba471518dc1849e18c1e14c77b9c8db0` |

### 🖥️ Desktop (1280px)

| Screen | File HTML | Screenshot | Screen ID |
|--------|-----------|------------|-----------|
| Bảng điều khiển (Dashboard) | [dashboard.html](screens/desktop/dashboard.html) | [dashboard.png](screenshots/desktop/dashboard.png) | `c88249123dd146c0a7a6a73040ac0989` |
| Bộ từ vựng (Desktop) | [word-sets.html](screens/desktop/word-sets.html) | [word-sets.png](screenshots/desktop/word-sets.png) | `2f40da0e278341d2962f0553b456ab12` |
| Thống kê & Tiến độ (Desktop) | [statistics.html](screens/desktop/statistics.html) | [statistics.png](screenshots/desktop/statistics.png) | `9c37f8b3c9414eca85672a9d7b6cca31` |
| Hồ sơ & Cài đặt (Desktop) | [profile.html](screens/desktop/profile.html) | [profile.png](screenshots/desktop/profile.png) | `bd537d508e8b42d191cd93f92941fb3c` |

---

## Stitch Links

- **Project:** `projects/13305312030109489024`
- **Design System Asset:** `assets/6e9e0ed5f80e425eb21b37adc5b1fc88`
