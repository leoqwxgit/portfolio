# 设计师作品集网站

这是一个个人设计师作品集网站，展示了我的项目和技能。

## 项目结构

```
├── index.html          # 主页
├── works/              # 项目详情页
│   ├── work1.html      # Millmane应用界面
│   ├── work2.html      # Oitcut网站
│   ├── work3.html      # 耳机产品品牌设计
│   ├── work4.html      # 产品设计流程
│   ├── work5.html      # 沙发设计
│   └── work6.html      # 极简科技产品
├── assets/             # 静态资源
│   └── images/         # 图片文件
├── .gitignore          # Git忽略文件
└── README.md           # 项目说明
```

## 技术栈

- HTML5
- Tailwind CSS
- Font Awesome
- GSAP 动画库

## 部署到 Vercel

### 方法一：通过 Vercel 网站部署

1. **注册 Vercel 账号**
   - 访问 [Vercel 官网](https://vercel.com/) 并注册账号

2. **创建新项目**
   - 登录后，点击 "New Project"
   - 选择 "Import Project"
   - 选择 "Import Git Repository"

3. **连接仓库**
   - 将本地仓库推送到 GitHub/GitLab/Bitbucket
   - 在 Vercel 中选择你的仓库

4. **配置部署**
   - 保持默认配置即可
   - 点击 "Deploy"

5. **部署完成**
   - 部署成功后，Vercel 会提供一个唯一的 URL

### 方法二：通过 Vercel CLI 部署

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   vercel
   ```

4. **确认部署**
   - 按照提示完成部署配置
   - 部署成功后，会获得一个部署 URL

## 本地运行

1. **启动本地服务器**
   ```bash
   python3 -m http.server 8000
   ```

2. **访问网站**
   - 打开浏览器，访问 `http://localhost:8000`

## 联系方式

- 邮箱：your.email@example.com
- 社交媒体：
  - Behance
  - Dribbble
  - Instagram
  - LinkedIn