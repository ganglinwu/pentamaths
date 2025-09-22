# Google reCAPTCHA Setup Guide

## Step 1: Get reCAPTCHA Keys

1. Go to https://www.google.com/recaptcha/admin/create
2. Sign in with your Google account
3. Fill out the form:
   - **Label**: "Pentamaths Contact Form"
   - **reCAPTCHA type**: Choose "reCAPTCHA v2" > "I'm not a robot" Checkbox
   - **Domains**:
     - Add `localhost` for development
     - Add your actual domain (e.g., `pentamaths.sg`)
   - Accept the Terms of Service
4. Click "Submit"
5. Copy your **Site Key** and **Secret Key**

## Step 2: Set up Environment Variables

Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

## Step 3: Install the Package

The package should be installed now. If not, run:
```bash
npm install react-google-recaptcha
npm install --save-dev @types/react-google-recaptcha
```

## Step 4: Enable reCAPTCHA in the Code

1. **Uncomment the import** in `src/app/page.tsx`:
   ```typescript
   import ReCAPTCHA from "react-google-recaptcha";
   ```

2. **Uncomment the reCAPTCHA component** in the form:
   ```jsx
   <div className="form-group">
     <ReCAPTCHA
       ref={captchaRef}
       sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
       onChange={(token) => setCaptchaToken(token)}
       onExpired={() => setCaptchaToken(null)}
     />
   </div>
   ```

3. **Uncomment the validation** in `handleFormSubmit`:
   ```typescript
   if (!captchaToken) {
     alert('Please complete the reCAPTCHA verification.');
     return;
   }
   ```

4. **Uncomment the reset** after form submission:
   ```typescript
   captchaRef.current?.reset();
   ```

## Step 5: Server-side Verification (Optional but Recommended)

Create an API route to verify the reCAPTCHA token on the server:

1. Create `src/app/api/contact/route.ts`:
   ```typescript
   import { NextRequest, NextResponse } from 'next/server';

   export async function POST(request: NextRequest) {
     const { name, email, subjectLevel, message, captchaToken } = await request.json();

     // Verify reCAPTCHA
     const verifyResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/x-www-form-urlencoded',
       },
       body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`,
     });

     const verifyData = await verifyResponse.json();

     if (!verifyData.success) {
       return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 });
     }

     // Process the form submission
     // Send email, save to database, etc.

     return NextResponse.json({ success: true });
   }
   ```

2. Update the form submission in `page.tsx`:
   ```typescript
   try {
     const response = await fetch('/api/contact', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         name: formData.fullName,
         email: formData.email,
         subjectLevel: formData.subjectLevel,
         message: formData.message,
         captchaToken,
       }),
     });

     if (!response.ok) {
       throw new Error('Failed to send message');
     }

     alert('Thank you for your message! We\'ll get back to you soon.');
   } catch (error) {
     alert('There was an error sending your message. Please try again.');
   }
   ```

## Testing

1. **Development**: Test on `localhost:3000`
2. **Production**: Test on your actual domain
3. **Verify all spam protections work**:
   - Try filling the honeypot field (should be blocked)
   - Try submitting without reCAPTCHA (should be blocked)
   - Try submitting too quickly (should be rate limited)
   - Try with invalid email (should be blocked)

## Security Notes

- Never expose your **Secret Key** in client-side code
- Always verify reCAPTCHA tokens on the server side
- Consider adding additional server-side rate limiting
- Monitor for spam attempts in your server logs

Your form now has 4 layers of spam protection:
1. **Silent Honeypots** - Catches bots without alerting them
   - Hidden decoy fields (website, phoneNumber, companyName)
   - Contextual education level trap (invalid subjects for your business)
2. **Email Validation** - Blocks invalid/disposable emails
3. **Rate Limiting** - Prevents rapid submissions
4. **reCAPTCHA** - Advanced bot detection

## Silent Spam Handling Strategy

When spam is detected through honeypots:
- ✅ **Show success message** to the spammer/bot
- ❌ **Don't process the submission** on backend
- 📝 **Log the attempt** for analysis
- ⏱️ **Take longer processing time** to waste bot resources
- 🔄 **Reset form normally** to maintain consistent behavior

This approach is much more effective because:
- Bots think they succeeded and don't adapt their methods
- No feedback loop for spammers to refine their approach
- Wastes spam bot computational resources
- Maintains your server resources by not processing junk