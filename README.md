# MarbleSource - Corporate Website

A professional B2B website for a natural stone export company built with Next.js and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 14 (Pages Router)
- **Styling**: Tailwind CSS 3.4
- **Deployment**: Vercel (recommended) / Netlify / Any Node.js hosting

## Project Structure

```
├── public/                  # Static assets
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Header.js       # Navigation header
│   │   ├── Footer.js       # Site footer
│   │   ├── Layout.js       # Page layout wrapper
│   │   └── ui/
│   │       ├── Icons.js    # SVG icon components
│   │       └── SectionHeader.js
│   ├── data/
│   │   ├── products.js     # Product catalog data
│   │   └── services.js     # Services data
│   ├── pages/
│   │   ├── _app.js         # App wrapper
│   │   ├── _document.js    # HTML document
│   │   ├── index.js        # Home page
│   │   ├── products.js     # Products/Materials page
│   │   ├── services.js     # Services page
│   │   ├── about.js        # About Us page
│   │   ├── contact.js      # Contact page
│   │   └── api/
│   │       └── contact.js  # Contact form API
│   └── styles/
│       └── globals.css     # Global styles + Tailwind
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   Navigate to `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## Deployment

### Option 1: Vercel (Recommended)

1. Push your code to a Git repository (GitHub, GitLab, Bitbucket)
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Click "Deploy" - Vercel auto-detects Next.js settings
5. Your site will be live at `your-project.vercel.app`

**Custom Domain**:
- Go to Project Settings → Domains
- Add your domain and follow DNS instructions

### Option 2: Netlify

1. Push your code to a Git repository
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Select your repository
5. Set build command: `npm run build`
6. Set publish directory: `.next`
7. Deploy

### Option 3: Traditional Hosting (VPS/Dedicated)

1. Build the project:
   ```bash
   npm run build
   ```

2. Transfer files to your server

3. Install dependencies on server:
   ```bash
   npm install --production
   ```

4. Start with PM2 or similar:
   ```bash
   pm2 start npm --name "marblesource" -- start
   ```

5. Set up reverse proxy (Nginx example):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Customization

### Company Information

Update these files to customize for your company:

1. **Company name & logo**: `src/components/Header.js` and `src/components/Footer.js`
2. **Contact info**: `src/components/Footer.js` and `src/pages/contact.js`
3. **SEO metadata**: Each page's `<Head>` section
4. **Stats & milestones**: `src/pages/index.js` and `src/pages/about.js`

### Products & Services

- **Products**: Edit `src/data/products.js`
- **Services**: Edit `src/data/services.js`

### Styling

- **Colors**: Modify color palette in `tailwind.config.js`
- **Fonts**: Update font imports in `src/styles/globals.css`
- **Components**: Component classes defined in `src/styles/globals.css`

### Contact Form Backend

The contact form at `/api/contact` is a placeholder. To make it functional:

1. **Email Service** (e.g., SendGrid, Resend):
   ```javascript
   // In src/pages/api/contact.js
   import { Resend } from 'resend'

   const resend = new Resend(process.env.RESEND_API_KEY)

   // Add to handler:
   await resend.emails.send({
     from: 'noreply@yourdomain.com',
     to: 'sales@yourdomain.com',
     subject: `New Inquiry from ${company}`,
     text: message,
   })
   ```

2. **Environment Variables**:
   Create `.env.local`:
   ```
   RESEND_API_KEY=your_api_key
   SALES_EMAIL=sales@yourdomain.com
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_search_console_verification_code
   ```

## Analytics and SEO Tracking

### Google Analytics 4 (GA4)

1. Create a GA4 property and Web Data Stream for your domain
2. Copy your Measurement ID (format: `G-XXXXXXXXXX`)
3. Set `NEXT_PUBLIC_GA_ID` in Vercel Project Settings -> Environment Variables
4. Redeploy the project
5. Verify traffic in GA4 Realtime report

### Google Search Console

1. Add your domain property in Google Search Console
2. Use HTML tag verification and copy only the `content` value
3. Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` in Vercel environment variables
4. Redeploy, then click Verify in Search Console
5. Submit `https://yourdomain.com/sitemap.xml` in Search Console

### Ranking and visibility checks

