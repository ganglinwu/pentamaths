import { NextRequest, NextResponse } from 'next/server';
import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';
import { sendContactEmail } from '@/lib/email';

/**
 * Create an assessment to analyse the risk of a UI action.
 * Using Google's official reCAPTCHA Enterprise Node.js SDK
 */
async function createAssessment({
  projectID = process.env.GOOGLE_CLOUD_PROJECT_ID || "swift-arcadia-458910-c2",
  recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6Ldq8NArAAAAADRscCMvQQuQN_uSSrPsHy1UEWy5",
  token,
  recaptchaAction = "contact_form",
}: {
  projectID?: string;
  recaptchaKey?: string;
  token: string;
  recaptchaAction?: string;
}) {
  // Handle base64 encoded credentials for Vercel deployment
  let client;
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    // Parse base64 encoded credentials
    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY, 'base64').toString()
    );

    // Create client with explicit credentials
    client = new RecaptchaEnterpriseServiceClient({
      credentials: credentials
    });
  } else {
    // Fallback to default credentials
    client = new RecaptchaEnterpriseServiceClient();
  }

  const projectPath = client.projectPath(projectID);

  // Build the assessment request
  const request = {
    assessment: {
      event: {
        token: token,
        siteKey: recaptchaKey,
      },
    },
    parent: projectPath,
  };

  try {
    const [response] = await client.createAssessment(request);

    // Check if the token is valid
    if (!response.tokenProperties?.valid) {
      console.log(`The CreateAssessment call failed because the token was: ${response.tokenProperties?.invalidReason}`);
      return null;
    }

    // Check if the expected action was executed
    if (response.tokenProperties.action === recaptchaAction) {
      // Get the risk score and the reason(s)
      console.log(`The reCAPTCHA score is: ${response.riskAnalysis?.score}`);
      response.riskAnalysis?.reasons?.forEach((reason) => {
        console.log(reason);
      });

      return response.riskAnalysis?.score || 0;
    } else {
      console.log("The action attribute in your reCAPTCHA tag does not match the action you are expecting to score");
      return null;
    }
  } catch (error) {
    console.error('Error creating reCAPTCHA assessment:', error);
    return null;
  } finally {
    // Close the client
    client.close();
  }
}

// Email validation function
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Check for disposable email domains
function isDisposableEmail(email: string): boolean {
  const disposableDomains = [
    '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
    'tempmail.org', 'yopmail.com', 'throwaway.email'
  ];
  const domain = email.split('@')[1]?.toLowerCase();
  return disposableDomains.includes(domain);
}

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, subjectLevel, message, captchaToken, website, phoneNumber, companyName } = await request.json();

    // Spam Protection Check #1: Honeypot fields
    if (website || phoneNumber || companyName) {
      console.log('Spam detected: Honeypot fields filled', { email, timestamp: new Date().toISOString() });
      // Return success to maintain deception
      return NextResponse.json({ success: true });
    }

    // Spam Protection Check #2: Education level validation
    const validLevels = ['h2-maths', 'h1-maths', 'a-maths'];
    if (subjectLevel && !validLevels.includes(subjectLevel)) {
      console.log('Spam detected: Invalid education level', { subjectLevel, email, timestamp: new Date().toISOString() });
      // Return success to maintain deception
      return NextResponse.json({ success: true });
    }

    // Spam Protection Check #3: Email validation
    if (!isValidEmail(email) || isDisposableEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Spam Protection Check #4: Required fields
    if (!fullName || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Spam Protection Check #5: reCAPTCHA Enterprise verification
    if (captchaToken) {
      const riskScore = await createAssessment({
        token: captchaToken,
        recaptchaAction: 'contact_form'
      });

      if (riskScore === null) {
        console.log('reCAPTCHA verification failed', { email, timestamp: new Date().toISOString() });
        // Return success to maintain deception for potential bots
        return NextResponse.json({ success: true });
      }

      // Score interpretation: 1.0 = very likely human, 0.0 = very likely bot
      // Use environment variable for threshold (default 0.5)
      const threshold = parseFloat(process.env.RECAPTCHA_SCORE_THRESHOLD || '0.5');
      if (riskScore < threshold) {
        console.log('Low reCAPTCHA score - likely bot', {
          score: riskScore,
          email,
          timestamp: new Date().toISOString()
        });
        // Return success to maintain deception
        return NextResponse.json({ success: true });
      }

      console.log('reCAPTCHA verification passed', {
        score: riskScore,
        email,
        timestamp: new Date().toISOString()
      });
    }

    // All validation passed - process legitimate submission
    console.log('Processing legitimate contact form submission', {
      fullName,
      email,
      subjectLevel,
      timestamp: new Date().toISOString()
    });

    // Send email notification
    const emailSent = await sendContactEmail({ fullName, email, subjectLevel, message });

    if (!emailSent) {
      console.error('Failed to send email, but will still return success to user');
      // Still return success to user - don't expose internal email issues
    }

    // TODO: Add to database if needed
    // await saveContactSubmission({ fullName, email, subjectLevel, message });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}