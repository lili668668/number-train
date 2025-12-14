# 數字訓練應用

一個用於練習辨識大數字的 React 應用程式。

## 功能特點

- 顯示五個符合特定規則的數字
- 超過百位數的數字只有前兩位非零（例如：360、2,700、45,000）
- 數字範圍：0 到 9,999,999,999,999,999（9千9百9十9兆）
- 支援千分位格式化顯示
- 響應式設計，支援各種設備

## 技術棧

- React 18
- Vite
- ESLint
- CSS3

## 安裝與運行

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

### 建置生產版本

```bash
npm run build
```

### 預覽生產版本

```bash
npm run preview
```

### 程式碼檢查

```bash
npm run lint
```

## 專案結構

```
number-train/
├── public/          # 靜態資源
├── src/
│   ├── components/  # React 組件
│   │   ├── NumberTrainer.jsx
│   │   └── NumberTrainer.css
│   ├── App.jsx      # 主應用組件
│   ├── App.css
│   ├── main.jsx     # 入口文件
│   └── index.css
├── index.html       # HTML 模板
├── vite.config.js   # Vite 配置
└── package.json
```

## 數字生成規則

- 1-2 位數：可以是 0-99 的任意數字
- 3 位數以上：只有前兩位數字非零，其餘位數皆為 0
  - 例如：12、360、2,700、45,000、1,200,000

## License

MIT