- Index status: Search Console -> Pages
- Search queries and average positions: Search Console -> Performance
- If a page is indexed, `site:yourdomain.com` should return it in Google results

## Warehouse Change Log (Google Sheets)

Track added/removed folders and images in one sheet with one row per change.

### 1) Create a Google Sheet

Create header row:

`TarihSaat | Depo | Islem | Tur | Ad | Yol | RootFolderId`

### 2) Add Apps Script webhook

Open `Extensions -> Apps Script` and paste:

```javascript
const SHEET_NAME = 'Sheet1';
const SECRET = 'replace_with_same_secret_in_vercel';

const SUMMARY_HEADERS = ['Depo Ozeti', 'Toplam Dosya', 'Toplam Klasor', 'Son Guncelleme'];
const SUMMARY_START_COL = 9; // I sütunu

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const body = JSON.parse(e.postData.contents || '{}');

  if (!sheet) {
    return ContentService.createTextOutput('Sheet not found').setMimeType(ContentService.MimeType.TEXT);
  }

  if (SECRET && body.secret !== SECRET) {
    return ContentService.createTextOutput('Unauthorized').setMimeType(ContentService.MimeType.TEXT);
  }

  const events = Array.isArray(body.events) ? body.events : [];
  for (const ev of events) {
    sheet.appendRow([
      ev.timestamp || new Date().toISOString(),
      ev.warehouse || '',
      ev.action || '',
      ev.itemType || '',
      ev.name || '',
      ev.path || '',
      ev.rootFolderId || '',
    ]);
  }

  writeSummary(sheet, body.summary);

  return ContentService.createTextOutput(
    JSON.stringify({ success: true, appended: events.length })
  ).setMimeType(ContentService.MimeType.JSON);
}

function writeSummary(sheet, summary) {
  if (!summary || !summary.warehouse) return;

  // Ensure summary header exists
  const headerRow = sheet.getRange(1, SUMMARY_START_COL, 1, SUMMARY_HEADERS.length).getValues()[0];
  if (!headerRow[0]) {
    sheet.getRange(1, SUMMARY_START_COL, 1, SUMMARY_HEADERS.length).setValues([SUMMARY_HEADERS]);
  }

  // Keep summary panel fixed on the right side (I2 and below)
  const summaryRows = sheet.getRange(2, SUMMARY_START_COL, 100, 1).getValues().flat();
  const existingIndex = summaryRows.findIndex((name) => name === summary.warehouse);
  const emptyIndex = summaryRows.findIndex((name) => !name);
  const targetRow = existingIndex >= 0
    ? existingIndex + 2
    : (emptyIndex >= 0 ? emptyIndex + 2 : 2);

  sheet.getRange(targetRow, SUMMARY_START_COL, 1, 4).setValues([[
    summary.warehouse,
    Number(summary.totalFiles || 0),
    Number(summary.totalFolders || 0),
    summary.updatedAt || new Date().toISOString(),
  ]]);
}
```

Deploy as Web App (`Anyone with the link`) and copy URL.

### 3) Add Vercel environment variables

- `REPORT_WEBHOOK_URL` = Apps Script Web App URL
- `REPORT_WEBHOOK_SECRET` = same value as `SECRET` in Apps Script

After redeploy, each sync writes new rows to the same sheet.

## Adding Images

Replace placeholder gradients with actual images:

1. Add images to `public/images/` folder
2. Update product data in `src/data/products.js` with image paths
3. Replace gradient divs with Next.js `<Image>` components:
   ```jsx
   import Image from 'next/image'

   <Image
     src="/images/white-marble.jpg"
     alt="White Marble"
     fill
     className="object-cover"
   />
   ```

## SEO Checklist

Before going live:

- [ ] Update all page titles and meta descriptions
- [ ] Add actual product images with alt text
- [ ] Create `public/robots.txt`
- [ ] Create `public/sitemap.xml`
- [ ] Add Google Analytics/Tag Manager
- [ ] Set up Google Search Console
- [ ] Add Open Graph images for social sharing

## Performance

The site is optimized for performance:

- Static generation for all pages
- Minimal JavaScript bundle
- No external UI libraries
- System fonts with web font fallbacks
- Lazy loading ready for images

## Browser Support

- Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## License

Private/Proprietary - Not for redistribution

---

Built with Next.js and Tailwind CSS
