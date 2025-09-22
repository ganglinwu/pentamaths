# 🚀 Production Deployment Guide

## Prerequisites Checklist

### ✅ **Google Cloud Setup**
- [ ] Service Account created with reCAPTCHA Enterprise Agent role
- [ ] Service Account JSON key downloaded securely
- [ ] reCAPTCHA Enterprise site configured for your domain

### ✅ **Email Service Setup** (Choose One)
**Option A: Gmail SMTP**
- [ ] Gmail account with 2FA enabled
- [ ] App-specific password generated
- [ ] SMTP settings configured

**Option B: SendGrid**
- [ ] SendGrid account created
- [ ] API key generated
- [ ] Sender identity verified

### ✅ **Domain & Hosting**
- [ ] Domain configured for your hosting platform
- [ ] SSL certificate enabled
- [ ] Environment variables configured on hosting platform

## Step-by-Step Deployment

### **1. Environment Variables Setup**

Create `.env.local` (for development) and configure production environment variables:

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit with your actual values
nano .env.local
```

**Required Variables:**
```bash
# Google Cloud & reCAPTCHA
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
GOOGLE_CLOUD_PROJECT_ID=swift-arcadia-458910-c2
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Ldq8NArAAAAADRscCMvQQuQN_uSSrPsHy1UEWy5

# Email Service (Gmail SMTP example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Contact Settings
CONTACT_EMAIL_TO=ask@pentamaths.sg
CONTACT_EMAIL_FROM=noreply@pentamaths.sg

# Security
RECAPTCHA_SCORE_THRESHOLD=0.5
```

### **2. Platform-Specific Setup**

#### **Vercel Deployment**
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod

# Set environment variables in Vercel dashboard
# https://vercel.com/your-project/settings/environment-variables
```

**Vercel Environment Variables:**
- Add all variables from `.env.local.example`
- For `GOOGLE_APPLICATION_CREDENTIALS`: Upload JSON as a file or use base64 string

#### **Netlify Deployment**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login and deploy
netlify login
netlify deploy --prod
```

#### **Railway/Render/Other**
- Connect your GitHub repository
- Configure environment variables in platform dashboard
- Deploy from main branch

### **3. Google Cloud Authentication Setup**

#### **Option A: Service Account Key (Recommended)**
1. Upload service account JSON to secure location
2. Set `GOOGLE_APPLICATION_CREDENTIALS` to file path
3. Ensure file permissions are secure (600)

#### **Option B: Base64 Encoded Key (For platforms like Vercel)**
```bash
# Encode your service account key
base64 -i path/to/service-account-key.json

# Set as environment variable
GOOGLE_SERVICE_ACCOUNT_KEY=base64-encoded-string
```

Then update the API route to handle base64:
```typescript
// In your API route, before creating the client
if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
  const credentials = JSON.parse(
    Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY, 'base64').toString()
  );
  process.env.GOOGLE_APPLICATION_CREDENTIALS = JSON.stringify(credentials);
}
```

### **4. Domain Configuration**

#### **Update reCAPTCHA Domains**
1. Go to Google Cloud Console
2. Navigate to reCAPTCHA Enterprise
3. Edit your site key
4. Add your production domain (e.g., `pentamaths.sg`)

#### **Update CORS/Security Headers**
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};
```

### **5. Testing Production Setup**

#### **Smoke Tests**
```bash
# Test API endpoint
curl -X POST https://yourdomain.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "subjectLevel": "h2-maths",
    "message": "Test message"
  }'
```

#### **Spam Protection Tests**
1. **Normal Submission**: Should work and send emails
2. **Honeypot Test**: Fill hidden fields → Should get success but no email
3. **Invalid Education**: Select "Primary Math" → Should be blocked silently
4. **Rate Limiting**: Submit twice quickly → Should show rate limit message
5. **Invalid Email**: Use fake email → Should show validation error

### **6. Monitoring & Analytics**

#### **Log Monitoring**
Set up log monitoring to track:
- Spam attempts blocked
- reCAPTCHA scores
- Email sending failures
- Form submission rates

#### **Useful Queries**
```bash
# Count spam attempts by type
grep "Spam detected" logs | sort | uniq -c

# Monitor reCAPTCHA scores
grep "reCAPTCHA score" logs | awk '{print $NF}' | sort -n

# Email delivery success rate
grep -c "email sent" logs vs grep -c "email failed" logs
```

## Security Best Practices

### **🔒 Security Checklist**
- [ ] Service account key stored securely
- [ ] Environment variables not exposed in client code
- [ ] HTTPS enabled on production domain
- [ ] Rate limiting configured
- [ ] Input validation enabled
- [ ] Error messages don't expose internal details

### **🚨 Emergency Procedures**
- **High Spam Volume**: Lower reCAPTCHA threshold temporarily
- **Email Service Down**: Monitor logs, implement fallback notification
- **reCAPTCHA Issues**: Logs will show authentication errors

## Performance Optimization

### **⚡ Optimization Tips**
- Cache reCAPTCHA client creation
- Use connection pooling for email services
- Monitor API response times
- Set up CDN for static assets

### **📊 Metrics to Monitor**
- Form submission success rate
- Email delivery rate
- Average response time
- Spam detection accuracy

## Troubleshooting

### **Common Issues**
1. **reCAPTCHA Authentication Error**: Check service account permissions
2. **Email Not Sending**: Verify SMTP credentials or SendGrid API key
3. **CORS Issues**: Update Next.js headers configuration
4. **Environment Variables**: Ensure all required variables are set

### **Debug Commands**
```bash
# Check environment variables
env | grep GOOGLE
env | grep SMTP

# Test email configuration
node -e "console.log(require('./src/lib/email'))"

# Verify reCAPTCHA setup
curl https://yourapi.com/api/test-recaptcha
```

Your production deployment should now be secure, reliable, and ready to handle legitimate inquiries while blocking spam effectively! 🛡️